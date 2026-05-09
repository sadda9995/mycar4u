'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function Cities() {
    const [cities, setCities] = useState([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCities = async () => {
        setLoading(true);
        try {
            const res = await api.get('/cities');
            setCities(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCities();
    }, []);

    const addCity = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cities', { name });
            setName('');
            fetchCities();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add city');
        }
    };

    const toggleCity = async (id, isActive) => {
        await api.put(`/cities/${id}`, { isActive: !isActive });
        fetchCities();
    };

    const deleteCity = async (id) => {
        if (!confirm('Delete city?')) return;
        await api.delete(`/cities/${id}`);
        fetchCities();
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Cities</h1>
            </div>

            <form onSubmit={addCity} className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 flex gap-3">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Add a city (e.g., Bengaluru)"
                    className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                    required
                />
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-bold flex items-center">
                    <Plus className="h-4 w-4 mr-1" /> Add
                </button>
            </form>

            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
                <div className="divide-y divide-white/5">
                    {loading ? (
                        <div className="p-4 text-gray-400">Loading...</div>
                    ) : cities.length === 0 ? (
                        <div className="p-4 text-gray-400">No cities yet</div>
                    ) : cities.map(city => (
                        <div key={city._id} className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-white font-semibold">{city.name}</p>
                                <p className="text-xs text-gray-500">Created {new Date(city.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => toggleCity(city._id, city.isActive)}
                                    className="text-gray-300 hover:text-white flex items-center gap-1"
                                >
                                    {city.isActive ? <ToggleRight className="h-5 w-5 text-green-400" /> : <ToggleLeft className="h-5 w-5 text-gray-500" />}
                                    {city.isActive ? 'Active' : 'Inactive'}
                                </button>
                                <button onClick={() => deleteCity(city._id)} className="text-red-400 hover:text-red-200">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
