'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, User, Mail, Phone, Shield, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                // Fetch all users and filter for role 'user'
                const res = await api.get('/users');
                const userList = res.data.filter(u => u.role === 'user');
                setCustomers(userList);
            } catch (error) {
                console.error('Error fetching customers:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const filtered = useMemo(() => {
        if (!searchTerm) return customers;
        const term = searchTerm.toLowerCase();
        return customers.filter((c) => {
            const name = c.name?.toLowerCase() || '';
            const email = c.email?.toLowerCase() || '';
            const mobile = c.mobile?.toLowerCase() || '';
            return name.includes(term) || email.includes(term) || mobile.includes(term);
        });
    }, [customers, searchTerm]);

    if (loading) return <div className="p-8 text-white">Loading customers...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Customers</h1>
                    <p className="text-gray-400 mt-1">Manage user profiles and verification</p>
                </div>
            </div>

            {/* Filters / Search */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by Name, Email or Phone..."
                        className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-red-500 outline-none text-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-900 border-b border-white/5 text-gray-400 font-medium text-xs uppercase">
                        <tr>
                            <th className="p-4 pl-6">Customer</th>
                            <th className="p-4">Contact Info</th>
                            <th className="p-4">Verification Status</th>
                            <th className="p-4">Wallet</th>
                            <th className="p-4 text-right pr-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500">No customers found</td>
                            </tr>
                        ) : filtered.map((customer) => (
                            <tr key={customer._id} className="hover:bg-white/5 transition">
                                <td className="p-4 pl-6">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-gray-400 mr-3">
                                            {customer.name ? customer.name[0].toUpperCase() : <User className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{customer.name || 'Unknown User'}</p>
                                            <p className="text-gray-500 text-xs">Joined {new Date(customer.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="space-y-1">
                                        {customer.email && (
                                            <div className="flex items-center text-gray-300">
                                                <Mail className="h-3 w-3 mr-2 text-gray-500" />
                                                {customer.email}
                                            </div>
                                        )}
                                        <div className="flex items-center text-gray-300">
                                            <Phone className="h-3 w-3 mr-2 text-gray-500" />
                                            {customer.mobile}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {customer.isVerified ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                            <Shield className="h-3 w-3 mr-1" />
                                            Pending
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 font-mono text-white">
                                    ₹{customer.walletBalance?.toLocaleString() || 0}
                                </td>
                                <td className="p-4 text-right pr-6">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await api.put(`/users/${customer._id}`, { isVerified: !customer.isVerified });
                                                    setCustomers(prev => prev.map(c => c._id === customer._id ? { ...c, isVerified: !customer.isVerified } : c));
                                                } catch (err) {
                                                    console.error(err);
                                                    alert('Failed to update verification');
                                                }
                                            }}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold border ${customer.isVerified ? 'border-yellow-500 text-yellow-400 hover:bg-yellow-500/10' : 'border-green-500 text-green-400 hover:bg-green-500/10'}`}>
                                            {customer.isVerified ? 'Unverify' : 'Verify'}
                                        </button>
                                        <Link href={`/customers/${customer._id}`} className="text-gray-400 hover:text-white transition inline-block p-2 hover:bg-white/10 rounded-lg">
                                            View
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
