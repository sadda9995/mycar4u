'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import { Car, ArrowRight, Phone, ShieldCheck, User, Mail, RotateCcw } from 'lucide-react';

function LoginContent() {
    const [loginEmail, setLoginEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [cooldown, setCooldown] = useState(0);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') || '/';

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2500);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/send-otp', { email: loginEmail });
            setStep(2);
            showToast('OTP sent');
            setCooldown(30);
        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.message || 'Failed to send OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { email: loginEmail, otp });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            const u = res.data.user;
            setName(u.name || '');
            setMobile(u.mobile || '');
            const needsProfile = res.data.isNewUser || !u.name || !u.mobile;
            if (needsProfile) {
                setStep(3);
            } else {
                router.push(redirectTo);
            }
        } catch (error) {
            console.error(error);
            showToast('Invalid OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/users/me/profile', { name, mobile });
            const existing = JSON.parse(localStorage.getItem('user') || '{}');
            const updated = { ...existing, name, mobile };
            localStorage.setItem('user', JSON.stringify(updated));
        } catch (error) {
            console.error(error);
            showToast('Failed to save profile', 'error');
        } finally {
            router.push(redirectTo);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex relative overflow-hidden">
            {/* Background Split */}
            <div className="absolute inset-0 z-0 flex">
                <div className="hidden lg:block w-2/3 relative">
                    <img
                        src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2500&auto=format&fit=crop"
                        alt="Login Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black"></div>
                    <div className="absolute bottom-20 left-20 text-white z-10">
                        <h1 className="text-6xl font-bold mb-4">Start your <br />Journey.</h1>
                        <p className="text-xl text-gray-300">Premium cars. Unforgettable memories.</p>
                    </div>
                </div>
                <div className="w-full lg:w-1/3 bg-black"></div>
            </div>

            {/* Login Container */}
            <div className="relative z-10 w-full flex items-center justify-center lg:justify-end p-4 lg:p-0">
                <div className="w-full max-w-md lg:mr-20 bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    <div className="flex items-center mb-8">
                        <Car className="h-8 w-8 text-red-600" />
                        <span className="ml-2 text-2xl font-bold text-white">Mycar4u</span>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2">
                        {step === 1 ? 'Welcome Back' : step === 2 ? 'Verify OTP' : 'Complete Profile'}
                    </h2>
                    <p className="text-gray-400 mb-8">
                        {step === 1
                            ? 'Enter your email address to get started'
                            : step === 2
                                ? `Check email sent to ${loginEmail}`
                                : 'Add your name and mobile to personalize your bookings'}
                    </p>

                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div className="bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 flex items-center focus-within:border-red-600 transition">
                                <Mail className="text-gray-500 mr-3 h-5 w-5" />
                                <input
                                    type="email"
                                    required
                                    placeholder="Email Address"
                                    className="bg-transparent w-full text-white outline-none font-medium placeholder:text-zinc-600"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" /> : (
                                    <>
                                        Continue
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 flex items-center focus-within:border-red-600 transition group">
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter 4-digit OTP"
                                    className="bg-transparent w-full text-white outline-none font-medium placeholder:text-zinc-600 tracking-widest text-center text-xl"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={4}
                                />
                                <button 
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            const text = await navigator.clipboard.readText();
                                            if (text && text.length === 4) setOtp(text);
                                        } catch (err) {
                                            console.error('Failed to paste', err);
                                        }
                                    }}
                                    className="text-xs text-red-500 hover:text-red-400 font-bold ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    PASTE
                                </button>
                                <ShieldCheck className="h-5 w-5 text-gray-500 ml-2" />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" /> : (
                                    <>
                                        Verify & Continue
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </button>
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setStep(1)}
                                    type="button"
                                    className="text-sm text-gray-500 hover:text-white transition"
                                >
                                    Change Email
                                </button>
                                <button
                                    type="button"
                                    disabled={cooldown > 0}
                                    onClick={handleSendOtp}
                                    className="text-sm text-red-400 hover:text-red-200 transition disabled:opacity-50 flex items-center"
                                >
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleProfile} className="space-y-6">
                            <div className="bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 flex items-center focus-within:border-red-600 transition">
                                <User className="h-5 w-5 text-gray-500 mr-3" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Your Name"
                                    className="bg-transparent w-full text-white outline-none font-medium placeholder:text-zinc-600"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 flex items-center focus-within:border-red-600 transition">
                                <Phone className="h-5 w-5 text-gray-500 mr-3" />
                                <input
                                    type="tel"
                                    required
                                    placeholder="Mobile Number"
                                    className="bg-transparent w-full text-white outline-none font-medium placeholder:text-zinc-600"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" /> : (
                                    <>
                                        Save & Continue
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
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

export default function Login() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
