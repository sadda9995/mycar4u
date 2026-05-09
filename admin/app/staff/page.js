'use client';

import React from 'react';
import { UserPlus, Mail, Phone, Shield, Save, MapPin, Copy } from 'lucide-react';

import api from '@/lib/api';

export default function StaffManagement() {
    const [staff, setStaff] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [form, setForm] = React.useState({ name: '', mobile: '', email: '', role: 'office_staff', cityId: '', officeId: '' });
    const [cities, setCities] = React.useState([]);
    const [offices, setOffices] = React.useState([]);
    const [inviteLink, setInviteLink] = React.useState('');
    const [selfRole, setSelfRole] = React.useState('');
    const [selfCity, setSelfCity] = React.useState('');
    const [selfOffice, setSelfOffice] = React.useState('');

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            const filtered = !selfRole ? res.data
                : selfRole === 'super_admin'
                    ? res.data
                    : selfRole === 'city_admin'
                        ? res.data.filter(u => (u.cityId?._id || u.cityId) === selfCity)
                        : res.data.filter(u => u.officeId && (u.officeId._id || u.officeId) === selfOffice);
            setStaff(filtered);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCitiesOffices = async () => {
        try {
            const [c, o] = await Promise.all([api.get('/cities'), api.get('/offices')]);
            const activeCities = c.data.filter(city => city.isActive !== false);
            setCities(activeCities);
            setOffices(o.data);
            if (!form.cityId && activeCities.length) setForm(prev => ({ ...prev, cityId: activeCities[0]._id }));
        } catch (err) {
            console.error('Error fetching cities/offices', err);
        }
    };

    React.useEffect(() => {
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
            try {
                const u = JSON.parse(userRaw);
                setSelfRole(u.role);
                setSelfCity(u.cityId?._id || u.cityId || '');
                setSelfOffice(u.officeId?._id || u.officeId || '');
                if (u.cityId) setForm(prev => ({ ...prev, cityId: u.cityId._id || u.cityId }));
            } catch { }
        }
        fetchCitiesOffices();
    }, []);

    React.useEffect(() => {
        fetchUsers();
    }, [selfRole, selfCity, selfOffice]);

    const saveUser = async () => {
        if (!form.email) return alert('Email is required for invite');
        try {
            const payload = { ...form };
            if (selfRole === 'city_admin') {
                payload.cityId = selfCity;
                if (payload.role === 'super_admin') payload.role = 'city_admin';
            }
            const res = await api.post('/auth/invite', payload);
            setInviteLink(res.data.activationLink);
            setIsModalOpen(false);
            setForm({ name: '', mobile: '', email: '', role: 'office_staff', cityId: '', officeId: '' });
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to add staff');
        }
    };

    const updateRole = async (id, role) => {
        if (selfRole !== 'super_admin') return alert('Only super admin can change roles');
        try {
            await api.put(`/users/${id}`, { role });
            setStaff(prev => prev.map(u => u._id === id ? { ...u, role } : u));
        } catch (err) {
            console.error(err);
            alert('Failed to update role');
        }
    };

    if (loading) return <div className="p-8 text-white">Loading staff...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Staff Management</h1>
                    <p className="text-gray-400 mt-1">Manage access and roles for your team</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={selfRole === 'office_staff'}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-red-900/20 transition disabled:opacity-50">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Add New Staff
                </button>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-900 border-b border-white/5 text-gray-400 font-medium text-sm uppercase">
                        <tr>
                            <th className="p-6">Name</th>
                            <th className="p-6">Role</th>
                            <th className="p-6">City</th>
                            <th className="p-6">Office</th>
                            <th className="p-6">Contact</th>
                            <th className="p-6">Status</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {staff.map((s) => (
                            <tr key={s._id} className="hover:bg-white/5 transition">
                                <td className="p-6">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-gray-400 mr-4">
                                            {s.name ? s.name[0] : 'U'}
                                        </div>
                                        <span className="font-bold text-white">{s.name || 'Unknown User'}</span>
                                    </div>
                                </td>
                                <td className="p-6">
                            <div className="flex items-center text-sm text-gray-300">
                                <Shield className="h-4 w-4 mr-2 text-red-500" />
                                <select
                                    value={s.role}
                                    onChange={(e) => updateRole(s._id, e.target.value)}
                                    disabled={selfRole !== 'super_admin'}
                                    className="bg-transparent border border-white/10 rounded-lg px-3 py-1 text-white text-sm disabled:opacity-50">
                                    <option value="super_admin">SUPER ADMIN</option>
                                    <option value="city_admin">CITY ADMIN</option>
                                    <option value="office_staff">OFFICE STAFF</option>
                                    <option value="user">USER</option>
                                </select>
                            </div>
                                </td>
                                <td className="p-6 text-sm text-gray-300">{s.cityId?.name || ''}</td>
                                <td className="p-6 text-sm text-gray-300">{s.officeId?.name || ''}</td>
                                <td className="p-6">
                                    <div className="space-y-1 text-sm text-gray-400">
                                        {s.email && <div className="flex items-center"><Mail className="h-3 w-3 mr-2" /> {s.email}</div>}
                                        <div className="flex items-center"><Phone className="h-3 w-3 mr-2" /> {s.mobile}</div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.isVerified ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                        }`}>
                                        {s.isVerified ? 'Verified' : 'Pending'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Add Staff</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <input
                            type="text"
                            placeholder="Name"
                            value={form.name}
                            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Mobile"
                            value={form.mobile}
                            onChange={(e) => setForm(prev => ({ ...prev, mobile: e.target.value }))}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                        />
                        <input
                            type="email"
                            placeholder="Email (required for invite)"
                            value={form.email}
                            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                            required
                        />
                        <select
                            value={form.role}
                            onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                            disabled={selfRole === 'city_admin'}>
                            {selfRole === 'super_admin' && <option value="super_admin">Super Admin</option>}
                            <option value="city_admin">City Admin</option>
                            <option value="office_staff">Office Staff</option>
                        </select>
                        <select
                            value={form.cityId}
                            onChange={(e) => setForm(prev => ({ ...prev, cityId: e.target.value, officeId: '' }))}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                            disabled={selfRole === 'city_admin'}>
                            <option value="">Select City</option>
                            {cities.map(city => (
                                <option key={city._id} value={city._id}>{city.name}</option>
                            ))}
                        </select>
                        <select
                            value={form.officeId}
                            onChange={(e) => setForm(prev => ({ ...prev, officeId: e.target.value }))}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none">
                            <option value="">Select Office (optional)</option>
                            {offices.filter(o => !form.cityId || o.cityId === form.cityId || o.cityId?._id === form.cityId).map(o => (
                                <option key={o._id} value={o._id}>{o.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={saveUser}
                            disabled={selfRole === 'office_staff'}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold flex items-center justify-center disabled:opacity-50">
                            <Save className="h-5 w-5 mr-2" />
                            Save Staff
                        </button>
                    </div>
                </div>
            )}

            {inviteLink && (
                <div className="fixed bottom-6 right-6 bg-zinc-900 border border-white/10 rounded-xl p-6 shadow-2xl text-sm text-white max-w-md animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <p className="font-bold text-lg text-red-500">Staff Invited Successfully</p>
                        <button onClick={() => setInviteLink('')} className="text-gray-500 hover:text-white transition">✕</button>
                    </div>
                    <p className="text-gray-400 mb-3">Copy and share this activation link with the staff member:</p>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-black/40 border border-white/10 rounded-lg p-3 break-all text-xs font-mono text-gray-300 flex-1">
                            {inviteLink}
                        </div>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(inviteLink);
                                alert('Link copied to clipboard!');
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-all active:scale-95 shadow-lg shadow-red-900/20"
                            title="Copy Link"
                        >
                            <Copy className="h-5 w-5" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500">
                        This link allows the staff member to set their password and activate their account.
                    </p>
                </div>
            )}
        </div>
    );
}
