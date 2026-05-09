'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Calendar, Percent, CheckCircle, Car } from 'lucide-react';

export default function Notifications() {
    const router = useRouter();

    const notifications = [
        {
            id: 1,
            type: 'booking',
            title: 'Booking Confirmed!',
            message: 'Your booking for Swift ZXi is confirmed for Tommorow. Get ready for your trip!',
            date: '2 hours ago',
            read: false,
            icon: CheckCircle,
            color: 'text-green-500'
        },
        {
            id: 2,
            type: 'offer',
            title: '20% Off on Weekday Rentals',
            message: 'Use code WEEKDAY20 to get flat 20% off on all bookings made for Mon-Thu.',
            date: '1 day ago',
            read: true,
            icon: Percent,
            color: 'text-yellow-400'
        },
        {
            id: 3,
            type: 'system',
            title: 'Welcome to Mycar4u Premium',
            message: 'Thanks for joining us. Complete your KYC to start booking your first ride instantly.',
            date: '2 days ago',
            read: true,
            icon: Car,
            color: 'text-red-500'
        },
        {
            id: 4,
            type: 'reminder',
            title: 'Complete your Profile',
            message: 'Add your driving license to speed up future checkouts.',
            date: '3 days ago',
            read: true,
            icon: User,
            color: 'text-blue-500'
        }
    ];

    function User(props) {
        return (
            <svg
                {...props}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-md border-b border-white/10 px-4 h-16 flex items-center">
                <button onClick={() => router.back()} className="mr-4 text-gray-400 hover:text-white transition">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-lg font-bold">Notifications</h1>
                <div className="ml-auto relative">
                    <Bell className="h-5 w-5 text-gray-400" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-600 rounded-full"></span>
                </div>
            </div>

            <main className="max-w-2xl mx-auto p-4 md:p-8 space-y-4">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`p-4 rounded-xl border flex items-start space-x-4 transition hover:bg-zinc-900 ${n.read ? 'bg-black border-white/5' : 'bg-zinc-900/30 border-red-500/20'
                            }`}
                    >
                        <div className={`p-2 rounded-full bg-zinc-800 ${n.color}`}>
                            <n.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className={`font-semibold text-sm ${!n.read ? 'text-white' : 'text-gray-300'}`}>
                                {n.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                {n.message}
                            </p>
                            <p className="text-[10px] text-zinc-600 mt-2 font-mono uppercase">
                                {n.date}
                            </p>
                        </div>
                        {!n.read && (
                            <div className="h-2 w-2 bg-red-600 rounded-full mt-2"></div>
                        )}
                    </div>
                ))}

                <div className="text-center pt-8">
                    <button className="text-xs text-gray-500 hover:text-white transition">
                        Mark all as read
                    </button>
                </div>
            </main>
        </div>
    );
}
