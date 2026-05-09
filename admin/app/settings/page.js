'use client';

import React, { useEffect, useState } from 'react';
import { Save, Phone, Building2, Bell, ShieldCheck } from 'lucide-react';

const STORAGE_KEY = 'admin_settings';

export default function SettingsPage() {
    const [form, setForm] = useState({
        companyName: '',
        supportNumber: '',
        supportEmail: '',
        defaultDailyKm: 300,
        autoVerifyUsers: false,
        damageProtectionDefault: true
    });

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setForm(JSON.parse(saved));
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
        alert('Settings saved locally');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-gray-400 mt-1">Configure company info and defaults</p>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-red-500" /> Organization
                </h2>
                <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => setForm(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Company name"
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        value={form.supportNumber}
                        onChange={(e) => setForm(prev => ({ ...prev, supportNumber: e.target.value }))}
                        placeholder="Support phone"
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                    />
                    <input
                        type="email"
                        value={form.supportEmail}
                        onChange={(e) => setForm(prev => ({ ...prev, supportEmail: e.target.value }))}
                        placeholder="Support email"
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-red-500" /> Defaults
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Default daily KM limit</label>
                        <input
                            type="number"
                            value={form.defaultDailyKm}
                            onChange={(e) => setForm(prev => ({ ...prev, defaultDailyKm: Number(e.target.value) || 0 }))}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center justify-between bg-black border border-white/10 rounded-xl px-4 py-3">
                        <div>
                            <p className="text-white font-medium">Auto-verify new users</p>
                            <p className="text-xs text-gray-500">Mark new signups as verified</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={form.autoVerifyUsers}
                            onChange={(e) => setForm(prev => ({ ...prev, autoVerifyUsers: e.target.checked }))}
                            className="h-5 w-5"
                        />
                    </div>
                    <div className="flex items-center justify-between bg-black border border-white/10 rounded-xl px-4 py-3">
                        <div>
                            <p className="text-white font-medium">Damage protection on by default</p>
                            <p className="text-xs text-gray-500">Apply protection package to new bookings</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={form.damageProtectionDefault}
                            onChange={(e) => setForm(prev => ({ ...prev, damageProtectionDefault: e.target.checked }))}
                            className="h-5 w-5"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 shadow-lg shadow-red-900/20">
                <Save className="h-5 w-5" />
                Save Settings (local)
            </button>
        </div>
    );
}
