'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    User, Shield, CreditCard, Bell, ChevronRight, 
    ArrowLeft, LogOut, Check, Save, Zap, HelpCircle
} from 'lucide-react';
import api from '@/utils/api';

export default function Settings() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Profile State
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        mobile: ''
    });

    // Razorpay Info (Mock or fetched)
    const [razorpayKey, setRazorpayKey] = useState('rzp_test_*******');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            setProfileData({
                name: parsed.name || '',
                email: parsed.email || '',
                mobile: parsed.mobile || ''
            });
        } else {
            router.push('/login?redirectTo=/settings');
        }
        setLoading(false);
    }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/users/me/profile', {
                name: profileData.name,
                mobile: profileData.mobile
            });
            const updatedUser = { ...user, ...profileData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            showToast('Profile updated successfully');
        } catch (err) {
            showToast('Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
        </div>
    );

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        user?.role === 'admin' && { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ].filter(Boolean);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-900">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full transition">
                        <ArrowLeft className="h-5 w-5 text-gray-400" />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight">Settings</h1>
                </div>
                {user && (
                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-gradient-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                            {user.name?.[0] || user.email?.[0]}
                        </div>
                    </div>
                )}
            </header>

            <main className="max-w-6xl mx-auto p-6 md:p-10 flex flex-col md:flex-row gap-10">
                {/* Sidebar */}
                <aside className="w-full md:w-64 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                activeTab === tab.id 
                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center">
                                <tab.icon className={`h-5 w-5 mr-3 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`} />
                                <span className="font-medium">{tab.label}</span>
                            </div>
                            {activeTab === tab.id && <ChevronRight className="h-4 w-4" />}
                        </button>
                    ))}
                    <div className="pt-6 mt-6 border-t border-white/10">
                        <button 
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('user');
                                router.push('/login');
                            }}
                            className="w-full flex items-center p-3 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/5 transition-all"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Content */}
                <div className="flex-1 bg-zinc-900/50 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[120px] pointer-events-none"></div>
                    
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Profile Information</h2>
                                <p className="text-gray-400 text-sm">Manage your account's public profile and contact info.</p>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-red-600 outline-none transition font-medium"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                                        <input 
                                            type="email" 
                                            value={profileData.email}
                                            disabled
                                            className="w-full bg-black/30 border border-white/5 text-gray-500 rounded-xl px-4 py-3 outline-none cursor-not-allowed font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mobile Number</label>
                                        <input 
                                            type="tel" 
                                            value={profileData.mobile}
                                            onChange={(e) => setProfileData({...profileData, mobile: e.target.value})}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-red-600 outline-none transition font-medium"
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button 
                                        type="submit"
                                        disabled={saving}
                                        className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        {saving ? <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div> : <Save className="h-5 w-5 mr-2" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'payments' && user?.role === 'admin' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Payment Configuration</h2>
                                <p className="text-gray-400 text-sm">View and manage your payment gateway settings.</p>
                            </div>

                            <div className="bg-black/50 border border-white/10 rounded-2xl p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 bg-blue-600/20 rounded-xl flex items-center justify-center mr-4">
                                            <Zap className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Razorpay Integration</h3>
                                            <p className="text-xs text-green-500 flex items-center font-bold">
                                                <Check className="h-3 w-3 mr-1" /> Active & Connected
                                            </p>
                                        </div>
                                    </div>
                                    <button className="text-xs font-bold text-red-500 hover:text-red-400 transition underline">Manage on Razorpay</button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Public Key (Key ID)</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={razorpayKey}
                                            readOnly
                                            className="flex-1 bg-black/30 border border-white/5 text-gray-500 rounded-xl px-4 py-3 font-mono text-sm"
                                        />
                                        <button className="bg-white/5 border border-white/10 px-4 rounded-xl text-xs font-bold hover:bg-white/10 transition">Copy</button>
                                    </div>
                                    <p className="text-[10px] text-gray-600 mt-1 flex items-center">
                                        <HelpCircle className="h-3 w-3 mr-1" /> This key is used for client-side payment initiation.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-red-900/10 border border-red-900/30 rounded-2xl p-6">
                                <h4 className="text-red-500 font-bold mb-2 text-sm">Security Note</h4>
                                <p className="text-gray-400 text-xs leading-relaxed">
                                    Your Secret Key is never exposed in the frontend. It is securely stored in your server environment variables (.env). To rotate keys, please update the server configuration.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <Shield className="h-16 w-16 text-gray-700 mb-2" />
                            <h3 className="text-xl font-bold">Security Settings</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">Password updates and multi-factor authentication are coming soon.</p>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <Bell className="h-16 w-16 text-gray-700 mb-2" />
                            <h3 className="text-xl font-bold">Notification Preferences</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">Customize how you receive updates about your bookings and offers.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-10 right-10 px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border animate-in slide-in-from-right-10 ${
                    toast.type === 'success' ? 'bg-zinc-900 border-green-500/30 text-green-500' : 'bg-zinc-900 border-red-500/30 text-red-500'
                }`}>
                    {toast.type === 'success' ? <Check className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                    <span className="font-bold">{toast.msg}</span>
                </div>
            )}
        </div>
    );
}
