import express, { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import AdminSettings from '../models/AdminSettings';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Middleware to check if user is admin
const adminAuth = (req: AuthRequest, res: Response, next: express.NextFunction) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};

// Apply auth and admin check to all routes
router.use(auth, adminAuth);

// Get All Appointments (Filter by status optional)
router.get('/appointments', async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) {
            query = { status };
        }
        const appointments = await Appointment.find(query)
            .populate('userId', 'name surname phone email')
            .sort({ date: 1, time: 1 });
        res.json(appointments);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update Appointment Status (Approve/Reject)
router.put('/appointments/:id', async (req: Request, res: Response): Promise<void> => {
    const { status } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
    }

    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!appointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }

        res.json(appointment);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get Settings
router.get('/settings', async (req: Request, res: Response) => {
    try {
        let settings = await AdminSettings.findOne();
        if (!settings) {
            // Create default if not exists
            settings = new AdminSettings();
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update Settings
router.put('/settings', async (req: Request, res: Response) => {
    const { workingHours, disabledDates, isShopOpen } = req.body;

    try {
        let settings = await AdminSettings.findOne();
        if (!settings) {
            settings = new AdminSettings();
        }

        if (workingHours) settings.workingHours = workingHours;
        if (disabledDates) settings.disabledDates = disabledDates;
        if (isShopOpen !== undefined) settings.isShopOpen = isShopOpen;

        await settings.save();
        res.json(settings);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

export default router;
