import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, UtensilsCrossed, QrCode, BellRing, Armchair, Settings, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from 'react';

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    const isActive = (path) => location.pathname.includes(path);

    const NavItems = () => (
        <div className="space-y-2">
            <Button
                variant={isActive('orders') ? "secondary" : "ghost"}
                className={`w-full justify-start h-12 rounded-xl text-stone-600 font-medium ${isActive('orders') ? 'bg-stone-100 text-stone-900' : ''}`}
                onClick={() => { navigate('/admin/orders'); setOpen(false); }}
            >
                <BellRing className="mr-3 h-5 w-5 opacity-70" />
                Live Orders
            </Button>

            <Button
                variant={isActive('categories') ? "secondary" : "ghost"}
                className={`w-full justify-start h-12 rounded-xl text-stone-600 font-medium ${isActive('categories') ? 'bg-stone-100 text-stone-900' : ''}`}
                onClick={() => { navigate('/admin/categories'); setOpen(false); }}
            >
                <LayoutDashboard className="mr-3 h-5 w-5 opacity-70" />
                Categories
            </Button>
            <Button
                variant={isActive('items') ? "secondary" : "ghost"}
                className={`w-full justify-start h-12 rounded-xl text-stone-600 font-medium ${isActive('items') ? 'bg-stone-100 text-stone-900' : ''}`}
                onClick={() => { navigate('/admin/items'); setOpen(false); }}
            >
                <UtensilsCrossed className="mr-3 h-5 w-5 opacity-70" />
                Menu Items
            </Button>

            <Button
                variant={isActive('tables') ? "secondary" : "ghost"}
                className={`w-full justify-start h-12 rounded-xl text-stone-600 font-medium ${isActive('tables') ? 'bg-stone-100 text-stone-900' : ''}`}
                onClick={() => { navigate('/admin/tables'); setOpen(false); }}
            >
                <Armchair className="mr-3 h-5 w-5 opacity-70" />
                Tables & QR
            </Button>

            <Button
                variant={isActive('settings') ? "secondary" : "ghost"}
                className={`w-full justify-start h-12 rounded-xl text-stone-600 font-medium ${isActive('settings') ? 'bg-stone-100 text-stone-900' : ''}`}
                onClick={() => { navigate('/admin/settings'); setOpen(false); }}
            >
                <Settings className="mr-3 h-5 w-5 opacity-70" />
                Settings
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-stone-50 flex">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r border-stone-200 hidden md:flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-stone-100">
                    <h1 className="text-xl font-bold tracking-tight text-stone-900">QR Menu <span className="text-stone-400 font-normal">Admin</span></h1>
                </div>

                <nav className="flex-1 p-4">
                    <NavItems />
                </nav>

                <div className="p-4 border-t border-stone-100">
                    <Button
                        variant="outline"
                        className="w-full justify-start border-stone-200 text-stone-600 hover:text-red-600 hover:border-red-100 hover:bg-red-50 rounded-xl"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Mobile Header & Sheet */}
            <div className="md:hidden fixed top-0 w-full bg-white border-b border-stone-200 z-20 px-4 h-16 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="-ml-2">
                                <Menu className="h-6 w-6 text-stone-700" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 p-0">
                            <div className="p-6 border-b border-stone-100">
                                <h1 className="text-xl font-bold tracking-tight text-stone-900">QR Menu Admin</h1>
                            </div>
                            <nav className="p-4 flex-1">
                                <NavItems />
                            </nav>
                            <div className="p-4 border-t border-stone-100 mt-auto">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-stone-200 text-stone-600 hover:text-red-600 hover:border-red-100 hover:bg-red-50 rounded-xl"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-3 h-4 w-4" />
                                    Sign Out
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <h1 className="text-lg font-bold text-stone-900">Admin Panel</h1>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-10 md:ml-64 mt-16 md:mt-0 transition-all duration-300">
                <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
