import express, { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import { auth, AuthRequest } from '../middleware/auth';
import AdminSettings from '../models/AdminSettings';

const router = express.Router();

// Get Approved Appointments (Slots) for a specific date
// Public or User protected? Let's make it public so people can see slots, or user protected as per req.
// Req: "Randevu Sayfası: Sadece giriş yapmış kullanıcılar erişebilir"
router.get('/', auth, async (req: Request, res: Response) => {
    const { date } = req.query; // YYYY-MM-DD

    if (!date) {
        return res.status(400).json({ message: 'Date parameter is required' });
    }

    try {
        const appointments = await Appointment.find({
            date: date as string,
            status: { $in: ['approved', 'pending'] } // Pending slots might also be considered taken to avoid double booking? Or just approved? 
            // "Dolu saatler pasif" -> If pending, maybe we block it too? Let's block pending too for safety.
        }).select('time status');

        res.json(appointments);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Create Appointment
router.post('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
    const { date, time } = req.body;
    const userId = req.user.id;

    try {
        // 1. Check if Sunday
        const dayOfWeek = new Date(date).getDay();
        if (dayOfWeek === 0) { // 0 = Sunday
            res.status(400).json({ message: 'We are closed on Sundays.' });
            return;
        }

        // 2. Check Time Range (08:30 - 20:00)
        // Simple string comparison works for HH:mm if padded.
        if (time < '08:30' || time > '20:00') {
            res.status(400).json({ message: 'Appointments are only available between 08:30 and 20:00.' });
            return;
        }

        // 3. Check Availability
        const existing = await Appointment.findOne({
            date,
            time,
            status: { $in: ['approved', 'pending'] },
        });

        if (existing) {
            res.status(400).json({ message: 'This slot is already booked or pending approval.' });
            return;
        }

        // 4. Create
        const newAppointment = new Appointment({
            userId,
            date,
            time,
            status: 'pending', // Admin approval required
        });

        await newAppointment.save();

        res.json(newAppointment);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get User's Appointments
router.get('/my-appointments', auth, async (req: AuthRequest, res: Response) => {
    try {
        const appointments = await Appointment.find({ userId: req.user.id }).sort({ date: 1, time: 1 });
        res.json(appointments);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

export default router;
