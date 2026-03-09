import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/config/db';
import { signToken, AuthUser } from '@/middleware/auth';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, role } = await request.json();

        // Validate required fields
        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { error: 'Name, email, password, and role are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const { rows: existing } = await query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existing.length > 0) {
            return NextResponse.json(
                { error: 'A user with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert user
        const { rows } = await query(
            `INSERT INTO users (email, password_hash, full_name, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, email, full_name, role`,
            [email, passwordHash, name, role]
        );

        const user: AuthUser = rows[0];
        const token = signToken(user);

        return NextResponse.json(
            {
                success: true,
                user,
                token,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error registering user:', error);
        return NextResponse.json(
            { error: error.message || 'Registration failed' },
            { status: 500 }
        );
    }
}
