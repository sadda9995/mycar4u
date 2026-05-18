'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, Menu, X } from 'lucide-react';

export default function Header() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('user');
            if (userData) setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <nav className="sticky top-0 w-full z-50 transition-all duration-300 bg-black/90 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                        <img src="/favicon.png" alt="Mycar4u Logo" className="h-10 w-10 object-contain" />
                        <span className="ml-2 text-2xl font-bold tracking-tight text-white">Mycar4u</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <button onClick={() => router.push('/')} className="text-gray-300 hover:text-white text-sm font-medium transition cursor-pointer">Home</button>
                        <button onClick={() => router.push('/cars')} className="text-gray-300 hover:text-white text-sm font-medium transition cursor-pointer">Cars</button>
                        {user ? (
                            <div className="flex items-center space-x-4 pl-6 border-l border-white/20">
                                <span className="text-sm font-medium">{user.name || user.mobile}</span>
                                <button
                                    onClick={() => router.push('/settings?tab=bookings')}
                                    className="text-sm text-gray-300 hover:text-white transition cursor-pointer"
                                >
                                    My Bookings
                                </button>
                                <button onClick={() => router.push('/settings')} className="text-gray-400 hover:text-white transition cursor-pointer">
                                    <Settings className="h-5 w-5" />
                                </button>
                                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition cursor-pointer">
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4 pl-6 border-l border-white/20">
                                <button onClick={() => router.push('/login')} className="text-white font-medium hover:text-red-500 transition cursor-pointer">Log In</button>
                                <button
                                    onClick={() => router.push('/login')}
                                    className="bg-red-600 text-white px-5 py-2.5 rounded-full hover:bg-red-700 transition font-medium shadow-lg shadow-red-900/20 cursor-pointer"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white cursor-pointer">
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 absolute w-full left-0 top-20 p-6 flex flex-col space-y-4 shadow-2xl z-50">
                    {user && (
                        <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 flex items-center space-x-3 mb-2 pointer-events-none select-none">
                            <div className="h-10 w-10 bg-gradient-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center text-sm font-black text-white shadow-md">
                                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Welcome back</p>
                                <p className="text-sm font-extrabold text-white truncate">{user.name || 'User'}</p>
                            </div>
                        </div>
                    )}
                    <button onClick={() => { router.push('/'); setIsMobileMenuOpen(false); }} className="text-left text-lg font-medium text-white py-2 border-b border-white/10 cursor-pointer">Home</button>
                    <button onClick={() => { router.push('/cars'); setIsMobileMenuOpen(false); }} className="text-left text-lg font-medium text-white py-2 border-b border-white/10 cursor-pointer">Cars</button>
                    {user ? (
                        <>
                            <button onClick={() => { router.push('/settings?tab=bookings'); setIsMobileMenuOpen(false); }} className="text-left text-lg font-medium text-white py-2 border-b border-white/10 cursor-pointer">My Bookings</button>
                            <button onClick={() => { router.push('/settings'); setIsMobileMenuOpen(false); }} className="text-left text-lg font-medium text-white py-2 border-b border-white/10 flex items-center cursor-pointer">
                                <Settings className="h-5 w-5 mr-2 text-gray-400" /> Settings
                            </button>
                            <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-left text-lg font-medium text-red-500 py-2 flex items-center cursor-pointer">
                                <LogOut className="h-5 w-5 mr-2" /> Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => { router.push('/login'); setIsMobileMenuOpen(false); }} className="text-left text-lg font-medium text-white py-2 border-b border-white/10 cursor-pointer">Log In</button>
                            <button onClick={() => { router.push('/login'); setIsMobileMenuOpen(false); }} className="text-left text-lg font-medium text-red-500 py-2 cursor-pointer">Sign Up</button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
