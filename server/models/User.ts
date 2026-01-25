import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    surname: string;
    phone: string;
    email: string;
    password?: string;
    role: 'user' | 'admin';
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Store hashed password
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);
