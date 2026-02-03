# FormBuilder

A MERN stack application for creating dynamic forms with multi-provider OAuth (Airtable & Google) and real-time synchronization with Airtable.

## Features

- **Authentication**: Native Airtable OAuth 2.0 (PKCE) and Google OAuth 2.0.
- **Form Builder**: Drag-and-drop-style interface for creating forms with various field types (Short Text, Long Text, Single Select).
- **Conditional Logic**: Visibility rules (AND/OR) to show/hide fields based on user input.
- **Data Sync**: Responses are stored in MongoDB and optionally synced to Airtable bases in real-time.
- **Responsive UI**: Built with React, Tailwind CSS, and Framer Motion.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **Integrations**: Airtable API, Google OAuth

## Installation

### 1. Backend Setup

Navigate to `form-builder-backend` and create a `.env` file:

```env
# Airtable
AIRTABLE_CLIENT_ID=
AIRTABLE_CLIENT_SECRET=
AIRTABLE_BASE_ID=
AIRTABLE_TABLE_NAME=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Database & Security
MONGODB_URI=
JWT_SECRET=
PORT=5000
```

Install dependencies and start the server:
```bash
npm install
node server.js
```

### 2. Frontend Setup

Navigate to `form-builder-frontend`, install dependencies and start the development server:

```bash
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Project Structure

- `form-builder-backend/`: Express.js server, OAuth handling, and API routes.
- `form-builder-frontend/`: React frontend with form building and viewing capabilities.

## License

MIT
