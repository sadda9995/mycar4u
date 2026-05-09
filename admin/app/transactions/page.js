'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { IndianRupee, ArrowUpRight, ArrowDownLeft, Calendar, Download, Search } from 'lucide-react';
import api from '@/lib/api';

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                // api.get('/payment/all') 
                // Note: The route in paymentRoutes.js is router.get('/all', ...) mounted at /api/payment
                const res = await api.get('/payment/all');
                setTransactions(res.data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const filtered = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return transactions.filter(t => {
            const matchesStatus = statusFilter === 'all' || (t.paymentStatus || 'pending') === statusFilter;
            const haystack = `${t.bookingId || ''} ${t.user?.name || ''} ${t.user?.mobile || ''}`.toLowerCase();
            return matchesStatus && haystack.includes(term);
        });
    }, [transactions, searchTerm, statusFilter]);

    const exportCsv = () => {
        if (!filtered.length) return;
        const headers = ['Transaction / Booking', 'Customer', 'Date', 'Amount', 'Status'];
        const rows = filtered.map(t => [
            t.bookingId || '',
            t.user?.name || '',
            new Date(t.createdAt).toLocaleString(),
            t.totalAmount || 0,
            t.paymentStatus || 'pending'
        ]);
        const csv = [headers, ...rows].map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transactions-${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const totalRevenue = transactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Transactions</h1>
                    <p className="text-gray-400 mt-1">Financial overview and payment history</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportCsv}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition flex items-center border border-white/10">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-900/50 to-green-800/20 border border-green-500/20 p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-500/20 rounded-xl">
                            <IndianRupee className="h-6 w-6 text-green-500" />
                        </div>
                        <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-white mt-1">₹{totalRevenue.toLocaleString()}</h3>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
                    <h2 className="text-lg font-bold text-white">Payment History</h2>
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <div className="relative md:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search booking/customer..."
                                className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:border-green-500 outline-none text-sm"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-green-500 outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-zinc-900 text-gray-400 font-medium text-xs uppercase">
                        <tr>
                            <th className="p-4 pl-6">Transaction ID / Booking</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Extras</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading transactions...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">No transactions found</td></tr>
                        ) : filtered.map((t) => (
                            <tr key={t._id} className="hover:bg-white/5 transition">
                                <td className="p-4 pl-6">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-zinc-800 rounded-lg mr-3 text-gray-400">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-mono text-white mb-0.5">{t.bookingId}</p>
                                            <p className="text-xs text-gray-500 capitalize">{t.paymentMode || 'Online'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <p className="text-white font-medium">{t.user?.name || 'Unknown'}</p>
                                    <p className="text-xs text-gray-500">{t.user?.mobile}</p>
                                </td>
                                <td className="p-4 text-gray-400">
                                    {new Date(t.createdAt).toLocaleDateString()}
                                    <span className="text-xs ml-1 opacity-50">{new Date(t.createdAt).toLocaleTimeString()}</span>
                                </td>
                                <td className="p-4 font-bold text-white">
                                    ₹{t.totalAmount?.toLocaleString()}
                                </td>
                                <td className="p-4 text-white">
                                    <div className="text-xs text-gray-300 space-y-1">
                                        <div className="flex justify-between"><span>Extra KM</span><span className="text-white font-semibold">₹{t.extraKmFee || 0}</span></div>
                                        <div className="flex justify-between"><span>Late Fee</span><span className="text-white font-semibold">₹{t.lateFee || 0}</span></div>
                                        <div className="flex justify-between border-t border-white/10 pt-1 text-white font-bold"><span>Total</span><span>₹{(t.extraKmFee || 0) + (t.lateFee || 0)}</span></div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${t.paymentStatus === 'paid' ? 'text-green-500 bg-green-500/10' :
                                            t.paymentStatus === 'pending' ? 'text-yellow-500 bg-yellow-500/10' :
                                                'text-gray-500 bg-gray-500/10'
                                        }`}>
                                        {t.paymentStatus || 'Pending'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
