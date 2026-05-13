'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Car, 
  Search, 
  Star, 
  Zap, 
  Shield, 
  MapPin, 
  Filter, 
  X, 
  ChevronDown, 
  ArrowRight,
  LogOut,
  Menu,
  Settings
} from 'lucide-react';
import api from '@/utils/api';

function CarsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || 'all',
    fuelType: searchParams.get('fuelType') || 'all',
    search: searchParams.get('search') || '',
    status: 'available'
  });

  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
      
      const preferredCity = localStorage.getItem('preferredCity');
      if (!filters.city && preferredCity) {
        setFilters(prev => ({ ...prev, city: preferredCity }));
      }
    }
    fetchCities();
  }, []);

  useEffect(() => {
    fetchCars();
  }, [filters.city, filters.type, filters.fuelType, filters.status, page]);

  const fetchCities = async () => {
    try {
      const res = await api.get('/cities');
      setCities(res.data.filter(c => c.isActive !== false));
    } catch (err) {
      console.error('Failed to load cities', err);
    }
  };

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.fuelType !== 'all') params.append('fuelType', filters.fuelType);
      if (filters.search) params.append('search', filters.search);
      params.append('status', filters.status);
      params.append('page', page);
      params.append('limit', 6);

      const res = await api.get(`/cars?${params.toString()}`);
      setCars(res.data.cars || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch cars', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCars();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const resetFilters = () => {
    setFilters({
      city: '',
      type: 'all',
      fuelType: 'all',
      search: '',
      status: 'available'
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-900 selection:text-white">
      {/* Navbar (Same as Home) */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 bg-black/80 backdrop-blur-md border-b border-white/10`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
              <Car className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-2xl font-bold tracking-tight text-white">Mycar4u</span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => router.push('/')} className="text-gray-300 hover:text-white text-sm font-medium transition">Home</button>
              <button onClick={() => router.push('/cars')} className="text-white text-sm font-medium transition underline underline-offset-8 decoration-red-600 decoration-2">Fleet</button>
              {user ? (
                <div className="flex items-center space-x-4 pl-6 border-l border-white/20">
                  <span className="text-sm font-medium">{user.name || user.mobile}</span>
                  <button onClick={() => router.push('/bookings')} className="text-sm text-gray-300 hover:text-white transition">My Bookings</button>
                  <button onClick={() => router.push('/settings')} className="text-gray-400 hover:text-white transition">
                    <Settings className="h-5 w-5" />
                  </button>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition"><LogOut className="h-5 w-5" /></button>
                </div>
              ) : (
                <div className="flex items-center space-x-4 pl-6 border-l border-white/20">
                  <button onClick={() => router.push('/login')} className="text-white font-medium hover:text-red-500 transition">Log In</button>
                  <button onClick={() => router.push('/login')} className="bg-red-600 text-white px-5 py-2.5 rounded-full hover:bg-red-700 transition font-medium">Sign Up</button>
                </div>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero / Header */}
      <div className="pt-24 pb-8 md:pt-32 md:pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-2 md:mb-4">Explore Our <span className="text-red-600">Premium Fleet</span></h1>
          <p className="text-sm md:text-base text-gray-400 max-w-2xl">Find the perfect vehicle for your next adventure. From rugged SUVs to sleek sedans, we have it all.</p>
        </div>
      </div>

      {/* Main Content: Filters + Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:w-64 space-y-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-red-500 mb-4 flex items-center">
                <Filter className="h-4 w-4 mr-2" /> Filters
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">City</label>
                  <select 
                    value={filters.city} 
                    onChange={(e) => setFilters({...filters, city: e.target.value})}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-red-600 outline-none transition"
                  >
                    <option value="">All Cities</option>
                    {cities.map(c => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">Car Type</label>
                  <div className="space-y-2">
                    {['all', 'Hatchback', 'Sedan', 'SUV', 'Luxury'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setFilters({...filters, type})}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition ${filters.type === type ? 'bg-red-600 text-white' : 'bg-zinc-900/50 text-gray-400 hover:bg-zinc-800'}`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">Fuel Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['all', 'Petrol', 'Diesel', 'EV', 'CNG'].map(fuel => (
                      <button 
                        key={fuel}
                        onClick={() => setFilters({...filters, fuelType: fuel})}
                        className={`px-3 py-2 rounded-xl text-xs transition ${filters.fuelType === fuel ? 'bg-zinc-700 text-white border-red-500 border' : 'bg-zinc-900/50 text-gray-500 border border-transparent'}`}
                      >
                        {fuel}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={resetFilters}
                className="w-full mt-8 text-xs text-gray-500 hover:text-red-500 transition underline underline-offset-4"
              >
                Reset All Filters
              </button>
            </div>
          </aside>

          {/* Results Area */}
          <div className="flex-1">
            {/* Search and Mobile Filter Toggle */}
            <div className="flex gap-2 mb-6 md:mb-8">
              <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                <input 
                  type="text"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-4 py-3 md:py-4 text-sm md:text-base focus:border-red-600 outline-none transition"
                />
              </form>
            </div>

            {/* Car Grid */}
            {loading ? (
              <div key="skeleton-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={`skeleton-item-${i}`} className="h-[400px] bg-zinc-900/50 rounded-3xl animate-pulse border border-white/5"></div>
                ))}
              </div>
            ) : cars.length === 0 ? (
              <div key="empty-grid" className="text-center py-24 bg-zinc-900/20 rounded-3xl border border-dashed border-white/10">
                <div className="bg-zinc-800 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">No cars found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                <button onClick={resetFilters} className="mt-6 text-red-500 font-bold hover:underline">Clear all filters</button>
              </div>
            ) : (
              <div key="real-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {cars.map((car) => (
                  <div 
                    key={car._id} 
                    className="group bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden hover:border-red-600/40 hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-500 flex flex-col"
                  >
                    <div className="h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center relative overflow-hidden">
                      {car.image && car.image.length > 0 ? (
                        <img 
                          src={car.image[0].startsWith('http') ? car.image[0] : `${process.env.NEXT_PUBLIC_API_URL || ''}${car.image[0]}`} 
                          alt={car.model} 
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                        />
                      ) : (
                        <Car className="h-20 w-20 text-zinc-700 group-hover:scale-110 transition-transform duration-700" />
                      )}
                      <div className="absolute bottom-4 left-4 flex gap-1">
                        <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded lowercase">
                          {car.type}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">{car.make}</p>
                          <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors">{car.model}</h3>
                        </div>
                        <div className="flex items-center bg-yellow-500/10 px-2 py-1 rounded-lg text-yellow-500 border border-yellow-500/20">
                          <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                          <span className="text-xs font-black">4.8</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-gray-500 mb-6 font-bold uppercase tracking-widest">
                        <span className="flex items-center"><Zap className="h-3 w-3 mr-1.5 text-red-600" /> {car.fuelType}</span>
                        <span className="flex items-center"><Shield className="h-3 w-3 mr-1.5 text-red-600" /> {car.seats} Seats</span>
                        <span className="flex items-center"><MapPin className="h-3 w-3 mr-1.5 text-red-600" /> {car.location?.city}</span>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-5 border-t border-white/5">
                        <div>
                          <span className="text-2xl font-black text-white">₹{car.pricePerDay}</span>
                          <span className="text-gray-500 text-[10px] ml-1 font-black uppercase">/ day</span>
                        </div>
                        <button 
                          onClick={() => router.push(`/cars/${car._id}`)}
                          className="bg-white text-black h-11 w-11 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-white/5"
                        >
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-4">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className={`px-4 py-2 rounded-xl border transition ${page === 1 ? 'border-white/5 text-gray-700 cursor-not-allowed' : 'border-white/10 text-white hover:border-red-600'}`}
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-bold transition ${page === i + 1 ? 'bg-red-600 text-white' : 'bg-zinc-900 text-gray-500 hover:text-white'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className={`px-4 py-2 rounded-xl border transition ${page === totalPages ? 'border-white/5 text-gray-700 cursor-not-allowed' : 'border-white/10 text-white hover:border-red-600'}`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Floating Filter Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[50] lg:hidden">
        <button 
          onClick={() => setShowFilters(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl shadow-red-900/40 flex items-center gap-2 active:scale-95 transition-transform"
        >
          <Filter className="h-4 w-4" /> Filters
          {(filters.city || filters.type !== 'all' || filters.fuelType !== 'all') && (
            <span className="bg-white text-red-600 w-5 h-5 rounded-full text-[10px] flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* Mobile Bottom Sheet Filter */}
      {showFilters && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)}></div>
          <div className="absolute bottom-0 left-0 w-full bg-zinc-900 rounded-t-[32px] p-6 animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-6"></div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 bg-zinc-800 rounded-full"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pb-6">
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase mb-3 block tracking-widest">City</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setFilters({...filters, city: ''})}
                    className={`px-4 py-2.5 rounded-xl text-sm transition ${!filters.city ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-400'}`}
                  >
                    All Cities
                  </button>
                  {cities.map(c => (
                    <button 
                      key={c._id}
                      onClick={() => setFilters({...filters, city: c.name})}
                      className={`px-4 py-2.5 rounded-xl text-sm transition ${filters.city === c.name ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-400'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold uppercase mb-3 block tracking-widest">Car Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'Hatchback', 'Sedan', 'SUV', 'Luxury'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setFilters({...filters, type})}
                      className={`px-2 py-2.5 rounded-xl text-xs transition ${filters.type === type ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-400'}`}
                    >
                      {type === 'all' ? 'All Types' : type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold uppercase mb-3 block tracking-widest">Fuel</label>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'Petrol', 'Diesel', 'EV', 'CNG'].map(fuel => (
                    <button 
                      key={fuel}
                      onClick={() => setFilters({...filters, fuelType: fuel})}
                      className={`px-2 py-2.5 rounded-xl text-xs transition ${filters.fuelType === fuel ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-400'}`}
                    >
                      {fuel === 'all' ? 'All' : fuel}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5">
              <button 
                onClick={() => { resetFilters(); setShowFilters(false); }}
                className="flex-1 py-4 text-gray-400 font-bold"
              >
                Reset
              </button>
              <button 
                onClick={() => setShowFilters(false)}
                className="flex-[2] bg-white text-black py-4 rounded-2xl font-bold active:scale-95 transition-transform"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CarsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-red-600 animate-pulse font-black text-2xl">MYCAR4U</div>}>
      <CarsContent />
    </Suspense>
  );
}
