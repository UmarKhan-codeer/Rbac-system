import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import UserRole from '@/models/UserRole';
import Role from '@/models/Role';
import { hasPermission } from '@/lib/rbac';
import bcrypt from 'bcryptjs';
import { z, ZodError } from 'zod';

const userCreateSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    roles: z.array(z.string()).min(1, 'At least one role is required'),
});

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const canReadUsers = await hasPermission(session.user.roles || [session.user.role], 'read:users');
        if (!canReadUsers) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const users = await User.find().select('-password');

        // Fetch roles for each user
        const usersWithRoles = await Promise.all(users.map(async (user) => {
            const userRoles = await UserRole.find({ userId: user._id }).populate('roleId');
            const roles = userRoles.map((ur: any) => ur.roleId.name);
            return {
                ...user.toObject(),
                roles,
            };
        }));

        return NextResponse.json(usersWithRoles);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const canCreateUsers = await hasPermission(session.user.roles || [session.user.role], 'create:users');
        if (!canCreateUsers) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { name, email, password, roles } = userCreateSchema.parse(body);

        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // Assign roles
        for (const roleName of roles) {
            const role = await Role.findOne({ name: roleName });
            if (role) {
                await UserRole.create({
                    userId: user._id,
                    roleId: role._id,
                });
            }
        }

        const createdUser = user.toObject();
        delete createdUser.password;

        return NextResponse.json({ ...createdUser, roles }, { status: 201 });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 });
        }
        console.error('Create user error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}