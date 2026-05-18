'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Clock,
    ShieldCheck,
    Settings,
    Phone,
    Download,
    AlertTriangle,
    Car
} from 'lucide-react';

export default function RentalDetails() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
            router.push('/login?redirectTo=/bookings/' + id);
            return;
        }

        const fetchBookingDetails = async () => {
            try {
                const res = await api.get('/bookings/my');
                const found = res.data.find(b => b._id === id || b.bookingId === id);

                if (found) {
                    setBooking(found);
                } else {
                    setError('Booking not found');
                }
            } catch (err) {
                if (err.response?.status === 401) {
                    router.push('/login?redirectTo=/bookings/' + id);
                } else {
                    console.error(err);
                    setError('Failed to load booking details');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchBookingDetails();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
        </div>
    );

    if (error || !booking) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Unavailable</h2>
            <p className="text-gray-400 mb-6">{error || 'Booking details not found.'}</p>
            <button onClick={() => router.push('/settings?tab=bookings')} className="bg-white/10 px-6 py-2 rounded-lg hover:bg-white/20 transition">
                Back to Bookings
            </button>
        </div>
    );

    // Helper to format dates
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'completed': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'active': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header */}
            <nav className="sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-md border-b border-white/10 px-4 h-16 flex items-center justify-between">
                <div className="flex items-center">
                    <button onClick={() => router.back()} className="mr-4 text-gray-400 hover:text-white transition">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-lg font-bold">Trip Details</h1>
                </div>
                <div className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(booking.status)} uppercase tracking-wider`}>
                    {booking.status}
                </div>
            </nav>

            <main className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">

                {/* Car Card */}
                <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between relative z-10">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{booking.car ? `${booking.car.make} ${booking.car.model}` : 'Unknown Car'}</h2>
                            {booking.car?.registrationNumber && (
                                <p className="text-gray-400 font-mono text-sm mb-4">{booking.car.registrationNumber}</p>
                            )}
                            {booking.car && (
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs bg-black/50 border border-white/10 px-2 py-1 rounded text-gray-300">
                                        {booking.car.fuelType}
                                    </span>
                                    <span className="text-xs bg-black/50 border border-white/10 px-2 py-1 rounded text-gray-300">
                                        {booking.car.transmission}
                                    </span>
                                    <span className="text-xs bg-black/50 border border-white/10 px-2 py-1 rounded text-gray-300">
                                        {booking.car.seats} Seats
                                    </span>
                                </div>
                            )}
                        </div>
                        {booking.car?.image && (
                            <div className="mt-6 md:mt-0">
                                <img
                                    src={booking.car.image}
                                    alt={booking.car.model}
                                    className="w-48 h-auto object-cover rounded-lg shadow-xl"
                                />
                            </div>
                        )}
                    </div>
                    {/* Background decoration */}
                    <Car className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 pointer-events-none" />
                </section>

                {/* Timeline */}
                <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-6">Trip Schedule</h3>
                    <div className="relative pl-8 border-l-2 border-dashed border-zinc-700 space-y-8">
                        {/* Start */}
                        <div className="relative">
                            <div className="absolute -left-[39px] bg-black border-2 border-green-500 w-5 h-5 rounded-full"></div>
                            <div>
                                <p className="text-xs text-green-500 font-bold mb-0.5">PICKUP</p>
                                <p className="text-lg font-bold">{formatDate(booking.startTime)}</p>
                                <p className="text-sm text-gray-400 mt-1 flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {booking.car?.location || 'Bangalore Center'}
                                </p>
                            </div>
                        </div>

                        {/* End */}
                        <div className="relative">
                            <div className="absolute -left-[39px] bg-black border-2 border-red-500 w-5 h-5 rounded-full"></div>
                            <div>
                                <p className="text-xs text-red-500 font-bold mb-0.5">DROP-OFF</p>
                                <p className="text-lg font-bold">{formatDate(booking.endTime)}</p>
                                <p className="text-sm text-gray-400 mt-1 flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {booking.car?.location || 'Bangalore Center'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Payment Info */}
                <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Payment Invoice</h3>
                        <button className="text-xs text-red-500 hover:text-white flex items-center transition">
                            <Download className="h-3 w-3 mr-1" /> Download PDF
                        </button>
                    </div>

                    <div className="space-y-3 text-sm text-gray-300">
                        <div className="flex justify-between">
                            <span>Base Fare & Taxes</span>
                            <span>₹{booking.totalAmount}</span>
                        </div>
                        <div className="flex justify-between text-green-500">
                            <span>Amount Paid</span>
                            <span className="font-bold">₹{booking.totalAmount}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-white/5 text-gray-500 text-xs">
                            <span>Payment ID</span>
                            <span className="font-mono">{booking.paymentResult?.razorpay_payment_id || 'N/A'}</span>
                        </div>
                    </div>
                </section>

                {/* Actions Grid */}
                <section className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => {
                            const text = `Hello! I want to report an issue with my booking (ID: ${booking.bookingId}) for the ${booking.car ? `${booking.car.make} ${booking.car.model}` : 'vehicle'}.`;
                            window.open(`https://wa.me/919876543210?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center transition cursor-pointer"
                    >
                        <AlertTriangle className="h-6 w-6 text-yellow-500 mb-2" />
                        <span className="text-sm font-bold">Report Issue</span>
                    </button>
                    <button 
                        onClick={() => {
                            const text = `Hello! I would like to request a trip extension for my booking (ID: ${booking.bookingId}) for the ${booking.car ? `${booking.car.make} ${booking.car.model}` : 'vehicle'}.`;
                            window.open(`https://wa.me/919876543210?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center transition cursor-pointer"
                    >
                        <Clock className="h-6 w-6 text-blue-500 mb-2" />
                        <span className="text-sm font-bold">Extend Trip</span>
                    </button>
                    <button 
                        onClick={() => window.open('tel:+919876543210', '_self')}
                        className="bg-zinc-800 hover:bg-zinc-700 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center transition cursor-pointer"
                    >
                        <Phone className="h-6 w-6 text-green-500 mb-2" />
                        <span className="text-sm font-bold">Call Support</span>
                    </button>
                    <button className="bg-zinc-800 hover:bg-zinc-700 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center transition cursor-pointer">
                        <ShieldCheck className="h-6 w-6 text-purple-500 mb-2" />
                        <span className="text-sm font-bold">Insurance</span>
                    </button>
                </section>

            </main>
        </div>
    );
}
