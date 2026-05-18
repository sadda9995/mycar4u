'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ClipboardCheck, ArrowRight, ArrowLeft, Camera, FileText, Loader2, RefreshCw, Ban, ImagePlus, X } from 'lucide-react';

import api from '@/lib/api';

export default function Operations() {
    const [activeTab, setActiveTab] = useState('outward');
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2500);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Operations Module</h1>
                    <p className="text-gray-400 mt-1">Vehicle Handover & Takeover Logs</p>
                </div>
                <div className="bg-zinc-900 border border-white/10 rounded-xl p-1 flex">
                    <button
                        onClick={() => setActiveTab('outward')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'outward' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Outward (Dispatch)
                    </button>
                    <button
                        onClick={() => setActiveTab('inward')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'inward' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Inward (Return)
                    </button>
                </div>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8">
                {activeTab === 'outward' ? <OutwardForm showToast={showToast} /> : <InwardForm showToast={showToast} />}
            </div>
            {toast && (
                <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold border ${toast.type === 'success'
                    ? 'bg-green-900/80 border-green-500/30 text-green-100'
                    : 'bg-red-900/80 border-red-500/30 text-red-100'}`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}

function OutwardForm({ showToast }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [cleanliness, setCleanliness] = useState('Clean');
    const [damagePhotos, setDamagePhotos] = useState([]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/bookings');
            const readyForDispatch = res.data.filter(b => b.status === 'confirmed');
            setBookings(readyForDispatch);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleSelectBooking = (e) => {
        const bookingId = e.target.value;
        const booking = bookings.find(b => b._id === bookingId);
        setSelectedBooking(booking);
    };

    const uploadToCloudinary = async (file) => {
        const data = new FormData();
        data.append('image', file);
        try {
            const res = await api.post('/upload', data);
            return res.data.filePath;
        } catch (err) {
            console.error('Upload failed', err);
            return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center text-red-500 mb-6">
                <ArrowRight className="h-6 w-6 mr-2" />
                <h2 className="text-xl font-bold">New Vehicle Dispatch</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Booking ID / Customer</label>
                    <select
                        onChange={handleSelectBooking}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none">
                        <option value="">Select Booking...</option>
                        {bookings.map(b => (
                            <option key={b._id} value={b._id}>
                                {b.bookingId} - {b.user?.name} ({new Date(b.startTime).toLocaleDateString()})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Selected Vehicle</label>
                    <input
                        type="text"
                        value={selectedBooking ? `${selectedBooking.car?.make} ${selectedBooking.car?.model} (${selectedBooking.car?.registrationNumber})` : ''}
                        disabled
                        className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Odometer Start (km)</label>
                    <input
                        type="number"
                        value={selectedBooking?.startOdometer || ''}
                        onChange={(e) => setSelectedBooking(prev => ({ ...(prev || {}), startOdometer: Number(e.target.value) }))}
                        placeholder="e.g 12500"
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Fuel Level (%)</label>
                    <input
                        type="number"
                        value={selectedBooking?.startFuelLevel || ''}
                        onChange={(e) => setSelectedBooking(prev => ({ ...(prev || {}), startFuelLevel: Number(e.target.value) }))}
                        placeholder="e.g 80"
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Cleanliness</label>
                    <select
                        value={cleanliness}
                        onChange={(e) => setCleanliness(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none">
                        <option value="Clean">Clean</option>
                        <option value="Needs Washing">Needs Washing</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Existing Damages (Photos)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {damagePhotos.map((url, idx) => (
                        <div key={idx} className="relative aspect-square bg-black border border-white/10 rounded-xl overflow-hidden">
                            <img src={url} alt="damage" className="h-full w-full object-cover" />
                            <button
                                onClick={() => setDamagePhotos(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    <label className="aspect-square bg-black border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-white/30 cursor-pointer transition">
                        <ImagePlus className="h-6 w-6 mb-2" />
                        <span className="text-xs">Add Photo</span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                    const url = await uploadToCloudinary(file);
                                    if (url) setDamagePhotos(prev => [...prev, url]);
                                } catch (err) {
                                    console.error(err);
                                    alert('Upload failed');
                                }
                            }}
                        />
                    </label>
                </div>
            </div>

            <div className="pt-6 border-t border-white/10">
                <button
                    onClick={async () => {
                        if (!selectedBooking?._id) {
                            alert('Select a booking first');
                            return;
                        }
                        if (selectedBooking.startOdometer == null || selectedBooking.startOdometer === '') {
                            alert('Enter start odometer');
                            return;
                        }
                        if (selectedBooking.startFuelLevel == null || selectedBooking.startFuelLevel === '') {
                            alert('Enter start fuel level');
                            return;
                        }
                        try {
                            await api.put(`/bookings/${selectedBooking._id}`, {
                                status: 'active',
                                startOdometer: selectedBooking.startOdometer,
                                startFuelLevel: selectedBooking.startFuelLevel,
                                startCleanliness: cleanliness,
                                damagePhotos
                            });
                            showToast('Dispatch recorded and booking marked active.');
                            fetchBookings();
                            setSelectedBooking(null);
                            setDamagePhotos([]);
                        } catch (err) {
                            console.error(err);
                            showToast('Failed to submit dispatch log', 'error');
                        }
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold flex items-center justify-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Submit Dispatch Log
                </button>
                <button
                    onClick={async () => {
                        if (!selectedBooking?._id) {
                            alert('Select a booking first');
                            return;
                        }
                        if (!confirm('Cancel this booking?')) return;
                        try {
                            await api.put(`/bookings/${selectedBooking._id}`, { status: 'cancelled', paymentStatus: 'refunded' });
                            fetchBookings();
                            setSelectedBooking(null);
                            setDamagePhotos([]);
                        } catch (err) {
                            console.error(err);
                            showToast('Failed to cancel booking', 'error');
                        }
                    }}
                    className="mt-3 w-full bg-zinc-800 hover:bg-zinc-700 text-red-400 py-3 rounded-xl font-bold flex items-center justify-center border border-red-500/30">
                    <Ban className="h-5 w-5 mr-2" />
                    Cancel Booking
                </button>
            </div>
        </div>
    )
}

function InwardForm({ showToast }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [cleanliness, setCleanliness] = useState('Clean');
    const [lateHours, setLateHours] = useState(0);

    const fetchActive = async () => {
        setLoading(true);
        try {
            const res = await api.get('/bookings?status=active');
            setBookings(res.data);
        } catch (error) {
            console.error('Error fetching active bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActive();
    }, []);

    const handleSelect = (e) => {
        const bookingId = e.target.value;
        const booking = bookings.find(b => b._id === bookingId);
        setSelectedBooking(booking);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center text-green-500 mb-6">
                <ArrowLeft className="h-6 w-6 mr-2" />
                <h2 className="text-xl font-bold">Vehicle Return Check</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Active Booking</label>
                    <select
                        onChange={handleSelect}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none">
                        <option value="">Select Returning Car...</option>
                        {bookings.map(b => (
                            <option key={b._id} value={b._id}>
                                {b.bookingId} - {b.car?.make} {b.car?.model}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Odometer End (km)</label>
                    <input
                        type="number"
                        value={selectedBooking?.endOdometer || ''}
                        onChange={(e) => setSelectedBooking(prev => ({ ...(prev || {}), endOdometer: Number(e.target.value) }))}
                        placeholder="e.g 12800"
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Fuel Level (%)</label>
                    <input
                        type="number"
                        value={selectedBooking?.endFuelLevel || ''}
                        onChange={(e) => setSelectedBooking(prev => ({ ...(prev || {}), endFuelLevel: Number(e.target.value) }))}
                        placeholder="e.g 75"
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Late Return?</label>
                    <input
                        type="number"
                        value={lateHours}
                        onChange={(e) => setLateHours(Number(e.target.value) || 0)}
                        placeholder="Hours late (0 if on time)"
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Cleanliness on Return</label>
                    <select
                        value={cleanliness}
                        onChange={(e) => setCleanliness(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none">
                        <option value="Clean">Clean</option>
                        <option value="Needs Washing">Needs Washing</option>
                    </select>
                </div>
            </div>

            {selectedBooking && (
                <UsageSummary booking={selectedBooking} lateHours={lateHours} />
            )}

            <div className="pt-6 border-t border-white/10">
                <button
                    onClick={async () => {
                        if (!selectedBooking?._id) {
                            alert('Select a booking first');
                            return;
                        }
                        if (selectedBooking.endOdometer == null || selectedBooking.endOdometer === '') {
                            alert('Enter end odometer');
                            return;
                        }
                        if (selectedBooking.endFuelLevel == null || selectedBooking.endFuelLevel === '') {
                            alert('Enter end fuel level');
                            return;
                        }
                        const { extraKmFee, lateFee } = computeFees(selectedBooking, lateHours);
                        try {
                            await api.put(`/bookings/${selectedBooking._id}`, {
                                status: 'completed',
                                paymentStatus: 'paid',
                                endOdometer: selectedBooking.endOdometer,
                                endFuelLevel: selectedBooking.endFuelLevel,
                                endCleanliness: cleanliness,
                                lateReturnHours: lateHours,
                                extraKmFee,
                                lateFee
                            });
                            showToast('Return recorded and booking closed.');
                            fetchActive();
                            setSelectedBooking(null);
                        } catch (err) {
                            console.error(err);
                            showToast('Failed to complete return', 'error');
                        }
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center">
                    <ClipboardCheck className="h-5 w-5 mr-2" />
                    Complete Return & Close Booking
                </button>
            </div>
        </div>
    )
}

function computeFees(booking, lateHours = 0) {
    const startOdo = booking.startOdometer || 0;
    const endOdo = booking.endOdometer || startOdo;
    const distance = Math.max(0, endOdo - startOdo);
    const allowed = booking.allowedKm || 0;
    const extraKm = Math.max(0, distance - allowed);
    const extraKmFee = extraKm * (booking.extraKmCharge || 0);
    const lateFee = (lateHours || 0) * (booking.lateFeePerHour || 0);
    return { distance, extraKm, extraKmFee, lateFee };
}

function UsageSummary({ booking, lateHours }) {
    const { distance, extraKm, extraKmFee, lateFee } = useMemo(
        () => computeFees(booking, lateHours),
        [booking, lateHours]
    );
    return (
        <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl">
            <h3 className="font-bold text-red-400 mb-2">Usage Summary</h3>
            <div className="flex justify-between text-sm text-gray-300">
                <span>Distance Driven</span>
                <span>{distance} km</span>
            </div>
            <div className="flex justify-between text-sm text-gray-300 mt-1">
                <span>Extra KM ({extraKm} km @ ₹{booking.extraKmCharge}/km)</span>
                <span className="font-bold text-white">₹{extraKmFee}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-300 mt-1">
                <span>Late Fee ({lateHours}h @ ₹{booking.lateFeePerHour}/h)</span>
                <span className="font-bold text-white">₹{lateFee}</span>
            </div>
            <div className="flex justify-between text-sm text-white mt-2 border-t border-red-500/20 pt-2">
                <span>Total Extras</span>
                <span className="font-bold">₹{extraKmFee + lateFee}</span>
            </div>
        </div>
    );
}
