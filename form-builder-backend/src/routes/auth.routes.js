// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const fetch = require('node-fetch');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

let lastCodeVerifier = null;

const authMiddleware = require('../middlewares/auth.middleware')

router.get('/airtable', (req, res) => {
  const state = crypto.randomBytes(32).toString('base64url');
  const codeVerifier = crypto.randomBytes(48).toString('base64url');
  lastCodeVerifier = codeVerifier;
  const codeChallenge = crypto.
  createHash('sha256')
  .update(codeVerifier)
  .digest('base64url');

  const redirectUri = 'http://localhost:5000/auth/airtable/callback';

  const url = `https://airtable.com/oauth2/v1/authorize` +
    `?client_id=${process.env.AIRTABLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    '&response_type=code' +
    `&scope=${encodeURIComponent('data.records:read')}` +
    `&state=${encodeURIComponent(state)}` +
    '&code_challenge_method=S256' +
    `&code_challenge=${encodeURIComponent(codeChallenge)}`;

  res.redirect(url);
});

router.get('/airtable/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.send('No code received');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: 'http://localhost:5000/auth/airtable/callback',
    code_verifier: lastCodeVerifier || '',
  });

  const basicAuth = Buffer.from(`${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`).toString('base64');

  const tokenRes = await fetch('https://airtable.com/oauth2/v1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`,
    },
    body,
  });

  const tokenJson = await tokenRes.json();
  if (tokenJson.error) return res.send('Token error: ' + JSON.stringify(tokenJson));

  const airtableUserId = 'airtable-user-1';
  await User.findOneAndUpdate(
    { airtableUserId },
    {
      airtableUserId,
      name: 'Airtable User',
      accessToken: tokenJson.access_token,
      refreshToken: tokenJson.refresh_token,
      loginTime: new Date(),
    },
    { upsert: true, new: true }
  );

const token = jwt.sign(
  { userId: airtableUserId },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
res.redirect(`http://localhost:5173/dashboard?token=${token}`);
});

router.post('/login', async (req, res) => {
  const { airtableUserId } = req.body;
  const user = await User.findOne({ airtableUserId });
  if (!user) return res.status(401).json({ error: 'User not found' });
  
  const token = jwt.sign({ userId: user.airtableUserId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});


module.exports = router;
