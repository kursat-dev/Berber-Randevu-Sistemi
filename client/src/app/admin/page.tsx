'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Check, X, Clock, Settings, Calendar } from 'lucide-react';

export default function AdminPage() {
    const router = useRouter();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [activeTab, setActiveTab] = useState<'appointments' | 'settings'>('appointments');
    const [loading, setLoading] = useState(true);

    // Settings state
    const [settings, setSettings] = useState<any>({});
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            // Simple role check from local storage (not secure but UI only, backend protects routes)
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.role !== 'admin') {
                    router.push('/');
                }
            }
        };
        fetchUserData();
    }, [router]);

    useEffect(() => {
        if (activeTab === 'appointments') {
            fetchAppointments();
        } else {
            fetchSettings();
        }
    }, [activeTab, filter]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/appointments?status=${filter}`);
            setAppointments(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/settings');
            setSettings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await api.put(`/admin/appointments/${id}`, { status });
            // Remove from list or update
            setAppointments(appointments.filter(app => app._id !== id));
        } catch (err) {
            console.error("Update failed", err);
            alert("İşlem başarısız oldu.");
        }
    };

    const handleSettingsSave = async () => {
        setSavingSettings(true);
        try {
            await api.put('/admin/settings', settings);
            alert("Ayarlar kaydedildi.");
        } catch (err) {
            console.error("Save failed", err);
            alert("Kaydetme başarısız.");
        } finally {
            setSavingSettings(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <h1 className="text-5xl font-black mb-12 tracking-tighter uppercase">YÖNETİM PANELİ</h1>

            {/* Tabs */}
            <div className="flex gap-8 mb-12 border-b-4 border-black">
                <button
                    onClick={() => setActiveTab('appointments')}
                    className={cn(
                        "pb-4 px-2 font-black uppercase tracking-widest transition-all",
                        activeTab === 'appointments' ? "border-b-8 border-black text-black" : "text-neutral-400 hover:text-black"
                    )}
                >
                    Randevular
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={cn(
                        "pb-4 px-2 font-black uppercase tracking-widest transition-all",
                        activeTab === 'settings' ? "border-b-8 border-black text-black" : "text-neutral-400 hover:text-black"
                    )}
                >
                    Ayarlar
                </button>
            </div>

            {activeTab === 'appointments' && (
                <div className="space-y-10 animate-fade-in-up">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4">
                        {(['pending', 'approved', 'rejected'] as const).map(f => (
                            <Button
                                key={f}
                                variant={filter === f ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter(f)}
                                className="h-12 px-6 font-bold"
                            >
                                {f === 'pending' ? 'BEKLEYENLER' : f === 'approved' ? 'ONAYLANANLAR' : 'REDDEDİLENLER'}
                            </Button>
                        ))}
                    </div>

                    {loading ? (
                        <p className="text-xl font-bold uppercase animate-pulse">Yükleniyor...</p>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {appointments.length === 0 ? (
                                <p className="text-neutral-400 font-bold uppercase col-span-full py-20 text-center border-4 border-dashed border-neutral-200">Kayıt bulunamadı.</p>
                            ) : (
                                appointments.map((appt) => (
                                    <div key={appt._id} className="border-4 border-black p-8 bg-white space-y-6 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-black text-2xl uppercase tracking-tight">{appt.userId?.name} {appt.userId?.surname}</h4>
                                                <p className="font-bold text-neutral-500">{appt.userId?.phone}</p>
                                            </div>
                                            <div className="font-black bg-black text-white px-3 py-1 text-sm tracking-tighter">
                                                {appt.time}
                                            </div>
                                        </div>

                                        <div className="border-t-2 border-black pt-6">
                                            <p className="text-sm font-bold uppercase"><span className="opacity-50">Tarih:</span> {format(new Date(appt.date), 'd MMMM yyyy', { locale: tr })}</p>
                                            <p className="text-sm font-bold uppercase"><span className="opacity-50">Durum:</span> {appt.status === 'pending' ? 'Beklemede' : appt.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}</p>
                                        </div>

                                        {appt.status === 'pending' && (
                                            <div className="flex gap-2 pt-2">
                                                <Button size="sm" className="flex-1 bg-black text-white hover:bg-neutral-800" onClick={() => handleStatusUpdate(appt._id, 'approved')}>
                                                    ONAYLA
                                                </Button>
                                                <Button size="sm" variant="outline" className="flex-1 border-black text-black hover:bg-black hover:text-white" onClick={() => handleStatusUpdate(appt._id, 'rejected')}>
                                                    REDDET
                                                </Button>
                                            </div>
                                        )}
                                        {appt.status === 'approved' && (
                                            <Button size="sm" variant="outline" className="w-full mt-2 border-dashed opacity-50 hover:opacity-100" onClick={() => handleStatusUpdate(appt._id, 'rejected')}>
                                                İPTAL ET / REDDET
                                            </Button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="max-w-2xl space-y-12 animate-fade-in-up">
                    <div className="space-y-6 border-4 border-black p-8">
                        <h3 className="font-black text-2xl uppercase tracking-tighter">ÇALIŞMA SAATLERİ</h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase opacity-50">Açılış</label>
                                <input
                                    type="time"
                                    value={settings.workingHours?.start || '08:30'}
                                    onChange={(e) => setSettings({ ...settings, workingHours: { ...settings.workingHours, start: e.target.value } })}
                                    className="flex h-12 w-full border-2 border-black px-4 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase opacity-50">Kapanış</label>
                                <input
                                    type="time"
                                    value={settings.workingHours?.end || '20:00'}
                                    onChange={(e) => setSettings({ ...settings, workingHours: { ...settings.workingHours, end: e.target.value } })}
                                    className="flex h-12 w-full border-2 border-black px-4 font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 border-4 border-black p-8">
                        <input
                            type="checkbox"
                            id="isOpen"
                            checked={settings.isShopOpen ?? true}
                            onChange={(e) => setSettings({ ...settings, isShopOpen: e.target.checked })}
                            className="h-8 w-8 rounded-none border-4 border-black accent-black cursor-pointer"
                        />
                        <label htmlFor="isOpen" className="font-black text-2xl uppercase tracking-tighter cursor-pointer">Dükkan Açık</label>
                    </div>

                    <Button onClick={handleSettingsSave} disabled={savingSettings} size="lg" className="w-full h-20 text-2xl">
                        {savingSettings ? 'KAYDEDİLİYOR...' : 'AYARLARI KAYDET'}
                    </Button>
                </div>
            )}
        </div>
    );
}
