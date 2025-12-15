import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Role from '@/models/Role';
import Permission from '@/models/Permission';
import RolePermission from '@/models/RolePermission';
import UserRole from '@/models/UserRole';
import { hasPermission } from '@/lib/rbac';
import { z, ZodError } from 'zod';

const roleSchema = z.object({
    name: z.string().min(1),
    permissions: z.array(z.string()),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const canUpdateRoles = await hasPermission(session.user.role, 'update:roles');
        if (!canUpdateRoles) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { name, permissions } = roleSchema.parse(body);

        await dbConnect();

        // Prevent modifying superadmin role
        const targetRole = await Role.findById(id);
        if (targetRole?.name === 'superadmin') {
            return NextResponse.json({ error: 'Cannot modify superadmin role' }, { status: 403 });
        }

        const role = await Role.findByIdAndUpdate(
            id,
            { name },
            { new: true }
        );

        if (!role) {
            return NextResponse.json({ error: 'Role not found' }, { status: 404 });
        }

        // Update permissions
        // 1. Remove existing permissions for this role
        await RolePermission.deleteMany({ roleId: role._id });

        // 2. Add new permissions
        if (permissions && permissions.length > 0) {
            for (const permName of permissions) {
                const permission = await Permission.findOne({ name: permName });
                if (permission) {
                    await RolePermission.create({
                        roleId: role._id,
                        permissionId: permission._id,
                    });
                }
            }
        }

        return NextResponse.json({
            ...role.toObject(),
            permissions
        });
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

        const canDeleteRoles = await hasPermission(session.user.role, 'delete:roles');
        if (!canDeleteRoles) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        // Prevent deleting superadmin role
        const targetRole = await Role.findById(id);
        if (targetRole?.name === 'superadmin') {
            return NextResponse.json({ error: 'Cannot delete superadmin role' }, { status: 403 });
        }

        const role = await Role.findByIdAndDelete(id);

        if (!role) {
            return NextResponse.json({ error: 'Role not found' }, { status: 404 });
        }

        // Clean up related data
        await RolePermission.deleteMany({ roleId: id });
        await UserRole.deleteMany({ roleId: id });

        return NextResponse.json({ message: 'Role deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
