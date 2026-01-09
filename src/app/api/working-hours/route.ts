import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WorkingHours from '@/models/WorkingHours';
import { ApiResponse } from '@/types';

/**
 * GET /api/working-hours
 * Get all working hours (for all days)
 */
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const workingHours = await WorkingHours.find()
            .sort({ dayOfWeek: 1 })
            .lean();

        return NextResponse.json<ApiResponse>({
            success: true,
            data: workingHours,
        });

    } catch (error: any) {
        console.error('Fetch working hours error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Çalışma saatleri getirilirken bir hata oluştu.',
        }, { status: 500 });
    }
}
