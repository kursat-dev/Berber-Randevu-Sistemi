import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import connectToDatabase from './db';

// Define Schema
const AppointmentSchema = new mongoose.Schema({
    user_id: { type: String, required: false },
    ad: { type: String, required: true },
    soyad: { type: String, required: true },
    telefon: { type: String, required: true },
    hizmet: { type: String, required: true },
    tarih: { type: String, required: true }, // Format: YYYY-MM-DD
    saat: { type: String, required: true },
    durum: { type: String, default: 'beklemede' },
    created_at: { type: Date, default: Date.now }
});

// Prevent model recompilation error in dev
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await connectToDatabase();

    if (req.method === 'GET') {
        // Get booked slots for a specific date
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'Date parameter is required' });
        }

        try {
            const appointments = await Appointment.find({
                tarih: date as string,
                durum: { $ne: 'iptal' } // Don't block cancelled slots
            }).select('saat -_id'); // Only return 'saat' field

            return res.status(200).json(appointments);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    if (req.method === 'POST') {
        // Create new appointment
        try {
            const { user_id, ad, soyad, telefon, hizmet, tarih, saat } = req.body;

            // Check if slot is already taken
            const existing = await Appointment.findOne({
                tarih,
                saat,
                durum: { $ne: 'iptal' }
            });

            if (existing) {
                return res.status(409).json({ error: 'Bu saat dilimi dolu.' });
            }

            const newAppointment = await Appointment.create({
                user_id,
                ad,
                soyad,
                telefon,
                hizmet,
                tarih,
                saat
            });

            return res.status(201).json(newAppointment);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const { id, durum } = req.body;

            if (!id || !durum) {
                return res.status(400).json({ error: 'Missing id or durum' });
            }

            await connectToDatabase();

            const updatedAppointment = await Appointment.findByIdAndUpdate(
                id,
                { durum },
                { new: true }
            );

            if (!updatedAppointment) {
                return res.status(404).json({ error: 'Appointment not found' });
            }

            return res.status(200).json(updatedAppointment);
        } catch (error) {
            console.error('Error updating appointment:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
