import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Role from '@/models/Role';
import Permission from '@/models/Permission';
import RolePermission from '@/models/RolePermission';
import { hasPermission } from '@/lib/rbac';
import { z, ZodError } from 'zod';

const roleSchema = z.object({
    name: z.string().min(1),
    permissions: z.array(z.string()),
});

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const canReadRoles = await hasPermission(session.user.role, 'read:roles');
        if (!canReadRoles) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const roles = await Role.find();

        const rolesWithPermissions = await Promise.all(roles.map(async (role) => {
            const rolePermissions = await RolePermission.find({ roleId: role._id }).populate('permissionId');
            const permissions = rolePermissions.map((rp: any) => rp.permissionId.name);
            return {
                ...role.toObject(),
                permissions,
            };
        }));

        return NextResponse.json(rolesWithPermissions);
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

        const canCreateRoles = await hasPermission(session.user.role, 'create:roles');
        if (!canCreateRoles) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { name, permissions } = roleSchema.parse(body);

        await dbConnect();
        const role = await Role.create({
            name,
        });

        // Create RolePermission entries
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
        }, { status: 201 });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
