import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Signup
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
    const { name, surname, phone, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            surname,
            phone,
            email,
            password: hashedPassword,
        });

        await user.save();

        const payload = {
            id: user.id,
            role: user.role,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            token,
            user: { id: user.id, name: user.name, role: user.role }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Signin
router.post('/signin', async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password!); // user.password is optional in interface but required in DB
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const payload = {
            id: user.id,
            role: user.role,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        console.log(`User ${email} signed in successfully. Role: ${user.role}`);
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (err) {
        console.error('Signin error:', err);
        res.status(500).send('Server Error');
    }
});

// Get Me (Protected)
import { auth, AuthRequest } from '../middleware/auth';
router.get('/me', auth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

export default router;
