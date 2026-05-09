'use client';

import './globals.css';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Car,
    ClipboardList,
    Users,
    LogOut,
    Menu,
    X,
    Settings,
    IndianRupee,
    MapPin
} from 'lucide-react';

export default function RootLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter(); // Use useRouter from next/navigation
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [scope, setScope] = useState({ role: '', city: '', office: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRaw = localStorage.getItem('user');
        if (!token && !userRaw && pathname !== '/login') {
            router.push('/login');
            return;
        }
        if (userRaw) {
            try {
                const u = JSON.parse(userRaw);
                const allowed = ['super_admin', 'city_admin', 'office_staff'];
                if (allowed.includes(u.role)) {
                    setIsAdmin(true);
                    setScope({
                        role: u.role,
                        city: u.cityId?.name || u.cityId || '',
                        office: u.officeId?.name || u.officeId || ''
                    });
                } else {
                    setIsAdmin(false);
                    if (pathname !== '/login') router.push('/login');
                }
            } catch (e) {
                setIsAdmin(false);
            }
        }
        setIsAuthorized(!!token || !!userRaw);
    }, [pathname, router]);

    // Hide sidebar on login page
    const showSidebar = pathname !== '/login';

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Bookings', icon: ClipboardList, path: '/bookings' },
        { name: 'Transactions', icon: IndianRupee, path: '/transactions' },
        { name: 'Fleet', icon: Car, path: '/cars' },
        { name: 'Operations', icon: ClipboardList, path: '/operations' },
        { name: 'Customers', icon: Users, path: '/customers' },
        ...(scope.role === 'super_admin' || scope.role === 'city_admin' ? [{ name: 'Staff', icon: Users, path: '/staff' }] : []),
        ...(scope.role === 'super_admin' ? [
            { name: 'Cities', icon: MapPin, path: '/cities' },
            { name: 'Offices', icon: MapPin, path: '/offices' },
            { name: 'Audit Logs', icon: ClipboardList, path: '/audit' }
        ] : []),
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    // Loading state content
    if ((!isAuthorized || !isAdmin) && pathname !== '/login') {
        return (
            <html lang="en">
                <body className="bg-black text-white antialiased flex items-center justify-center h-screen">
                    <div className="animate-pulse flex flex-col items-center">
                        <Car className="h-10 w-10 text-red-600 mb-4" />
                        <p className="text-gray-400">Loading...</p>
                    </div>
                </body>
            </html>
        );
    }

    return (
        <html lang="en">
            <body className="bg-black text-white antialiased">
                <div className="flex h-screen overflow-hidden">

                    {/* Sidebar */}
                    {showSidebar && (
                        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-white/10 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
                            <div className="h-full flex flex-col">
                                {/* Logo */}
                                <div className="h-16 flex items-center px-6 border-b border-white/10">
                                    <Car className="h-6 w-6 text-red-600 mr-2" />
                                    <span className="text-xl font-bold tracking-tight">Admin<span className="text-red-600">Panel</span></span>
                                </div>

                                {/* Navigation */}
                                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                                    {menuItems.map((item) => {
                                        const isActive = pathname === item.path;
                                        return (
                                            <Link
                                                key={item.path}
                                                href={item.path}
                                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive
                                                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <item.icon className="h-5 w-5 mr-3" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                {/* User Profile */}
                                <div className="p-4 border-t border-white/10">
                                <div className="flex items-center p-3 bg-black/40 rounded-xl">
                                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-gray-400">
                                        AD
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-bold text-white capitalize">{scope.role || 'Admin'}</p>
                                        <p className="text-xs text-gray-500">
                                            {scope.city ? `City: ${scope.city}` : 'All cities'}
                                            {scope.office ? ` · Office: ${scope.office}` : ''}
                                        </p>
                                    </div>
                                        <button
                                            onClick={() => {
                                                localStorage.removeItem('token');
                                                localStorage.removeItem('user');
                                                router.push('/login');
                                            }}
                                            className="ml-auto text-gray-400 hover:text-red-500"
                                        >
                                            <LogOut className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        {/* Mobile Header */}
                        {showSidebar && (
                            <header className="md:hidden h-16 bg-zinc-900 border-b border-white/10 flex items-center px-4">
                                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white">
                                    {isSidebarOpen ? <X /> : <Menu />}
                                </button>
                                <span className="ml-4 font-bold text-lg">Admin Panel</span>
                            </header>
                        )}

                        {/* Content Area */}
                        <main className={`flex-1 overflow-y-auto ${showSidebar ? 'p-6 md:p-8' : ''}`}>
                            {children}
                        </main>
                    </div>
                </div>
            </body>
        </html>
    );
}
