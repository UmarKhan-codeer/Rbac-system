import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Permission from '@/models/Permission';
import RolePermission from '@/models/RolePermission';
import { hasPermission } from '@/lib/rbac';
import { z, ZodError } from 'zod';

const permissionSchema = z.object({
    name: z.string().min(1).refine((val) => {
        const parts = val.split(':');
        if (parts.length !== 2) return false;
        const [action, resource] = parts;
        const allowedActions = ['create', 'read', 'update', 'delete'];
        const allowedResources = ['users', 'posts', 'roles', 'permissions'];
        return allowedActions.includes(action) && allowedResources.includes(resource);
    }, {
        message: "Permission name must be in format 'action:resource' (e.g., create:posts). Allowed actions: create, read, update, delete. Allowed resources: users, posts, roles, permissions."
    }),
    description: z.string().optional(),
});

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Allow users with read:permissions to view permissions
        const canReadPermissions = await hasPermission(session.user.role, 'read:permissions');

        if (!canReadPermissions) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const permissions = await Permission.find().sort({ name: 1 });

        return NextResponse.json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const canCreatePermissions = await hasPermission(session.user.role, 'create:permissions');
        if (!canCreatePermissions) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { name, description } = permissionSchema.parse(body);

        await dbConnect();

        // Check if permission already exists
        const existingPermission = await Permission.findOne({ name });
        if (existingPermission) {
            return NextResponse.json({ error: 'Permission already exists' }, { status: 400 });
        }

        const permission = await Permission.create({
            name,
            description,
        });

        return NextResponse.json(permission, { status: 201 });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error('Error creating permission:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
