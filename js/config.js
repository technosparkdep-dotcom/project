/* ══════════════════════════
   TECHNOSPARK — config.js
   Points the frontend at the backend API.
   Change API_BASE_URL if you deploy the backend somewhere else.
══════════════════════════ */
const API_BASE_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
  ? 'http://localhost:5000/api'
  : 'http://localhost:5000/api'; // TODO: replace with your deployed backend URL, e.g. https://api.yourdomain.com/api
