'use client';

import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Car, Fuel as FuelIcon, Gauge as GaugeIcon, Droplet, Image as ImageIcon, Settings } from 'lucide-react';

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [filter, setFilter] = useState('all'); // all, active, completed
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get('/bookings/my');
                setBookings(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(b => {
        if (filter === 'all') return true;
        // Simple client-side logic for tabs based on status or dates
        const isPast = new Date(b.endTime) < new Date();
        if (filter === 'active') return !isPast && b.status !== 'cancelled';
        if (filter === 'completed') return isPast;
        return true;
    });

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <nav className="bg-zinc-900/50 backdrop-blur border-b border-white/5 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
                    <button onClick={() => router.push('/')} className="mr-4 p-2 hover:bg-white/10 rounded-full transition">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-bold flex-1">My Bookings</h1>
                    <button onClick={() => router.push('/settings')} className="p-2 hover:bg-white/10 rounded-full transition">
                        <Settings className="h-5 w-5 text-gray-400" />
                    </button>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto p-4 md:p-8">
                {/* Tabs */}
                <div className="flex space-x-4 mb-8 border-b border-white/10 pb-1">
                    {['all', 'active', 'completed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`pb-3 px-2 text-sm font-medium capitalize transition relative ${filter === f ? 'text-red-500' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {f}
                            {filter === f && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 rounded-t-full"></div>}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div></div>
                ) : (
                    <div className="space-y-6">
                        {filteredBookings.map((booking) => (
                            <div key={booking._id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="h-16 w-16 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center relative">
                                            {booking.car.image && booking.car.image.length > 0 ? (
                                                <img 
                                                    src={booking.car.image[0].startsWith('http') ? booking.car.image[0] : `${process.env.NEXT_PUBLIC_API_URL || ''}${booking.car.image[0]}`} 
                                                    alt={booking.car.model} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <Car className="h-8 w-8 text-gray-500" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{booking.car.make} {booking.car.model}</h3>
                                            <p className="text-xs text-gray-500 font-mono bg-black px-2 py-0.5 rounded inline-block mt-1">
                                                {booking.car.registrationNumber}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-400/10 text-green-400' : 'bg-gray-400/10 text-gray-400'
                                            }`}>
                                            {booking.status}
                                        </span>
                                        <p className="mt-2 text-xl font-bold">₹{booking.totalAmount}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/30 rounded-xl p-4">
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 uppercase">Start Trip</p>
                                        <div className="flex items-center text-sm">
                                            <Calendar className="h-4 w-4 mr-2 text-red-500" />
                                            {new Date(booking.startTime).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 uppercase">End Trip</p>
                                        <div className="flex items-center text-sm">
                                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                            {new Date(booking.endTime).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 pt-2 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Booking ID: {booking.bookingId}</span>
                                        <button className="text-xs text-red-500 hover:text-red-400 font-medium">Need Help?</button>
                                    </div>
                                    {(booking.startOdometer || booking.endOdometer || booking.startFuelLevel || booking.endFuelLevel || booking.startCleanliness || booking.endCleanliness || booking.lateReturnHours || booking.extraKmFee || booking.lateFee) && (
                                        <div className="md:col-span-2 bg-black/40 rounded-xl p-4 space-y-3 border border-white/5">
                                            <div className="flex items-center justify-between text-xs uppercase text-gray-400">
                                                <span className="flex items-center gap-2"><GaugeIcon className="h-4 w-4 text-red-500" /> Ops Summary</span>
                                                <span className="text-gray-500">Logged at return</span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-200">
                                                <div className="bg-zinc-900/50 rounded-lg p-3">
                                                    <p className="text-[11px] text-gray-500">Start Odo</p>
                                                    <p className="font-semibold">{booking.startOdometer ?? '-'}</p>
                                                </div>
                                                <div className="bg-zinc-900/50 rounded-lg p-3">
                                                    <p className="text-[11px] text-gray-500">End Odo</p>
                                                    <p className="font-semibold">{booking.endOdometer ?? '-'}</p>
                                                </div>
                                                <div className="bg-zinc-900/50 rounded-lg p-3 flex items-center gap-2">
                                                    <Droplet className="h-4 w-4 text-blue-400" />
                                                    <div>
                                                        <p className="text-[11px] text-gray-500">Fuel Out / In</p>
                                                        <p className="font-semibold">{booking.startFuelLevel ?? '-'}% → {booking.endFuelLevel ?? '-' }%</p>
                                                    </div>
                                                </div>
                                                <div className="bg-zinc-900/50 rounded-lg p-3">
                                                    <p className="text-[11px] text-gray-500">Cleanliness</p>
                                                    <p className="font-semibold">{booking.startCleanliness || '-'} → {booking.endCleanliness || '-'}</p>
                                                </div>
                                                <div className="bg-zinc-900/50 rounded-lg p-3">
                                                    <p className="text-[11px] text-gray-500">Late Hours</p>
                                                    <p className="font-semibold">{booking.lateReturnHours || 0}h</p>
                                                </div>
                                                <div className="bg-zinc-900/50 rounded-lg p-3">
                                                    <p className="text-[11px] text-gray-500">Extra KM Fee</p>
                                                    <p className="font-semibold text-red-400">₹{booking.extraKmFee || 0}</p>
                                                </div>
                                                <div className="bg-zinc-900/50 rounded-lg p-3">
                                                    <p className="text-[11px] text-gray-500">Late Fee</p>
                                                    <p className="font-semibold text-red-400">₹{booking.lateFee || 0}</p>
                                                </div>
                                            </div>
                                            {booking.damagePhotos?.length > 0 && (
                                                <div className="pt-2 border-t border-white/5">
                                                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-2"><ImageIcon className="h-4 w-4 text-red-500" /> Damage Photos</p>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        {booking.damagePhotos.map((url, idx) => (
                                                            <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-white/10 bg-black">
                                                                <img src={url} alt="damage" className="h-full w-full object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {filteredBookings.length === 0 && (
                            <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
                                <Car className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                                <h3 className="text-gray-400 font-medium">No bookings found</h3>
                                <button onClick={() => router.push('/')} className="mt-4 text-sm text-red-500 hover:underline">Start a new journey</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
