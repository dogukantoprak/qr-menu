import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, Minus, Loader2 } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CartDrawer() {
    const {
        cartItems,
        cartTotal,
        removeFromCart,
        updateQuantity,
        isCartOpen,
        setIsCartOpen,
        clearCart
    } = useCart();

    const { slug } = useParams();
    const [ordering, setOrdering] = useState(false);
    const [showTableDialog, setShowTableDialog] = useState(false);
    const [manualTable, setManualTable] = useState('');
    const [orderSuccessId, setOrderSuccessId] = useState(null);

    const handleCheckout = () => {
        const storedTable = localStorage.getItem(`qr_menu_table_${slug}`);
        if (!storedTable) {
            setShowTableDialog(true);
        } else {
            placeOrder(storedTable);
        }
    };

    const confirmManualTable = () => {
        if (!manualTable) return;
        localStorage.setItem(`qr_menu_table_${slug}`, manualTable);
        setShowTableDialog(false);
        placeOrder(manualTable);
    };

    const placeOrder = async (tableNumber) => {
        setOrdering(true);
        try {
            const payload = {
                restaurantSlug: slug,
                tableNumber: tableNumber,
                items: cartItems.map(i => ({
                    menuItemId: i.id,
                    quantity: i.quantity
                })),
                note: "" // We can add a note input later
            };

            const res = await api.post('/public/orders', payload);

            clearCart();
            setIsCartOpen(false);
            setOrderSuccessId(res.data.orderId);
            toast.success("Order placed successfully! 🎉");

            // In a real app, redirect to /order-status/:id
            // For now, we assume success
        } catch (err) {
            console.error(err);
            toast.error("Failed to place order. Please try again.");
        } finally {
            setOrdering(false);
        }
    };

    return (
        <>
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetContent side="bottom" className="h-[90vh] sm:h-full sm:max-w-md rounded-t-[32px] sm:rounded-none border-0 shadow-[0_-8px_40px_rgba(0,0,0,0.1)] p-0 flex flex-col bg-white">
                    <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

                    <SheetHeader className="px-6 pt-4 pb-2 shrink-0 text-left">
                        <SheetTitle className="text-2xl font-bold text-stone-900">Your Order</SheetTitle>
                        <SheetDescription className="text-stone-500 font-medium text-base">
                            {cartItems.length === 0 ? "Your cart is empty" : `${cartItems.reduce((a, b) => a + b.quantity, 0)} items selected`}
                        </SheetDescription>
                    </SheetHeader>

                    {cartItems.length > 0 ? (
                        <>
                            <ScrollArea className="flex-1 px-6 -mx-0">
                                <div className="space-y-6 pt-2 pb-6">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-4 group">
                                            {/* Image Thumbnail */}
                                            <div className="h-20 w-20 rounded-2xl bg-stone-50 overflow-hidden shrink-0 border border-stone-100 shadow-sm relative">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-stone-300">
                                                        <div className="h-6 w-6 opacity-30 bg-current rounded-full" />
                                                    </div>
                                                )}
                                                <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm text-stone-900 border border-stone-100">
                                                    x{item.quantity}
                                                </div>
                                            </div>

                                            <div className="flex-1 flex flex-col justify-between py-0.5 min-h-[80px]">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="font-bold text-stone-900 text-base leading-snug line-clamp-2">{item.name}</h4>
                                                    <span className="font-bold text-stone-900 shrink-0 whitespace-nowrap">{(item.price * item.quantity).toFixed(2)} ₺</span>
                                                </div>

                                                <div className="flex items-center justify-between mt-auto">
                                                    <p className="text-xs text-stone-400 font-medium line-clamp-1">{item.price} ₺ each</p>

                                                    <div className="flex items-center gap-3 bg-stone-50 rounded-full p-1 border border-stone-100">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="h-7 w-7 flex items-center justify-center rounded-full bg-white text-stone-900 shadow-sm border border-stone-100 disabled:opacity-50 hover:bg-stone-100 transition-colors active:scale-95"
                                                            data-testid={`drawer-btn-decrease-${item.id}`}
                                                        >
                                                            {item.quantity === 1 ? <Trash2 className="h-3.5 w-3.5 text-red-500" /> : <Minus className="h-3.5 w-3.5" />}
                                                        </button>
                                                        <span className="text-sm font-bold w-4 text-center tabular-nums text-stone-900" data-testid={`drawer-qty-${item.id}`}>{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="h-7 w-7 flex items-center justify-center rounded-full bg-stone-900 text-white shadow-md hover:bg-black transition-transform active:scale-95"
                                                            data-testid={`drawer-btn-increase-${item.id}`}
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>

                            <SheetFooter className="p-6 pt-4 bg-white border-t border-stone-100 sm:flex-col sm:space-x-0 mt-auto shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-10">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-stone-500 font-medium text-lg">Total</span>
                                    <span className="font-extrabold text-2xl tracking-tight text-stone-900">{cartTotal.toFixed(2)} <span className="text-base font-bold text-stone-400">₺</span></span>
                                </div>
                                <div className="flex gap-3 w-full">
                                    <Button
                                        variant="outline"
                                        className="h-14 flex-1 rounded-full border-stone-200 text-stone-500 font-bold hover:bg-stone-50 hover:text-stone-900 hover:border-stone-300 transition-all active:scale-95"
                                        onClick={clearCart}
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        className="h-14 flex-[3] rounded-full bg-stone-900 text-white hover:bg-black text-lg font-bold shadow-xl shadow-stone-900/20 active:scale-[0.98] transition-all"
                                        onClick={handleCheckout}
                                        disabled={ordering}
                                        data-testid="btn-checkout"
                                    >
                                        {ordering ? <Loader2 className="animate-spin" /> : "Place Order"}
                                    </Button>
                                </div>
                            </SheetFooter>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 text-center p-8 pb-32">
                            <div className="h-24 w-24 bg-stone-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in-50 duration-500">
                                <span className="text-5xl opacity-20">🛒</span>
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 mb-2">Your cart is empty</h3>
                            <p className="text-stone-500 font-medium max-w-[200px] leading-relaxed mb-8">
                                Looks like you haven't added anything to your cart yet.
                            </p>
                            <Button
                                className="rounded-full h-12 px-8 bg-stone-900 text-white shadow-lg shadow-stone-900/20 hover:bg-black active:scale-95 transition-all"
                                onClick={() => setIsCartOpen(false)}
                            >
                                Start Ordering
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Table Number Dialog */}
            <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>Enter Table Number</DialogTitle>
                        <DialogDescription>
                            We need to know where to bring your food!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 py-4">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="table" className="sr-only">
                                Table Number
                            </Label>
                            <Input
                                id="table"
                                type="number"
                                placeholder="e.g. 12"
                                className="rounded-xl text-lg h-12"
                                value={manualTable}
                                onChange={(e) => setManualTable(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button type="button" onClick={confirmManualTable} className="w-full rounded-xl bg-stone-900">
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
