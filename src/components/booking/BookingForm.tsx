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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Hizmet Seçin <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {services.map((service) => (
                            <button
                                key={service._id}
                                type="button"
                                onClick={() => setSelectedService(service._id!)}
                                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${selectedService === service._id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                    }`}
                            >
                                <div className="font-semibold text-gray-900 dark:text-white">
                                    {service.name}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {service.description}
                                </div>
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                                    {formatCurrency(service.price)}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Tarih Seçin <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date | null) => setSelectedDate(date)}
                        filterDate={filterDate}
                        minDate={new Date()}
                        dateFormat="dd/MM/yyyy"
                        locale="tr"
                        placeholderText="Tarih seçin"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        inline
                    />
                </div>

                {/* Time Slot Selection */}
                {selectedDate && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Saat Seçin <span className="text-red-500">*</span>
                        </label>
                        {isLoading ? (
                            <div className="text-center py-8 text-gray-500">
                                Müsait saatler yükleniyor...
                            </div>
                        ) : timeSlots.length > 0 ? (
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {timeSlots.map((slot) => (
                                    <button
                                        key={slot.time}
                                        type="button"
                                        disabled={!slot.available}
                                        onClick={() => setSelectedTimeSlot(slot.time)}
                                        className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${selectedTimeSlot === slot.time
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : slot.available
                                                ? 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 text-gray-900 dark:text-white'
                                                : 'bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed opacity-50'
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Not (Opsiyonel)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Varsa özel isteklerinizi yazabilirsiniz"
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {errorMessage && (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                        {errorMessage}
                    </div>
                )}

                {selectedService && selectedServiceData && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                Toplam Ücret:
                            </span>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(selectedServiceData.price)}
                            </span>
                        </div>
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
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
