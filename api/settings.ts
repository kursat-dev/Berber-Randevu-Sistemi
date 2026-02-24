import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import connectToDatabase from './db.js';
import Settings from './models/Settings.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Helper to get or create default settings
async function getSettings() {
    let settings = await Settings.findOne({ key: 'main' });
    if (!settings) {
        settings = await Settings.create({ key: 'main' });
    }
    return settings;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await connectToDatabase();

    if (req.method === 'GET') {
        try {
            const settings = await getSettings();
            return res.status(200).json({
                services: settings.services,
                timeSlots: settings.timeSlots,
                blockedSlots: settings.blockedSlots
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    if (req.method === 'PUT') {
        try {
            // Verify admin token
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET) as { role: string };

            if (decoded.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden - Admin only' });
            }

            const { services, timeSlots, blockedSlots } = req.body;

            const updateData: any = { updated_at: new Date() };
            if (services !== undefined) updateData.services = services;
            if (timeSlots !== undefined) updateData.timeSlots = timeSlots;
            if (blockedSlots !== undefined) updateData.blockedSlots = blockedSlots;

            const settings = await Settings.findOneAndUpdate(
                { key: 'main' },
                { $set: updateData },
                { new: true, upsert: true }
            );

            return res.status(200).json({
                services: settings.services,
                timeSlots: settings.timeSlots,
                blockedSlots: settings.blockedSlots
            });
        } catch (error: any) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }
            console.error('Error updating settings:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
