import './load-env.js';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For query parameters

// Import API handlers - convert Express req/res to Vercel format
import registerHandler from './api/auth/register.ts';
import loginHandler from './api/auth/login.ts';
import appointmentsHandler from './api/appointments.ts';
import settingsHandler from './api/settings.ts';

// Helper to convert Express req/res to Vercel format
const toVercelHandler = (handler) => async (req, res) => {
  // Debug log
  console.log(`[${new Date().toISOString()}] Incoming ${req.method} ${req.url}`);
  
  const vercelReq = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query || {},
    body: req.body,
  };
  
  const vercelRes = {
    status: (code) => {
      res.status(code);
      return vercelRes;
    },
    json: (data) => {
      console.log(`[${new Date().toISOString()}] Sending JSON response for ${req.url}`);
      res.json(data);
    },
  };
  
  try {
    await handler(vercelReq, vercelRes);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error in handler ${req.url}:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// API Routes
app.post('/api/auth/register', toVercelHandler(registerHandler));
app.post('/api/auth/login', toVercelHandler(loginHandler));
app.get('/api/appointments', toVercelHandler(appointmentsHandler));
app.post('/api/appointments', toVercelHandler(appointmentsHandler));
app.put('/api/appointments', toVercelHandler(appointmentsHandler));
app.get('/api/settings', toVercelHandler(settingsHandler));
app.put('/api/settings', toVercelHandler(settingsHandler));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 MONGO_URI: ${process.env.MONGODB_URI ? 'Loaded' : 'NOT FOUND'}`);
});

