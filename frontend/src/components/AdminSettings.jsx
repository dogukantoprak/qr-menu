import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from 'sonner';
import { Loader2, Save, Wifi, Store, Palette } from 'lucide-react';

export default function AdminSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        name: '',
        theme_color: '#e11d48',
        wifi_ssid: '',
        wifi_password: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/admin/settings');
            setSettings(res.data);
        } catch (err) {
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/admin/settings', settings);
            toast.success("Settings updated successfully");
        } catch (err) {
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;


    const handleSeed = async () => {
        if (!window.confirm("This will populate your menu with demo data. Continue?")) return;
        setSaving(true);
        try {
            await api.post('/admin/seed-demo');
            toast.success("Demo data seeded successfully!");
        } catch (err) {
            toast.error("Failed to seed data", { description: err.response?.data?.msg || err.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-stone-900">Restaurant Settings</h1>
                <p className="text-stone-500 mt-2">Manage your branding and venue details.</p>
            </div>

            <div className="space-y-6">
                {/* Branding Section */}
                <Card className="rounded-3xl border-stone-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" /> General Info</CardTitle>
                        <CardDescription>Visible on your public menu.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Restaurant Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={settings.name}
                                onChange={handleChange}
                                className="rounded-xl"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Theme Section */}
                <Card className="rounded-3xl border-stone-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Appearance</CardTitle>
                        <CardDescription>Customize the look of your digital menu.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="theme_color">Accent Color</Label>
                            <div className="flex gap-3">
                                <Input
                                    id="theme_color"
                                    name="theme_color"
                                    type="color"
                                    value={settings.theme_color}
                                    onChange={handleChange}
                                    className="w-16 h-12 p-1 rounded-xl cursor-pointer"
                                />
                                <Input
                                    value={settings.theme_color}
                                    onChange={handleChange}
                                    name="theme_color"
                                    className="flex-1 rounded-xl font-mono uppercase"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* WiFi Section */}
                <Card className="rounded-3xl border-stone-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Wifi className="h-5 w-5" /> WiFi Details</CardTitle>
                        <CardDescription>Optional: Share WiFi credentials via QR code (future feature).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="wifi_ssid">Network Name (SSID)</Label>
                                <Input
                                    id="wifi_ssid"
                                    name="wifi_ssid"
                                    value={settings.wifi_ssid || ''}
                                    onChange={handleChange}
                                    className="rounded-xl"
                                    placeholder="e.g. MyRestaurant_Guest"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="wifi_password">Password</Label>
                                <Input
                                    id="wifi_password"
                                    name="wifi_password"
                                    value={settings.wifi_password || ''}
                                    onChange={handleChange}
                                    className="rounded-xl"
                                    type="password"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Demo Tools */}
                <Card className="rounded-3xl border-stone-100 shadow-sm bg-stone-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-stone-700">Demo Data</CardTitle>
                        <CardDescription>Populate your menu with example categories and items.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleSeed}
                            disabled={saving}
                            className="bg-white border-stone-200 text-stone-700 hover:bg-stone-100 rounded-xl"
                        >
                            Reset & Seed Demo Data
                        </Button>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleSave}
                        size="lg"
                        disabled={saving}
                        className="rounded-full px-8 bg-stone-900 text-white hover:bg-black font-bold shadow-lg shadow-stone-900/10 active:scale-95 transition-all"
                    >
                        {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
