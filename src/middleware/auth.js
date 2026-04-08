// ─────────────────────────────────────────
//  src/middleware/auth.js
// ─────────────────────────────────────────
const { createClient } = require('@supabase/supabase-js');

// Supabase client using anon key for auth validation
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * Middleware: Verify Supabase JWT token from Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Authentication error' });
  }
};

/**
 * Middleware: Require admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.user_metadata?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
