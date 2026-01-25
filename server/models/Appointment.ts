import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
    userId: mongoose.Types.ObjectId;
    date: string; // ISO Date String (YYYY-MM-DD)
    time: string; // HH:mm
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
}

const AppointmentSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
