'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Car, Calendar, MapPin, Search, Star, Zap, Shield, Clock, Menu, X, Settings } from 'lucide-react';
import api from '@/utils/api';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [location, setLocation] = useState('');
  const [cities, setCities] = useState([]);
  const [showCityModal, setShowCityModal] = useState(false);
  const [dates, setDates] = useState({
    start: '',
    end: ''
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    }
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const res = await api.get('/cities');
      const active = res.data.filter(c => c.isActive !== false);
      setCities(active);
      const stored = typeof window !== 'undefined' ? localStorage.getItem('preferredCity') : null;
      if (stored) {
        setLocation(stored);
        fetchCars(stored);
      } else if (active.length) {
        setShowCityModal(true);
      }
    } catch (err) {
      console.error('Failed to load cities', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async (cityName = location) => {
    try {
      let url = '/cars?limit=10';
      if (cityName) url += `&city=${encodeURIComponent(cityName)}`;
      const res = await api.get(url);
      setCars(res.data.cars || []);
    } catch (error) {
      console.error('Failed to fetch cars', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      if (typeof window !== 'undefined') localStorage.setItem('preferredCity', location);
      fetchCars(location);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-900 selection:text-white">
      {/* Navbar */}
      {/* Navbar */}
      <nav className={`absolute top-0 w-full z-50 transition-all duration-300 ${isMobileMenuOpen ? 'bg-black' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
              <Car className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-2xl font-bold tracking-tight text-white">Mycar4u</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => router.push('/')} className="text-gray-300 hover:text-white text-sm font-medium transition">Home</button>
              <button onClick={() => router.push('/cars')} className="text-gray-300 hover:text-white text-sm font-medium transition">Fleet</button>
              <button className="text-gray-300 hover:text-white text-sm font-medium transition">Offers</button>
              {user ? (
                <div className="flex items-center space-x-4 pl-6 border-l border-white/20">
                  <span className="text-sm font-medium">{user.name || user.mobile}</span>
                  <button
                    onClick={() => router.push('/bookings')}
                    className="text-sm text-gray-300 hover:text-white transition"
                  >
                    My Bookings
                  </button>
                  <button onClick={() => router.push('/settings')} className="text-gray-400 hover:text-white transition">
                    <Settings className="h-5 w-5" />
                  </button>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4 pl-6 border-l border-white/20">
                  <button onClick={() => router.push('/login')} className="text-white font-medium hover:text-red-500 transition">Log In</button>
                  <button
                    onClick={() => router.push('/login')}
                    className="bg-red-600 text-white px-5 py-2.5 rounded-full hover:bg-red-700 transition font-medium shadow-lg shadow-red-900/20"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 absolute w-full left-0 top-20 p-6 flex flex-col space-y-4 shadow-2xl">
            <button onClick={() => router.push('/')} className="text-left text-lg font-medium text-white py-2 border-b border-white/10">Home</button>
            <button onClick={() => router.push('/cars')} className="text-left text-lg font-medium text-white py-2 border-b border-white/10">Fleet</button>
            <button className="text-left text-lg font-medium text-white py-2 border-b border-white/10">Offers</button>
            {user ? (
              <>
                <div className="py-2 flex items-center justify-between border-b border-white/10">
                  <span className="text-lg font-medium text-gray-300">Hello, {user.name || user.mobile}</span>
                </div>
                <button onClick={() => router.push('/bookings')} className="text-left text-lg font-medium text-white py-2 border-b border-white/10">My Bookings</button>
                <button onClick={() => router.push('/settings')} className="text-left text-lg font-medium text-white py-2 border-b border-white/10 flex items-center">
                  <Settings className="h-5 w-5 mr-2" /> Settings
                </button>
                <button onClick={handleLogout} className="text-left text-lg font-medium text-red-500 py-2 flex items-center">
                  <LogOut className="h-5 w-5 mr-2" /> Log Out
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-4 pt-2">
                <button onClick={() => router.push('/login')} className="w-full bg-zinc-800 text-white py-3 rounded-xl font-bold">Log In</button>
                <button onClick={() => router.push('/login')} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-900/20">Sign Up</button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-[600px] h-auto md:h-[600px] flex flex-col pt-24 pb-12 md:pt-0 md:pb-0 md:justify-center items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1485291571150-772bcfc10da5?q=80&w=3000&auto=format&fit=crop"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-4 md:mb-6 leading-tight">
            Drive the <span className="text-red-600">Extraordinary</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 md:mb-10 max-w-2xl px-4">
            Premium car rentals for every journey. From city streets to mountain peaks, find your perfect ride today.
          </p>

          {/* Search Widget */}
          <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-black/40 rounded-xl px-4 py-3 border border-white/5 group hover:border-white/20 transition">
              <label className="block text-xs text-gray-400 mb-1 flex items-center"><MapPin className="h-3 w-3 mr-1" /> City</label>
              <select
                className="w-full bg-transparent text-white outline-none font-medium appearance-none cursor-pointer"
                value={location}
                onChange={(e) => {
                  const city = e.target.value;
                  setLocation(city);
                  if (typeof window !== 'undefined') localStorage.setItem('preferredCity', city);
                  fetchCars(city);
                }}
              >
                {cities.map(c => (
                  <option key={c._id} value={c.name} className="bg-zinc-900">{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 bg-black/40 rounded-xl px-4 py-3 border border-white/5 hover:border-white/20 transition">
              <label className="block text-xs text-gray-400 mb-1 flex items-center"><Calendar className="h-3 w-3 mr-1" /> Start Date</label>
              <input
                type="datetime-local"
                className="w-full bg-transparent text-white outline-none font-medium appearance-none [&::-webkit-calendar-picker-indicator]:invert"
                onChange={(e) => setDates({ ...dates, start: e.target.value })}
              />
            </div>

            <div className="flex-1 bg-black/40 rounded-xl px-4 py-3 border border-white/5 hover:border-white/20 transition">
              <label className="block text-xs text-gray-400 mb-1 flex items-center"><Calendar className="h-3 w-3 mr-1" /> End Date</label>
              <input
                type="datetime-local"
                className="w-full bg-transparent text-white outline-none font-medium appearance-none [&::-webkit-calendar-picker-indicator]:invert"
                onChange={(e) => setDates({ ...dates, end: e.target.value })}
              />
            </div>

            <button 
              onClick={() => {
                const params = new URLSearchParams();
                if (location) params.append('city', location);
                router.push(`/cars?${params.toString()}`);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-lg flex items-center justify-center transition shadow-lg shadow-red-900/30"
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 md:px-8 space-y-24">
        {(!loading && cars.length === 0) && (
          <div className="bg-red-900/10 border border-red-500/20 text-red-100 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between">
            <div>
              <p className="text-lg font-bold">No cars in {location || 'your city'} yet.</p>
              <p className="text-sm text-red-200/80 mt-1">Choose another city to see available cars.</p>
            </div>
            <button
              onClick={() => setShowCityModal(true)}
              className="mt-3 md:mt-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold"
            >
              Change City
            </button>
          </div>
        )}

        {/* 1. Value Props / Features */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Verified Cars", desc: "Every car is inspected for safety & hygiene." },
              { icon: Zap, title: "Instant Booking", desc: "Book in 3 clicks. No waiting, no paperwork." },
              { icon: Clock, title: "24/7 Support", desc: "Round-the-clock roadside assistance." }
            ].map((f, i) => (
              <div key={i} className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 flex items-start space-x-4 hover:bg-zinc-900 transition duration-300">
                <div className="bg-red-600/10 p-3 rounded-xl text-red-500">
                  <f.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-1">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Premium Fleet (Car Grid) */}
        <section id="fleet">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Premium Fleet</h2>
              <p className="text-gray-400">Choose from our curated collection of luxury and sport vehicles.</p>
            </div>
            <div className="flex overflow-x-auto pb-2 md:pb-0 space-x-2 w-full md:w-auto no-scrollbar">
              <button 
                onClick={() => router.push('/cars')}
                className="px-6 py-2.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition text-sm font-bold shadow-lg shadow-red-900/20 whitespace-nowrap flex items-center"
              >
                View All Cars
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.map((car) => (
                <div key={car._id} className="group bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden hover:border-red-600/40 hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-300 flex flex-col">
                  {/* Image Area */}
                  <div className="h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center relative overflow-hidden">
                    <Car className="h-20 w-20 text-zinc-700 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 shadow-lg">
                      {car.transmission}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">{car.make}</p>
                        <h3 className="text-xl font-bold text-white">{car.model}</h3>
                      </div>
                      <div className="flex items-center bg-yellow-500/10 px-2 py-1 rounded text-yellow-500">
                        <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                        <span className="text-xs font-bold">4.8</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500 mb-6 uppercase tracking-wide">
                      <div className="flex items-center"><Zap className="h-3 w-3 mr-2 text-gray-600" /> {car.fuelType}</div>
                      <div className="flex items-center"><Shield className="h-3 w-3 mr-2 text-gray-600" /> {car.seats} Seats</div>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                      <div>
                        <span className="text-2xl font-bold text-white">₹{car.pricePerDay}</span>
                        <span className="text-gray-500 text-xs ml-1 font-medium">/ day</span>
                      </div>
                      <button
                        onClick={() => router.push(`/cars/${car._id}`)}
                        className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-colors shadow-lg"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. How It Works */}
        <section className="bg-zinc-900/20 rounded-3xl p-8 md:p-12 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400">Start your journey in minutes</p>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Choose Your Car", desc: "Select from our range of premium vehicles." },
              { step: "02", title: "Book & Pay", desc: "Select dates and pay securely online." },
              { step: "03", title: "Zoom Away", desc: "Pick up your car and enjoy the ride." }
            ].map((s, i) => (
              <div key={i} className="text-center relative">
                <div className="text-6xl font-black text-white/5 absolute -top-8 left-1/2 -translate-x-1/2">{s.step}</div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-900/20 text-xl font-bold">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Testimonials */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Loved by Thousands</h2>
            <p className="text-gray-400">Don't just take our word for it.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Arjun K.", role: "Road Tripper", text: "The car was in mint condition. The booking process was seamless. Highly recommended!" },
              { name: "Sarah M.", role: "Daily Commuter", text: "Best rental service in Bangalore. Customer support is super responsive." },
              { name: "Rahul D.", role: "Business Traveler", text: "Premium cars at affordable rates. Will definitely book again for my next trip." }
            ].map((t, i) => (
              <div key={i} className="bg-zinc-900/30 p-8 rounded-2xl border border-white/5 relative">
                <div className="flex text-yellow-500 mb-4">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-gray-300 italic mb-6">"{t.text}"</p>
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-gray-500 text-sm">
                    {t.name[0]}
                  </div>
                  <div className="ml-3">
                    <p className="font-bold text-sm text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. CTA Banner */}
        <section className="bg-gradient-to-r from-red-900 to-black rounded-3xl p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between border border-white/10">
          <div className="max-w-xl mb-8 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to hit the road?</h2>
            <p className="text-red-100 text-lg mb-8">Download our app for exclusive deals and faster bookings.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition flex items-center justify-center">
                Download App
              </button>
              <button className="border border-white/30 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition">
                View Offers
              </button>
            </div>
          </div>

          {/* Decorative visual for App */}
          <div className="relative w-64 h-64 bg-black/40 rounded-3xl border border-white/10 flex items-center justify-center rotate-3 transform hover:rotate-0 transition duration-500">
            <span className="text-gray-500 font-mono text-sm">App Mockup</span>
          </div>
        </section>

      </main>

      {showCityModal && cities.length > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-2">Choose your city</h3>
            <p className="text-gray-400 text-sm mb-4">We’ll show cars available in your city first.</p>
            <div className="space-y-2 mb-4">
              {cities.map((c) => (
                <button
                  key={c._id}
                  onClick={() => { setLocation(c.name); setShowCityModal(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition ${location === c.name ? 'border-red-500 bg-red-500/10 text-white' : 'border-white/10 text-gray-200 hover:border-white/30'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                if (!location && cities[0]) setLocation(cities[0].name);
                setShowCityModal(false);
              }}
              className="w-full text-sm text-gray-400 hover:text-white"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Car className="h-6 w-6 text-red-600" />
              <span className="ml-2 text-xl font-bold text-white">Mycar4u</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Premium car rental service designed for the modern traveler. Comfort, Safety, and Style.
            </p>
          </div>
          {['Company', 'Support', 'Legal'].map((head) => (
            <div key={head}>
              <h3 className="font-bold text-white mb-4">{head}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                {['About', 'Careers', 'Contact'].map(i => <li key={i} className="hover:text-red-500 cursor-pointer">{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
