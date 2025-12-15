'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Trash2, Save, Edit2, X } from 'lucide-react';
import { IPermission } from '@/models/Permission';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';

interface PermissionWithId extends Omit<IPermission, '_id'> {
    _id: string;
}

export default function PermissionsPage() {
    const [permissions, setPermissions] = useState<PermissionWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAction, setSelectedAction] = useState('create');
    const [selectedResource, setSelectedResource] = useState('posts');
    const [newPermissionDescription, setNewPermissionDescription] = useState('');
    const [editingPermission, setEditingPermission] = useState<string | null>(null);
    const [editDescription, setEditDescription] = useState('');

    const actions = ['create', 'read', 'update', 'delete'];
    const resources = ['posts', 'users', 'roles', 'permissions'];

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            const res = await fetch('/api/permissions');
            const data = await res.json();
            setPermissions(data);
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePermission = async (e: React.FormEvent) => {
        e.preventDefault();
        const newPermissionName = `${selectedAction}:${selectedResource}`;

        const createPromise = new Promise(async (resolve, reject) => {
            try {
                const res = await fetch('/api/permissions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: newPermissionName,
                        description: newPermissionDescription
                    }),
                });

                if (res.ok) {
                    const newPermission = await res.json();
                    setPermissions([...permissions, newPermission].sort((a, b) => a.name.localeCompare(b.name)));
                    setNewPermissionDescription('');
                    resolve('Permission added successfully');
                } else {
                    const error = await res.json();
                    reject(error.error || 'Failed to create permission');
                }
            } catch (error) {
                console.error('Error creating permission:', error);
                reject('Error creating permission');
            }
        });

        toast.promise(createPromise, {
            loading: 'Creating permission...',
            success: 'Permission added successfully!',
            error: (err: any) => err,
        });
    };

    const handleUpdatePermission = async (permissionId: string) => {
        const permission = permissions.find(p => p._id === permissionId);
        if (!permission) return;

        const updatePromise = new Promise(async (resolve, reject) => {
            try {
                const res = await fetch(`/api/permissions/${permissionId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: permission.name,
                        description: editDescription
                    }),
                });

                if (res.ok) {
                    const updatedPermission = await res.json();
                    setPermissions(permissions.map(p => p._id === permissionId ? updatedPermission : p));
                    setEditingPermission(null);
                    resolve('Permission updated successfully');
                } else {
                    const error = await res.json();
                    reject(error.error || 'Failed to update permission');
                }
            } catch (error) {
                console.error('Error updating permission:', error);
                reject('Error updating permission');
            }
        });

        toast.promise(updatePromise, {
            loading: 'Updating permission...',
            success: 'Permission updated successfully!',
            error: (err: any) => err,
        });
    };

    const handleDeletePermission = async (permissionId: string) => {
        const deletePromise = new Promise(async (resolve, reject) => {
            try {
                const res = await fetch(`/api/permissions/${permissionId}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    setPermissions(permissions.filter(p => p._id !== permissionId));
                    resolve('Permission deleted successfully');
                } else {
                    const error = await res.json();
                    reject(error.error || 'Failed to delete permission');
                }
            } catch (error) {
                console.error('Error deleting permission:', error);
                reject('Error deleting permission');
            }
        });

        toast.promise(deletePromise, {
            loading: 'Deleting permission...',
            success: 'Permission deleted successfully!',
            error: (err: any) => err,
        });
    };

    const startEditing = (permission: PermissionWithId) => {
        setEditingPermission(permission._id);
        setEditDescription(permission.description || '');
    };

    const cancelEditing = () => {
        setEditingPermission(null);
        setEditDescription('');
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Permission Management</h1>
                <p className="text-muted-foreground mt-1">Define granular permissions for roles.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Create Permission</CardTitle>
                        <CardDescription>Add a new permission rule.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreatePermission} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Action</Label>
                                <div className="relative">
                                    <select
                                        value={selectedAction}
                                        onChange={(e) => setSelectedAction(e.target.value)}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {actions.map(action => (
                                            <option key={action} value={action}>{action}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Resource</Label>
                                <div className="relative">
                                    <select
                                        value={selectedResource}
                                        onChange={(e) => setSelectedResource(e.target.value)}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {resources.map(resource => (
                                            <option key={resource} value={resource}>{resource}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Preview Name</Label>
                                <div className="px-3 py-2 bg-muted rounded-md border text-sm font-mono text-muted-foreground">
                                    {selectedAction}:{selectedResource}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input
                                    id="description"
                                    value={newPermissionDescription}
                                    onChange={(e) => setNewPermissionDescription(e.target.value)}
                                    placeholder="e.g., Allows creating posts"
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Permission
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Existing Permissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Permission Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {permissions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                                                No permissions found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        permissions.map((permission) => (
                                            <TableRow key={permission._id}>
                                                {editingPermission === permission._id ? (
                                                    <>
                                                        <TableCell className="font-mono text-sm">
                                                            {permission.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={editDescription}
                                                                onChange={(e) => setEditDescription(e.target.value)}
                                                                className="h-8"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleUpdatePermission(permission._id)}>
                                                                    <Save className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEditing}>
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell className="font-mono text-sm font-medium">
                                                            {permission.name}
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {permission.description || '-'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEditing(permission)}>
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeletePermission(permission._id)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
