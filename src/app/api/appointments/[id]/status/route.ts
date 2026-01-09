import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';
import { ApiResponse } from '@/types';

/**
 * PATCH /api/appointments/[id]/status
 * Approve or reject appointment (admin only)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        // Verify admin authentication
        const authHeader = request.headers.get('authorization');
        const token = extractTokenFromHeader(authHeader || '');

        if (!token) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Yetkilendirme gereklidir.',
            }, { status: 401 });
        }

        let adminData;
        try {
            adminData = verifyToken(token);
        } catch (error) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Geçersiz veya süresi dolmuş token.',
            }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { status } = body;

        // Validate status
        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Geçersiz durum. "approved" veya "rejected" olmalıdır.',
            }, { status: 400 });
        }

        // Find and update appointment
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Randevu bulunamadı.',
            }, { status: 404 });
        }

        appointment.status = status;
        appointment.reviewedBy = adminData.adminId;
        appointment.reviewedAt = new Date();

        await appointment.save();

        return NextResponse.json<ApiResponse>({
            success: true,
            data: appointment,
            message: `Randevu ${status === 'approved' ? 'onaylandı' : 'reddedildi'}.`,
        });

    } catch (error: any) {
        console.error('Update appointment status error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Randevu durumu güncellenirken bir hata oluştu.',
        }, { status: 500 });
    }
}
