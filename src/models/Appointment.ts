import mongoose, { Schema, Model } from 'mongoose';
import { IAppointment } from '@/types';

const AppointmentSchema = new Schema<IAppointment>(
    {
        customerName: {
            type: String,
            required: [true, 'Müşteri adı gereklidir'],
            trim: true,
        },
        customerPhone: {
            type: String,
            required: [true, 'Telefon numarası gereklidir'],
            trim: true,
        },
        date: {
            type: Date,
            required: [true, 'Tarih gereklidir'],
        },
        timeSlot: {
            type: String,
            required: [true, 'Saat gereklidir'],
        },
        serviceId: {
            type: String,
            required: [true, 'Hizmet seçimi gereklidir'],
            ref: 'Service',
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        totalPrice: {
            type: Number,
            required: [true, 'Fiyat gereklidir'],
        },
        notes: {
            type: String,
            trim: true,
        },
        reviewedBy: {
            type: String,
            ref: 'Admin',
        },
        reviewedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// CRITICAL: Compound unique index on (date, timeSlot) prevents double bookings
AppointmentSchema.index({ date: 1, timeSlot: 1 }, { unique: true });

// Index for fast admin queries by date and status
AppointmentSchema.index({ date: 1, status: 1 });

// Index for customer phone lookup
AppointmentSchema.index({ customerPhone: 1 });

const Appointment: Model<IAppointment> =
    mongoose.models.Appointment ||
    mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;
