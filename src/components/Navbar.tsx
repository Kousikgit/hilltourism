'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, User, Menu, Home, X } from 'lucide-react';
import { Button } from './ui/Button';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Properties', href: '/properties' },
        { name: 'Hotels', href: '/hotels' },


        { name: 'Tours', href: '/tours' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 pointer-events-none">
            <div className="max-w-7xl mx-auto flex items-center justify-between glass px-6 py-3 rounded-full pointer-events-auto shadow-lg border-white/20">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg">
                        <Home className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        Hill<span className="text-primary-600">Tourism</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-base font-medium text-neutral-700 hover:text-primary-600 transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="hidden sm:flex rounded-full">
                        <Search className="w-5 h-5" />
                    </Button>
                    <Button className="hidden sm:flex font-semibold bg-primary-600 hover:bg-primary-500 text-white shadow-md shadow-primary-600/20" size="sm">
                        Book Now
                    </Button>
                    <Button
                        variant="glass"
                        size="sm"
                        className="p-2 md:hidden"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="absolute top-20 left-4 right-4 glass rounded-3xl p-6 pointer-events-auto md:hidden animate-in fade-in zoom-in duration-200 shadow-2xl border-white/20">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-lg font-medium text-neutral-800 hover:text-primary-600 transition-colors px-4 py-2 rounded-xl hover:bg-white/40"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="h-px bg-neutral-200/50 my-2" />
                        <div className="flex flex-col gap-3">
                            <Button variant="outline" className="w-full justify-start gap-3">
                                <Search className="w-5 h-5" />
                                Search
                            </Button>
                            <Button className="w-full bg-primary-600 hover:bg-primary-500 text-white shadow-md shadow-primary-600/20">
                                Book Now
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

