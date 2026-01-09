import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { generateToken } from '@/lib/jwt';
import { ApiResponse } from '@/types';

/**
 * POST /api/auth/login
 * Admin login with username & password
 */
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const { username, password } = await request.json();

        // Validate input
        if (!username || !password) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Kullanıcı adı ve şifre gereklidir.',
            }, { status: 400 });
        }

        // Find admin
        const admin = await Admin.findOne({ username: username.toLowerCase().trim() });

        if (!admin) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Kullanıcı adı veya şifre hatalı.',
            }, { status: 401 });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

        if (!isPasswordValid) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Kullanıcı adı veya şifre hatalı.',
            }, { status: 401 });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate JWT token
        const token = generateToken({
            adminId: admin._id!.toString(),
            username: admin.username,
            role: admin.role,
        });

        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                token,
                admin: {
                    id: admin._id,
                    username: admin.username,
                    fullName: admin.fullName,
                    role: admin.role,
                },
            },
            message: 'Giriş başarılı.',
        });

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Giriş yapılırken bir hata oluştu.',
        }, { status: 500 });
    }
}
