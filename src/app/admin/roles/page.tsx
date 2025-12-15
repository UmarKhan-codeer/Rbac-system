'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Trash2, Edit2, Shield, X, Check } from 'lucide-react';
import { IRole } from '@/models/Role';
import { IPermission } from '@/models/Permission';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RoleWithId extends Omit<IRole, '_id'> {
    _id: string;
    permissions: string[];
}

interface PermissionWithId extends Omit<IPermission, '_id'> {
    _id: string;
}

export default function RolesPage() {
    const [roles, setRoles] = useState<RoleWithId[]>([]);
    const [permissions, setPermissions] = useState<PermissionWithId[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentRole, setCurrentRole] = useState<RoleWithId | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        permissions: [] as string[]
    });

    useEffect(() => {
        Promise.all([fetchRoles(), fetchPermissions()])
            .finally(() => setLoading(false));
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await fetch('/api/roles');
            const data = await res.json();
            setRoles(data);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    };

    const fetchPermissions = async () => {
        try {
            const res = await fetch('/api/permissions');
            const data = await res.json();
            setPermissions(data);
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
        }
    };

    const handleOpenCreate = () => {
        setModalMode('create');
        setCurrentRole(null);
        // Default permission 'read:posts' selected
        setFormData({
            name: '',
            permissions: ['read:posts']
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (role: RoleWithId) => {
        setModalMode('edit');
        setCurrentRole(role);
        setFormData({
            name: role.name,
            permissions: role.permissions || []
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        const submitPromise = new Promise(async (resolve, reject) => {
            try {
                const url = modalMode === 'create' ? '/api/roles' : `/api/roles/${currentRole?._id}`;
                const method = modalMode === 'create' ? 'POST' : 'PUT';

                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                if (res.ok) {
                    await fetchRoles();
                    setIsModalOpen(false);
                    resolve(modalMode === 'create' ? 'Role created successfully' : 'Role updated successfully');
                } else {
                    const error = await res.json();
                    reject(error.error || 'Operation failed');
                }
            } catch (error) {
                console.error('Error saving role:', error);
                reject('Error saving role');
            }
        });

        toast.promise(submitPromise, {
            loading: modalMode === 'create' ? 'Creating role...' : 'Updating role...',
            success: (msg: any) => msg,
            error: (err: any) => err,
        });
    };

    const handleDeleteRole = async (roleId: string) => {
        const deletePromise = new Promise(async (resolve, reject) => {
            try {
                const res = await fetch(`/api/roles/${roleId}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    setRoles(roles.filter(r => r._id !== roleId));
                    resolve('Role deleted successfully');
                } else {
                    const error = await res.json();
                    reject(error.error || 'Failed to delete role');
                }
            } catch (error) {
                console.error('Error deleting role:', error);
                reject('Error deleting role');
            }
        });

        toast.promise(deletePromise, {
            loading: 'Deleting role...',
            success: 'Role deleted successfully!',
            error: (err: any) => err,
        });
    };

    const togglePermission = (permissionName: string) => {
        setFormData(prev => {
            const exists = prev.permissions.includes(permissionName);
            return {
                ...prev,
                permissions: exists
                    ? prev.permissions.filter(p => p !== permissionName)
                    : [...prev.permissions, permissionName]
            };
        });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Role Management</h1>
                    <p className="text-muted-foreground mt-1">Manage user roles and their associated permissions.</p>
                </div>
                <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Role
                </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {roles.map((role) => (
                    <Card key={role._id} className={cn(
                        "flex flex-col h-full transition-all duration-300 hover:shadow-xl border-border/60",
                        role.name === 'superadmin' ? 'bg-primary/5 border-primary/20' : 'hover:border-primary/50'
                    )}>
                        <CardHeader className="pb-3 md:pb-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={cn(
                                        "p-2.5 rounded-xl flex items-center justify-center transition-colors",
                                        role.name === 'superadmin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                                    )}>
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle className="capitalize text-lg">{role.name}</CardTitle>
                                        <div className="text-xs text-muted-foreground font-medium">
                                            {role.permissions.length} Permission{role.permissions.length !== 1 && 's'}
                                        </div>
                                    </div>
                                </div>
                                {role.name !== 'superadmin' && (
                                    <div className="flex -mr-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-70 hover:opacity-100" onClick={() => handleOpenEdit(role)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteRole(role._id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="h-px bg-border/50 w-full mb-4" />
                            <div className="flex flex-wrap gap-1.5">
                                {role.permissions && role.permissions.length > 0 ? (
                                    role.permissions.slice(0, 5).map((perm) => (
                                        <Badge
                                            key={perm}
                                            variant="secondary"
                                            className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-secondary/50 hover:bg-secondary text-secondary-foreground/80"
                                        >
                                            {perm}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground italic">No permissions assigned</span>
                                )}
                                {role.permissions.length > 5 && (
                                    <Badge variant="outline" className="px-2 py-0.5 text-[10px]">
                                        +{role.permissions.length - 5}
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{modalMode === 'create' ? 'Create New Role' : 'Edit Role'}</DialogTitle>
                        <DialogDescription>
                            Configure the role name and assign permissions.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto pr-2">
                        <div className="space-y-2">
                            <Label htmlFor="roleName">Role Name</Label>
                            <Input
                                id="roleName"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Editor"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Permissions</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
                                {permissions.map((perm) => (
                                    <label
                                        key={perm._id}
                                        className={`
                                            relative flex items-center p-3 rounded-lg border cursor-pointer transition-all
                                            ${formData.permissions.includes(perm.name)
                                                ? 'border-primary bg-primary/5 shadow-sm'
                                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center h-5">
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions.includes(perm.name)}
                                                onChange={() => togglePermission(perm.name)}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <span className={`font-medium ${formData.permissions.includes(perm.name) ? 'text-primary' : 'text-foreground'}`}>
                                                {perm.name}
                                            </span>
                                            {perm.description && (
                                                <p className="text-muted-foreground text-xs mt-0.5">{perm.description}</p>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit">{modalMode === 'create' ? 'Create Role' : 'Save Changes'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}