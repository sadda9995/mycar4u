'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Car, Calendar, CreditCard, Shield, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';

export default function BookingDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await api.get(`/bookings/${id}`);
                setBooking(res.data);
            } catch (error) {
                console.error('Error fetching booking:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [id]);

    if (loading) return <div className="p-8 text-white">Loading booking details...</div>;
    if (!booking) return <div className="p-8 text-white">Booking not found</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'active': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'completed': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
            case 'cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <button onClick={() => router.back()} className="flex items-center text-gray-400 hover:text-white transition mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bookings
            </button>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        Booking #{booking.bookingId}
                        <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(booking.status)} uppercase`}>
                            {booking.status}
                        </span>
                    </h1>
                    <p className="text-gray-400 mt-1">Created on {new Date(booking.createdAt).toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Customer Info */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                            <User className="h-5 w-5 mr-2 text-red-500" />
                            Customer Details
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-400 text-sm">Full Name</p>
                                <p className="text-white font-medium">{booking.user?.name || 'Unknown'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Phone Number</p>
                                <p className="text-white font-medium">{booking.user?.mobile}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Email</p>
                                <p className="text-white font-medium">{booking.user?.email || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                            <Car className="h-5 w-5 mr-2 text-blue-500" />
                            Vehicle Details
                        </h2>
                        <div className="flex gap-4">
                            {booking.car?.image?.[0] && (
                                <img src={booking.car.image[0]} alt="Car" className="h-24 w-32 object-cover rounded-xl bg-zinc-800" />
                            )}
                            <div>
                                <p className="text-lg font-bold text-white">{booking.car?.make} {booking.car?.model}</p>
                                <p className="text-gray-400 font-mono">{booking.car?.registrationNumber}</p>
                                <div className="mt-2 flex gap-2">
                                    <span className="bg-zinc-800 px-2 py-1 rounded text-xs text-gray-300">
                                        Limit: {booking.allowedKm}km
                                    </span>
                                    <span className="bg-zinc-800 px-2 py-1 rounded text-xs text-gray-300">
                                        Extra: ₹{booking.extraKmCharge}/km
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-yellow-500" />
                            Timeline
                        </h2>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="border-l-2 border-green-500/50 pl-4">
                                <p className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded w-fit mb-2">PICKUP</p>
                                <p className="text-white font-bold">{new Date(booking.startTime).toLocaleDateString()}</p>
                                <p className="text-gray-400 text-sm">{new Date(booking.startTime).toLocaleTimeString()}</p>
                            </div>
                            <div className="border-l-2 border-red-500/50 pl-4">
                                <p className="text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded w-fit mb-2">DROP OFF</p>
                                <p className="text-white font-bold">{new Date(booking.endTime).toLocaleDateString()}</p>
                                <p className="text-gray-400 text-sm">{new Date(booking.endTime).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Payment & Fees */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                            <CreditCard className="h-5 w-5 mr-2 text-purple-500" />
                            Payment & Fees
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Trip Total</span>
                                <span className="text-white font-bold">₹{booking.totalAmount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Extra KM Fee</span>
                                <span className="text-white font-bold">₹{booking.extraKmFee || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Late Fee</span>
                                <span className="text-white font-bold">₹{booking.lateFee || 0}</span>
                            </div>
                            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                <span className="text-gray-400">Payment Status</span>
                                <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${booking.paymentStatus === 'paid' ? 'text-green-500 bg-green-500/10' : 'text-yellow-500 bg-yellow-500/10'
                                    }`}>
                                    {booking.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Ops Data */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                            <Shield className="h-5 w-5 mr-2 text-orange-500" />
                            Ops & Return
                        </h2>
                        <div className="space-y-2 text-sm text-gray-300">
                            <div className="flex justify-between"><span>Start Odo</span><span className="text-white">{booking.startOdometer ?? '-'}</span></div>
                            <div className="flex justify-between"><span>End Odo</span><span className="text-white">{booking.endOdometer ?? '-'}</span></div>
                            <div className="flex justify-between"><span>Start Fuel</span><span className="text-white">{booking.startFuelLevel ?? '-'}%</span></div>
                            <div className="flex justify-between"><span>End Fuel</span><span className="text-white">{booking.endFuelLevel ?? '-'}%</span></div>
                            <div className="flex justify-between"><span>Cleanliness (out)</span><span className="text-white">{booking.startCleanliness || '-'}</span></div>
                            <div className="flex justify-between"><span>Cleanliness (in)</span><span className="text-white">{booking.endCleanliness || '-'}</span></div>
                            <div className="flex justify-between"><span>Late Hours</span><span className="text-white">{booking.lateReturnHours || 0}h</span></div>
                        </div>
                    </div>

                    {/* Damage Photos */}
                    {booking.damagePhotos?.length > 0 && (
                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                <ImageIcon className="h-5 w-5 mr-2 text-red-500" />
                                Damage Photos
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                {booking.damagePhotos.map((url, idx) => (
                                    <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-black">
                                        <img src={url} alt={`Damage ${idx}`} className="h-full w-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
