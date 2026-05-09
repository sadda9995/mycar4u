'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, Shield, CheckCircle, XCircle, FileText, Calendar, CreditCard } from 'lucide-react';
import api from '@/lib/api';

export default function CustomerProfile() {
    const { id } = useParams();
    const router = useRouter();
    const [customer, setCustomer] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User
                const userRes = await api.get('/users');
                const foundUser = userRes.data.find(u => u._id === id);
                setCustomer(foundUser);

                // Fetch User Bookings
                // Assuming we can filter logic client side for MVP or use an endpoint if available
                const bookingRes = await api.get('/bookings');
                const userBookings = bookingRes.data.filter(b => b.user?._id === id || b.user === id);
                setBookings(userBookings);

            } catch (error) {
                console.error('Error fetching customer data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleVerify = async (status) => {
        try {
            // This endpoint needs to be implemented or we use a generic update
            // let's assume specific endpoint or generic put
            // await api.put(`/users/${id}/verify`, { status }); 
            // For now, let's just log it as the endpoint might not exist yet in my plan
            alert(`Verification logic to be implemented for ${status}`);
        } catch (error) {
            console.error('Error updating verification:', error);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading profile...</div>;
    if (!customer) return <div className="p-8 text-white">Customer not found</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <button onClick={() => router.back()} className="flex items-center text-gray-400 hover:text-white transition mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Customers
            </button>

            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-2xl text-gray-400">
                        {customer.name ? customer.name[0].toUpperCase() : <User />}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            {customer.name}
                            {customer.isVerified && <CheckCircle className="h-6 w-6 text-green-500" />}
                        </h1>
                        <p className="text-gray-400 mt-1">Member since {new Date(customer.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {!customer.isVerified && (
                        <button onClick={() => handleVerify(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold transition flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Documents
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Documents */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                            <Shield className="h-5 w-5 mr-2 text-blue-500" />
                            KYC Documents
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-gray-400 text-sm font-bold">Driving License</p>
                                <div className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center border border-white/10 relative overflow-hidden group">
                                    {customer.drivingLicense?.imageFront ? (
                                        <img src={customer.drivingLicense.imageFront} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-500 text-sm">No Front Image</span>
                                    )}
                                </div>
                                <div className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center border border-white/10 relative overflow-hidden group">
                                    {customer.drivingLicense?.imageBack ? (
                                        <img src={customer.drivingLicense.imageBack} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-500 text-sm">No Back Image</span>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-400 text-sm font-bold">Aadhaar Card</p>
                                <div className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center border border-white/10 relative overflow-hidden group">
                                    {customer.aadhaar?.imageFront ? (
                                        <img src={customer.aadhaar.imageFront} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-500 text-sm">No Front Image</span>
                                    )}
                                </div>
                                <div className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center border border-white/10 relative overflow-hidden group">
                                    {customer.aadhaar?.imageBack ? (
                                        <img src={customer.aadhaar.imageBack} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-500 text-sm">No Back Image</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking History */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                            Booking History
                        </h2>
                        {bookings.length > 0 ? (
                            <div className="space-y-4">
                                {bookings.map(book => (
                                    <div key={book._id} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                                        <div>
                                            <p className="font-bold text-white">{book.car?.make} {book.car?.model}</p>
                                            <p className="text-xs text-gray-500">{new Date(book.startTime).toLocaleDateString()} - {new Date(book.endTime).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-white">₹{book.totalAmount}</p>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${book.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                                }`}>{book.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No bookings found.</p>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Contact Info</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-zinc-800 p-2 rounded-lg"><Phone className="h-4 w-4 text-white" /></div>
                                <div>
                                    <p className="text-xs text-gray-400">Mobile Number</p>
                                    <p className="text-white font-medium">{customer.mobile}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-zinc-800 p-2 rounded-lg"><Mail className="h-4 w-4 text-white" /></div>
                                <div>
                                    <p className="text-xs text-gray-400">Email Address</p>
                                    <p className="text-white font-medium">{customer.email || 'Not Provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Wallet Balance</h2>
                        <div className="bg-gradient-to-r from-red-900 to-red-600 rounded-xl p-4">
                            <p className="text-red-200 text-sm mb-1">Current Balance</p>
                            <h3 className="text-3xl font-bold text-white">₹{customer.walletBalance?.toLocaleString() || 0}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
