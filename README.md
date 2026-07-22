# MERN Stack Project

This repository is scaffolded for a MERN-stack application.

## Structure

- `server/` - Express backend with MongoDB via Mongoose
- `client/` - React frontend built with Vite

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Start both frontend and backend in development:

```bash
npm run dev
```

3. Backend runs on `http://localhost:5000` by default.
4. Frontend runs on `http://localhost:5173` by default.

## Notes

- Copy `server/.env.example` to `server/.env` and add your MongoDB connection.
- Update `client/src/App.jsx` and `server/src/index.js` to build your app.
