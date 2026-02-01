import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// User Schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  metadata: {
    ad: String,
    soyad: String,
    telefon: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@berber.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`Admin user already exists: ${adminEmail}`);
      console.log('To change password, delete the user first or update manually in database.');
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(adminPassword, salt);

    // Create admin user
    const admin = await User.create({
      email: adminEmail,
      password_hash,
      role: 'admin',
      metadata: {
        ad: 'Admin',
        soyad: 'User'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('⚠️  Please change the password after first login!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating admin user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();

