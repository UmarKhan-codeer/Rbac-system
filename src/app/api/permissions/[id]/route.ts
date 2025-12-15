import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Permission from '@/models/Permission';
import RolePermission from '@/models/RolePermission';
import { hasPermission } from '@/lib/rbac';
import { z, ZodError } from 'zod';

const permissionSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
});

// Core permissions that cannot be deleted
const PROTECTED_PERMISSIONS: string[] = [
    'create:users', 'read:users', 'update:users', 'delete:users',
    'create:roles', 'read:roles', 'update:roles', 'delete:roles',
    'create:permissions', 'read:permissions', 'update:permissions', 'delete:permissions',
];

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const canUpdatePermissions = await hasPermission(session.user.role, 'update:permissions');
        if (!canUpdatePermissions) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { name, description } = permissionSchema.parse(body);

        await dbConnect();

        // Check if trying to rename a protected permission
        const targetPermission = await Permission.findById(id);
        if (targetPermission && PROTECTED_PERMISSIONS.includes(targetPermission.name)) {
            // Allow updating description but not name for protected permissions
            if (name !== targetPermission.name) {
                return NextResponse.json({
                    error: 'Cannot rename core system permissions'
                }, { status: 403 });
            }
        }

        const permission = await Permission.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        );

        if (!permission) {
            return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
        }

        return NextResponse.json(permission);
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error('Error updating permission:', error);
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

        const canDeletePermissions = await hasPermission(session.user.role, 'delete:permissions');
        if (!canDeletePermissions) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        // Prevent deleting protected permissions
        const targetPermission = await Permission.findById(id);
        if (targetPermission && PROTECTED_PERMISSIONS.includes(targetPermission.name)) {
            return NextResponse.json({
                error: 'Cannot delete core system permissions'
            }, { status: 403 });
        }

        const permission = await Permission.findByIdAndDelete(id);

        if (!permission) {
            return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
        }

        // Clean up related RolePermission entries
        await RolePermission.deleteMany({ permissionId: id });

        return NextResponse.json({ message: 'Permission deleted' });
    } catch (error) {
        console.error('Error deleting permission:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
