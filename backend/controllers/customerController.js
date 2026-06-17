import { supabaseAdmin } from '../config/supabase.js';

// GET /customer/profile
export const getCustomerProfile = async (req, res, next) => {
  try {
    // req.user.profile is pre-populated by requireCustomer middleware
    res.status(200).json({ profile: req.user.profile });
  } catch (err) {
    next(err);
  }
};

// PUT /customer/profile
export const updateCustomerProfile = async (req, res, next) => {
  try {
    const { full_name, phone, address, city, state, pincode } = req.body;

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        full_name,
        phone,
        address,
        city,
        state,
        pincode
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Profile updated successfully.', profile });
  } catch (err) {
    next(err);
  }
};

// GET /customer/favorites
export const getFavorites = async (req, res, next) => {
  try {
    const { data: favorites, error } = await supabaseAdmin
      .from('favorites')
      .select(`
        id,
        product_id,
        products (
          id,
          name,
          price,
          discount_price,
          stock,
          images,
          category,
          is_active
        )
      `)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Clean response to return list of products directly
    const productsList = favorites
      .filter(f => f.products !== null)
      .map(f => f.products);

    res.status(200).json(productsList);
  } catch (err) {
    next(err);
  }
};

// POST /customer/favorites
export const addFavorite = async (req, res, next) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    const { data, error } = await supabaseAdmin
      .from('favorites')
      .insert({
        user_id: req.user.id,
        product_id
      })
      .select()
      .single();

    if (error) {
      // If code is duplicate constraint (already hearted)
      if (error.code === '23505') {
        return res.status(200).json({ message: 'Product is already in favorites.' });
      }
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Product added to favorites.', data });
  } catch (err) {
    next(err);
  }
};

// DELETE /customer/favorites/:productId
export const removeFavorite = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    const { error } = await supabaseAdmin
      .from('favorites')
      .delete()
      .eq('user_id', req.user.id)
      .eq('product_id', productId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Product removed from favorites.' });
  } catch (err) {
    next(err);
  }
};

// GET /customer/cart
export const getDbCart = async (req, res, next) => {
  try {
    const { data: cartItems, error } = await supabaseAdmin
      .from('cart_items')
      .select(`
        quantity,
        product_id,
        products (
          id,
          name,
          price,
          discount_price,
          stock,
          images,
          category,
          is_active
        )
      `)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Clean up response format
    const cleanedCart = cartItems
      .filter(item => item.products !== null)
      .map(item => {
        const finalPrice = item.products.discount_price !== null 
          ? item.products.discount_price 
          : item.products.price;
        
        return {
          id: item.products.id,
          name: item.products.name,
          price: item.products.price,
          discount_price: item.products.discount_price,
          finalPrice: parseFloat(finalPrice),
          images: item.products.images,
          stock: item.products.stock,
          category: item.products.category,
          quantity: item.quantity
        };
      });

    res.status(200).json(cleanedCart);
  } catch (err) {
    next(err);
  }
};

// POST /customer/cart (syncs local state with database)
export const syncCartWithDb = async (req, res, next) => {
  try {
    const { cart } = req.body; // Array of { id, quantity }

    if (!Array.isArray(cart)) {
      return res.status(400).json({ error: 'Cart must be an array of items.' });
    }

    // 1. Delete all current cart items
    const { error: deleteError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.id);

    if (deleteError) {
      return res.status(400).json({ error: deleteError.message });
    }

    // 2. Insert new items if cart is not empty
    if (cart.length > 0) {
      const rowsToInsert = cart.map(item => ({
        user_id: req.user.id,
        product_id: item.id,
        quantity: parseInt(item.quantity)
      }));

      const { error: insertError } = await supabaseAdmin
        .from('cart_items')
        .insert(rowsToInsert);

      if (insertError) {
        return res.status(400).json({ error: insertError.message });
      }
    }

    res.status(200).json({ message: 'Shopping cart synced successfully.' });
  } catch (err) {
    next(err);
  }
};

// GET /customer/orders
export const getCustomerOrders = async (req, res, next) => {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          product_id,
          products (
            name,
            images
          )
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};
