'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    User, Shield, CreditCard, Bell, ChevronRight, 
    ArrowLeft, LogOut, Check, Save, Zap, HelpCircle,
    Calendar, Clock, Car, Fuel as FuelIcon, Gauge as GaugeIcon, 
    Droplet, Image as ImageIcon, Star
} from 'lucide-react';
import api from '@/utils/api';
import Header from '@/components/Header';

export default function AccountDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('bookings');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Profile State
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        mobile: ''
    });

    // Bookings State
    const [bookings, setBookings] = useState([]);
    const [bookingFilter, setBookingFilter] = useState('all'); // all, active, completed
    const [bookingsLoading, setBookingsLoading] = useState(true);

    // Razorpay Info (Mock or fetched)
    const [razorpayKey, setRazorpayKey] = useState('rzp_test_*******');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (userData && token) {
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

        // Read query parameter for default active tab safely
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            if (tab) setActiveTab(tab);
        }
    }, []);

    // Fetch Bookings when tab is active
    useEffect(() => {
        if (!user) return;
        
        const fetchBookings = async () => {
            setBookingsLoading(true);
            try {
                const res = await api.get('/bookings/my');
                setBookings(res.data);
            } catch (error) {
                console.error('Failed to fetch bookings', error);
                if (error.response?.status === 401) {
                    router.push('/login?redirectTo=/settings?tab=bookings');
                }
            } finally {
                setBookingsLoading(false);
            }
        };

        if (activeTab === 'bookings') {
            fetchBookings();
        }
    }, [activeTab, user]);

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

    const filteredBookings = bookings.filter(b => {
        if (bookingFilter === 'all') return true;
        const isPast = new Date(b.endTime) < new Date();
        if (bookingFilter === 'active') return !isPast && b.status !== 'cancelled';
        if (bookingFilter === 'completed') return isPast;
        return true;
    });

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
        </div>
    );

    const tabs = [
        { id: 'bookings', label: 'My Bookings', icon: Calendar },
        { id: 'profile', label: 'Profile Details', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        user?.role === 'admin' && { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ].filter(Boolean);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-900 font-sans pb-24 md:pb-0">
            {/* Header */}
            <Header />

            <main className="max-w-7xl mx-auto p-4 md:p-8 lg:p-10 flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 space-y-2 flex-shrink-0">
                    <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-5 mb-6 text-center">
                        <div className="h-16 w-16 bg-gradient-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center text-xl font-black shadow-lg shadow-red-600/20 mx-auto mb-3">
                            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <h3 className="font-extrabold text-white text-base truncate">{user?.name || 'User'}</h3>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email || user?.mobile}</p>
                    </div>

                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer ${
                                activeTab === tab.id 
                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/20 font-bold' 
                                : 'text-gray-400 hover:bg-white/5 hover:text-white font-medium'
                            }`}
                        >
                            <div className="flex items-center">
                                <tab.icon className={`h-5 w-5 mr-3 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`} />
                                <span className="text-sm">{tab.label}</span>
                            </div>
                            {activeTab === tab.id && <ChevronRight className="h-4 w-4" />}
                        </button>
                    ))}
                    
                    <div className="pt-4 mt-4 border-t border-white/10">
                        <button 
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('user');
                                router.push('/login');
                            }}
                            className="w-full flex items-center p-3.5 rounded-2xl text-gray-500 hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer font-medium"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            <span className="text-sm">Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Content Panel */}
                <div className="flex-1 bg-zinc-900/30 border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden min-h-[500px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[120px] pointer-events-none"></div>
                    
                    {/* tab: bookings */}
                    {activeTab === 'bookings' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-5 gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">My Bookings</h2>
                                    <p className="text-gray-400 text-xs md:text-sm">View and track all your premium vehicle booking history.</p>
                                </div>
                                
                                {/* Inner Filters */}
                                <div className="flex space-x-1.5 bg-black/40 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
                                    {['all', 'active', 'completed'].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setBookingFilter(f)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                                                bookingFilter === f 
                                                ? 'bg-red-600 text-white shadow-md' 
                                                : 'text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {bookingsLoading ? (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {filteredBookings.map((booking) => (
                                        <div key={booking._id} className="bg-black/30 border border-white/5 rounded-2xl p-5 md:p-6 hover:border-white/10 transition group">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                                                <div className="flex items-start space-x-4">
                                                    <div className="h-16 w-16 bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center relative flex-shrink-0 border border-white/5">
                                                        {booking.car?.image && booking.car.image.length > 0 ? (
                                                            <img 
                                                                src={booking.car.image[0].startsWith('http') ? booking.car.image[0] : `${process.env.NEXT_PUBLIC_API_URL || ''}${booking.car.image[0]}`} 
                                                                alt={booking.car.model} 
                                                                className="w-full h-full object-cover" 
                                                            />
                                                        ) : (
                                                            <Car className="h-8 w-8 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-extrabold text-base md:text-lg">{booking.car ? `${booking.car.make} ${booking.car.model}` : 'Unknown Car'}</h3>
                                                        {booking.car?.registrationNumber && (
                                                            <p className="text-[10px] text-gray-400 font-mono bg-zinc-800 px-2 py-0.5 rounded inline-block mt-1 uppercase tracking-wider">
                                                                {booking.car.registrationNumber}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-left sm:text-right flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto border-t sm:border-0 border-white/5 pt-3 sm:pt-0">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                                        booking.status === 'confirmed' ? 'bg-green-400/10 text-green-400' : 'bg-gray-400/10 text-gray-400'
                                                    }`}>
                                                        {booking.status}
                                                    </span>
                                                    <p className="mt-1.5 text-lg font-black text-white">₹{booking.totalAmount}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/40 rounded-xl p-4 border border-white/5">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Start Trip</p>
                                                    <div className="flex items-center text-sm font-semibold">
                                                        <Calendar className="h-4 w-4 mr-2 text-red-500" />
                                                        {new Date(booking.startTime).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">End Trip</p>
                                                    <div className="flex items-center text-sm font-semibold">
                                                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                                        {new Date(booking.endTime).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="sm:col-span-2 pt-3 border-t border-white/5 flex items-center justify-between">
                                                    <span className="text-[11px] text-gray-500 font-mono">Booking ID: {booking.bookingId}</span>
                                                    <button 
                                                        onClick={() => {
                                                            const text = `Hello! I need help with my booking (ID: ${booking.bookingId}) for the ${booking.car ? `${booking.car.make} ${booking.car.model}` : 'vehicle'}.`;
                                                            window.open(`https://wa.me/919876543210?text=${encodeURIComponent(text)}`, '_blank');
                                                        }}
                                                        className="text-xs text-red-500 hover:text-red-400 font-bold transition cursor-pointer"
                                                    >
                                                        Need Help?
                                                    </button>
                                                </div>
                                                
                                                {/* Operations Summary (Odometer, Fuel, damage) */}
                                                {(booking.startOdometer || booking.endOdometer || booking.startFuelLevel || booking.endFuelLevel || booking.startCleanliness || booking.endCleanliness || booking.lateReturnHours || booking.extraKmFee || booking.lateFee) && (
                                                    <div className="sm:col-span-2 bg-black/40 rounded-xl p-4 space-y-3 border border-white/5 mt-2">
                                                        <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-wider text-gray-400">
                                                            <span className="flex items-center gap-1.5"><GaugeIcon className="h-4 w-4 text-red-500" /> Ride Operations</span>
                                                            <span className="text-gray-600 font-normal">Logged at return</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-200">
                                                            <div className="bg-zinc-900/50 rounded-lg p-2.5">
                                                                <p className="text-[10px] text-gray-500">Start Odo</p>
                                                                <p className="font-bold mt-0.5">{booking.startOdometer ?? '-'}</p>
                                                            </div>
                                                            <div className="bg-zinc-900/50 rounded-lg p-2.5">
                                                                <p className="text-[10px] text-gray-500">End Odo</p>
                                                                <p className="font-bold mt-0.5">{booking.endOdometer ?? '-'}</p>
                                                            </div>
                                                            <div className="bg-zinc-900/50 rounded-lg p-2.5 flex items-center gap-2">
                                                                <Droplet className="h-4 w-4 text-blue-400 flex-shrink-0" />
                                                                <div>
                                                                    <p className="text-[10px] text-gray-500">Fuel Out/In</p>
                                                                    <p className="font-bold mt-0.5">{booking.startFuelLevel ?? '-'}% → {booking.endFuelLevel ?? '-' }%</p>
                                                                </div>
                                                            </div>
                                                            <div className="bg-zinc-900/50 rounded-lg p-2.5">
                                                                <p className="text-[10px] text-gray-500">Cleanliness</p>
                                                                <p className="font-bold mt-0.5">{booking.startCleanliness || '-'} → {booking.endCleanliness || '-'}</p>
                                                            </div>
                                                            <div className="bg-zinc-900/50 rounded-lg p-2.5">
                                                                <p className="text-[10px] text-gray-500">Late Hours</p>
                                                                <p className="font-bold mt-0.5">{booking.lateReturnHours || 0}h</p>
                                                            </div>
                                                            <div className="bg-zinc-900/50 rounded-lg p-2.5">
                                                                <p className="text-[10px] text-gray-500">Extra KM Fee</p>
                                                                <p className="font-bold mt-0.5 text-red-400">₹{booking.extraKmFee || 0}</p>
                                                            </div>
                                                            <div className="bg-zinc-900/50 rounded-lg p-2.5">
                                                                <p className="text-[10px] text-gray-500">Late Fee</p>
                                                                <p className="font-bold mt-0.5 text-red-400">₹{booking.lateFee || 0}</p>
                                                            </div>
                                                        </div>
                                                        {booking.damagePhotos?.length > 0 && (
                                                            <div className="pt-3 border-t border-white/5">
                                                                <p className="text-[10px] uppercase font-black tracking-wider text-gray-500 mb-2 flex items-center gap-1.5"><ImageIcon className="h-4 w-4 text-red-500" /> Damage Photos</p>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    {booking.damagePhotos.map((url, idx) => (
                                                                        <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-white/10 bg-black">
                                                                            <img src={url} alt="damage" className="h-full w-full object-cover" />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {filteredBookings.length === 0 && (
                                        <div className="text-center py-20 bg-black/20 rounded-3xl border border-dashed border-zinc-800">
                                            <Car className="h-12 w-12 text-zinc-700 mx-auto mb-4 animate-bounce" />
                                            <h3 className="text-gray-400 font-bold">No bookings found</h3>
                                            <button onClick={() => router.push('/')} className="mt-4 text-sm text-red-500 hover:underline font-bold">Start a new journey</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* tab: profile */}
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="border-b border-white/5 pb-5">
                                <h2 className="text-2xl font-bold mb-1">Profile Details</h2>
                                <p className="text-gray-400 text-xs md:text-sm">Manage your account's public profile and contact info.</p>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-red-600 focus:bg-black outline-none transition font-semibold text-sm"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Email Address</label>
                                        <input 
                                            type="email" 
                                            value={profileData.email}
                                            disabled
                                            className="w-full bg-black/30 border border-white/5 text-gray-500 rounded-xl px-4 py-3 outline-none cursor-not-allowed font-semibold text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mobile Number</label>
                                        <input 
                                            type="tel" 
                                            value={profileData.mobile}
                                            onChange={(e) => setProfileData({...profileData, mobile: e.target.value})}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-red-600 focus:bg-black outline-none transition font-semibold text-sm"
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/5">
                                    <button 
                                        type="submit"
                                        disabled={saving}
                                        className="bg-white text-black px-8 py-3.5 rounded-xl font-black text-sm hover:bg-red-600 hover:text-white transition-all flex items-center shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                                    >
                                        {saving ? <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div> : <Save className="h-5 w-5 mr-2" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* tab: payments */}
                    {activeTab === 'payments' && user?.role === 'admin' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="border-b border-white/5 pb-5">
                                <h2 className="text-2xl font-bold mb-1">Payment Gateway Configuration</h2>
                                <p className="text-gray-400 text-xs md:text-sm">View and manage your payment gateway settings.</p>
                            </div>

                            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 bg-blue-600/20 rounded-xl flex items-center justify-center mr-4">
                                            <Zap className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm md:text-base">Razorpay Integration</h3>
                                            <p className="text-xs text-green-500 flex items-center font-black uppercase tracking-wider mt-0.5">
                                                <Check className="h-3.5 w-3.5 mr-1" /> Connected
                                            </p>
                                        </div>
                                    </div>
                                    <button className="text-xs font-black text-red-500 hover:text-red-400 transition underline cursor-pointer self-start sm:self-auto">Manage on Razorpay</button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Public Key (Key ID)</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={razorpayKey}
                                            readOnly
                                            className="flex-1 bg-black/30 border border-white/5 text-gray-500 rounded-xl px-4 py-3 font-mono text-sm"
                                        />
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(razorpayKey);
                                                showToast('Key copied to clipboard');
                                            }}
                                            className="bg-white/5 border border-white/10 px-4 rounded-xl text-xs font-bold hover:bg-white/10 transition cursor-pointer"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-600 mt-1 flex items-center">
                                        <HelpCircle className="h-3.5 w-3.5 mr-1 text-gray-600" /> This key is used for client-side payment initiation.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-red-900/10 border border-red-900/20 rounded-2xl p-6">
                                <h4 className="text-red-500 font-bold mb-2 text-sm uppercase tracking-wider">Security Warning</h4>
                                <p className="text-gray-400 text-xs leading-relaxed">
                                    Your Secret Key is never exposed in the frontend for compliance and safety. It is securely stored in your server environment variables (.env). To rotate keys, please contact engineering.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* tab: security */}
                    {activeTab === 'security' && (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in duration-500">
                            <Shield className="h-16 w-16 text-zinc-700 mb-2 animate-pulse" />
                            <h3 className="text-xl font-bold">Security Settings</h3>
                            <p className="text-gray-500 max-w-xs mx-auto text-sm">Password updates and multi-factor authentication are coming soon in the next system release.</p>
                        </div>
                    )}

                    {/* tab: notifications */}
                    {activeTab === 'notifications' && (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in duration-500">
                            <Bell className="h-16 w-16 text-zinc-700 mb-2 animate-pulse" />
                            <h3 className="text-xl font-bold">Notification Preferences</h3>
                            <p className="text-gray-500 max-w-xs mx-auto text-sm">Customize how you receive SMS, email, and billing receipts for your active rentals.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Toast Notifications */}
            {toast && (
                <div className={`fixed bottom-10 right-10 px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border animate-in slide-in-from-right-10 z-50 ${
                    toast.type === 'success' ? 'bg-zinc-900 border-green-500/30 text-green-500' : 'bg-zinc-900 border-red-500/30 text-red-500'
                }`}>
                    {toast.type === 'success' ? <Check className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                    <span className="font-bold text-sm">{toast.msg}</span>
                </div>
            )}
        </div>
    );
}
