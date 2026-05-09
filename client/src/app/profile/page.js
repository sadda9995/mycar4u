'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Shield, CheckCircle, Upload, ArrowLeft } from 'lucide-react';
import api from '@/utils/api';

export default function Profile() {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('user');
            if (userData) setUser(JSON.parse(userData));
            else router.push('/login');
        }
    }, []);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <button onClick={() => router.push('/')} className="mb-6 flex items-center text-gray-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5 mr-2" /> Back to Home
                </button>

                <h1 className="text-3xl font-bold mb-8">My Profile</h1>

                {/* User Info Card */}
                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 mb-8 flex items-center space-x-6">
                    <div className="h-20 w-20 bg-zinc-800 rounded-full flex items-center justify-center border-2 border-red-600">
                        <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user.name || 'User'}</h2>
                        <p className="text-gray-400">+91 {user.mobile}</p>
                        <div className="flex items-center mt-2 text-green-400 text-sm">
                            <Shield className="h-3 w-3 mr-1" />
                            {user.role === 'admin' ? 'Admin Access' : 'Standard Account'}
                        </div>
                    </div>
                </div>

                {/* KYC Section */}
                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">KYC Documents</h3>
                        <span className="px-3 py-1 bg-yellow-400/10 text-yellow-400 text-xs rounded-full border border-yellow-400/20">
                            Pending Verification
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Driver's License */}
                        <div className="border border-dashed border-zinc-700 bg-black/30 rounded-xl p-6 text-center hover:border-red-600/50 transition cursor-pointer group">
                            <div className="h-12 w-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-red-600 transition">
                                <Upload className="h-5 w-5 text-gray-300 group-hover:text-white" />
                            </div>
                            <p className="font-semibold text-white mb-1">Driver's License</p>
                            <p className="text-xs text-gray-500">Upload Front Side</p>
                        </div>

                        {/* Aadhaar */}
                        <div className="border border-dashed border-zinc-700 bg-black/30 rounded-xl p-6 text-center hover:border-red-600/50 transition cursor-pointer group">
                            <div className="h-12 w-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-red-600 transition">
                                <Upload className="h-5 w-5 text-gray-300 group-hover:text-white" />
                            </div>
                            <p className="font-semibold text-white mb-1">Aadhaar Card</p>
                            <p className="text-xs text-gray-500">Upload Front Side</p>
                        </div>
                    </div>

                    <p className="mt-4 text-xs text-center text-gray-500">
                        Your documents are encrypted and stored securely.
                    </p>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            router.push('/login');
                        }}
                        className="text-red-500 hover:text-red-400 text-sm font-medium"
                    >
                        Log Out from all devices
                    </button>
                </div>
            </div>
        </div>
    );
}
