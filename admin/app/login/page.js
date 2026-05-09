'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Car, ArrowRight, Lock, User, Mail } from 'lucide-react';
import api from '@/lib/api';

export default function Login() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [useEmail, setUseEmail] = useState(true);
    const [resetLink, setResetLink] = useState('');
    const [activationToken, setActivationToken] = useState('');
    const [resetToken, setResetToken] = useState('');

    useEffect(() => {
        const act = searchParams.get('activate');
        const reset = searchParams.get('reset');
        if (act) setActivationToken(act);
        if (reset) setResetToken(reset);
    }, [searchParams]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const endpoint = useEmail ? '/auth/login-staff' : '/auth/login';
            const payload = useEmail ? { email, password } : { username, password };
            const res = await api.post(endpoint, payload);

            const { token, user } = res.data;
            const role = user?.role || res.data.role;

            if (role !== 'admin' && role !== 'super_admin' && role !== 'city_admin' && role !== 'office_staff') {
                setError('Access Denied. Admins only.');
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ role, ...user }));

            // Redirect to Dashboard
            window.location.href = '/';
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Invalid Credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleForgot = async () => {
        if (!email) {
            setError('Enter email to reset password');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/staff/forgot', { email });
            setResetLink(res.data.resetLink);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    const handleTokenSubmit = async (type) => {
        setError('');
        setLoading(true);
        try {
            const token = type === 'activate' ? activationToken : resetToken;
            const endpoint = type === 'activate' ? '/auth/activate' : '/auth/staff/reset';
            const res = await api.post(endpoint, { token, password });
            const { token: accessToken, user } = res.data;
            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.message || 'Token flow failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-2xl p-8">
                <div className="flex justify-center mb-8">
                    <div className="h-12 w-12 bg-zinc-800 rounded-full flex items-center justify-center">
                        <Car className="h-6 w-6 text-red-600" />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
                    <p className="text-gray-400 text-sm">Secure access for fleet managers</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-400">Admin Login</label>
                            <button type="button" className="text-xs text-red-400" onClick={() => setUseEmail(!useEmail)}>
                                {useEmail ? 'Use username login' : 'Use email login'}
                            </button>
                        </div>
                        {useEmail ? (
                            <div className="relative mb-4">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter email"
                                    className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-red-500 outline-none"
                                    required
                                />
                            </div>
                        ) : (
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-red-500 outline-none"
                                required
                            />
                        </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-red-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center disabled:opacity-50 mt-2"
                    >
                        {loading ? 'Verifying...' : 'Login'}
                        {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
                    </button>

                    <div className="text-center mt-4">
                        <button type="button" onClick={handleForgot} className="text-xs text-red-400">
                            Forgot password? Send reset link
                        </button>
                        {resetLink && <p className="text-xs text-gray-500 mt-2 break-all">Reset link: {resetLink}</p>}
                    </div>
                </form>

                {(activationToken || resetToken) && (
                    <div className="mt-6 border-t border-white/10 pt-4">
                        <h3 className="text-sm font-bold text-white mb-2">Complete invite / reset</h3>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Set new password"
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none mb-3"
                        />
                        {activationToken && (
                            <button
                                onClick={() => handleTokenSubmit('activate')}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition mb-2">
                                Activate account
                            </button>
                        )}
                        {resetToken && (
                            <button
                                onClick={() => handleTokenSubmit('reset')}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition">
                                Reset password
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
