import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Pencil, Trash2, Loader2, GripVertical, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/categories');
            setCategories(res.data);
        } catch (err) {
            toast.error('Failed to load categories', {
                description: err.response?.data?.msg || err.message
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openCreateDialog = () => {
        setEditingCategory(null);
        setFormData({ name: '' });
        setIsDialogOpen(true);
    };

    const openEditDialog = (category) => {
        setEditingCategory(category);
        setFormData({ name: category.name });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setIsSubmitting(true);
        try {
            if (editingCategory) {
                await api.put(`/admin/categories/${editingCategory.id}`, { name: formData.name });
                toast.success("Category updated successfully");
            } else {
                await api.post('/admin/categories', {
                    name: formData.name,
                    sort_order: categories.length + 1
                });
                toast.success("Category created successfully");
            }
            setIsDialogOpen(false);
            fetchCategories();
        } catch (err) {
            toast.error(editingCategory ? "Update failed" : "Creation failed", {
                description: err.response?.data?.msg || err.message
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/admin/categories/${id}`);
            toast.success("Category deleted");
            fetchCategories();
        } catch (err) {
            toast.error("Failed to delete category", {
                description: err.response?.data?.msg || "Ensure category contains no items before deleting."
            });
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-stone-900">Categories</h2>
                    <p className="text-stone-500 mt-1">Manage food categories (e.g., Appetizers, Drinks).</p>
                </div>
                <Button onClick={openCreateDialog} className="rounded-full shadow-lg shadow-stone-900/10 bg-stone-900 hover:bg-black transition-transform active:scale-95 px-6">
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
            </div>

            {/* Helper Bar */}
            <div className="flex items-center gap-2 bg-white p-4 rounded-3xl border-0 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-stone-400" />
                    <Input
                        placeholder="Search categories..."
                        className="pl-11 h-11 rounded-2xl border-stone-200 bg-stone-50/50 focus:bg-white focus:ring-stone-200 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="h-4 w-px bg-stone-200 mx-2 hidden sm:block"></div>
                <div className="text-sm text-stone-400 font-medium hidden sm:block">
                    {filteredCategories.length} categories found
                </div>
            </div>

            {/* Soft UI List instead of Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-stone-300" />
                </div>
            ) : filteredCategories.length === 0 ? (
                <div className="text-center py-20 text-stone-400 border-2 border-dashed border-stone-200 rounded-3xl bg-stone-50/50">
                    <div className="mb-2 text-2xl">📂</div>
                    No categories found. Create one to get started.
                </div>
            ) : (
                <div className="grid gap-3">
                    {filteredCategories.map((cat) => (
                        <div key={cat.id} className="group flex items-center justify-between p-4 pl-5 bg-white rounded-3xl shadow-sm border border-stone-100 hover:shadow-lg hover:shadow-stone-900/5 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-stone-100 group-hover:bg-stone-900 transition-colors duration-300"></div>

                            <div className="flex items-center gap-5">
                                <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-stone-50 text-stone-400 group-hover:bg-stone-100 group-hover:text-stone-600 transition-colors">
                                    <GripVertical className="h-5 w-5 opacity-50" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg text-stone-900 group-hover:text-black transition-colors">{cat.name}</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="bg-stone-50 text-stone-500 hover:bg-stone-100 border-0 text-[10px] uppercase tracking-wider font-bold">
                                            Sort: {cat.sort_order}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-0">
                                <Button variant="secondary" size="icon" onClick={() => openEditDialog(cat)} className="h-10 w-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600">
                                    <Pencil className="h-4 w-4" />
                                </Button>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-red-50 text-stone-300 hover:text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="rounded-3xl border-0 shadow-2xl p-6">
                                        <DialogHeader>
                                            <DialogTitle>Delete Category</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to delete <strong className="text-stone-900 bg-stone-100 px-2 py-0.5 rounded">{cat.name}</strong>?
                                                This action cannot be undone.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter className="gap-2 sm:gap-0 mt-4">
                                            <DialogClose asChild>
                                                <Button variant="outline" className="rounded-xl border-stone-200 h-11">Cancel</Button>
                                            </DialogClose>
                                            <Button variant="destructive" className="rounded-xl h-11 shadow-lg shadow-red-500/20" onClick={() => handleDelete(cat.id)}>
                                                Confirm Delete
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-2xl p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-2 bg-stone-50/50">
                        <DialogTitle className="text-2xl font-bold">{editingCategory ? "Edit Category" : "New Category"}</DialogTitle>
                        <DialogDescription>
                            {editingCategory ? "Update the category details below." : "Create a new category for your menu items."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid w-full items-center gap-6 p-6">
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="name" className="text-stone-600 font-semibold ml-1">Category Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Appetizers"
                                    className="rounded-2xl border-stone-200 bg-stone-50 focus:bg-white focus:ring-4 focus:ring-stone-100 transition-all font-medium h-12 text-lg"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <DialogFooter className="p-6 pt-2 bg-stone-50/30">
                            <DialogClose asChild>
                                <Button type="button" variant="ghost" className="rounded-xl hover:bg-stone-100 h-12 px-6">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-stone-900 text-white hover:bg-black h-12 px-8 shadow-xl shadow-stone-900/10">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingCategory ? "Save Changes" : "Create Category"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
