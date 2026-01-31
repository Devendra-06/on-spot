'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { authService } from '@/app/services/auth.service';

export default function AccountPage() {
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);

    const handleUpdatePassword = async () => {
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        setSaving(true);
        try {
            await authService.updateMe({ oldPassword, password });
            alert('Password updated successfully');
            setOldPassword('');
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update password');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">My Account</h1>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your password and account security.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="oldPassword">Current Password</Label>
                        <Input
                            id="oldPassword"
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="pt-4 flex gap-4">
                        <Button onClick={handleUpdatePassword} disabled={saving}>
                            {saving ? 'Updating...' : 'Update Password'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="max-w-2xl border-red-200">
                <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>Irreversible account actions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                    <Button variant="destructive">Delete Account</Button>
                </CardContent>
            </Card>
        </div>
    );
}
