import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Search, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Items() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');

    // Dialog & Form State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '', price: '', category_id: '', description: '', image_url: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catsRes, itemsRes] = await Promise.all([
                api.get('/admin/categories'),
                api.get('/admin/items')
            ]);
            setCategories(catsRes.data);
            setItems(itemsRes.data);

            // Default category for form
            if (catsRes.data.length > 0 && !formData.category_id) {
                setFormData(prev => ({ ...prev, category_id: catsRes.data[0].id }));
            }
        } catch (err) {
            toast.error("Failed to load data", {
                description: err.response?.data?.msg || err.message
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('file', file);

        try {
            const res = await api.post('/admin/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, image_url: res.data.url }));
            toast.success("Image uploaded");
        } catch (err) {
            toast.error("Upload failed", { description: "Supported formats: png, jpg, webp" });
        } finally {
            setUploading(false);
        }
    };

    const openCreateDialog = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            price: '',
            category_id: categories.length > 0 ? categories[0].id : '',
            description: '',
            image_url: ''
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            price: item.price,
            category_id: item.category_id,
            description: item.description || '',
            image_url: item.image_url || ''
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price)
            };

            if (editingItem) {
                await api.put(`/admin/items/${editingItem.id}`, payload);
                toast.success("Item updated");
            } else {
                await api.post('/admin/items', payload);
                toast.success("Item created");
            }
            setIsDialogOpen(false);
            fetchData();
        } catch (err) {
            toast.error("Save failed", {
                description: err.response?.data?.msg || err.message
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/admin/items/${id}`);
            toast.success("Item deleted");
            fetchData();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    // Filter Logic
    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'ALL' || item.category_id === parseInt(filterCategory);
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-stone-900">Menu Items</h2>
                    <p className="text-stone-500 mt-1">Manage your food and drinks.</p>
                </div>
                <Button onClick={openCreateDialog} className="rounded-full shadow-lg shadow-stone-900/10 bg-stone-900 hover:bg-black transition-transform active:scale-95">
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-2xl border-0 shadow-sm">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                    <Input
                        placeholder="Search items..."
                        className="pl-10 rounded-xl border-stone-200 bg-stone-50 focus:bg-white transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex w-full sm:w-auto items-center gap-2">
                    <Filter className="h-4 w-4 text-stone-400" />
                    <Select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full sm:w-[200px] rounded-xl border-stone-200"
                    >
                        <option value="ALL">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                </div>
                <div className="ml-auto text-sm text-stone-500 font-medium">
                    Showing {filteredItems.length} items
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-stone-300" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map(item => (
                        <Card key={item.id} className="group border-0 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 rounded-3xl overflow-hidden bg-white ring-1 ring-stone-100 hover:ring-stone-200 hover:-translate-y-1">
                            <div className="aspect-[4/3] w-full bg-stone-100 relative overflow-hidden group-hover:opacity-95 transition-opacity">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-stone-200">
                                        <ImageIcon className="h-12 w-12 opacity-30" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    <Badge variant="secondary" className="bg-white/80 backdrop-blur-md shadow-sm text-stone-900 font-bold px-3 py-1.5 rounded-full text-sm border-0">
                                        {item.price} <span className="text-[10px] ml-1 font-normal text-stone-500">₺</span>
                                    </Badge>
                                </div>
                            </div>
                            <CardHeader className="pb-2 pt-5 px-5">
                                <div className="flex justify-between items-start gap-3">
                                    <CardTitle className="text-xl font-bold text-stone-900 line-clamp-1 leading-tight">{item.name}</CardTitle>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="outline" className="text-[10px] font-bold tracking-wider uppercase border-stone-200 text-stone-500 rounded-md px-2 py-0.5 bg-stone-50">
                                        {categories.find(c => c.id === item.category_id)?.name}
                                    </Badge>
                                </div>
                                <CardDescription className="line-clamp-2 h-10 text-stone-500 text-sm mt-3 leading-relaxed">
                                    {item.description || "No description provided."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-5 pb-5 pt-2 flex items-center gap-2 mt-auto">
                                <Button variant="secondary" onClick={() => openEditDialog(item)} className="flex-1 rounded-xl bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-700 font-bold h-10 transition-colors duration-200">
                                    Edit
                                </Button>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="rounded-3xl border-0 shadow-2xl p-8">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl">Delete Item</DialogTitle>
                                            <DialogDescription className="text-base text-stone-500 mt-2">
                                                Are you sure you want to permanently delete <strong className="text-stone-900">{item.name}</strong>?
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter className="gap-3 sm:gap-0 mt-6">
                                            <DialogClose asChild>
                                                <Button variant="outline" className="rounded-xl border-stone-200 h-12 px-6">Cancel</Button>
                                            </DialogClose>
                                            <Button variant="destructive" className="rounded-xl h-12 px-6 shadow-xl shadow-red-500/20" onClick={() => handleDelete(item.id)}>Delete</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="col-span-full py-24 text-center text-stone-400 border-2 border-dashed border-stone-200 rounded-[32px] bg-stone-50/50 flex flex-col items-center justify-center">
                            <Search className="h-12 w-12 opacity-20 mb-4" />
                            <p className="text-lg font-medium text-stone-500">No items found matching your filters.</p>
                        </div>
                    )}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-2xl">{editingItem ? "Edit Item" : "Create Item"}</DialogTitle>
                        <DialogDescription>
                            Add details for your menu item.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6 p-6 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-stone-600">Item Name</Label>
                                    <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Cheese Burger" className="rounded-xl border-stone-200 bg-stone-50 focus:bg-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-stone-600">Price (TRY)</Label>
                                    <Input id="price" type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required className="rounded-xl border-stone-200 bg-stone-50 focus:bg-white" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-stone-600">Category</Label>
                                <Select id="category" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} required className="rounded-xl border-stone-200 bg-stone-50 focus:bg-white">
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-stone-600">Item Image</Label>
                                <div className="flex items-center gap-4 border border-stone-200 rounded-2xl p-4 bg-stone-50/50">
                                    <Avatar className="h-16 w-16 rounded-xl border border-stone-200">
                                        <AvatarImage src={formData.image_url} objectFit="cover" />
                                        <AvatarFallback className="bg-white"><ImageIcon className="text-stone-300" /></AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex gap-2">
                                            <Input type="file" accept="image/*" onChange={handleFileChange} className="text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:bg-stone-900 file:text-white file:font-medium hover:file:bg-black border-0 bg-transparent p-0" />
                                        </div>
                                        <p className="text-xs text-stone-400">
                                            {uploading ? "Uploading..." : "Upload local file (PNG, JPG)"}
                                        </p>
                                    </div>
                                </div>
                                <div className="relative mt-2">
                                    <Input
                                        placeholder="Or paste external image URL..."
                                        value={formData.image_url}
                                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        className="rounded-xl border-stone-200 bg-stone-50 focus:bg-white text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-stone-600">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Ingredients, taste, allergens..."
                                    className="rounded-xl border-stone-200 bg-stone-50 focus:bg-white resize-none"
                                />
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-0 gap-2 sm:gap-0">
                            <DialogClose asChild>
                                <Button type="button" variant="ghost" className="rounded-xl hover:bg-stone-100">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isSubmitting || uploading} className="rounded-xl bg-stone-900 text-white hover:bg-black shadow-lg shadow-stone-900/10">
                                {(isSubmitting || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Item
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
