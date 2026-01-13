import mongoose, { Schema, Model } from 'mongoose';
import { IWorkingHours } from '@/types';

const WorkingHoursSchema = new Schema<IWorkingHours>(
    {
        dayOfWeek: {
            type: Number,
            required: [true, 'Gün numarası gereklidir'],
            min: 0,
            max: 6,
        },
        isOpen: {
            type: Boolean,
            default: true,
        },
        openTime: {
            type: String,
            required: [true, 'Açılış saati gereklidir'],
        },
        closeTime: {
            type: String,
            required: [true, 'Kapanış saati gereklidir'],
        },
        slotInterval: {
            type: Number,
            default: 30, // 30 minutes default
            min: [15, 'Slot aralığı en az 15 dakika olmalıdır'],
        },
        breakStart: {
            type: String,
        },
        breakEnd: {
            type: String,
        },
    },
    {
        timestamps: { createdAt: false, updatedAt: true },
    }
);

// Unique index on dayOfWeek (one document per day)
WorkingHoursSchema.index({ dayOfWeek: 1 }, { unique: true });

const WorkingHours: Model<IWorkingHours> =
    mongoose.models.WorkingHours ||
    mongoose.model<IWorkingHours>('WorkingHours', WorkingHoursSchema);

export default WorkingHours;
