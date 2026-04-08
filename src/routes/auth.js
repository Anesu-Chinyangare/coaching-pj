// src/routes/auth.js
const express = require('express');
const router  = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });
    res.json({ data: { user: data.user, session: data.session } });
  } catch (err) { next(err); }
});

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const { data, error } = await supabaseAuth.auth.signUp({
      email, password,
      options: { data: { name } }
    });
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ data });
  } catch (err) { next(err); }
});

// POST /api/auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) await supabaseAuth.auth.admin.signOut(token);
    res.json({ message: 'Logged out' });
  } catch (err) { next(err); }
});

module.exports = router;
