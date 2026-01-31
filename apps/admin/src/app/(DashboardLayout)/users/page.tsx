'use client';
import { useEffect, useState } from 'react';
import CardBox from '@/app/components/shared/CardBox';
import { Button } from '@/components/ui/button';
import { usersService, User } from '@/app/services/users.service';
import { Icon } from '@iconify/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Form states
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roleId, setRoleId] = useState('2');
    const [statusId, setStatusId] = useState('1');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await usersService.findAll();
            setUsers(data.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenCreate = () => {
        setEditingUser(null);
        resetForm();
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (user: User) => {
        setEditingUser(user);
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setEmail(user.email || '');
        setPassword(''); // Don't show password
        setRoleId(user.role?.id.toString() || '2');
        setStatusId(user.status?.id.toString() || '1');
        setIsDialogOpen(true);
    };

    const handleSaveUser = async () => {
        try {
            const payload: any = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                role: { id: parseInt(roleId) },
                status: { id: parseInt(statusId) }
            };

            // Only include password if provided (for create or password change)
            if (password) {
                payload.password = password;
            }

            if (editingUser) {
                await usersService.update(editingUser.id, payload);
                alert('✅ User updated successfully');
            } else {
                await usersService.create(payload);
                alert('✅ User created successfully');
            }

            setIsDialogOpen(false);
            resetForm();
            fetchUsers();
        } catch (error: any) {
            console.error('Save error:', error);
            const msg = error.response?.data?.message;
            const detail = Array.isArray(msg) ? msg.join(', ') : msg;
            alert('❌ ' + (detail || 'Failed to save user'));
        }
    };

    const resetForm = () => {
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setRoleId('2');
        setStatusId('1');
    };

    const handleDelete = async (id: number | string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await usersService.delete(id);
                alert('✅ User deleted successfully');
                fetchUsers();
            } catch (error: any) {
                console.error('Failed to delete user', error);
                alert('❌ Failed to delete user');
            }
        }
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">User Management</h2>
                <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2" onClick={handleOpenCreate}>
                                <Icon icon="solar:user-plus-bold" /> Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password {editingUser && '(Leave blank to keep current)'}</Label>
                                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Role</Label>
                                        <Select value={roleId} onValueChange={setRoleId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Admin</SelectItem>
                                                <SelectItem value="2">User</SelectItem>
                                                <SelectItem value="3">Restaurant Admin</SelectItem>
                                                <SelectItem value="4">Restaurant Manager</SelectItem>
                                                <SelectItem value="5">Restaurant Staff</SelectItem>
                                                <SelectItem value="6">Delivery</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Status</Label>
                                        <Select value={statusId} onValueChange={setStatusId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Active</SelectItem>
                                                <SelectItem value="2">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button onClick={handleSaveUser} className="w-full mt-2">
                                    {editingUser ? 'Update User' : 'Create User'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={fetchUsers} variant="outline" className="flex items-center gap-2">
                        <Icon icon="solar:refresh-linear" /> Refresh
                    </Button>
                </div>
            </div>

            <CardBox>
                {loading ? (
                    <div className="py-10 text-center text-gray-500">Loading users...</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.firstName} {user.lastName}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                            {user.role?.name || 'User'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status?.id === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.status?.name || 'Active'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* Protect Super Admin (Assuming ID 1 is Super Admin) */}
                                            {user.id !== 1 && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                        onClick={() => handleOpenEdit(user)}
                                                    >
                                                        <Icon icon="solar:pen-bold" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDelete(user.id)}
                                                    >
                                                        <Icon icon="solar:trash-bin-trash-bold" />
                                                    </Button>
                                                </>
                                            )}
                                            {user.id === 1 && (
                                                <span className="text-xs text-gray-400 italic px-2">System Protected</span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardBox>
        </div>
    );
}
