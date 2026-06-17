import { supabaseAdmin } from '../config/supabase.js';

export const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify user token with Supabase Auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Session expired or invalid token.' });
    }

    // Verify admin role in admin_profiles
    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from('admin_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !adminProfile || adminProfile.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Administrative privileges required.' });
    }

    // Attach user information to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: adminProfile.role
    };

    next();
  } catch (err) {
    console.error('Authentication error:', err.message);
    res.status(500).json({ error: 'Internal server authorization check failed.' });
  }
};

export const requireCustomer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify user token with Supabase Auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Session expired or invalid token.' });
    }

    // Verify customer profile in user_profiles
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return res.status(403).json({ error: 'Access forbidden. Customer profile not found.' });
    }

    // Attach customer user info & profile settings to request object
    req.user = {
      id: user.id,
      email: user.email,
      profile: userProfile
    };

    next();
  } catch (err) {
    console.error('Customer Auth error:', err.message);
    res.status(500).json({ error: 'Internal server customer authorization check failed.' });
  }
};
