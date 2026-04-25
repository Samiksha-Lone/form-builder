# FormCraft AI — Smart Form Builder with Airtable Integration

> A modern, AI-powered form building platform that seamlessly connects your responses to Airtable while providing deep insights through sentiment analysis.

## 🔗 Links
- **GitHub Repository**: [https://github.com/Samiksha-Lone/form-builder](https://github.com/Samiksha-Lone/form-builder)

## Overview

FormCraft AI is a sophisticated form management system designed for businesses and creators who need more than just a static data collection tool. It combines the power of AI to generate templates and analyze responses with the flexibility of Airtable for data management and storage.

## Problem Statement

- **Tedious Form Creation**: Manual form design is time-consuming and often lacks professional structure.
- **Drowning in Data**: High-volume form responses are hard to analyze without manual effort to identify trends or spam.
- **Syncing Issues**: Moving data from forms to external tools like Airtable often requires brittle third-party connectors or manual exports.

## Solution

FormCraft AI automates the entire lifecycle of a form. Using Hugging Face AI, it can generate entire form structures from a single prompt and analyze respondent sentiment in real-time. It features native, secure OAuth integration with Airtable to ensure your data is always synced directly to your preferred workspace.

## Key Features

- 🔐 **Dual OAuth Authentication** — Secure, specialized access via Google or Airtable OAuth 2.0
- 🤖 **AI-Powered Builder** — Generate professional form structures instantly from a simple text prompt
- 🔌 **Native Airtable Sync** — Direct, real-time mapping of form responses to your Airtable bases and tables
- 📊 **Smart Analytics Dashboard** — Visual representation of response trends, timelines, and sentiment data
- 🛡️ **AI Spam & Sentiment Detection** — Automatic analysis of response content to flag spam and categorize sentiment
- 🧩 **Dynamic Form Viewer** — A sleek, mobile-optimized interface for users to submit responses securely
- ⚙️ **Advanced Form Management** — Full CRUD capabilities with support for conditional logic and custom field types
- 📱 **Responsive UI** — Premium, mobile-first design built with modern glassmorphic aesthetics

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Vite, Tailwind CSS, Framer Motion, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **AI Layer** | Hugging Face Inference API |
| **Auth & Security** | JWT, Google OAuth, Airtable OAuth, bcryptjs |
| **Icons** | Lucide React |
| **Deployment** | Vercel (frontend), Render (backend) |

## Architecture / Flow

```text
User → React Frontend → Axios → Express API → MongoDB
                                      ↓
                           JWT Auth · AI Analysis
                           Airtable Sync · OAuth
```

## My Contribution

**I independently designed and built this entire project from scratch**, including:

- 🖥️ **Frontend Architecture** — Developed a modular React application with complex state management for the form builder and analytics suite
- ⚙️ **Backend Engineering** — Built a robust Express server handling complex OAuth 2.0 flows and direct Airtable API integrations
- 🤖 **AI Implementation** — Architected the NLP pipeline using Hugging Face for real-time sentiment analysis and form generation
- 🔌 **Integration Design** — Engineered the sync engine that maps dynamic form schemas to Airtable's relational structure
- 🚀 **Deployment & DevOps** — Configured the full-stack environment, managed database clusters, and ensured secure communication between services

## Setup

### Prerequisites
Node.js 18+, npm, MongoDB account, Airtable Developer account, Google Cloud Console project

### 1. Backend

```bash
cd form-builder-backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
AIRTABLE_CLIENT_ID=your_airtable_client_id
AIRTABLE_CLIENT_SECRET=your_airtable_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
HUGGINGFACE_API_KEY=your_huggingface_key
```

```bash
node server.js   # http://localhost:5000
```

### 2. Frontend

```bash
cd form-builder-frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev   # http://localhost:5173
```

## Screenshots

### Dashboard
![Dashboard](outputs/dashboard.webp)

### Form Builder & AI Generation
![Form Builder](outputs/form.webp)

### AI Insights & Analytics
![AI Insights](outputs/analysis.webp)

## Future Improvements

- [ ] Multi-page form support for complex surveys
- [ ] Drag-and-drop builder interface for visual customization
- [ ] Integration with Slack/Discord for real-time submission alerts

## License

ISC License — see [LICENSE](LICENSE) for details.

## Credits

**Developed by [Samiksha Lone](https://github.com/Samiksha-Lone)**