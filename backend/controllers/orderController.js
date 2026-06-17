import { supabaseAdmin } from '../config/supabase.js';

// Auto-check and create storage buckets
const ensureBucketExists = async (bucketName) => {
  try {
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (listError) return;

    const exists = buckets.some(b => b.name === bucketName);
    if (!exists) {
      await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024
      });
      console.log(`Created Supabase storage bucket: ${bucketName}`);
    }
  } catch (err) {
    console.error(`Bucket check/creation error for ${bucketName}:`, err.message);
  }
};

ensureBucketExists('payment-screenshots');

const uploadToSupabase = async (file, bucketName, folder = '') => {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${folder}${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
  
  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (error) {
    throw new Error(`Upload error: ${error.message}`);
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return publicUrl;
};

// Generate human readable Order ID
const generateOrderId = () => {
  const chars = '0123456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `LUV-${rand}`;
};

// POST /orders
export const createOrder = async (req, res, next) => {
  try {
    const {
      customer_name,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      total_amount,
      utr_number,
      cart_items // JSON string or array
    } = req.body;

    if (!customer_name || !phone || !email || !address || !city || !state || !pincode || !total_amount || !utr_number || !cart_items) {
      return res.status(400).json({ error: 'All customer fields, total amount, UTR number, and cart items are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Payment proof screenshot is required.' });
    }

    // Parse cart items
    let parsedCartItems = [];
    try {
      parsedCartItems = typeof cart_items === 'string' ? JSON.parse(cart_items) : cart_items;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid cart items format.' });
    }

    if (parsedCartItems.length === 0) {
      return res.status(400).json({ error: 'Cart cannot be empty.' });
    }

    // Check UTR duplicate
    const { data: existingUTR } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('utr_number', utr_number.trim())
      .maybeSingle();

    if (existingUTR) {
      return res.status(400).json({ error: 'An order with this UTR number has already been submitted.' });
    }

    // Check if customer is logged in to link their account
    let customerUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (user) {
          customerUserId = user.id;
        }
      } catch (err) {
        console.warn('Silent auth check failed for checkout:', err.message);
      }
    }

    // Upload payment screenshot to Supabase Storage
    const screenshotUrl = await uploadToSupabase(req.file, 'payment-screenshots', 'screenshots/');

    // Generate Order ID
    let uniqueOrderId = generateOrderId();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const { data: duplicateOrder } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('order_id', uniqueOrderId)
        .maybeSingle();

      if (!duplicateOrder) {
        isUnique = true;
      } else {
        uniqueOrderId = generateOrderId();
        attempts++;
      }
    }

    // Create order record
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_id: uniqueOrderId,
        customer_name,
        phone,
        email,
        address,
        city,
        state,
        pincode,
        total_amount: parseFloat(total_amount),
        utr_number: utr_number.trim(),
        payment_screenshot: screenshotUrl,
        status: 'Pending Verification',
        user_id: customerUserId
      })
      .select()
      .single();

    if (orderError) {
      return res.status(400).json({ error: orderError.message });
    }

    // Insert order items
    const orderItemsToInsert = parsedCartItems.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: parseInt(item.quantity),
      price: parseFloat(item.price)
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      // Clean up order record on failure (manual rollback)
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return res.status(400).json({ error: `Failed to save order items: ${itemsError.message}` });
    }

    res.status(201).json({
      message: 'Order placed successfully. Waiting for payment verification.',
      order_id: order.order_id,
      id: order.id
    });
  } catch (err) {
    next(err);
  }
};

// GET /orders (Admin only)
export const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'All') {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

// GET /orders/:id (Admin and customer detail check)
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .or(`id.eq.${id},order_id.eq.${id}`)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Fetch associated order items with product details
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select(`
        id,
        quantity,
        price,
        product_id,
        products (
          name,
          images
        )
      `)
      .eq('order_id', order.id);

    if (itemsError) {
      return res.status(400).json({ error: itemsError.message });
    }

    res.status(200).json({
      ...order,
      items
    });
  } catch (err) {
    next(err);
  }
};

// PUT /orders/:id/status (Admin updates order status)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['Pending Verification', 'Payment Verified', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status value.' });
    }

    // Fetch current order state to inspect previous status
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const prevStatus = currentOrder.status;

    // If no status changes, return immediately
    if (prevStatus === status) {
      return res.status(200).json({ message: 'Order status is already set to this value.', order: currentOrder });
    }

    // Fetch order items to perform stock adjustment
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', id);

    if (itemsError) {
      return res.status(400).json({ error: 'Failed to retrieve order items for stock adjustment.' });
    }

    // Stock adjustments transitions
    // Transition 1: Verification (Pending -> Verified) - Decrement Stock
    if (prevStatus === 'Pending Verification' && status === 'Payment Verified') {
      for (const item of items) {
        if (!item.product_id) continue;
        
        // Fetch current product stock
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('name, stock')
          .eq('id', item.product_id)
          .single();

        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await supabaseAdmin
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product_id);
        }
      }
    }

    // Transition 2: Cancellation (Verified/Processing/Shipped/Delivered -> Cancelled) - Increment Stock (Restore)
    const activeVerifiedStatuses = ['Payment Verified', 'Processing', 'Shipped', 'Delivered'];
    if (activeVerifiedStatuses.includes(prevStatus) && status === 'Cancelled') {
      for (const item of items) {
        if (!item.product_id) continue;

        // Fetch current product stock
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (product) {
          const newStock = product.stock + item.quantity;
          await supabaseAdmin
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product_id);
        }
      }
    }

    // Transition 3: Undoing cancellation (Cancelled -> Verified/Processing/Shipped/Delivered) - Decrement Stock again
    if (prevStatus === 'Cancelled' && activeVerifiedStatuses.includes(status)) {
      for (const item of items) {
        if (!item.product_id) continue;

        // Fetch current product stock
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await supabaseAdmin
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product_id);
        }
      }
    }

    // Update the database order status
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.status(200).json({
      message: `Order status successfully transitioned from "${prevStatus}" to "${status}".`,
      order: updatedOrder
    });
  } catch (err) {
    next(err);
  }
};

// POST /track-order
export const trackOrder = async (req, res, next) => {
  try {
    const { order_id, phone } = req.body;

    if (!order_id || !phone) {
      return res.status(400).json({ error: 'Both Order ID (LUV-XXXXXX) and Phone Number are required.' });
    }

    const cleanedOrderId = order_id.trim().toUpperCase();
    const cleanedPhone = phone.trim();

    // Fetch order record
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_id', cleanedOrderId)
      .eq('phone', cleanedPhone)
      .maybeSingle();

    if (orderError || !order) {
      return res.status(404).json({ error: 'No matching order found with the provided details.' });
    }

    // Fetch order items with product details
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select(`
        id,
        quantity,
        price,
        product_id,
        products (
          name,
          images
        )
      `)
      .eq('order_id', order.id);

    if (itemsError) {
      return res.status(400).json({ error: itemsError.message });
    }

    res.status(200).json({
      ...order,
      items
    });
  } catch (err) {
    next(err);
  }
};

// GET /dashboard/summary (Admin only - returns dashboard statistics)
export const getDashboardSummary = async (req, res, next) => {
  try {
    // 1. Total products count
    const { count: totalProducts, error: pError } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });

    // 2. Total orders count
    const { count: totalOrders, error: oError } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // 3. Pending orders count
    const { count: pendingOrders, error: peError } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Pending Verification');

    // 4. Verified orders count (excluding cancelled and pending verification)
    const { count: verifiedOrders, error: vError } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .not('status', 'in', '("Pending Verification","Cancelled")');

    // 5. Total revenue (sum total_amount for all orders except cancelled)
    const { data: revenueData, error: rError } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .neq('status', 'Cancelled');

    let totalRevenue = 0;
    if (revenueData) {
      totalRevenue = revenueData.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
    }

    // 6. Recent orders (fetch last 5 orders)
    const { data: recentOrders, error: reError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (pError || oError || peError || vError || rError || reError) {
      return res.status(400).json({ error: 'Error computing dashboard statistics.' });
    }

    res.status(200).json({
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      pendingOrders: pendingOrders || 0,
      verifiedOrders: verifiedOrders || 0,
      totalRevenue,
      recentOrders: recentOrders || []
    });
  } catch (err) {
    next(err);
  }
};
