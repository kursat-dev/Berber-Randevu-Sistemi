'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { IService, ApiResponse, TimeSlot } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function BookingForm() {
    const [services, setServices] = useState<IService[]>([]);
    const [selectedService, setSelectedService] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch services on mount
    useEffect(() => {
        fetchServices();
    }, []);

    // Fetch availability when a date is selected
    useEffect(() => {
        if (selectedDate) {
            fetchAvailability(selectedDate);
        }
    }, [selectedDate]);

    const fetchServices = async () => {
        try {
            const response = await fetch('/api/services');
            const data: ApiResponse<IService[]> = await response.json();
            if (data.success && data.data) {
                setServices(data.data);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const fetchAvailability = async (date: Date) => {
        setIsLoading(true);
        setSelectedTimeSlot('');
        const formattedDate = date.toISOString().split('T')[0];

        try {
            const response = await fetch(
                `/api/appointments/availability?date=${formattedDate}`
            );
            const data: ApiResponse<{ timeSlots: TimeSlot[] }> = await response.json();
            if (data.success && data.data) {
                setTimeSlots(data.data.timeSlots || []);
            }
        } catch (error) {
            console.error('Error fetching availability:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!selectedService || !selectedDate || !selectedTimeSlot || !customerName || !customerPhone) {
            setErrorMessage('Lütfen tüm zorunlu alanları doldurun.');
            return;
        }

        setIsSubmitting(true);

        try {
            // For MVP, we'll skip reCAPTCHA in development
            const recaptchaToken = 'dev-token';

            const formattedDate = selectedDate.toISOString().split('T')[0];

            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerName,
                    customerPhone,
                    date: formattedDate,
                    timeSlot: selectedTimeSlot,
                    serviceId: selectedService,
                    notes,
                    recaptchaToken,
                }),
            });

            const data: ApiResponse = await response.json();

            if (data.success) {
                setShowSuccessModal(true);
                // Reset form
                setCustomerName('');
                setCustomerPhone('');
                setNotes('');
                setSelectedDate(null);
                setSelectedService('');
                setSelectedTimeSlot('');
                setTimeSlots([]);
            } else {
                setErrorMessage(data.error || 'Bir hata oluştu.');
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
            setErrorMessage('Randevu oluşturulurken bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedServiceData = services.find((s) => s._id === selectedService);

    // Filter past dates
    const filterDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                {/* Service Selection */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">
                        Hizmet Seçin <span className="text-yellow-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((service) => (
                            <button
                                key={service._id}
                                type="button"
                                onClick={() => setSelectedService(service._id!)}
                                className={`group p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden ${selectedService === service._id
                                    ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.2)]'
                                    : 'border-white/5 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                {selectedService === service._id && (
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/20 rounded-bl-full flex items-center justify-center pl-4 pb-4">
                                        <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                                <div className={`font-black text-lg tracking-tight uppercase italic mb-1 transition-colors ${selectedService === service._id ? 'text-yellow-500' : 'text-white'}`}>
                                    {service.name}
                                </div>
                                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                    {service.description}
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <div className={`text-xl font-black ${selectedService === service._id ? 'text-white' : 'text-yellow-500'}`}>
                                        {formatCurrency(service.price)}
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">KDV Dahil</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date Selection */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">
                        Tarih Seçin <span className="text-yellow-500">*</span>
                    </label>
                    <div className="premium-datepicker-wrapper">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date: Date | null) => setSelectedDate(date)}
                            filterDate={filterDate}
                            minDate={new Date()}
                            dateFormat="dd/MM/yyyy"
                            locale="tr"
                            placeholderText="Tarih seçin"
                            className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                            inline
                        />
                    </div>
                </div>

                {/* Time Slot Selection */}
                {selectedDate && (
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">
                            Saat Seçin <span className="text-yellow-500">*</span>
                        </label>
                        {isLoading ? (
                            <div className="text-center py-8 text-gray-500">
                                Müsait saatler yükleniyor...
                            </div>
                        ) : timeSlots.length > 0 ? (
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                {timeSlots.map((slot) => (
                                    <button
                                        key={slot.time}
                                        type="button"
                                        disabled={!slot.available}
                                        onClick={() => setSelectedTimeSlot(slot.time)}
                                        className={`px-4 py-3 rounded-xl font-bold transition-all duration-300 border-2 ${selectedTimeSlot === slot.time
                                            ? 'bg-yellow-500 border-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                                            : slot.available
                                                ? 'bg-white/5 border-white/5 hover:border-white/20 text-white'
                                                : 'bg-black/20 border-white/5 text-gray-600 cursor-not-allowed opacity-50'
                                            }`}
                                    >
                                        {slot.time}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Bu tarihte müsait saat bulunmamaktadır.
                            </div>
                        )}
                    </div>
                )}

                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Ad Soyad"
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ad Soyad"
                        required
                    />
                    <Input
                        label="Telefon"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+90 5XX XXX XX XX"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                        Not (Opsiyonel)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Varsa özel isteklerinizi yazabilirsiniz"
                        rows={3}
                        className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                    />
                </div>

                {errorMessage && (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                        {errorMessage}
                    </div>
                )}

                {selectedService && selectedServiceData && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-2xl">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                                Toplam Ücret:
                            </span>
                            <span className="text-3xl font-black text-yellow-500">
                                {formatCurrency(selectedServiceData.price)}
                            </span>
                        </div>
                    </div>
                )}

                <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full"
                    isLoading={isSubmitting}
                >
                    Randevu Oluştur
                </Button>
            </form>

            <Modal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Randevu Oluşturuldu!"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        Randevunuz başarıyla oluşturuldu. En kısa sürede onaylanacaktır.
                    </p>
                    <Button onClick={() => setShowSuccessModal(false)} variant="primary">
                        Tamam
                    </Button>
                </div>
            </Modal>
        </>
    );
}
