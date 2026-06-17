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
        fileSizeLimit: 5 * 1024 * 1024 // 5MB limit
      });
      console.log(`Created Supabase storage bucket: ${bucketName}`);
    }
  } catch (err) {
    console.error(`Bucket check/creation error for ${bucketName}:`, err.message);
  }
};

// Initialize buckets
ensureBucketExists('product-images');

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

// GET /products
export const getAllProducts = async (req, res, next) => {
  try {
    const { search, category, sortBy, page = 1, limit = 12, all } = req.query;

    let query = supabaseAdmin.from('products').select('*', { count: 'exact' });

    // Filter by active status unless specifically requested (e.g. for admin view)
    if (all !== 'true') {
      query = query.eq('is_active', true);
    }

    // Filter by Category
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    // Search query
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Sort order
    if (sortBy === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (sortBy === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else {
      // Default: Newest first
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data: products, count, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({
      products,
      currentPage: pageNum,
      totalPages: Math.ceil(count / limitNum),
      totalProducts: count
    });
  } catch (err) {
    next(err);
  }
};

// GET /products/:id
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

// POST /products
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, discount_price, stock, is_active } = req.body;

    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Product name, category, price, and stock quantity are required.' });
    }

    // Upload files to Supabase Storage
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToSupabase(file, 'product-images', 'products/');
        imageUrls.push(url);
      }
    }

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        description,
        category,
        price: parseFloat(price),
        discount_price: discount_price ? parseFloat(discount_price) : null,
        stock: parseInt(stock),
        images: imageUrls,
        is_active: is_active === 'false' ? false : true
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Product created successfully.', product });
  } catch (err) {
    next(err);
  }
};

// PUT /products/:id
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, discount_price, stock, is_active, existing_images } = req.body;

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Assemble current images list
    let finalImages = [];
    if (existing_images) {
      // If it's a string, make it an array. If already array, keep it.
      finalImages = Array.isArray(existing_images) ? existing_images : [existing_images];
    }

    // Upload new files if provided
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToSupabase(file, 'product-images', 'products/');
        finalImages.push(url);
      }
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (category !== undefined) updateFields.category = category;
    if (price !== undefined) updateFields.price = parseFloat(price);
    if (discount_price !== undefined) updateFields.discount_price = discount_price === '' || discount_price === 'null' ? null : parseFloat(discount_price);
    if (stock !== undefined) updateFields.stock = parseInt(stock);
    if (is_active !== undefined) updateFields.is_active = is_active === 'false' ? false : true;
    updateFields.images = finalImages;

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Product updated successfully.', product });
  } catch (err) {
    next(err);
  }
};

// DELETE /products/:id
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
