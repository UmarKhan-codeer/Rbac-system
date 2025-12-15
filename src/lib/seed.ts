import User from '@/models/User';
import Role from '@/models/Role';
import Permission from '@/models/Permission';
import RolePermission from '@/models/RolePermission';
import UserRole from '@/models/UserRole';
import bcryptjs from 'bcryptjs';

export async function seedDatabase() {
    try {
        // 1. Seed Permissions
        const permissions = [
            // Users
            'create:users', 'read:users', 'update:users', 'delete:users',
            // Posts
            'create:posts', 'read:posts', 'update:posts', 'delete:posts',
            // Roles
            'create:roles', 'read:roles', 'update:roles', 'delete:roles',
            // Permissions
            'create:permissions', 'read:permissions', 'update:permissions', 'delete:permissions',
        ];

        for (const permName of permissions) {
            const existingPerm = await Permission.findOne({ name: permName });
            if (!existingPerm) {
                await Permission.create({ name: permName });
                console.log(`Permission ${permName} created.`);
            }
        }

        // 2. Seed Roles
        const roles = ['superadmin', 'admin', 'editor', 'viewer'];

        for (const roleName of roles) {
            const existingRole = await Role.findOne({ name: roleName });
            if (!existingRole) {
                await Role.create({ name: roleName });
                console.log(`Role ${roleName} created.`);
            }
        }

        // 3. Seed Role Permissions
        const rolePermissionsMap: { [key: string]: string[] } = {
            superadmin: permissions, // All permissions
            admin: [
                'create:posts', 'read:posts', 'update:posts', 'delete:posts',
                'create:users', 'read:users', 'update:users', 'delete:users',
                'read:roles', 'read:permissions'
            ],
            editor: ['create:posts', 'read:posts', 'update:posts'],
            viewer: ['read:posts'],
        };

        for (const [roleName, perms] of Object.entries(rolePermissionsMap)) {
            const role = await Role.findOne({ name: roleName });
            if (!role) continue;

            for (const permName of perms) {
                const permission = await Permission.findOne({ name: permName });
                if (!permission) continue;

                const existingRolePerm = await RolePermission.findOne({
                    roleId: role._id,
                    permissionId: permission._id,
                });

                if (!existingRolePerm) {
                    await RolePermission.create({
                        roleId: role._id,
                        permissionId: permission._id,
                    });
                    console.log(`Assigned ${permName} to ${roleName}.`);
                }
            }
        }

        // 4. Seed SuperAdmin
        const superAdminEmail = 'superadmin@example.com';
        const existingAdmin = await User.findOne({ email: superAdminEmail });

        if (!existingAdmin) {
            const hashedPassword = await bcryptjs.hash('SuperAdmin@123', 10);
            const newAdmin = await User.create({
                name: 'Super Admin',
                email: superAdminEmail,
                password: hashedPassword,
            });
            console.log('SuperAdmin created.');

            // Assign superadmin role
            const superAdminRole = await Role.findOne({ name: 'superadmin' });
            if (superAdminRole) {
                await UserRole.create({
                    userId: newAdmin._id,
                    roleId: superAdminRole._id,
                });
                console.log('SuperAdmin role assigned.');
            }
        }
    } catch (error) {
        console.error('Seeding error:', error);
    }
}
