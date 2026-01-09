import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import Service from '@/models/Service';
import WorkingHours from '@/models/WorkingHours';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { isPastDate } from '@/lib/utils';
import { ApiResponse, BookingFormData } from '@/types';

/**
 * POST /api/appointments
 * Create a new appointment with time-collision prevention
 */
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body: BookingFormData = await request.json();
        const {
            customerName,
            customerPhone,
            date,
            timeSlot,
            serviceId,
            notes,
            recaptchaToken,
        } = body;

        // 1. Validate reCAPTCHA
        const isHuman = await verifyRecaptcha(recaptchaToken);
        if (!isHuman) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Spam algılandı. Lütfen tekrar deneyin.',
            }, { status: 400 });
        }

        // 2. Validate required fields
        if (!customerName || !customerPhone || !date || !timeSlot || !serviceId) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Lütfen tüm zorunlu alanları doldurun.',
            }, { status: 400 });
        }

        // 3. Check if time is in the past
        if (isPastDate(date, timeSlot)) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Geçmiş tarih için randevu oluşturamazsınız.',
            }, { status: 400 });
        }

        // 4. Verify working hours
        const appointmentDate = new Date(date);
        const dayOfWeek = appointmentDate.getDay();

        const workingHours = await WorkingHours.findOne({ dayOfWeek });

        if (!workingHours || !workingHours.isOpen) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Seçtiğiniz gün çalışma saatlerimiz dışındadır.',
            }, { status: 400 });
        }

        // Check if time slot is within working hours
        if (
            timeSlot < workingHours.openTime ||
            timeSlot >= workingHours.closeTime
        ) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Seçtiğiniz saat çalışma saatlerimiz dışındadır.',
            }, { status: 400 });
        }

        // Check if time slot is during break
        if (
            workingHours.breakStart &&
            workingHours.breakEnd &&
            timeSlot >= workingHours.breakStart &&
            timeSlot < workingHours.breakEnd
        ) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Seçtiğiniz saat molada olduğumuz saattir.',
            }, { status: 400 });
        }

        // 5. Fetch service to validate and get price
        const service = await Service.findById(serviceId);

        if (!service || !service.isActive) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Seçtiğiniz hizmet bulunamadı.',
            }, { status: 404 });
        }

        // 6. ATOMIC INSERT with collision detection
        try {
            const appointment = await Appointment.create({
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                date: appointmentDate,
                timeSlot,
                serviceId: service._id,
                totalPrice: service.price,
                notes: notes?.trim(),
                status: 'pending',
            });

            return NextResponse.json<ApiResponse>({
                success: true,
                data: {
                    _id: appointment._id,
                    customerName: appointment.customerName,
                    customerPhone: appointment.customerPhone,
                    date: appointment.date,
                    timeSlot: appointment.timeSlot,
                    status: appointment.status,
                    totalPrice: appointment.totalPrice,
                },
                message: 'Randevunuz başarıyla oluşturuldu. Onay bekleniyor.',
            }, { status: 201 });

        } catch (error: any) {
            // MongoDB E11000 duplicate key error (time slot collision)
            if (error.code === 11000) {
                return NextResponse.json<ApiResponse>({
                    success: false,
                    error: 'Bu saat dilimi dolu. Lütfen başka bir saat seçin.',
                }, { status: 409 });
            }
            throw error;
        }

    } catch (error: any) {
        console.error('Appointment creation error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Randevu oluşturulurken bir hata oluştu.',
        }, { status: 500 });
    }
}

/**
 * GET /api/appointments
 * Get appointments (future: admin-only with filters)
 */
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const date = searchParams.get('date');

        const filter: any = {};

        if (status) {
            filter.status = status;
        }

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);

            filter.date = {
                $gte: startDate,
                $lt: endDate,
            };
        }

        const appointments = await Appointment.find(filter)
            .populate('serviceId')
            .sort({ date: 1, timeSlot: 1 })
            .lean();

        return NextResponse.json<ApiResponse>({
            success: true,
            data: appointments,
        });

    } catch (error: any) {
        console.error('Fetch appointments error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Randevular getirilirken bir hata oluştu.',
        }, { status: 500 });
    }
}
