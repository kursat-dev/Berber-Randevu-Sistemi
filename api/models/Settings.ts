import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
    id: { type: String, required: true },
    label: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: String, required: true },
    note: { type: String, default: '' }
}, { _id: false });

const SettingsSchema = new mongoose.Schema({
    // Singleton pattern - always use key "main"
    key: { type: String, default: 'main', unique: true },
    services: {
        type: [ServiceSchema],
        default: [
            { id: 'sac-kesimi', label: 'Saç Kesimi', price: 200, duration: '~30 dk', note: '' },
            { id: 'sac-kesme-yikama', label: 'Saç Kesme + Yıkama', price: 300, duration: '~45 dk', note: '' },
            { id: 'sac-sakal-yikama', label: 'Saç-Sakal Kesme + Yıkama', price: 400, duration: '~1 saat', note: '' },
            { id: 'sac-boyama', label: 'Saç Boyama', price: 1000, duration: '~2 saat', note: 'Rengine göre değişiklik gösterir' },
            { id: 'perma', label: 'Perma', price: 4000, duration: '~3 saat', note: '' }
        ]
    },
    timeSlots: {
        type: [String],
        default: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
    },
    // blockedSlots: { "2026-02-25": ["19:00", "20:00"], ... }
    blockedSlots: {
        type: Map,
        of: [String],
        default: {}
    },
    updated_at: { type: Date, default: Date.now }
});

// Prevent model recompilation error in dev
const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

export default Settings;
