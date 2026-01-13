import mongoose, { Schema, Model } from 'mongoose';
import { IAdmin } from '@/types';

const AdminSchema = new Schema<IAdmin>(
    {
        username: {
            type: String,
            required: [true, 'Kullanıcı adı gereklidir'],
            trim: true,
            lowercase: true,
        },
        passwordHash: {
            type: String,
            required: [true, 'Şifre gereklidir'],
        },
        fullName: {
            type: String,
            required: [true, 'Ad soyad gereklidir'],
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        role: {
            type: String,
            enum: ['owner', 'staff'],
            default: 'staff',
        },
        lastLogin: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Unique index on username for login
AdminSchema.index({ username: 1 }, { unique: true });

const Admin: Model<IAdmin> =
    mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
