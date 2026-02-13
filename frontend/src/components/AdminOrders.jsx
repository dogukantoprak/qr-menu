import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    ChefHat,
    BellRing,
    Calendar,
    Utensils,
    ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/admin/orders');
            setOrders(res.data);
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Poll every 10 seconds
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        // Optimistic update
        const prevOrders = [...orders];
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

        try {
            await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Order #${orderId} marked as ${newStatus}`);
        } catch (err) {
            setOrders(prevOrders);
            toast.error("Failed to update status");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'ACCEPTED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'PREPARING': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'READY': return 'bg-green-100 text-green-700 border-green-200';
            case 'SERVED': return 'bg-stone-100 text-stone-500 border-stone-200';
            case 'CANCELLED': return 'bg-red-50 text-red-500 border-red-100';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-stone-300" />
        </div>
    );

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-stone-900">Live Orders</h1>
                    <p className="text-stone-500 mt-2">Manage incoming table orders in real-time.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="h-8 px-3 rounded-full gap-2 border-green-200 bg-green-50 text-green-700 animate-pulse">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live
                    </Badge>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-24 bg-stone-50 rounded-3xl border border-stone-100 border-dashed">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4">
                        <BellRing className="h-8 w-8 text-stone-300" />
                    </div>
                    <h3 className="text-lg font-bold text-stone-900">No active orders</h3>
                    <p className="text-stone-500">New orders will appear here automatically.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                        <Card key={order.id} className="rounded-3xl border-0 shadow-sm ring-1 ring-stone-100 bg-white overflow-hidden hover:shadow-md transition-shadow">
                            {/* Header */}
                            <div className="bg-stone-50/50 p-4 border-b border-stone-50 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge className="bg-stone-900 text-white hover:bg-black rounded-lg text-xs font-bold px-2 py-0.5">
                                            #{order.id}
                                        </Badge>
                                        <span className="text-xs text-stone-400 font-medium flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-stone-900">Table {order.table}</h3>
                                </div>
                                <Badge className={`rounded-full px-3 py-1 border shadow-none ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </Badge>
                            </div>

                            {/* Items */}
                            <CardContent className="p-4 space-y-4">
                                <ScrollArea className="h-[120px] pr-4">
                                    <div className="space-y-3">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <div className="flex gap-2 items-center">
                                                    <span className="bg-stone-100 text-stone-600 font-bold h-6 w-6 rounded-md flex items-center justify-center text-[10px]">
                                                        {item.quantity}x
                                                    </span>
                                                    <span className="text-stone-700 font-medium line-clamp-1">{item.name}</span>
                                                </div>
                                                <span className="text-stone-400 tabular-nums">
                                                    {(item.unit_price * item.quantity).toFixed(0)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                {order.note && (
                                    <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-xs text-yellow-800 italic">
                                        "{order.note}"
                                    </div>
                                )}

                                <div className="pt-2 border-t border-stone-50 flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Total</p>
                                        <p className="text-xl font-extrabold text-stone-900">{order.total} <span className="text-sm text-stone-400">₺</span></p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {order.status === 'PENDING' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-9 w-9 rounded-full border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 p-0"
                                                    onClick={() => updateStatus(order.id, 'CANCELLED')}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="h-9 px-4 rounded-full bg-stone-900 text-white hover:bg-green-600 shadow-md transform active:scale-95 transition-all text-xs font-bold"
                                                    onClick={() => updateStatus(order.id, 'ACCEPTED')}
                                                >
                                                    Accept
                                                </Button>
                                            </>
                                        )}
                                        {order.status === 'ACCEPTED' && (
                                            <Button
                                                size="sm"
                                                className="h-9 w-full rounded-full bg-stone-900 text-white hover:bg-blue-600"
                                                onClick={() => updateStatus(order.id, 'PREPARING')}
                                            >
                                                Start Preparing
                                            </Button>
                                        )}
                                        {order.status === 'PREPARING' && (
                                            <Button
                                                size="sm"
                                                className="h-9 w-full rounded-full bg-purple-600 text-white hover:bg-purple-700"
                                                onClick={() => updateStatus(order.id, 'READY')}
                                            >
                                                Mark Ready
                                            </Button>
                                        )}
                                        {order.status === 'READY' && (
                                            <Button
                                                size="sm"
                                                className="h-9 w-full rounded-full bg-green-600 text-white hover:bg-green-700"
                                                onClick={() => updateStatus(order.id, 'SERVED')}
                                            >
                                                Complete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
