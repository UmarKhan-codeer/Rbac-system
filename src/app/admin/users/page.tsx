'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Trash2, Shield, Plus, Edit2, Search } from 'lucide-react';
import { IUser } from '@/models/User';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Improved Role Badge Component
function UserBadge({ role }: { role: string }) {
    const isSuper = role === 'superadmin';
    const isAdmin = role === 'admin';

    let colorClass = "bg-secondary text-secondary-foreground hover:bg-secondary/80";
    if (isSuper) colorClass = "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800";
    if (isAdmin) colorClass = "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800";

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} transition-colors`}>
            {isSuper && <Shield className="mr-1 h-3 w-3" />}
            {role}
        </span>
    )
}

interface UserWithId extends Omit<IUser, '_id'> {
    _id: string;
    roles: string[];
}

interface Role {
    _id: string;
    name: string;
}

export default function UsersPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<UserWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<UserWithId | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roles: [] as string[]
    });

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await fetch('/api/roles');
            const data = await res.json();
            setRoles(data);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    };

    const handleOpenCreate = () => {
        setModalMode('create');
        setFormData({ name: '', email: '', password: '', roles: [] });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: UserWithId) => {
        setModalMode('edit');
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            roles: user.roles || []
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const submitPromise = new Promise(async (resolve, reject) => {
            try {
                const url = modalMode === 'create' ? '/api/users' : `/api/users/${selectedUser?._id}`;
                const method = modalMode === 'create' ? 'POST' : 'PUT';

                const bodyData = { ...formData };
                if (modalMode === 'edit' && !bodyData.password) {
                    delete (bodyData as any).password;
                }

                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData),
                });

                if (res.ok) {
                    setIsModalOpen(false);
                    fetchUsers();
                    resolve(modalMode === 'create' ? 'User created successfully' : 'User updated successfully');
                } else {
                    const error = await res.json();
                    reject(error.error || 'Operation failed');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                reject('Error submitting form');
            }
        });

        toast.promise(submitPromise, {
            loading: modalMode === 'create' ? 'Creating user...' : 'Updating user...',
            success: (msg: any) => msg,
            error: (err: any) => err,
        });
    };

    const handleDelete = async (userId: string) => {
        // Using toast promise for better UX than standard confirm alert
        toast((t) => (
            <div className="flex flex-col gap-2">
                <span className="font-semibold">Delete this user?</span>
                <span className="text-sm text-gray-500">This action cannot be undone.</span>
                <div className="flex gap-2 mt-2">
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                            toast.dismiss(t.id);
                            performDelete(userId);
                        }}
                    >
                        Delete
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const performDelete = async (userId: string) => {
        const deletePromise = new Promise(async (resolve, reject) => {
            try {
                const res = await fetch(`/api/users/${userId}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    setUsers(users.filter(u => u._id !== userId));
                    resolve('User deleted successfully');
                } else {
                    reject('Failed to delete user');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                reject('Error deleting user');
            }
        });

        toast.promise(deletePromise, {
            loading: 'Deleting user...',
            success: 'User deleted successfully!',
            error: 'Failed to delete user',
        });
    }


    const isSuperAdmin = (userRoles: string[]) => userRoles?.includes('superadmin');

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
                    <p className="text-muted-foreground mt-1">Manage system users and access roles.</p>
                </div>
                <Button onClick={handleOpenCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Users Directory</CardTitle>
                            <CardDescription>A list of all users and their roles.</CardDescription>
                        </div>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading users...</TableCell>
                                    </TableRow>
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No users found.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles?.map((role) => (
                                                        <UserBadge key={role} role={role} />
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {!isSuperAdmin(user.roles) && (
                                                        <>
                                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(user)}>
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(user._id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{modalMode === 'create' ? 'Create New User' : 'Edit User'}</DialogTitle>
                        <DialogDescription>
                            {modalMode === 'create' ? 'Add a new user to the system.' : 'Modify existing user details.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        {(modalMode === 'create' || (modalMode === 'edit' && !isSuperAdmin(selectedUser?.roles || []))) && (
                            <div className="space-y-2">
                                <Label htmlFor="password">Password {modalMode === 'edit' && '(Leave blank to not change)'}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={modalMode === 'create'}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Roles</Label>
                            <div className="flex flex-col gap-2 p-3 border rounded-md max-h-[200px] overflow-y-auto">
                                {roles.map((role) => (
                                    <div key={role._id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`role-${role._id}`}
                                            checked={formData.roles.includes(role.name)}
                                            onChange={(e) => {
                                                const newRoles = e.target.checked
                                                    ? [...formData.roles, role.name]
                                                    : formData.roles.filter(r => r !== role.name);
                                                setFormData({ ...formData, roles: newRoles });
                                            }}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor={`role-${role._id}`} className="font-normal cursor-pointer">
                                            {role.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit">{modalMode === 'create' ? 'Create User' : 'Save Changes'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}