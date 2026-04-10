# Form Builder

An AI-powered form builder with dynamic logic, OAuth authentication, Airtable integration, and advanced analytics like sentiment analysis, spam detection, and response insights.

## Links

- [GitHub Repository](https://github.com/Samiksha-Lone/form-builder)

## Problem Statement

Businesses and individuals need an easy way to create dynamic forms, collect responses, and analyze data without coding expertise. Traditional form builders lack advanced analytics, conditional logic, and secure integrations.

## Problem–Solution Mapping

To address static form structures, we implement dynamic conditional logic for adaptive field display. For efficient data analysis, AI-powered sentiment analysis, spam detection, and quality scoring are integrated. Seamless Airtable integration with OAuth authentication resolves integration issues, while multi-provider OAuth with JWT ensures security. Comprehensive analytics provide insights into response patterns.

## System Architecture

- **Frontend**: React-based single-page application for form creation and management
- **Backend**: Node.js RESTful API server for authentication, form operations, and AI analytics
- **Database**: MongoDB for storing users, forms, and responses
- **Authentication**: OAuth 2.0 with JWT for secure sessions
- **AI Integration**: Hugging Face models for NLP tasks
- **External Integrations**: Airtable API for data synchronization

## Features

- Multi-provider OAuth authentication (Airtable and Google)
- Dynamic form builder with conditional logic
- Response collection and management
- Airtable integration with OAuth
- AI-powered form generation from natural language
- Form templates
- Sentiment analysis, spam detection, and quality scoring
- Key phrase extraction and smart suggestions
- Analytics dashboard with timelines
- Responsive design

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT + OAuth
- **AI**: Hugging Face Inference

## Installation / Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (local or cloud)
- Airtable account with API access
- Google OAuth credentials
- Hugging Face API token (optional, for AI features)

### Backend Setup

1. **Clone and navigate to backend directory:**
   ```bash
   cd form-builder-backend
   npm install
   ```

2. **Create environment file:**
   Create `.env` file with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/form-builder
   JWT_SECRET=your-secure-jwt-secret
   AIRTABLE_CLIENT_ID=your-airtable-client-id
   AIRTABLE_CLIENT_SECRET=your-airtable-client-secret
   AIRTABLE_BASE_ID=your-airtable-base-id
   AIRTABLE_TABLE_NAME=your-table-name
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   HUGGINGFACE_API_KEY=your-huggingface-token
   ```

3. **Start the backend server:**
   ```bash
   node server.js
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd ../form-builder-frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   Application available at `http://localhost:5173`

### Production Build

```bash
cd form-builder-frontend
npm run build
npm run preview
```

## Screenshots

![Dashboard Overview](outputs/dashboard.webp)

![Form Builder](outputs/form.webp)

![Analytics Dashboard](outputs/analysis.webp)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credit

If you use or build upon this project, please provide attribution:

Samiksha Lone

https://github.com/Samiksha-Lone