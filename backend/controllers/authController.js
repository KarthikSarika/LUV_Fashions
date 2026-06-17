import { supabase, supabaseAdmin } from '../config/supabase.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      return res.status(401).json({ error: error?.message || 'Authentication failed. Invalid credentials.' });
    }

    // Verify user is an admin in profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('admin_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      // Sign out from Auth session if they are not an admin
      await supabase.auth.signOut();
      return res.status(403).json({ error: 'Access denied. You do not have administrator privileges.' });
    }

    // Return the session tokens and user details
    res.status(200).json({
      message: 'Login successful.',
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile.role
      }
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    // If client provides a token we can call signOut
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      // Perform sign out
      await supabase.auth.admin.signOut(token);
    }
    
    res.status(200).json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    // req.user is populated by requireAdmin middleware
    res.status(200).json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

export const customerRegister = async (req, res, next) => {
  try {
    const { email, password, full_name, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Sign up with Supabase Auth (metadata role: customer)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'customer',
          full_name: full_name || '',
          phone: phone || ''
        }
      }
    });

    if (error || !data.user) {
      return res.status(400).json({ error: error?.message || 'Registration failed.' });
    }

    // Wait briefly for trigger completion and query customer user_profiles
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    res.status(201).json({
      message: 'Registration successful.',
      token: data.session?.access_token || null,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: 'customer',
        profile: profile
      }
    });
  } catch (err) {
    next(err);
  }
};

export const customerLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      return res.status(401).json({ error: error?.message || 'Login failed. Invalid credentials.' });
    }

    // Check user profile exists in user_profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      // Clean session if this email maps to admin instead
      await supabase.auth.signOut();
      return res.status(403).json({ error: 'This login page is for customers. Admins should use the Admin Console.' });
    }

    res.status(200).json({
      message: 'Login successful.',
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: 'customer',
        profile: profile
      }
    });
  } catch (err) {
    next(err);
  }
};
