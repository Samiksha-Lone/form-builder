const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv').config();

const User = require('./src/models/user.model');

const authRoutes = require('./src/routes/auth.routes');
const formRoutes = require('./src/routes/form.routes');
const airtableRoutes = require('./src/routes/airtable.routes');
const responseRoutes = require('./src/routes/response.routes');

const app = express();

const requiredEnvVars = [
  'AIRTABLE_CLIENT_ID',
  'AIRTABLE_CLIENT_SECRET',
  'MONGODB_URI',
  'JWT_SECRET',
  'AIRTABLE_BASE_ID',
  'AIRTABLE_TABLE_NAME',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`ERROR: Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

app.use(express.json());
  app.use(cors({
  origin: 'http://localhost:5173',
  credentials: false,
}));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/auth', authRoutes);
app.use('/api', airtableRoutes); 
app.use('/api/forms', formRoutes); 
app.use('/api/forms', responseRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Form Builder API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
