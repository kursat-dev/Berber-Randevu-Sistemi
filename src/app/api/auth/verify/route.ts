import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';
import { ApiResponse } from '@/types';

/**
 * GET /api/auth/verify
 * Verify JWT token validity
 */
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = extractTokenFromHeader(authHeader || '');

        if (!token) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Token bulunamadı.',
            }, { status: 401 });
        }

        try {
            const payload = verifyToken(token);

            return NextResponse.json<ApiResponse>({
                success: true,
                data: payload,
            });

        } catch (error) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Geçersiz veya süresi dolmuş token.',
            }, { status: 401 });
        }

    } catch (error: any) {
        console.error('Token verification error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Token doğrulanırken bir hata oluştu.',
        }, { status: 500 });
    }
}
