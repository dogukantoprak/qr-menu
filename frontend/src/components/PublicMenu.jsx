import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Loader2, Info, MapPin, Search, Plus, ShoppingBag, ChevronRight, Minus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCart } from '../context/CartContext';
import { toast } from "sonner";

export default function PublicMenu() {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const { addToCart, cartCount, setIsCartOpen, cartItems, updateQuantity, cartTotal } = useCart();

    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [tableNumber, setTableNumber] = useState(null);

    useEffect(() => {
        // Table Parameters Logic
        const tableParam = searchParams.get('t');
        if (tableParam) {
            localStorage.setItem(`qr_menu_table_${slug}`, tableParam);
            setTableNumber(tableParam);
        } else {
            const storedTable = localStorage.getItem(`qr_menu_table_${slug}`);
            if (storedTable) setTableNumber(storedTable);
        }
    }, [searchParams, slug]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/public/restaurants/${slug}/menu`);
                setRestaurant({ name: res.data.restaurant_name });
                setMenu(res.data.categories);
                if (res.data.categories.length > 0) {
                    setActiveCategory(res.data.categories[0].name);
                }
            } catch (err) {
                console.error("PublicMenu Fetch Error:", err);
                // Use backend error message if available, else standard fallback
                // Use backend error message if available, else standard fallback
                const msg = err.response?.data?.error || err.response?.data?.msg;
                if (msg) {
                    setError(msg);
                } else if (err.message === "Network Error" || !err.response) {
                    setError("Connection error. Ensure backend is running.");
                } else {
                    setError(`Error: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll('section[id]');
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= sectionTop - 150) {
                    current = section.getAttribute('id');
                }
            });
            if (current) setActiveCategory(current);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [menu]);

    const scrollToCategory = (catName) => {
        const element = document.getElementById(catName);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 120,
                behavior: 'smooth'
            });
            setActiveCategory(catName);
        }
    };

    const handleAddToCart = (item) => {
        addToCart(item);
        toast.success(`Added ${item.name} to order`, {
            position: 'bottom-center',
            duration: 1500,
            className: "bg-stone-900 text-white border-0"
        });
    };

    const getQuantity = (id) => {
        const item = cartItems.find(i => i.id === id);
        return item ? item.quantity : 0;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
            <Loader2 className="h-10 w-10 animate-spin text-stone-600" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50 text-center">
            <Info className="h-12 w-12 text-stone-400 mb-4" />
            <h1 className="text-xl font-bold text-stone-800">Menu Unavailable</h1>
            <p className="text-stone-500 mt-2">{error}</p>
        </div>
    );

    const filteredMenu = menu.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="min-h-screen bg-stone-50 pb-32 font-sans antialiased text-stone-900 selection:bg-stone-200">
            {/* 1. Modern Header */}
            <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-40 border-b border-stone-100 shadow-sm">
                <div className="container max-w-md mx-auto px-5 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                                {restaurant?.name}
                            </h1>
                            <div className="flex items-center text-xs font-bold text-stone-400 mt-1 uppercase tracking-wider">
                                {tableNumber ? (
                                    <span className="flex items-center text-stone-900 bg-stone-100 px-2 py-0.5 rounded-full">
                                        <MapPin className="h-3 w-3 mr-1 text-stone-500" />
                                        Table {tableNumber}
                                    </span>
                                ) : (
                                    <>
                                        <MapPin className="h-3 w-3 mr-1" />
                                        <span>Table Service</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="h-11 w-11 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-900 font-extrabold border border-stone-200 shadow-sm">
                            {restaurant?.name?.charAt(0)}
                        </div>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-3 h-5 w-5 text-stone-400 group-focus-within:text-stone-600 transition-colors" />
                        <Input
                            className="pl-12 bg-stone-100/50 border-transparent focus:bg-white focus:border-stone-200 focus:ring-4 focus:ring-stone-100 h-12 rounded-2xl shadow-sm transition-all text-base font-medium placeholder:text-stone-400"
                            placeholder="What are you craving?"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* 2. Soft/Modern Category Nav */}
                <div className="border-t border-stone-100/50">
                    <div className="container max-w-md mx-auto px-5">
                        <div className="flex overflow-x-auto py-3 gap-2 no-scrollbar scroll-smooth" id="category-nav">
                            {menu.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => scrollToCategory(cat.name)}
                                    className={cn(
                                        "whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 flex-shrink-0 border",
                                        activeCategory === cat.name
                                            ? "bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-900/20 scale-[1.02]"
                                            : "bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                                    )}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* 3. Modern Hero Menu Cards (Image First) */}
            <main className="container max-w-sm sm:max-w-md mx-auto px-5 pt-8 space-y-10">
                {filteredMenu.length === 0 ? (
                    <div className="text-center py-24 opacity-60">
                        <div className="inline-block p-4 rounded-full bg-stone-100 mb-4">
                            <Search className="h-8 w-8 text-stone-400" />
                        </div>
                        <p className="text-stone-500 font-medium">No items found matching "{searchTerm}"</p>
                    </div>
                ) : filteredMenu.map((category) => (
                    <section key={category.id} id={category.name} className="scroll-mt-40 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-backwards">
                        <div className="flex items-baseline justify-between mb-5 px-1">
                            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">{category.name}</h2>
                            <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-md">{category.items.length} ITEMS</span>
                        </div>

                        <div className="grid gap-6">
                            {category.items.map((item) => {
                                const qty = getQuantity(item.id);
                                return (
                                    <Card key={item.id} className="group border-0 shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-xl hover:shadow-stone-900/5 transition-all duration-300 ring-1 ring-stone-100">
                                        {/* Hero Image Section */}
                                        <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full w-full text-stone-300 bg-stone-50">
                                                    <ShoppingBag className="h-10 w-10 opacity-20" />
                                                </div>
                                            )}
                                            {/* Badge (Optional - can add 'Popular' etc later) */}
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-4 pt-4 flex flex-col gap-3">
                                            <div>
                                                <h3 className="font-bold text-stone-900 text-[17px] leading-tight mb-1.5 line-clamp-2">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed font-medium">
                                                    {item.description}
                                                </p>
                                            </div>

                                            {/* Footer: Price & Controls */}
                                            <div className="flex items-center justify-between mt-1 pt-2 border-t border-stone-50">
                                                <div className="font-bold text-xl text-stone-900 tracking-tight">
                                                    {item.price}<span className="text-xs font-bold text-stone-400 ml-0.5 align-top">₺</span>
                                                </div>

                                                {/* Stepper / Add Button */}
                                                <div className="h-9">
                                                    {qty > 0 ? (
                                                        <div className="flex items-center justify-between min-w-[104px] h-full bg-stone-900 rounded-full shadow-lg shadow-stone-900/20 animate-in zoom-in-0 duration-200 overflow-hidden px-1">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }}
                                                                className="w-8 h-full flex items-center justify-center text-white hover:bg-white/10 transition-colors active:scale-90 duration-150"
                                                                data-testid={`btn-decrease-${item.id}`}
                                                            >
                                                                <Minus className="h-3.5 w-3.5" />
                                                            </button>

                                                            <span
                                                                className="font-bold text-sm text-white flex-1 text-center tabular-nums leading-none pt-0.5"
                                                                data-testid={`qty-${item.id}`}
                                                            >
                                                                {qty}
                                                            </span>

                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }}
                                                                className="w-8 h-full flex items-center justify-center text-white hover:bg-white/10 transition-colors active:scale-90 duration-150"
                                                                data-testid={`btn-increase-${item.id}`}
                                                            >
                                                                <Plus className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
                                                            className="h-9 px-5 rounded-full bg-stone-100 text-stone-900 hover:bg-stone-900 hover:text-white border-0 shadow-sm hover:shadow-lg hover:shadow-stone-900/10 transition-all duration-300 font-bold text-sm active:scale-95"
                                                            data-testid={`btn-add-${item.id}`}
                                                        >
                                                            Add <Plus className="ml-1.5 h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </section>
                ))}
            </main>

            {/* 4. Floating Action Button (FAB) - Bottom Right */}
            {cartCount > 0 && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-20 fade-in duration-500">
                    <Button
                        size="lg"
                        onClick={() => setIsCartOpen(true)}
                        className="h-16 rounded-full shadow-[0_12px_36px_-8px_rgba(0,0,0,0.5)] bg-stone-900 hover:bg-black text-white flex items-center gap-4 px-6 pr-8 transition-transform hover:scale-105 active:scale-95 border border-stone-800/50"
                        data-testid="fab-cart"
                    >
                        <div className="relative">
                            <div className="bg-white text-stone-900 h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm" data-testid="cart-badge">
                                {cartCount}
                            </div>
                        </div>
                        <div className="flex flex-col items-start -space-y-0.5">
                            <div className="flex items-center gap-2">
                                <span className="text-white/80 font-medium text-xs uppercase tracking-wider">Total</span>
                                <ChevronRight className="h-3 w-3 text-white/50" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-white" data-testid="fab-total">{cartTotal.toFixed(2)} ₺</span>
                        </div>
                    </Button>
                </div>
            )}
        </div>
    );
}
