"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminSidebar } from "@/components/AdminSidebar";
import { Loader2, ShieldAlert, LogOut, Key } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setIsAuthorized(true);
        router.push('/admin/login');
    };

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            console.log('Auth Check - Session:', session?.user?.email, sessionError);

            if (!session) {
                console.log('Auth Check - No session found');
                if (!isLoginPage) router.push('/admin/login');
                setIsAuthorized(true);
                setLoading(false);
                return;
            }

            setUserEmail(session.user.email || null);

            // Verify if user is admin
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();

            console.log('Auth Check - Profile:', profile, profileError);

            if (profileError) {
                setAuthError(`Database Error: ${profileError.message || 'Could not fetch profile'}`);
                setIsAuthorized(false);
            } else if (profile?.role !== 'admin') {
                console.warn('Auth Check - Not an admin! Role:', profile?.role);
                setIsAuthorized(false);
            } else {
                console.log('Auth Check - Welcome Admin!');
                setIsAuthorized(true);
                if (isLoginPage) {
                    router.push('/admin');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [isLoginPage, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                    <Key className="w-4 h-4 text-primary-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="text-neutral-400 font-extrabold uppercase tracking-[0.4em] text-[10px]">Verifying Credentials</p>
            </div>
        );
    }

    if (!isAuthorized && !isLoginPage) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-md w-full text-center space-y-8 relative">
                    <div className="w-24 h-24 bg-red-600/20 border border-red-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-900/20">
                        <ShieldAlert className="w-12 h-12 text-red-500 animate-bounce" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-white tracking-tighter">Access <span className="text-red-500">Denied</span></h1>
                        <p className="text-neutral-400 font-medium leading-relaxed">
                            Your account (<span className="text-white">{userEmail}</span>) is authenticated but does not have <span className="text-red-400 font-bold uppercase tracking-widest text-xs">Admin Privilege</span>.
                        </p>
                        {authError && (
                            <div className="mt-4 p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-red-200 text-xs font-mono text-left">
                                <span className="text-red-500 font-bold">ERROR:</span> {authError}
                            </div>
                        )}
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                            <Key className="w-3 h-3" /> Required Action
                        </h3>
                        <p className="text-sm text-neutral-300 font-medium leading-relaxed">
                            Please contact your system administrator or run the <code className="bg-white/10 px-2 py-0.5 rounded text-white border border-white/5 font-mono">profiles</code> SQL script in your Supabase dashboard to grant yourself the <code className="text-red-400 font-bold">admin</code> role.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="primary"
                            className="bg-white text-black hover:bg-neutral-200 w-full rounded-2xl py-6 h-auto font-black uppercase text-xs tracking-widest border-none"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Session
                        </Button>
                        <Button
                            variant="glass"
                            className="flex-1 rounded-2xl py-6 h-auto font-black uppercase text-xs tracking-widest border-white/10 hover:bg-white/5 text-white"
                            onClick={handleSignOut}
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoginPage) return <>{children}</>;

    return (
        <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto h-screen">
                {children}
            </main>
        </div>
    );
}
