'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, isSunday } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

// Generate 30 min slots from 08:30 to 20:00
const generateSlots = () => {
    const slots = [];
    let startHour = 8;
    let startMin = 30;

    while (startHour < 20 || (startHour === 20 && startMin === 0)) {
        const time = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
        slots.push(time);

        startMin += 30;
        if (startMin === 60) {
            startMin = 0;
            startHour++;
        }
    }
    return slots;
};

const TIME_SLOTS = generateSlots();

export default function BookPage() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [takenSlots, setTakenSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Protected Route Check
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (!selectedDate) return;
            // Reset selection when date changes
            setSelectedSlot(null);

            // Check Sunday locally first for UI
            if (isSunday(new Date(selectedDate))) {
                setTakenSlots([]); // Or handle as disabled differently
                return;
            }

            try {
                const res = await api.get(`/appointments?date=${selectedDate}`);
                // Assuming API returns array of objects with { time, status }
                const taken = res.data.map((appt: any) => appt.time);
                setTakenSlots(taken);
            } catch (err) {
                console.error("Failed to fetch slots", err);
            }
        };

        fetchSlots();
    }, [selectedDate]);

    const handleBook = async () => {
        if (!selectedSlot || !selectedDate) return;
        setLoading(true);
        setMessage('');

        try {
            await api.post('/appointments', {
                date: selectedDate,
                time: selectedSlot
            });
            setMessage('Randevu talebiniz alındı! Yönetici onayı bekleniyor.');
            // Refresh slots
            setTakenSlots([...takenSlots, selectedSlot]);
            setSelectedSlot(null);
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Randevu oluşturulamadı.');
        } finally {
            setLoading(false);
        }
    };

    const isDateSunday = selectedDate ? isSunday(new Date(selectedDate)) : false;

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-center tracking-tighter">RANDEVU AL</h1>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Date Selection */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold tracking-tighter uppercase">Tarih Seçin</h3>
                    <input
                        type="date"
                        value={selectedDate}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full p-4 rounded-none border-2 border-black bg-background text-lg font-bold focus:outline-none focus:bg-neutral-50 transition-colors uppercase tracking-widest cursor-pointer"
                    />
                    {isDateSunday && (
                        <p className="text-red-600 font-bold text-sm tracking-tight">PAZAR GÜNLERİ KAPALIYIZ.</p>
                    )}
                </div>

                {/* Time Selection */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Saat Seçin</h3>
                    {!isDateSunday ? (
                        <div className="grid grid-cols-3 gap-3">
                            {TIME_SLOTS.map((time) => {
                                const isTaken = takenSlots.includes(time);
                                const isSelected = selectedSlot === time;
                                return (
                                    <button
                                        key={time}
                                        disabled={isTaken}
                                        onClick={() => setSelectedSlot(time)}
                                        className={cn(
                                            "py-3 px-4 rounded-lg border-2 text-sm font-semibold transition-all duration-300",
                                            isTaken
                                                ? "bg-secondary text-muted-foreground opacity-40 cursor-not-allowed decoration-slice line-through border-transparent"
                                                : "hover:border-black hover:bg-neutral-50 active:scale-95",
                                            isSelected
                                                ? "bg-black text-white border-black shadow-lg hover:bg-black hover:text-white transform scale-105"
                                                : "bg-background border-input",
                                        )}
                                    >
                                        {time}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center border border-dashed border-input rounded-lg text-muted-foreground">
                            Bugün için saat seçimi yapılamaz.
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Area */}
            <div className="mt-16 p-10 border-4 border-black bg-black text-white text-center space-y-6 animate-fade-in-up animate-delay-200">
                {selectedDate && selectedSlot ? (
                    <>
                        <div className="space-y-2">
                            <p className="text-sm font-bold tracking-[0.2em] opacity-60 uppercase">Seçilen Randevu</p>
                            <p className="text-3xl font-black uppercase tracking-tighter">
                                {format(new Date(selectedDate), 'd MMMM yyyy', { locale: tr })} — {selectedSlot}
                            </p>
                        </div>
                        <Button
                            onClick={handleBook}
                            disabled={loading}
                            size="lg"
                            className="w-full max-w-md h-16 bg-white text-black hover:bg-neutral-200 border-none"
                        >
                            {loading ? 'İŞLENİYOR...' : 'RANDEVUYU ONAYLA'}
                        </Button>
                    </>
                ) : (
                    <p className="text-lg font-bold tracking-widest uppercase opacity-50 italic">Devam etmek için tarih ve saat seçiniz.</p>
                )}

                {message && (
                    <div className={cn(
                        "p-5 font-black uppercase tracking-widest text-sm border-2",
                        message.includes('alındı') ? "bg-white text-black border-white" : "bg-red-600 text-white border-red-600"
                    )}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
