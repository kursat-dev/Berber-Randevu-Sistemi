/**
 * Database Seeding Script
 * Run this script to populate initial data:
 * - Services
 * - Working Hours
 * - Admin User
 * 
 * Usage: npx ts-node scripts/seed.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dbConnect from '../src/lib/mongodb';
import Service from '../src/models/Service';
import WorkingHours from '../src/models/WorkingHours';
import Admin from '../src/models/Admin';

async function seed() {
    console.log('🌱 Starting database seeding...\n');

    try {
        await dbConnect();
        console.log('✅ Connected to MongoDB\n');

        // 1. Seed Services
        console.log('📦 Seeding services...');
        await Service.deleteMany({}); // Clear existing

        const services = await Service.insertMany([
            {
                name: 'Saç Kesimi',
                description: 'Profesyonel erkek saç kesimi',
                price: 150,
                duration: 30,
                isActive: true,
                displayOrder: 1,
            },
            {
                name: 'Sakal Tıraşı',
                description: 'Ustura ile sakal tıraşı',
                price: 100,
                duration: 20,
                isActive: true,
                displayOrder: 2,
            },
            {
                name: 'Saç + Sakal Kombo',
                description: 'Saç kesimi ve sakal tıraşı',
                price: 220,
                duration: 45,
                isActive: true,
                displayOrder: 3,
            },
            {
                name: 'Ağda',
                description: 'Yüz ve burun ağdası',
                price: 80,
                duration: 15,
                isActive: true,
                displayOrder: 4,
            },
            {
                name: 'Cilt Bakımı',
                description: 'Profesyonel cilt bakımı ve maske',
                price: 200,
                duration: 60,
                isActive: true,
                displayOrder: 5,
            },
        ]);

        console.log(`✅ Created ${services.length} services\n`);

        // 2. Seed Working Hours
        console.log('⏰ Seeding working hours...');
        await WorkingHours.deleteMany({}); // Clear existing

        const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

        const workingHoursData = [];

        for (let day = 0; day <= 6; day++) {
            if (day === 0) {
                // Sunday - Closed
                workingHoursData.push({
                    dayOfWeek: day,
                    isOpen: false,
                    openTime: '00:00',
                    closeTime: '00:00',
                    slotInterval: 30,
                });
            } else {
                // Monday to Saturday - Open 09:00 - 19:00 with lunch break
                workingHoursData.push({
                    dayOfWeek: day,
                    isOpen: true,
                    openTime: '09:00',
                    closeTime: '19:00',
                    slotInterval: 30,
                    breakStart: '13:00',
                    breakEnd: '14:00',
                });
            }
        }

        const workingHours = await WorkingHours.insertMany(workingHoursData);
        console.log(`✅ Created working hours for all 7 days\n`);

        // 3. Seed Admin User
        console.log('👤 Seeding admin user...');
        await Admin.deleteMany({}); // Clear existing

        const passwordHash = await bcrypt.hash('admin123', 10);

        const admin = await Admin.create({
            username: 'admin',
            passwordHash,
            fullName: 'Berber Yönetici',
            email: 'admin@berber.com',
            role: 'owner',
        });

        console.log('✅ Created admin user');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('   ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!\n');

        console.log('🎉 Seeding completed successfully!\n');
        console.log('Summary:');
        console.log(`- ${services.length} services created`);
        console.log('- 7 working hours configurations created');
        console.log('- 1 admin user created\n');

    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

seed();
