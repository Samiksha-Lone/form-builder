const express = require('express');
const crypto = require('crypto');
const fetch = require('node-fetch'); 
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: false,
}));

const User = require('./src/models/user.model')
const Form = require('./src/models/form.model')
const responseModel = require('./src/models/response.model');

mongoose.connect(process.env.MONGODB_URI);

const CLIENT_ID = process.env.AIRTABLE_CLIENT_ID;
const CLIENT_SECRET = 'a2f2d3e2d765feb295eb142c18dd1d29cc79b8b382d18c4b8431f032702a2be5';
const REDIRECT_URI = 'http://localhost:5000/auth/airtable/callback';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

let lastCodeVerifier = null;

app.get('/auth/airtable', (req, res) => {
  const state = crypto.randomBytes(32).toString('base64url');

  const codeVerifier = crypto.randomBytes(48).toString('base64url');
  lastCodeVerifier = codeVerifier;
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  const SCOPE = 'data.records:read';

  const url =
    'https://airtable.com/oauth2/v1/authorize' +
    `?client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    '&response_type=code' +
    `&scope=${encodeURIComponent(SCOPE)}` +
    `&state=${encodeURIComponent(state)}` +
    '&code_challenge_method=S256' +
    `&code_challenge=${encodeURIComponent(codeChallenge)}`;

  res.redirect(url);
});

app.get('/auth/airtable/callback', async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    return res.send('OAuth error: ' + error + ' - ' + error_description);
  }
  if (!code) {
    return res.send('No code received');
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: lastCodeVerifier || '',
  });

  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const tokenRes = await fetch('https://airtable.com/oauth2/v1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`,
    },
    body,
  });

  const tokenJson = await tokenRes.json();
  console.log('Token response:', tokenJson); 

  if (tokenJson.error) {
    return res.send('Token error: ' + JSON.stringify(tokenJson));
  }

  const airtableUserId = 'airtable-user-1';   
  const email = '';
  const name = 'Airtable User';

  const savedUser = await User.findOneAndUpdate(
    { airtableUserId },
    {
      airtableUserId,
      name,
      email,
      accessToken: tokenJson.access_token,
      refreshToken: tokenJson.refresh_token,
      loginTime: new Date(),
    },
    { upsert: true, new: true }
  );

res.redirect('http://localhost:5173/dashboard');

});

app.get('/api/me', async (req, res) => {
  const user = await User.findOne(); 
  if (!user) return res.json({ loggedIn: false });

  res.json({
    loggedIn: true,
    airtableUserId: user.airtableUserId,
    name: user.name,
    email: user.email,
  });
});

app.get('/api/bases', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) return res.status(401).json({ error: 'Not logged in' });

    const token = user.accessToken;

    const resp = await fetch('https://api.airtable.com/v0/meta/bases', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await resp.json();
    console.log('Airtable /meta/bases response:', data); 

    if (!resp.ok) {
      console.error('Airtable bases error:', data);
      return res.status(resp.status).json(data);
    }

    res.json({ bases: data.bases || [] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/tables', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) return res.status(401).json({ error: 'Not logged in' });

    const token = user.accessToken;

    const resp = await fetch(
      `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await resp.json();
    console.log('Airtable /meta/bases/{baseId}/tables response:', data); 

    if (!resp.ok) {
      return res.status(resp.status).json(data);
    }

    res.json({ tables: data.tables || [] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/fields', (req, res) => {
  const fields = [
    { id: 'name', label: 'Name', type: 'shortText', required: true },
    { id: 'email', label: 'Email', type: 'shortText', required: true },
    { id: 'role', label: 'Role', type: 'singleSelect', required: true, options: ['Engineer', 'Designer', 'PM'] },
    { id: 'githubUrl', label: 'GitHub URL', type: 'shortText', required: false },
    { id: 'about', label: 'About you', type: 'longText', required: false },
  ];
  res.json({ fields });
});

app.get('/api/forms', async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });

    res.json({
      forms: forms.map((f) => ({
        id: f._id,
        title: f.title,
        createdAt: f.createdAt,
      })),
    });
  } catch (e) {
    console.error('List forms error:', e);
    res.status(500).json({ error: 'Failed to load forms' });
  }
});

app.post('/api/forms', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) return res.status(401).json({ error: 'Not logged in' });

    const { title, questions } = req.body;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Title and questions are required' });
    }

    const form = await Form.create({
      ownerUserId: user.airtableUserId,
      airtableBaseId: AIRTABLE_BASE_ID,
      airtableTableName: AIRTABLE_TABLE_NAME,
      title,
      questions,
    });

    res.status(201).json({ formId: form._id });
  } catch (e) {
    console.error('Failed to save form:', e);
    res.status(500).json({ error: 'Failed to save form' });
  }
});

app.get('/api/forms/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    res.json({
      id: form._id,
      title: form.title,
      questions: form.questions,
    });
  } catch (e) {
    console.error('Error loading form:', e);
    res.status(500).json({ error: 'Failed to load form' });
  }
});

app.post('/api/forms/:id/submit', async (req, res) => {
  try {

    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }


    const { answers } = req.body || {};
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'answers object is required' });
    }

    const missing = [];
    for (const q of form.questions) {
      if (q.required && (answers[q.fieldId] == null || answers[q.fieldId] === '')) {
        missing.push(q.fieldId);
      }
    }
    if (missing.length) {
      return res.status(400).json({ error: 'Missing required fields', missing });
    }

    const airtableFields = {
      Name: answers['name'],
      Email: answers['email'],
      Role: answers['role'],
      'GitHub URL': answers['githubUrl'],
      About: answers['about'],
    };

    console.log('Would send to Airtable:', airtableFields);

    const saved = await responseModel.create({
      formId: form._id,
      airtableRecordId: null,  
      answers,
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      responseId: saved._id,
      airtableRecordId: null,
    });
  } catch (e) {
    console.error('Submit error:', e);
    return res.status(500).json({ error: 'Failed to submit response' });
  }
});


app.get('/forms/:id/responses', async (req, res) => {
  try {
    const responses = await responseModel
      .find({ formId: req.params.id })
      .sort({ createdAt: -1 });

    res.json({
      responses: responses.map((r) => ({
        id: r._id,
        createdAt: r.createdAt,
        answers: r.answers,
      })),
    });
  } catch (e) {
    console.error('List responses error:', e);
    res.status(500).json({ error: 'Failed to load responses' });
  }
});

app.post('/webhooks/airtable', express.json(), async (req, res) => {
  try {
    const event = req.body;

    const { type, recordId, formId, answers } = event;

    if (type === 'recordUpdated' && recordId) {
      await responseModel.findOneAndUpdate(
        { airtableRecordId: recordId },
        { answers, updatedAt: new Date() }
      );
    } else if (type === 'recordDeleted' && recordId) {
      await responseModel.findOneAndUpdate(
        { airtableRecordId: recordId },
        { deletedInAirtable: true }
      );
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Webhook error:', e);
    res.status(500).json({ error: 'Webhook handling failed' });
  }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
