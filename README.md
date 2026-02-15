# FormBuilder

A full-stack MERN application for creating, managing, and responding to dynamic forms with multi-provider OAuth authentication (Airtable & Google) and Airtable base integration.

## Features

- **Multi-Provider Authentication**: 
  - Airtable OAuth 2.0 (PKCE flow)
  - Google OAuth 2.0
  - JWT-based session management

- **Form Builder**: 
  - Create forms with multiple field types (Short Text, Long Text, Single Select)
  - User-friendly dashboard interface
  - Full CRUD operations on forms

- **Conditional Logic**: 
  - Advanced visibility rules with AND/OR conditions
  - Show/hide fields dynamically based on user input

- **Response Management**: 
  - Collect and store form responses in MongoDB
  - View and export responses for each form
  - Rate limiting on form submissions to prevent abuse

- **Airtable Integration**: 
  - Browse Airtable bases and tables
  - Support for syncing data with Airtable
  - OAuth token management for secure access

- **AI-Powered Features**:
  - **AI Form Generation**: Generate a complete form structure from a natural language prompt.
  - **AI Form Templates**: Access pre-built templates for common use cases.
  - **Sentiment Analysis**: Detect positive, negative, and neutral feedback trends.
  - **Spam Detection**: Identify suspicious or bot-like responses.
  - **Quality Scoring**: Rate response quality based on detail and completeness.
  - **Key Phrase Extraction**: Understand response themes and top keywords.
  - **Smart Suggestions**: Get real-time recommendations to improve form structure.
  - **AI Insights Discoverability**: Contextual insights integrated directly into the builder and form list.
  - **Response Timeline**: Track submission patterns and engagement over time.

- **Responsive UI**: 
  - Built with React 19
  - Smooth animations with Framer Motion
  - Tailwind CSS for modern styling
  - Mobile-friendly design

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animation library
- **React Router v7** - Client-side routing
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime
- **Express 5.x** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Airtable.js** - Airtable API client
- **Google Auth Library** - Google OAuth integration
- **Hugging Face Inference** - AI/ML model inference (FREE)
- **Natural.js** - NLP library (FREE)
- **Compromise.js** - Alternative NLP (FREE)

## Project Structure

```
form-builder/
├── form-builder-backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── middlewares/      # Auth, validation, rate limiting
│   │   ├── models/           # MongoDB schemas (User, Form, Response)
│   │   ├── routes/           # API routes (auth, forms, responses, airtable)
│   │   └── utils/            # Helper functions (conditional logic)
│   ├── server.js             # Express server setup
│   └── package.json
│
└── form-builder-frontend/
    ├── src/
    │   ├── components/       # React components (FormViewer, LoadingSpinner, etc.)
    │   ├── pages/            # Route pages (Login, FormResponses)
    │   ├── logic/            # Business logic (visibility rules)
    │   ├── utils/            # API client, helpers
    │   ├── App.jsx           # Main app with routing
    │   └── index.css         # Global styles
    ├── vite.config.js        # Vite configuration
    └── package.json
```

## API Endpoints

### Authentication (`/auth`)
- `GET /auth/airtable` - Start Airtable OAuth flow
- `GET /auth/airtable/callback` - Handle Airtable OAuth callback
- `GET /auth/google` - Start Google OAuth flow
- `GET /auth/google/callback` - Handle Google OAuth callback
- `POST /auth/login` - Native login with email/password

### Forms (`/api/forms`)
- `GET /api/forms` - List all forms (requires auth)
- `POST /api/forms` - Create new form (requires auth)
- `GET /api/forms/:id` - Get form details
- `POST /api/forms/:id/submit` - Submit form response
- `PUT /api/forms/:id` - Update form (requires auth)
- `DELETE /api/forms/:id` - Delete form (requires auth)
- `GET /api/forms/:formId/responses` - Get form responses (requires auth)
- `POST /api/forms/generate` - Generate form from AI prompt (requires auth)

### Airtable Integration (`/api`)
- `GET /api/me` - Get current user info (requires auth)
- `GET /api/bases` - List Airtable bases (requires auth)
- `GET /api/tables` - List tables in a base (requires auth)
- `GET /api/fields` - Get table fields

### AI Analytics & Insights (`/api`)
- `GET /api/forms/:formId/analytics` - Get comprehensive analytics report (requires auth)
- `GET /api/forms/:formId/analytics/sentiment` - Get sentiment analysis (requires auth)
- `GET /api/forms/:formId/analytics/spam` - Get spam detection stats (requires auth)
- `GET /api/forms/:formId/analytics/quality` - Get response quality scores (requires auth)
- `GET /api/forms/:formId/analytics/phrases` - Get top phrases/themes (requires auth)
- `GET /api/forms/:formId/analytics/timeline` - Get submission timeline (requires auth)
- `GET /api/forms/:formId/improvements` - Get form improvement suggestions (requires auth)
- `GET /api/forms/:formId/flagged-responses` - Get flagged responses for review (requires auth)

### Form Templates (`/api`)
- `GET /api/templates` - List all available form templates
- `GET /api/templates/:templateId` - Get specific template details

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance running
- Airtable account with API credentials
- Google OAuth credentials

### 1. Backend Setup

```bash
cd form-builder-backend
npm install
```

Create a `.env` file in the backend directory:

```env
# Server
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/form-builder

# JWT
JWT_SECRET=your-secret-key-here

# Airtable OAuth
AIRTABLE_CLIENT_ID=your-airtable-client-id
AIRTABLE_CLIENT_SECRET=your-airtable-client-secret
AIRTABLE_BASE_ID=your-base-id
AIRTABLE_TABLE_NAME=your-table-name

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS
FRONTEND_URL=http://localhost:5173

# AI Features (FREE - using Hugging Face)
ENABLE_AI_FEATURES=true
SPAM_DETECTION_ENABLED=true
HUGGINGFACE_API_KEY=your_huggingface_token_here
SENTIMENT_CACHE_TTL=3600000
```

Start the server:

```bash
node server.js
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd form-builder-frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Build for Production

**Backend:**
```bash
npm start  # or configure PM2/Docker
```

**Frontend:**
```bash
npm run build
npm run preview
```

## AI Features Setup

The form builder includes **FREE AI-powered analytics** using Hugging Face API:

### Optional: Enable AI Features

1. **Create Hugging Face Account** (free tier):
   - Visit https://huggingface.co/join
   - Create account (no credit card needed)
   - Go to Settings → Access Tokens
   - Create new read-only token

2. **Add to .env**:
   ```env
   ENABLE_AI_FEATURES=true
   HUGGINGFACE_API_KEY=your_token_here
   SPAM_DETECTION_ENABLED=true
   ```

3. **Restart backend server**

### AI Features Included (All FREE):
- Sentiment Analysis (Positive/Negative/Neutral detection)
- Spam Detection (Bot/suspicious response detection)
- Response Quality Scoring (Automatic quality assessment)
- Key Phrase Extraction (Automatic theme detection)
- Form Improvement Suggestions (Smart recommendations)
- Response Timeline (Submission pattern analysis)
- Flagged Response Review (Quality control)

## Usage

1. **Login**: Navigate to the login page and authenticate via Airtable, Google, or email/password
2. **Create Form**: Go to dashboard and create a new form
3. **Add Fields**: Add fields with various types and configure conditional logic
4. **Share Form**: Get the public form link and share with respondents
5. **View Responses**: Track submissions and export data
6. **Use AI Builder & Analytics**:
   - Describe your form in the AI Builder box to generate questions instantly.
   - Use AI Templates for high-conversion pre-built designs.
   - Click AI INSIGHTS while building to see response analytics.
   - Check sentiment and quality scores for all your submissions.
   - Extract key themes and get smart improvement suggestions.

### Quick AI Features Test

After collecting some responses, try these API calls:

```bash
# Get overall analytics
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/forms/FORM_ID/analytics

# Get sentiment breakdown
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/forms/FORM_ID/analytics/sentiment

# Get form improvement suggestions
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/forms/FORM_ID/improvements

# Get form templates
curl http://localhost:5000/api/templates
```

## Environment Variables

### Backend Required Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `AIRTABLE_CLIENT_ID` - Airtable OAuth client ID
- `AIRTABLE_CLIENT_SECRET` - Airtable OAuth client secret
- `AIRTABLE_BASE_ID` - Airtable base ID
- `AIRTABLE_TABLE_NAME` - Airtable table name
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

## Security Features

- JWT authentication for protected routes
- Rate limiting on form submissions
- CORS configuration for frontend integration
- Input validation on all API endpoints
- Secure OAuth 2.0 integration

## Development

### Linting

**Frontend:**
```bash
npm run lint
```

### Debugging

- Frontend uses React DevTools and Vite debugging
- Backend logs to console with error handling
- Check browser console for client-side errors

## License

MIT
