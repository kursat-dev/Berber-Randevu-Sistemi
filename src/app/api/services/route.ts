import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Service from '@/models/Service';
import { ApiResponse } from '@/types';

/**
 * GET /api/services
 * Get all active services
 */
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const services = await Service.find({ isActive: true })
            .sort({ displayOrder: 1, name: 1 })
            .lean();

        return NextResponse.json<ApiResponse>({
            success: true,
            data: services,
        });

    } catch (error: any) {
        console.error('Fetch services error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Hizmetler getirilirken bir hata oluştu.',
        }, { status: 500 });
    }
}
