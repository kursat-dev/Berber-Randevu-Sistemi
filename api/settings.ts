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

// Helper to verify admin token
function verifyAdmin(req: VercelRequest): { valid: boolean; error?: string } {
    try {
        const authHeader = req.headers.authorization;
        console.log('Auth header present:', !!authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { valid: false, error: 'No valid authorization header' };
        }

        const token = authHeader.split(' ')[1];
        if (!token || token === 'null' || token === 'undefined') {
            return { valid: false, error: 'Token is empty or null' };
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
        console.log('Token decoded, role:', decoded.role, 'email:', decoded.email);

        if (decoded.role !== 'admin') {
            return { valid: false, error: 'User is not admin' };
        }

        return { valid: true };
    } catch (error: any) {
        console.error('Token verification error:', error.name, error.message);
        return { valid: false, error: `Token error: ${error.name} - ${error.message}` };
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await connectToDatabase();

    if (req.method === 'GET') {
        try {
            const settingsDoc = await getSettings();
            const settings = settingsDoc.toObject ? settingsDoc.toObject() : settingsDoc;

            // Ensure older database records have durationMinutes
            const services = settings.services.map((s: any) => {
                if (s.durationMinutes === undefined || s.durationMinutes === null) {
                    if (s.id === 'perma') s.durationMinutes = 180;
                    else if (s.id === 'sac-boyama') s.durationMinutes = 120;
                    else s.durationMinutes = 60;
                }
                return s;
            });

            return res.status(200).json({
                services: services,
                timeSlots: settings.timeSlots,
                blockedSlots: settings.blockedSlots
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    if (req.method === 'PUT') {
        // Verify admin token
        const auth = verifyAdmin(req);
        if (!auth.valid) {
            console.error('Settings PUT auth failed:', auth.error);
            return res.status(401).json({ error: auth.error || 'Unauthorized' });
        }

        try {
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
        } catch (error) {
            console.error('Error updating settings:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
