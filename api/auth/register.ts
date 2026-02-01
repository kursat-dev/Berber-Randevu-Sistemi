import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../db.js';
import User from '../models/User.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { email, password, ad, soyad, telefon } = req.body;

        if (!email || !password || !ad || !soyad) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await connectToDatabase();

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await User.create({
            email,
            password_hash,
            metadata: {
                ad,
                soyad,
                telefon
            }
        });

        return res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role,
                metadata: newUser.metadata
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
