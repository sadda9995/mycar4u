'use client';

import React, { useEffect } from 'react';
import api from '@/lib/api';
import {
    TrendingUp,
    Users,
    Car,
    AlertCircle,
    Clock,
    CheckCircle
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
    const [loading, setLoading] = React.useState(true);
    const [data, setData] = React.useState({
        totalRevenue: 0,
        activeRentals: 0,
        pendingIssues: 0,
        totalCustomers: 0,
        recentActivity: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard'); // Calls /api/dashboard
                setData(res.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Derived Stats for UI
    const stats = [
        { title: 'Total Revenue', value: `₹${data.totalRevenue.toLocaleString()}`, change: '+12%', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
        { title: 'Active Rentals', value: data.activeRentals, change: '+4', icon: Car, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Pending Issues', value: data.pendingIssues, change: '-2', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
        { title: 'Total Customers', value: data.totalCustomers, change: '+8%', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ];

    // Mock Chart Data (Frontend only for now)
    const chartData = [
        { name: 'Mon', revenue: 4000 },
        { name: 'Tue', revenue: 3000 },
        { name: 'Wed', revenue: 5000 },
        { name: 'Thu', revenue: 2780 },
        { name: 'Fri', revenue: 1890 },
        { name: 'Sat', revenue: 9390 },
        { name: 'Sun', revenue: 8490 },
    ];

    if (loading) return <div className="p-8 text-white">Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                <p className="text-gray-400 mt-1">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl hover:border-white/10 transition">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            {/* <span className="text-xs font-bold bg-green-900/30 text-green-400 px-2 py-1 rounded-full">
                                {stat.change}
                            </span> */}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                        <p className="text-sm text-gray-500">{stat.title}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Chart */}
                <div className="lg:col-span-2 bg-zinc-900/50 border border-white/5 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-white mb-6">Revenue Trends</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#dc2626" strokeWidth={3} dot={{ r: 4, fill: '#dc2626' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {data.recentActivity && data.recentActivity.length > 0 ? (
                            data.recentActivity.map((item, i) => (
                                <div key={i} className="flex items-start">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-red-600 mr-4 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm text-white font-medium">
                                            {item.car?.make} {item.car?.model} ({item.status})
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {item.user?.name || 'User'} • {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No recent activity</p>
                        )}
                    </div>
                    <button className="w-full mt-6 py-2 text-sm text-gray-400 hover:text-white border border-white/10 rounded-xl transition">
                        View All Activity
                    </button>
                </div>

            </div>
        </div>
    );
}
