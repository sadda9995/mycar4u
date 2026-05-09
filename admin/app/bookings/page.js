'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, Eye, Download, CheckCircle, Clock, XCircle, AlertCircle, Ban, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [damageModal, setDamageModal] = useState({ open: false, images: [] });

    const fetchBookings = async () => {
        setLoading(true);
        try {
            let query = `/bookings?`;
            if (filterStatus !== 'all') query += `status=${filterStatus}&`;
            if (dateRange.start && dateRange.end) query += `startDate=${dateRange.start}&endDate=${dateRange.end}`;

            const res = await api.get(query);
            setBookings(res.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [filterStatus, dateRange]);

    const filteredBookings = useMemo(() => {
        if (!searchTerm) return bookings;
        const term = searchTerm.toLowerCase();
        return bookings.filter((b) => {
            const userName = b.user?.name?.toLowerCase() || '';
            const carName = `${b.car?.make || ''} ${b.car?.model || ''}`.toLowerCase();
            const reg = b.car?.registrationNumber?.toLowerCase() || '';
            const id = b.bookingId?.toLowerCase() || '';
            return userName.includes(term) || carName.includes(term) || reg.includes(term) || id.includes(term);
        });
    }, [bookings, searchTerm]);

    const exportCsv = (rows) => {
        if (!rows || !rows.length) return;
        const headers = ['Booking ID', 'Customer', 'Car', 'From', 'To', 'Amount', 'Status'];
        const lines = rows.map(b => [
            b.bookingId || '',
            b.user?.name || '',
            `${b.car?.make || ''} ${b.car?.model || ''} ${b.car?.registrationNumber || ''}`.trim(),
            new Date(b.startTime).toLocaleString(),
            new Date(b.endTime).toLocaleString(),
            b.totalAmount || 0,
            b.status
        ]);
        const csv = [headers, ...lines].map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bookings-${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

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
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Bookings</h1>
                    <p className="text-gray-400 mt-1">Manage and track all vehicle reservations</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => exportCsv(filteredBookings)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition flex items-center border border-white/10">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Booking ID, customer, car..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-red-500 outline-none text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 uppercase">From</div>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-red-500 outline-none"
                        />
                        <div className="text-xs text-gray-500 uppercase">To</div>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-red-500 outline-none"
                        />
                    </div>
                </div>
                <div className="flex gap-2 text-sm overflow-x-auto pb-2 md:pb-0">
                    {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl capitalize whitespace-nowrap transition ${filterStatus === status
                                ? 'bg-red-600 text-white'
                                : 'bg-black border border-white/10 text-gray-400 hover:text-white'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-900/80 text-gray-400 text-xs uppercase font-medium border-b border-white/5">
                            <tr>
                                <th className="p-4 pl-6">Booking ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Vehicle</th>
                                <th className="p-4">Dates</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Extras</th>
                                <th className="p-4 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-500">Loading bookings...</td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-500">No bookings found</td>
                                </tr>
                            ) : filteredBookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-white/5 transition">
                                    <td className="p-4 pl-6 font-mono text-white/80">
                                        {booking.bookingId || <span className="text-gray-600">N/A</span>}
                                    </td>
                                    <td className="p-4">
                                        <div className="py-1">
                                            <p className="font-bold text-white">{booking.user?.name || 'Unknown'}</p>
                                            <p className="text-gray-500 text-xs">{booking.user?.mobile}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {booking.car?.image?.[0] && (
                                                <img src={booking.car.image[0]} alt="Car" className="h-10 w-16 object-cover rounded-md bg-zinc-800" />
                                            )}
                                            <div>
                                                <p className="font-medium text-white">{booking.car?.make} {booking.car?.model}</p>
                                                <p className="text-gray-500 text-xs">{booking.car?.registrationNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="py-1">
                                            <p className="text-white">{new Date(booking.startTime).toLocaleDateString()}</p>
                                            <p className="text-gray-500 text-xs">to {new Date(booking.endTime).toLocaleDateString()}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-white">
                                        ₹{booking.totalAmount?.toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)} uppercase`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-white">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-gray-300">
                                                <span>Extra KM</span>
                                                <span className="font-semibold text-white">₹{booking.extraKmFee || 0}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-300">
                                                <span>Late Fee</span>
                                                <span className="font-semibold text-white">₹{booking.lateFee || 0}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-white font-bold border-t border-white/10 pt-1">
                                                <span>Total</span>
                                                <span>₹{(booking.extraKmFee || 0) + (booking.lateFee || 0)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right pr-6 space-x-2">
                                        <Link href={`/bookings/${booking._id}`} className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition">
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                        {booking.damagePhotos?.length > 0 && (
                                            <button
                                                onClick={() => setDamageModal({ open: true, images: booking.damagePhotos })}
                                                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                                            >
                                                <ImageIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                            <button
                                                onClick={async () => {
                                                    if (!confirm('Cancel this booking?')) return;
                                                    try {
                                                        await api.put(`/bookings/${booking._id}`, { status: 'cancelled', paymentStatus: 'refunded' });
                                                        fetchBookings();
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert('Failed to cancel booking');
                                                    }
                                                }}
                                                className="inline-flex items-center justify-center p-2 rounded-lg text-red-400 hover:text-white hover:bg-red-500/20 transition border border-red-500/30"
                                            >
                                                <Ban className="h-4 w-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {damageModal.open && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-3xl w-full p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Damage Photos</h3>
                            <button onClick={() => setDamageModal({ open: false, images: [] })} className="text-gray-400 hover:text-white text-xl">×</button>
                        </div>
                        {damageModal.images.length === 0 ? (
                            <p className="text-gray-400 text-sm">No photos available</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {damageModal.images.map((url, idx) => (
                                    <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-black">
                                        <img src={url} alt={`Damage ${idx}`} className="h-full w-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
