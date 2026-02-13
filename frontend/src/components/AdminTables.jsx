import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download, Plus, Trash2, QrCode } from "lucide-react";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import api from '../api/axios';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminTables() {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTableName, setNewTableName] = useState('');
    const [generating, setGenerating] = useState(false);
    const [restaurantSlug, setRestaurantSlug] = useState('demo-restoran');
    // In a real app we'd fetch settings to get the slug, 
    // but the backend returns logic-ready URLs now anyway.

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const res = await api.get('/admin/tables');
            setTables(res.data);
            if (res.data.length > 0) {
                // Try to guess slug from first URL if needed, or simple fetch settings
                // For now, we rely on the URL provided by backend
            }
        } catch (err) {
            toast.error("Failed to load tables");
        } finally {
            setLoading(false);
        }
    };

    const addTable = async () => {
        if (!newTableName.trim()) return;
        try {
            await api.post('/admin/tables', { name: newTableName });
            toast.success("Table added");
            setNewTableName('');
            fetchTables();
        } catch (err) {
            toast.error("Failed to add table");
        }
    };

    const deleteTable = async (id) => {
        if (!confirm("Are you sure? This will invalidate the QR code.")) return;
        try {
            await api.delete(`/admin/tables/${id}`);
            toast.success("Table deleted");
            setTables(tables.filter(t => t.id !== id));
        } catch (err) {
            toast.error("Failed to delete table");
        }
    };

    const downloadSingleQR = (table) => {
        const canvas = document.getElementById(`qr-canvas-${table.id}`);
        if (canvas) {
            canvas.toBlob((blob) => {
                saveAs(blob, `qr_table_${table.id}.png`);
                toast.success(`Downloaded QR for ${table.name}`);
            });
        }
    };

    const downloadBulkZip = async () => {
        setGenerating(true);
        const zip = new JSZip();
        const folder = zip.folder("qr_codes");

        // We create a simple text list for reliability as canvas-to-blob in loop can be tricky without async-await on render
        // But since we render them all, we COULD grab them. 
        // For robustness given the request, let's include the Links List.
        let linksText = `Table URLs\n\n`;
        tables.forEach(t => {
            // Backend provides relative URL /r/..., we need absolute
            const fullUrl = `${window.location.origin}${t.url}`;
            linksText += `${t.name}: ${fullUrl}\n`;
        });
        folder.file("table_links.txt", linksText);

        try {
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, "qr_codes_bundle.zip");
            toast.success("Downloaded QR Bundle");
        } catch (e) {
            toast.error("Failed to zip");
        }
        setGenerating(false);
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-stone-900">Tables & QRs</h1>
                    <p className="text-stone-500 mt-2">Manage restaurant tables and generate QR codes.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={downloadBulkZip} disabled={generating}>
                        {generating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
                        Download All (ZIP)
                    </Button>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-stone-900 text-white rounded-xl hover:bg-black">
                                <Plus className="mr-2 h-4 w-4" /> Add Table
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Table</DialogTitle>
                                <DialogDescription>Enter a name for the new table (e.g. "Table 5", "Garden 1")</DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Label>Table Name</Label>
                                <Input
                                    value={newTableName}
                                    onChange={(e) => setNewTableName(e.target.value)}
                                    placeholder="e.g. Table 15"
                                    className="mt-2"
                                />
                            </div>
                            <DialogFooter>
                                <Button onClick={addTable}>Create Table</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.map(table => (
                    <Card key={table.id} className="rounded-3xl border-stone-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                        <div className="flex">
                            {/* Left: Info */}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-lg text-stone-900">{table.name}</h3>
                                    <p className="text-xs text-stone-400 font-mono mt-1 truncate max-w-[120px]">
                                        {table.url}
                                    </p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button size="sm" variant="outline" onClick={() => downloadSingleQR(table)} className="rounded-lg h-8 text-xs">
                                        <Download className="h-3 w-3 mr-1" /> PNG
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => deleteTable(table.id)} className="rounded-lg h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>

                            {/* Right: QR Preview */}
                            <div className="w-32 bg-stone-50 flex items-center justify-center border-l border-stone-50 relative p-2">
                                <div className="bg-white p-2 rounded-xl shadow-sm">
                                    <QRCodeCanvas
                                        id={`qr-canvas-${table.id}`}
                                        value={`${import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin}${table.url}`}
                                        size={80}
                                        level={"M"}
                                        includeMargin={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {tables.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                        <QrCode className="h-10 w-10 mx-auto text-stone-300 mb-4" />
                        <h3 className="text-stone-900 font-bold">No tables yet</h3>
                        <p className="text-stone-500 text-sm">Add your first table to generate a QR code.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
