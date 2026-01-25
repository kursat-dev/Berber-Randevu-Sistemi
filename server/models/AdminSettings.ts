import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminSettings extends Document {
    workingHours: {
        start: string;
        end: string;
    };
    disabledDates: string[]; // List of YYYY-MM-DD dates that are closed
    isShopOpen: boolean;
}

const AdminSettingsSchema: Schema = new Schema({
    workingHours: {
        start: { type: String, default: '08:30' },
        end: { type: String, default: '20:00' },
    },
    disabledDates: { type: [String], default: [] },
    isShopOpen: { type: Boolean, default: true },
});

export default mongoose.model<IAdminSettings>('AdminSettings', AdminSettingsSchema);
