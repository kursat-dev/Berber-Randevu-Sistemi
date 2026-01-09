'use client';

import { useState, useEffect } from 'react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { IAppointment, IService, ApiResponse } from '@/types';
import Button from '@/components/ui/Button';

interface AppointmentWithService extends Omit<IAppointment, 'serviceId'> {
    serviceId: IService;
}

export default function AdminDashboard() {
    const [appointments, setAppointments] = useState<AppointmentWithService[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>('');

    useEffect(() => {
        fetchAppointments();
    }, [filter, selectedDate]);

    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            let url = `/api/appointments?status=${filter === 'all' ? '' : filter}`;
            if (selectedDate) {
                url += `&date=${selectedDate}`;
            }

            const token = localStorage.getItem('adminToken');
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data: ApiResponse<AppointmentWithService[]> = await response.json();
            if (data.success && data.data) {
                setAppointments(data.data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (appointmentId: string, status: 'approved' | 'rejected') => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/appointments/${appointmentId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            const data: ApiResponse = await response.json();
            if (data.success) {
                fetchAppointments(); // Refresh list
            } else {
                alert(data.error || 'işlem başarısız');
            }
        } catch (error) {
            console.error('Error updating appointment:', error);
            alert('Bir hata oluştu');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };

        const labels = {
            pending: 'Beklemede',
            approved: 'Onaylandı',
            rejected: 'Reddedildi',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Randevu Yönetimi
                </h1>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Durum
                            </label>
                            <div className="flex gap-2">
                                {['pending', 'approved', 'rejected', 'all'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f as any)}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${filter === f
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                            }`}
                                    >
                                        {f === 'all' ? 'Tümü' : f === 'pending' ? 'Bekleyen' : f === 'approved' ? 'Onaylı' : 'Reddedilen'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tarih
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        {selectedDate && (
                            <div className="flex items-end">
                                <Button variant="ghost" onClick={() => setSelectedDate('')}>
                                    Temizle
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Appointments List */}
                {isLoading ? (
                    <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">Randevu bulunamadı.</div>
                ) : (
                    <div className="grid gap-4">
                        {appointments.map((appointment) => (
                            <div
                                key={appointment._id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 hover:shadow-lg transition"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {appointment.customerName}
                                            </h3>
                                            {getStatusBadge(appointment.status)}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <div>📞 {appointment.customerPhone}</div>
                                            <div>💼 {appointment.serviceId.name}</div>
                                            <div>📅 {formatDate(appointment.date)}</div>
                                            <div>⏰ {appointment.timeSlot}</div>
                                            <div>💰 {formatCurrency(appointment.totalPrice)}</div>
                                        </div>

                                        {appointment.notes && (
                                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                📝 Not: {appointment.notes}
                                            </div>
                                        )}
                                    </div>

                                    {appointment.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleStatusChange(appointment._id!, 'approved')}
                                            >
                                                ✓ Onayla
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleStatusChange(appointment._id!, 'rejected')}
                                            >
                                                ✗ Reddet
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
