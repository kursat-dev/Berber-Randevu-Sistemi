import mongoose, { Schema, Model } from 'mongoose';
import { IService } from '@/types';

const ServiceSchema = new Schema<IService>(
    {
        name: {
            type: String,
            required: [true, 'Hizmet adı gereklidir'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Fiyat gereklidir'],
            min: [0, 'Fiyat 0\'dan küçük olamaz'],
        },
        duration: {
            type: Number,
            required: [true, 'Süre gereklidir'],
            min: [1, 'Süre en az 1 dakika olmalıdır'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index for filtering active services
ServiceSchema.index({ isActive: 1, displayOrder: 1 });

const Service: Model<IService> =
    mongoose.models.Service ||
    mongoose.model<IService>('Service', ServiceSchema);

export default Service;
