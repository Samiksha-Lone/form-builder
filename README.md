# Form Builder – MERN + Airtable

This is a full‑stack form builder application built for a tech hiring task. It uses **Airtable OAuth** for login, **React (Vite)** for the UI, **Node/Express** for the API, and **MongoDB** for persistence.

> In the final submitted version, form submissions are saved to **MongoDB**.  
> The Airtable record‑creation call is commented/stubbed in the backend due to OAuth/permission limits, but the mapping logic is present and can be re‑enabled.

---

## Tech Stack

- **Frontend:** React (Vite), React Router, Tailwind CSS  
- **Backend:** Node.js, Express  
- **Database:** MongoDB (Mongoose)  
- **External API:** Airtable OAuth 2.0 + REST API  

---

## Features

- **Airtable OAuth Login**
  - “Login with Airtable” redirects to Airtable’s OAuth consent page.
  - Backend exchanges the auth code for access/refresh tokens.
  - User + tokens are stored in MongoDB.

- **Dashboard**
  - Shows authenticated state.
  - Lists all saved forms from MongoDB.
  - Button to create a new form.

- **Form Builder**
  - Predefined fields: **Name, Email, Role, GitHub URL, About**.
  - Enable/disable fields and mark as required.
  - Saves form structure as a `Form` document in MongoDB.

- **Form Submission**
  - Public form URL: `/form/:formId`.
  - Validates required fields on client and server.
  - On submit, stores the response as a `Response` document in MongoDB.

- **View Responses**
  - URL: `/forms/:formId/responses`.
  - Lists responses for a form with timestamp and selected answers.

---

## Project Structure

form-builder/
  form-builder-backend/
    server.js
    package.json
    .env                 # NOT committed, local only
    src/
      models/
        user.model.js
        form.model.js
        response.model.js
      middlewares/
        auth.middleware.js
      routes/
        auth.routes.js
        form.routes.js
        airtable.routes.js
        response.routes.js
  form-builder-frontend/
    package.json
    index.html
    vite.config.js
    src/
      main.jsx
      App.jsx
      pages/
        Login.jsx
        Dashboard.jsx
        FormResponses.jsx
      components/
        FormViewer.jsx
      utils/
        api.js
      styles/
        index.css


---

## Backend Setup

Create a `.env` file inside **`form-builder-backend`**:

AIRTABLE_CLIENT_ID=4c6f6195-6afd-4445-8404-e881614ae230
AIRTABLE_CLIENT_SECRET=a2f2d3e2d765feb295eb142c18dd1d29cc79b8b382d18c4b8431f032702a2be5
REDIRECT_URL=http://localhost:5000/auth/airtable/callback
NAME=Form Builder
MONGODB_URI=mongodb://localhost:27017/form_builder
JWT_SECRET=0FddSyPQHQR2LWuYYgIzVorLx7EYBHtIRrJ7GIQ6fOaaBiHpW4BFJdttuepOkPrT
AIRTABLE_BASE_ID=appnubAoLb07wiTzh
AIRTABLE_TABLE_NAME=Users


OAuth redirect URI used in both Airtable settings and `server.js`:

http://localhost:5000/auth/airtable/callback


> In the final `/api/forms/:id/submit` handler, the call to `https://api.airtable.com/v0/...` is commented/removed, and only MongoDB storage is performed. The payload that would be sent to Airtable is logged so it can be wired back easily later.

### Run Backend

cd form-builder-backend
npm install
node server.js

Server: http://localhost:5000


---

## Frontend Setup

The frontend talks to the backend at `http://localhost:5000`.

### Run Frontend

cd form-builder-frontend
npm install
npm run dev

Vite dev server: http://localhost:5173


---

## Usage Flow

1. Open `http://localhost:5173/login`.  
2. Click **“Login with Airtable”** and approve the integration.  
3. You are redirected to the **Dashboard**.  
4. Click **“Create form”**, configure fields (enable/disable, required), and save.  
5. In **Your forms**, click **“Open form”** to navigate to `/form/:formId`.  
6. Fill out the form and submit.  
7. Go back to the Dashboard and click **“Responses”** for that form  
   (`/forms/:formId/responses`) to see the submissions stored in MongoDB.

---

## Demo
Repository: <https://github.com/Samiksha-Lone/form-builder>


---

## Notes & Trade‑offs

- Airtable OAuth flow and token storage are implemented end‑to‑end.  
- Due to time and permission constraints, production writes to Airtable are disabled; MongoDB is the source of truth for responses in this version.  
- Error and loading states are handled on the Login, Dashboard, Form Viewer, and Responses screens to keep the UX robust even when APIs fail.
