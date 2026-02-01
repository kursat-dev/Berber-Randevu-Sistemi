import mongoose from 'mongoose';

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

// Prevent model recompilation error in dev
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
