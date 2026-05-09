'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, MapPin } from 'lucide-react';

export default function Offices() {
    const [offices, setOffices] = useState([]);
    const [cities, setCities] = useState([]);
    const [form, setForm] = useState({ name: '', cityId: '' });
    const [loading, setLoading] = useState(true);
    const [selfRole, setSelfRole] = useState('');
    const [selfCity, setSelfCity] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [o, c] = await Promise.all([
                api.get('/offices'),
                api.get('/cities')
            ]);
            setOffices(o.data);
            const active = c.data.filter(city => city.isActive !== false);
            setCities(active);
            if (!form.cityId && active.length) setForm(prev => ({ ...prev, cityId: active[0]._id }));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const raw = localStorage.getItem('user');
        if (raw) {
            try {
                const u = JSON.parse(raw);
                setSelfRole(u.role);
                setSelfCity(u.cityId?._id || u.cityId || '');
            } catch { }
        }
        fetchData();
    }, []);

    const addOffice = async (e) => {
        e.preventDefault();
        try {
            await api.post('/offices', form);
            setForm(prev => ({ ...prev, name: '' }));
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add office');
        }
    };

    const removeOffice = async (id) => {
        if (!confirm('Delete office?')) return;
        await api.delete(`/offices/${id}`);
        fetchData();
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Offices</h1>
            </div>

            {selfRole === 'super_admin' && (
                <form onSubmit={addOffice} className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Office name"
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                        required
                    />
                    <select
                        value={form.cityId}
                        onChange={(e) => setForm(prev => ({ ...prev, cityId: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                        required
                    >
                        {cities.map(city => (
                            <option key={city._id} value={city._id} className="bg-zinc-900">{city.name}</option>
                        ))}
                    </select>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center">
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </button>
                </form>
            )}

            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
                <div className="divide-y divide-white/5">
                    {loading ? (
                        <div className="p-4 text-gray-400">Loading...</div>
                    ) : offices.length === 0 ? (
                        <div className="p-4 text-gray-400">No offices yet</div>
                    ) : offices
                        .filter(o => selfRole === 'super_admin' ? true : (o.cityId?._id || o.cityId) === selfCity)
                        .map(office => (
                            <div key={office._id} className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-white font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-red-500" /> {office.name}</p>
                                    <p className="text-xs text-gray-500">City: {office.cityId?.name || office.cityId}</p>
                                </div>
                                {selfRole === 'super_admin' && (
                                    <button onClick={() => removeOffice(office._id)} className="text-red-400 hover:text-red-200">
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
