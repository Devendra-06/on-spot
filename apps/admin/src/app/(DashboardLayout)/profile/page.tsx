'use client';
import { useState, useEffect, useRef } from 'react';
import { authService } from '@/app/services/auth.service';
import { filesService } from '@/app/services/files.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';

export default function ProfilePage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [user, setUser] = useState<any>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await authService.me();
            setUser(data);
            setFirstName(data.firstName || '');
            setLastName(data.lastName || '');
        } catch (error) {
            console.error('Failed to fetch profile', error);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await authService.updateMe({ firstName, lastName });
            toast.success('Profile updated successfully');
            fetchProfile();
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const uploadedFile = await filesService.upload(file);
            await authService.updateMe({ photo: { id: uploadedFile.id } });
            toast.success('Profile photo updated successfully');
            fetchProfile();
        } catch (error) {
            toast.error('Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={user?.photo?.path || "/images/profile/user-1.jpg"} />
                                <AvatarFallback>{firstName?.[0]}{lastName?.[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle>{firstName} {lastName}</CardTitle>
                        <CardDescription>{user?.role?.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                            <Icon icon="solar:letter-linear" width={18} />
                            {user?.email}
                        </div>
                        <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                            <Icon icon="solar:calendar-linear" width={18} />
                            Joined {new Date(user?.createdAt).toLocaleDateString()}
                        </div>

                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handlePhotoChange}
                        />
                        <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Change Photo'}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" value={user?.email || ''} disabled className="bg-gray-50" />
                            <p className="text-xs text-gray-500 italic">Email cannot be changed after registration.</p>
                        </div>
                        <div className="pt-4">
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
