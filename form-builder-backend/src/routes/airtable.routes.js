const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const User = require('../models/user.model');

router.get('/me', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) return res.json({ loggedIn: false });

    res.json({
      loggedIn: true,
      airtableUserId: user.airtableUserId,
      name: user.name,
      email: user.email,
    });
  } catch (e) {
    console.error('GET /api/me error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/bases
router.get('/bases', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) return res.status(401).json({ error: 'Not logged in' });

    const token = user.accessToken;

    const resp = await fetch('https://api.airtable.com/v0/meta/bases', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await resp.json();

    if (!resp.ok) return res.status(resp.status).json(data);
    res.json({ bases: data.bases || [] });
  } catch (e) {
    console.error('GET /api/bases error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tables
router.get('/tables', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) return res.status(401).json({ error: 'Not logged in' });

    const token = user.accessToken;

    const resp = await fetch(
      `https://api.airtable.com/v0/meta/bases/${process.env.AIRTABLE_BASE_ID}/tables`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await resp.json();

    if (!resp.ok) return res.status(resp.status).json(data);
    res.json({ tables: data.tables || [] });
  } catch (e) {
    console.error('GET /api/tables error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/fields  (static)
router.get('/fields', (req, res) => {
  const fields = [
    { id: 'name', label: 'Name', type: 'shortText', required: true },
    { id: 'email', label: 'Email', type: 'shortText', required: true },
    { id: 'role', label: 'Role', type: 'singleSelect', required: true, options: ['Engineer', 'Designer', 'PM'] },
    { id: 'githubUrl', label: 'GitHub URL', type: 'shortText', required: false },
    { id: 'about', label: 'About you', type: 'longText', required: false },
  ];
  res.json({ fields });
});

module.exports = router;
