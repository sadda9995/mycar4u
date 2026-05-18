'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Car, Calendar, MapPin, Search, Star, Zap, Shield, Clock, Menu, X, Settings, Smartphone, Key, ThumbsUp, CheckCircle, Quote, Compass, Sparkles } from 'lucide-react';
import api from '@/utils/api';
import Header from '@/components/Header';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [location, setLocation] = useState('');
  const [cities, setCities] = useState([]);
  const [showCityModal, setShowCityModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
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
      let url = '/cars?limit=6';
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
      <Header />

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
            Your Journey, Your <span className="text-red-600">Self-Drive</span> Freedom
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 md:mb-10 max-w-3xl px-4">
            From daily city commutes and family weekend road trips to premium corporate travel. Rent any car—from economical hatchbacks to luxury SUVs—100% online with low, fully refundable security deposits.
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

            <div className="flex-1 bg-black/40 rounded-xl px-4 py-3 border border-white/5 hover:border-white/20 transition cursor-pointer">
              <label className="block text-xs text-gray-400 mb-1 flex items-center"><Calendar className="h-3 w-3 mr-1" /> Start Date</label>
              <DatePicker
                  selected={startDate}
                  onChange={(date) => {
                      setStartDate(date);
                      if (date && endDate && endDate < date) setEndDate(null);
                  }}
                  showTimeSelect
                  timeIntervals={30}
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy HH:mm"
                  placeholderText="Start date & time"
                  className="w-full bg-transparent text-white outline-none font-medium placeholder-gray-500 cursor-pointer"
                  calendarClassName="bg-zinc-900 text-white border border-white/10 rounded-xl shadow-xl"
                  dayClassName={() => 'text-white'}
              />
            </div>

            <div className="flex-1 bg-black/40 rounded-xl px-4 py-3 border border-white/5 hover:border-white/20 transition cursor-pointer">
              <label className="block text-xs text-gray-400 mb-1 flex items-center"><Calendar className="h-3 w-3 mr-1" /> End Date</label>
              <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  showTimeSelect
                  timeIntervals={30}
                  minDate={startDate || new Date()}
                  dateFormat="dd/MM/yyyy HH:mm"
                  placeholderText="End date & time"
                  className="w-full bg-transparent text-white outline-none font-medium placeholder-gray-500 cursor-pointer"
                  calendarClassName="bg-zinc-900 text-white border border-white/10 rounded-xl shadow-xl"
                  dayClassName={() => 'text-white'}
              />
            </div>

            <button 
              onClick={() => {
                const params = new URLSearchParams();
                if (location) params.append('city', location);
                if (startDate) params.append('start', startDate.toISOString());
                if (endDate) params.append('end', endDate.toISOString());
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
              { icon: Shield, title: "Sanitized & Reliable Fleet", desc: "Whether you choose a budget hatchback or a premium SUV, every car is deeply detailed, safety-checked, and serviced to factory standards." },
              { icon: Zap, title: "Complete Self-Drive Privacy", desc: "No drivers, no hidden schedules. Enjoy complete privacy and the freedom to explore on your own terms. Your car, your rules." },
              { icon: Clock, title: "Refundable Deposit & Clear Pricing", desc: "Experience 100% price transparency. Fully refundable security deposits, zero hidden charges, and clear billing with no sudden convenience fees." }
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

        {/* How It Works */}
        <section id="how-it-works">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">How it <span className="text-red-600">Works</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Rent your perfect vehicle in three simple, fully digital steps. Our optimized platform gets you on the road faster.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[16.6%] right-[16.6%] h-0.5 bg-gradient-to-r from-red-600/0 via-red-600/50 to-red-600/0 -translate-y-1/2 z-0"></div>
            {[
              { icon: Smartphone, title: "1. Choose Your Match", desc: "Browse our diverse fleet of hatchbacks, sedans, SUVs, and premium models to find your perfect ride." },
              { icon: Key, title: "2. Secure Digital Check-in", desc: "Securely upload your Driving License and ID on our web platform for quick, automated verification." },
              { icon: ThumbsUp, title: "3. Doorstep Delivery & Go", desc: "Have the car delivered directly to your doorstep or pick it up from a nearby hub. Hit the road with 24/7 support." }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="h-20 w-20 bg-zinc-900 border-2 border-red-600/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(220,38,38,0.15)]">
                  <step.icon className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="font-bold text-xl text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Browse by Category */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Browse by Category</h2>
              <p className="text-gray-400">Find the perfect vehicle tailored for your daily commute, weekend getaways, or luxury business trips.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "SUVs", filter: "suv", image: "/categories/suv.png", glowColor: "from-blue-600/10 to-transparent", hoverBorder: "hover:border-blue-500/20" },
              { title: "Luxury", filter: "luxury", image: "/categories/luxury.png", glowColor: "from-red-600/10 to-transparent", hoverBorder: "hover:border-red-500/20" },
              { title: "Sedans", filter: "sedan", image: "/categories/sedan.png", glowColor: "from-purple-600/10 to-transparent", hoverBorder: "hover:border-purple-500/20" },
              { title: "Hatchbacks", filter: "hatchback", image: "/categories/hatchback.png", glowColor: "from-yellow-600/10 to-transparent", hoverBorder: "hover:border-yellow-500/20" }
            ].map((cat, i) => (
              <button 
                key={i}
                onClick={() => router.push(`/cars?type=${cat.filter}`)}
                className={`relative bg-zinc-900/30 border border-white/5 ${cat.hoverBorder} hover:bg-zinc-950/60 rounded-3xl p-6 h-64 flex flex-col items-center justify-between transition-all duration-500 group overflow-hidden cursor-pointer`}
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.glowColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0`}></div>
                
                {/* Image Wrapper with Float Effect */}
                <div className="relative w-full h-36 flex items-center justify-center z-10 transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-105">
                  <img 
                    src={cat.image} 
                    alt={cat.title} 
                    className="max-w-full max-h-full object-contain filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]"
                  />
                </div>

                {/* Info Text */}
                <div className="relative z-10 text-center w-full mt-2">
                  <span className="font-black text-sm text-gray-400 group-hover:text-white transition duration-300 tracking-wider uppercase">{cat.title}</span>
                  <div className="h-0.5 w-8 bg-red-600 mx-auto mt-2 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 2. Premium Fleet (Car Grid) */}
        <section id="fleet">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Our Self-Drive Fleet</h2>
              <p className="text-gray-400">Hand-selected, immaculate vehicles for every budget, passenger count, and road condition.</p>
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
                <div 
                  key={car._id} 
                  onClick={() => {
                    const url = `/cars/${car._id}${startDate && endDate ? `?start=${startDate.toISOString()}&end=${endDate.toISOString()}` : ''}`;
                    router.push(url);
                  }} 
                  className="group bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden hover:border-red-600/40 hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Image Area */}
                  <div className="h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center relative overflow-hidden">
                    {car.image && car.image.length > 0 ? (
                      <img 
                        src={car.image[0].startsWith('http') ? car.image[0] : `${process.env.NEXT_PUBLIC_API_URL || ''}${car.image[0]}`} 
                        alt={car.model} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Car className="h-20 w-20 text-zinc-700" />
                    )}
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
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const url = `/cars/${car._id}${startDate && endDate ? `?start=${startDate.toISOString()}&end=${endDate.toISOString()}` : ''}`;
                          router.push(url); 
                        }}
                        className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-colors shadow-lg cursor-pointer"
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



        {/* 4. Testimonials */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The Driver's Circle</h2>
            <p className="text-gray-400">What our self-drive community says about the Mycar4u experience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Arjun K.", role: "Office Commuter", text: "I rented a compact hatchback for my daily office commute while my personal vehicle was in the workshop. Super affordable, spotless, and incredibly fuel-efficient." },
              { name: "Sarah M.", role: "Family Explorer", text: "Booked a spacious 7-seater SUV for a weekend family road trip. The doorstep delivery was precisely on time, and the ride was exceptionally smooth." },
              { name: "Rahul D.", role: "Startup Founder", text: "Needed a premium sedan for an important corporate client meeting. Booked it in under 2 minutes. The online check-in is absolute magic." }
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
        <section className="relative bg-gradient-to-br from-zinc-900 to-black rounded-3xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between border border-white/10 overflow-hidden group">
          {/* Ambient Red Glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-red-600/10 rounded-full filter blur-[80px] pointer-events-none z-0"></div>
          
          <div className="max-w-xl mb-8 md:mb-0 relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">Ready to take the wheel?</h2>
            <p className="text-gray-300 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
              From quick daily errands to extraordinary interstate journeys, your perfect self-drive car is waiting. Book your next ride 100% digitally today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={() => router.push('/cars')}
                className="bg-white text-black px-8 py-4 rounded-xl font-black text-sm hover:bg-red-600 hover:text-white transition-all shadow-lg hover:shadow-red-900/30 cursor-pointer"
              >
                Browse Cars
              </button>
              <button 
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-white/10 transition cursor-pointer"
              >
                How It Works
              </button>
            </div>
          </div>

          {/* Decorative visual for Car */}
          <div className="relative w-80 h-48 md:w-[400px] md:h-[220px] z-10 transform hover:scale-105 transition duration-700 flex items-center justify-center pointer-events-none">
            <img 
              src="/categories/luxury.png" 
              alt="Luxury Sports Car Showcase" 
              className="max-w-full max-h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
            />
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
          <div>
            <h3 className="font-bold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-red-500 cursor-pointer"><a href="/#fleet">About</a></li>
              <li className="hover:text-red-500 cursor-pointer">Careers</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-red-500 cursor-pointer"><a href="/contact">Contact Us</a></li>
              <li className="hover:text-red-500 cursor-pointer"><a href="/contact">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-red-500 cursor-pointer"><a href="/terms-and-conditions">Terms & Conditions</a></li>
              <li className="hover:text-red-500 cursor-pointer"><a href="/privacy-policy">Privacy Policy</a></li>
              <li className="hover:text-red-500 cursor-pointer"><a href="/refund-and-cancellation">Refund & Cancellation</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
