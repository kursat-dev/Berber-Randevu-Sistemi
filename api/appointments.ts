import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import connectToDatabase from './db.js';
import Settings from './models/Settings.js';

// Define Schema
const AppointmentSchema = new mongoose.Schema({
    user_id: { type: String, required: false },
    ad: { type: String, required: true },
    soyad: { type: String, required: true },
    telefon: { type: String, required: true },
    hizmet: { type: String, required: true },
    tarih: { type: String, required: true }, // Format: YYYY-MM-DD
    saat: { type: String, required: true },
    slotlar: { type: [String], default: [] },
    durum: { type: String, default: 'beklemede' },
    created_at: { type: Date, default: Date.now }
});

// Prevent model recompilation error in dev
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

// Default time slots (used for slot calculation)
const DEFAULT_TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

// Helper: calculate required slots from a start time and durationMinutes
function calculateRequiredSlots(startTime: string, durationMinutes: number, timeSlots: string[]): string[] | null {
    const slotCount = Math.ceil(durationMinutes / 60);
    const startIndex = timeSlots.indexOf(startTime);
    if (startIndex === -1) return null;
    if (startIndex + slotCount > timeSlots.length) return null; // not enough slots remaining
    return timeSlots.slice(startIndex, startIndex + slotCount);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await connectToDatabase();

    if (req.method === 'GET') {
        const { date, all } = req.query;

        console.log('GET /api/appointments - Query params:', { date, all, query: req.query });

        try {
            // If all=true, return all appointments (for admin panel)
            if (all === 'true') {
                console.log('Fetching all appointments for admin');
                const appointments = await Appointment.find({})
                    .sort({ tarih: 1, saat: 1 })
                    .lean(); // Use lean() for better performance
                // Map _id to id for frontend compatibility
                const mappedAppointments = appointments.map((apt: any) => ({
                    ...apt,
                    id: apt._id.toString()
                }));
                return res.status(200).json(mappedAppointments);
            }

            // Otherwise, require date parameter for regular users
            if (!date) {
                return res.status(400).json({ error: 'Date parameter is required' });
            }

            // Get booked slots for a specific date
            // Return all individual slots that are occupied (from slotlar array)
            const appointments = await Appointment.find({
                tarih: date as string,
                durum: { $ne: 'iptal' } // Don't block cancelled slots
            }).select('saat slotlar -_id');

            // Flatten all occupied slots
            const occupiedSlots: string[] = [];
            appointments.forEach((apt: any) => {
                if (apt.slotlar && apt.slotlar.length > 0) {
                    occupiedSlots.push(...apt.slotlar);
                } else {
                    // Backward compatibility: old appointments without slotlar
                    occupiedSlots.push(apt.saat);
                }
            });

            // Return unique slots as objects matching old format
            const uniqueSlots = [...new Set(occupiedSlots)];
            return res.status(200).json(uniqueSlots.map(s => ({ saat: s })));
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    if (req.method === 'POST') {
        // Create new appointment
        try {
            const { user_id, ad, soyad, telefon, hizmet, tarih, saat, durationMinutes } = req.body;

            // Server-side date validation
            const appointmentDate = new Date(tarih + 'T00:00:00');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const maxDate = new Date(today);
            maxDate.setDate(maxDate.getDate() + 40);

            if (appointmentDate < today) {
                return res.status(400).json({ error: 'Geçmiş tarihe randevu alınamaz.' });
            }

            if (appointmentDate > maxDate) {
                return res.status(400).json({ error: 'En fazla 40 gün sonrasına randevu alınabilir.' });
            }

            // Calculate required slots based on duration
            const duration = durationMinutes || 60;

            // Fetch actual time slots from settings (admin may have added slots beyond the default range)
            const settingsDoc = await Settings.findOne({ key: 'main' });
            const actualTimeSlots = settingsDoc?.timeSlots?.length ? settingsDoc.timeSlots : DEFAULT_TIME_SLOTS;
            const requiredSlots = calculateRequiredSlots(saat, duration, actualTimeSlots);

            if (!requiredSlots) {
                return res.status(400).json({ error: 'Seçilen saat için yeterli ardışık slot bulunmamaktadır.' });
            }

            // Check if ANY of the required slots are already taken
            const existing = await Appointment.findOne({
                tarih,
                durum: { $ne: 'iptal' },
                $or: [
                    { slotlar: { $in: requiredSlots } },
                    // Backward compatibility: check saat field for old records without slotlar
                    { saat: { $in: requiredSlots }, slotlar: { $exists: true, $size: 0 } },
                    { saat: { $in: requiredSlots }, slotlar: { $exists: false } }
                ]
            });

            if (existing) {
                return res.status(409).json({ error: 'Seçilen saat aralığındaki slotlardan biri veya birkaçı dolu.' });
            }

            const newAppointment = await Appointment.create({
                user_id,
                ad,
                soyad,
                telefon,
                hizmet,
                tarih,
                saat,
                slotlar: requiredSlots
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

            const updatedAppointment = await Appointment.findByIdAndUpdate(
                id,
                { durum },
                { new: true, lean: false }
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

    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ error: 'Missing appointment id' });
            }

            const deleted = await Appointment.findByIdAndDelete(id as string);

            if (!deleted) {
                return res.status(404).json({ error: 'Appointment not found' });
            }

            return res.status(200).json({ success: true, message: 'Randevu silindi.' });
        } catch (error) {
            console.error('Error deleting appointment:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
