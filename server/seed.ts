import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/berber-randevu');
        console.log('MongoDB Connected for Seeding');

        const email = 'yazilim887@gmail.com';
        const password = 'm3pmyJMujCa7';

        // Check if admin exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log('Admin user already exists. Updating password...');
            const salt = await bcrypt.genSalt(10);
            existingAdmin.password = await bcrypt.hash(password, salt);
            existingAdmin.role = 'admin';
            await existingAdmin.save();
            console.log('Admin password updated.');
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newAdmin = new User({
                name: 'Admin',
                surname: 'User',
                phone: '0000000000',
                email,
                password: hashedPassword,
                role: 'admin',
            });

            await newAdmin.save();
            console.log('Admin user created successfully.');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
