"use client";

import { useState, useEffect } from 'react';
import { Building2, MapPin, Users, TrendingUp, Loader2, Calendar, IndianRupee, ArrowUpRight, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        locations: 0,
        properties: 0,
        bookings: 0,
        revenue: 0
    });
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [monthlyStats, setMonthlyStats] = useState<{ month: string; count: number; height: string }[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Basic Counts
                const [
                    { count: locCount },
                    { count: propCount },
                    { count: bookCount }
                ] = await Promise.all([
                    supabase.from('locations').select('*', { count: 'exact', head: true }),
                    supabase.from('properties').select('*', { count: 'exact', head: true }),
                    supabase.from('bookings').select('*', { count: 'exact', head: true })
                ]);

                // 2. Revenue & Recent Bookings
                const { data: bookings } = await supabase
                    .from('bookings')
                    .select('*, properties(name)')
                    .order('created_at', { ascending: false });

                const totalRevenue = bookings
                    ?.filter(b => b.status === 'confirmed')
                    .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0) || 0;

                const recent = bookings?.slice(0, 5) || [];

                // 3. Simple Chart Data (Last 6 months)
                const chartData = processChartData(bookings || []);

                setStats({
                    locations: locCount || 0,
                    properties: propCount || 0,
                    bookings: bookCount || 0,
                    revenue: totalRevenue
                });
                setRecentBookings(recent);
                setMonthlyStats(chartData);

            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const processChartData = (bookings: any[]) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const last6Months: { month: string; year: number; index: number; count: number }[] = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(currentMonth - i);
            last6Months.push({
                month: months[d.getMonth()],
                year: d.getFullYear(),
                index: d.getMonth(),
                count: 0
            });
        }

        bookings.forEach(b => {
            const d = new Date(b.created_at);
            const item = last6Months.find(m => m.index === d.getMonth() && m.year === d.getFullYear());
            if (item) item.count++;
        });

        const maxCount = Math.max(...last6Months.map(m => m.count), 1);

        return last6Months.map(m => ({
            month: m.month,
            count: m.count,
            height: `${(m.count / maxCount) * 100}%`
        }));
    };

    const statItems = [
        { name: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { name: 'Active Bookings', value: stats.bookings.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'Properties', value: stats.properties.toString(), icon: Building2, color: 'text-primary-600', bg: 'bg-primary-50' },
    ];

    return (
        <div className="p-8 md:p-12">
            <div className="mb-12">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest w-fit mb-4">
                    Admin Portal
                </div>
                <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">
                    Dashboard Overview
                </h1>
                <p className="text-neutral-500 font-medium">Welcome back, Admin. Here's your performance summary.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {statItems.map((stat) => (
                    <div key={stat.name} className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} dark:bg-white/5 group-hover:scale-110 transition-transform`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div className="px-2 py-1 rounded-full bg-neutral-50 dark:bg-white/5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                This Year
                            </div>
                        </div>
                        {loading ? (
                            <Loader2 className="w-6 h-6 text-neutral-300 animate-spin mb-1" />
                        ) : (
                            <span className="text-4xl font-black text-neutral-900 dark:text-white block mb-1 tracking-tight">
                                {stat.value}
                            </span>
                        )}
                        <span className="text-neutral-500 font-bold text-sm uppercase tracking-widest">
                            {stat.name}
                        </span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Booking Trends Chart */}
                <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 h-[400px] flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="font-black text-neutral-900 dark:text-white text-xl flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary-500" /> Booking Trends
                            </h3>
                            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Last 6 Months</p>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-4 border-b border-neutral-100 dark:border-white/5">
                        {loading ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-neutral-200 animate-spin" />
                            </div>
                        ) : monthlyStats.length > 0 ? (
                            monthlyStats.map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-3 group w-full">
                                    <div className="relative w-full flex items-end justify-center h-48 rounded-t-2xl bg-neutral-50 dark:bg-white/5 overflow-hidden">
                                        <div
                                            style={{ height: item.height }}
                                            className="w-full mx-2 bg-primary-500/80 group-hover:bg-primary-500 transition-all duration-500 rounded-t-xl relative min-h-[10%]"
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg mb-2">
                                                {item.count}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{item.month}</span>
                                </div>
                            ))
                        ) : (
                            <div className="w-full text-center text-neutral-400 text-sm">No data available</div>
                        )}
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 h-[400px] flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="font-black text-neutral-900 dark:text-white text-xl flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" /> Recent Activity
                            </h3>
                            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Latest Reservations</p>
                        </div>
                        <a href="/admin/bookings" className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 flex items-center gap-1">
                            View All <ArrowRight className="w-3 h-3" />
                        </a>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                        {loading ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-neutral-200 animate-spin" />
                            </div>
                        ) : recentBookings.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-neutral-400 text-center">
                                <Users className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-sm font-medium">No recent bookings found</p>
                            </div>
                        ) : (
                            recentBookings.map((booking) => (
                                <div key={booking.id} className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center text-primary-600 font-black text-xs shadow-sm">
                                            {booking.user_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-neutral-900 dark:text-white text-sm uppercase tracking-tight">{booking.user_name}</h4>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                                {new Date(booking.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${booking.status === 'confirmed' ? 'text-emerald-500' :
                                            booking.status === 'cancelled' ? 'text-red-500' : 'text-amber-500'
                                            }`}>
                                            {booking.status}
                                        </span>
                                        <span className="text-xs font-black text-neutral-900 dark:text-white">₹{booking.total_price}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
