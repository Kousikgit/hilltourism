"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    LayoutDashboard,
    MapPin,
    Building2,
    Users,
    LogOut,
    ChevronLeft,
    Sparkles,
    Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MENU_ITEMS = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Locations', href: '/admin/locations', icon: MapPin },
    { name: 'Properties', href: '/admin/properties', icon: Building2 },
    { name: 'Hotels', href: '/admin/hotels', icon: Building2 },


    { name: 'Tours', href: '/admin/tours', icon: Sparkles },
    { name: 'Messages', href: '/admin/messages', icon: Mail },
    { name: 'Bookings', href: '/admin/bookings', icon: Users },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    return (
        <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-white/5 h-screen sticky top-0 flex flex-col overflow-y-auto">
            <div className="p-8">
                <Link href="/" className="group flex items-center gap-2 mb-8 text-neutral-400 hover:text-neutral-900 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Back to Site</span>
                </Link>
                <Link href="/admin" className="text-xl font-black text-primary-600 tracking-tighter block">
                    HILL TOURISM<span className="text-neutral-400 font-normal">.Admin</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                                isActive
                                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 shadow-sm"
                                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-white/5 dark:hover:text-white"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 mt-auto border-t border-neutral-100 dark:border-white/5">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 w-full transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
