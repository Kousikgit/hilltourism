"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, Loader2, Sparkles } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;
            router.push('/admin');
        } catch (err: any) {
            setError(err.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <Sparkles className="w-3 h-3" /> Secure Gate
                    </div>
                    <h1 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
                        Admin <span className="text-primary-600">Access</span>
                    </h1>
                </div>

                <div className="bg-white dark:bg-neutral-900 p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-primary-900/5 border border-neutral-100 dark:border-white/5">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.25em] ml-2">Username / Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-[1.5rem] border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold placeholder:text-neutral-300"
                                placeholder="name@hilltourism.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.25em] ml-2">Access Token</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-[1.5rem] border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold placeholder:text-neutral-300"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl text-red-600 dark:text-red-400 text-[11px] font-black uppercase tracking-tight">
                                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-[1.5rem] py-8 h-auto text-sm font-black shadow-2xl shadow-primary-600/20 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Initialize Session'}
                        </Button>
                    </form>
                </div>

                <p className="mt-8 text-center text-neutral-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    Log in restricted to authorized staff
                </p>
            </div>
        </div>
    );
}
