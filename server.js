import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For query parameters

// Import API handlers - convert Express req/res to Vercel format
import registerHandler from './api/auth/register.ts';
import loginHandler from './api/auth/login.ts';
import appointmentsHandler from './api/appointments.ts';

// Helper to convert Express req/res to Vercel format
const toVercelHandler = (handler) => (req, res) => {
  // Debug log
  console.log('Request:', req.method, req.url, 'Query:', req.query);
  
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
      res.json(data);
    },
  };
  
  handler(vercelReq, vercelRes);
};

// API Routes
app.post('/api/auth/register', toVercelHandler(registerHandler));
app.post('/api/auth/login', toVercelHandler(loginHandler));
app.get('/api/appointments', toVercelHandler(appointmentsHandler));
app.post('/api/appointments', toVercelHandler(appointmentsHandler));
app.put('/api/appointments', toVercelHandler(appointmentsHandler));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 MONGO_URI: ${process.env.MONGODB_URI ? 'Loaded' : 'NOT FOUND'}`);
});

