import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import appointmentRoutes from './routes/appointments';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/berber-randevu';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Root Route
app.get('/', (req, res) => {
    res.send('Barber Appointment System API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
