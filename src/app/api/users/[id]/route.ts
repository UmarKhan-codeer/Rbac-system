import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Role from '@/models/Role';
import UserRole from '@/models/UserRole';
import { hasPermission } from '@/lib/rbac';
import bcrypt from 'bcryptjs';
import { z, ZodError } from 'zod';

const userUpdateSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    roles: z.array(z.string().min(1)),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const canUpdateUsers = await hasPermission(session.user.roles || [session.user.role], 'update:users');
        if (!canUpdateUsers) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { name, email, password, roles } = userUpdateSchema.parse(body);

        await dbConnect();

        // Check if any of the user's current roles is superadmin
        const existingUserRoles = await UserRole.find({ userId: id }).populate('roleId');
        const isSuperAdmin = existingUserRoles.some((ur: any) => ur.roleId.name === 'superadmin');

        if (isSuperAdmin) {
            return NextResponse.json({ error: 'Cannot modify SuperAdmin' }, { status: 403 });
        }

        // Update user details if provided
        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (Object.keys(updateData).length > 0) {
            await User.findByIdAndUpdate(id, updateData);
        }

        // Delete existing role assignments
        await UserRole.deleteMany({ userId: id });

        // Create new role assignments
        for (const roleName of roles) {
            const role = await Role.findOne({ name: roleName });
            if (role) {
                await UserRole.create({
                    userId: id,
                    roleId: role._id,
                });
            }
        }

        const user = await User.findById(id).select('-password');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ ...user.toObject(), roles });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const canDeleteUsers = await hasPermission(session.user.roles || [session.user.role], 'delete:users');
        if (!canDeleteUsers) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        // Check if user has superadmin role
        const existingUserRoles = await UserRole.find({ userId: id }).populate('roleId');
        const isSuperAdmin = existingUserRoles.some((ur: any) => ur.roleId.name === 'superadmin');

        if (isSuperAdmin) {
            return NextResponse.json({ error: 'Cannot delete SuperAdmin' }, { status: 403 });
        }

        // Delete user role assignments
        await UserRole.deleteMany({ userId: id });

        // Delete user
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
