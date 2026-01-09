import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import WorkingHours from '@/models/WorkingHours';
import { generateTimeSlots } from '@/lib/utils';
import { ApiResponse, TimeSlot } from '@/types';

/**
 * GET /api/appointments/availability?date=YYYY-MM-DD
 * Get available time slots for a specific date
 */
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');

        if (!dateParam) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Tarih parametresi gereklidir.',
            }, { status: 400 });
        }

        const date = new Date(dateParam);
        const dayOfWeek = date.getDay();

        // Get working hours for this day
        const workingHours = await WorkingHours.findOne({ dayOfWeek });

        if (!workingHours || !workingHours.isOpen) {
            return NextResponse.json<ApiResponse>({
                success: true,
                data: {
                    available: [],
                    message: 'Bu gün çalışma saatlerimiz bulunmamaktadır.',
                },
            });
        }

        // Generate all possible time slots
        const allSlots = generateTimeSlots(
            workingHours.openTime,
            workingHours.closeTime,
            workingHours.slotInterval,
            workingHours.breakStart,
            workingHours.breakEnd
        );

        // Get already booked slots for this date
        const bookedAppointments = await Appointment.find({
            date,
            status: { $in: ['pending', 'approved'] }, // Only consider pending and approved
        }).select('timeSlot');

        const bookedSlots = new Set(
            bookedAppointments.map((apt) => apt.timeSlot)
        );

        // Check which slots are in the past
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        // Create availability list
        const timeSlots: TimeSlot[] = allSlots.map((time) => {
            let available = !bookedSlots.has(time);

            // If it's today, mark past slots as unavailable
            if (isToday && available) {
                const [hours, minutes] = time.split(':').map(Number);
                const slotDateTime = new Date(date);
                slotDateTime.setHours(hours, minutes, 0, 0);

                if (slotDateTime <= now) {
                    available = false;
                }
            }

            return {
                time,
                available,
            };
        });

        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                date: dateParam,
                timeSlots,
            },
        });

    } catch (error: any) {
        console.error('Availability check error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Müsaitlik kontrolü sırasında bir hata oluştu.',
        }, { status: 500 });
    }
}
