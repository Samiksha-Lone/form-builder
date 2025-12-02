--> Form Builder – MERN + Airtable
Full‑stack form builder application built for the Tech Hiring Task. It uses Airtable OAuth for login, React for the UI, Node/Express for the API, and MongoDB for data storage.

--> Tech Stack
Frontend: React (Vite), React Router, Tailwind CSS
Backend: Node.js, Express
Database: MongoDB (Mongoose)
External API: Airtable OAuth 2.0 + REST API

--> Folder Structure
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

