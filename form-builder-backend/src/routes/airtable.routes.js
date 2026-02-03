const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const User = require('../models/user.model');

const auth = require('../middlewares/auth.middleware');

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.json({ loggedIn: false });

    res.json({
      loggedIn: true,
      airtableUserId: user.airtableUserId,
      name: user.name,
      email: user.email,
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/bases', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: 'Not logged in' });
    if (!user.accessToken) return res.status(400).json({ error: 'Airtable not connected' });

    const resp = await fetch('https://api.airtable.com/v0/meta/bases', {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    });
    const data = await resp.json();

    if (!resp.ok) return res.status(resp.status).json(data);
    res.json({ bases: data.bases || [] });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/tables', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: 'Not logged in' });
    if (!user.accessToken) return res.status(400).json({ error: 'Airtable not connected' });

    const resp = await fetch(
      `https://api.airtable.com/v0/meta/bases/${process.env.AIRTABLE_BASE_ID}/tables`,
      { headers: { Authorization: `Bearer ${user.accessToken}` } }
    );
    const data = await resp.json();

    if (!resp.ok) return res.status(resp.status).json(data);
    res.json({ tables: data.tables || [] });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

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
