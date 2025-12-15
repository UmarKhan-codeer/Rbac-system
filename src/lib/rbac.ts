import Role from '@/models/Role';
import RolePermission from '@/models/RolePermission';
import Permission from '@/models/Permission';
import dbConnect from '@/lib/db';

export async function getPermissionsForRole(roleName: string): Promise<string[]> {
    if (roleName === 'superadmin') {
        return ['*']; // SuperAdmin has all permissions
    }

    await dbConnect();
    const role = await Role.findOne({ name: roleName });
    if (!role) return [];

    const rolePermissions = await RolePermission.find({ roleId: role._id }).populate('permissionId');
    return rolePermissions.map((rp: any) => rp.permissionId.name);
}

export async function getPermissionsForRoles(roleNames: string[]): Promise<string[]> {
    if (roleNames.includes('superadmin')) {
        return ['*']; // SuperAdmin has all permissions
    }

    await dbConnect();
    const allPermissions = new Set<string>();

    for (const roleName of roleNames) {
        const permissions = await getPermissionsForRole(roleName);
        permissions.forEach(p => allPermissions.add(p));
    }

    return Array.from(allPermissions);
}

export async function hasPermission(roleNameOrNames: string | string[], permission: string): Promise<boolean> {
    const roleNames = Array.isArray(roleNameOrNames) ? roleNameOrNames : [roleNameOrNames];

    if (roleNames.includes('superadmin')) return true;

    const permissions = await getPermissionsForRoles(roleNames);
    return permissions.includes(permission);
}
