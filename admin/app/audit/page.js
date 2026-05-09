'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Download, Filter, RefreshCcw } from 'lucide-react';

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ action: '', actor: '', start: '', end: '' });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
            const res = await api.get(`/audit?${params.toString()}`);
            setLogs(res.data || []);
        } catch (err) {
            console.error('Failed to fetch audit', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, []);

    const downloadCsv = () => {
        const params = new URLSearchParams({ ...filters, format: 'csv' });
        window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/audit?${params.toString()}`, '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
                    <p className="text-gray-400 text-sm">Admin actions and login events</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchLogs}
                        className="px-4 py-2 rounded-xl bg-zinc-800 border border-white/10 text-white flex items-center gap-2">
                        <RefreshCcw size={16} /> Refresh
                    </button>
                    <button
                        onClick={downloadCsv}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
                        <Download size={16} /> CSV
                    </button>
                </div>
            </div>

            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3">
                        <Filter size={16} className="text-gray-500" />
                        <input
                            placeholder="Action"
                            value={filters.action}
                            onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                            className="bg-transparent outline-none text-white py-2 w-full"
                        />
                    </div>
                    <input
                        placeholder="Actor ID"
                        value={filters.actor}
                        onChange={(e) => setFilters(prev => ({ ...prev, actor: e.target.value }))}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white"
                    />
                    <input
                        type="date"
                        value={filters.start}
                        onChange={(e) => setFilters(prev => ({ ...prev, start: e.target.value }))}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white"
                    />
                    <input
                        type="date"
                        value={filters.end}
                        onChange={(e) => setFilters(prev => ({ ...prev, end: e.target.value }))}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white"
                    />
                    <button
                        onClick={fetchLogs}
                        className="md:col-span-4 bg-white/5 border border-white/10 text-white py-2 rounded-xl font-semibold hover:border-red-500 transition">
                        Apply Filters
                    </button>
                </div>

                <div className="overflow-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="py-3">Time</th>
                                <th className="py-3">Action</th>
                                <th className="py-3">Actor</th>
                                <th className="py-3">Target</th>
                                <th className="py-3">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={5} className="py-6 text-center text-gray-400">Loading...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={5} className="py-6 text-center text-gray-500">No logs found</td></tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log._id} className="text-gray-200">
                                        <td className="py-3 text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                                        <td className="py-3 font-semibold">{log.action}</td>
                                        <td className="py-3">
                                            <div className="text-xs text-gray-300">{log.actor?.name || 'System'}</div>
                                            <div className="text-[11px] text-gray-500">{log.actor?.email}</div>
                                        </td>
                                        <td className="py-3 text-xs text-gray-300">{log.targetType || '-'} {log.targetId || ''}</td>
                                        <td className="py-3 text-xs text-gray-400">{log.ip || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
