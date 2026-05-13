'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Car, Zap, IndianRupee, Trash2, Edit } from 'lucide-react';

import api from '@/lib/api';
import CarModal from '@/components/CarModal';

export default function Fleet() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCar, setCurrentCar] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        fuelType: 'all',
        type: 'all'
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCars();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, filters]);

    const fetchCars = async () => {
        setLoading(true);
        try {
            let query = '/cars?';
            if (search) query += `search=${search}&`;
            if (filters.status !== 'all') query += `status=${filters.status}&`;
            if (filters.fuelType !== 'all') query += `fuelType=${filters.fuelType}&`;
            if (filters.type !== 'all') query += `type=${filters.type}&`;

            const res = await api.get(query);
            // The API returns { cars: [], total: 0, ... }
            setCars(res.data.cars || res.data || []);
        } catch (error) {
            console.error('Error fetching cars:', error);
            setCars([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (carData) => {
        try {
            if (currentCar) {
                await api.put(`/cars/${currentCar._id}`, carData);
            } else {
                await api.post('/cars', carData);
            }
            setIsModalOpen(false);
            fetchCars();
        } catch (error) {
            console.error('Error saving car:', error);
            alert('Failed to save car');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this car?')) return;
        try {
            await api.delete(`/cars/${id}`);
            fetchCars();
        } catch (error) {
            console.error('Error deleting car:', error);
        }
    };

    const openAddModal = () => {
        setCurrentCar(null);
        setIsModalOpen(true);
    };

    const openEditModal = (car) => {
        setCurrentCar(car);
        setIsModalOpen(true);
    };

    // Removed initial fetchCars from here as it's covered by the useEffect dependency on search/filters (initial render + debounce)
    // However, initial render has empty search/filters, so it will fetch.

    if (loading && cars.length === 0 && !search) return <div className="p-8 text-white">Loading fleet...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Fleet Management</h1>
                    <p className="text-gray-400 mt-1">Track and manage your vehicle inventory</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-red-900/20 transition"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Car
                </button>
            </div>

            {/* Filters */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search Make, Model..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-red-500 outline-none"
                    />
                </div>
                <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-red-500 outline-none"
                >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                </select>
                <select
                    value={filters.fuelType}
                    onChange={(e) => setFilters(prev => ({ ...prev, fuelType: e.target.value }))}
                    className="bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-red-500 outline-none"
                >
                    <option value="all">All Fuel Types</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="EV">EV</option>
                </select>
                <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-red-500 outline-none"
                >
                    <option value="all">All Types</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Luxury">Luxury</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(cars) && cars.map(car => (
                    <div key={car._id} className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition group">
                        <div className="h-48 bg-zinc-800 flex items-center justify-center relative">
                            {car.image && car.image.length > 0 ? (
                                <img src={car.image[0]} alt={car.model} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                            ) : (
                                <Car className="h-16 w-16 text-zinc-600 group-hover:scale-110 transition duration-500" />
                            )}

                            <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full border ${car.status === 'available' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                car.status === 'booked' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                                    'bg-red-500/10 border-red-500/20 text-red-500'
                                }`}>
                                {car.status.toUpperCase()}
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-1">{car.make} {car.model}</h3>
                            <p className="text-gray-400 font-mono text-sm mb-2">{car.registrationNumber}</p>
                            <p className="text-xs inline-flex items-center px-2 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10 mb-4">
                                {car.location?.city || 'No city'}
                            </p>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                                <div className="flex items-center text-gray-300">
                                    <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                                    {car.transmission}
                                </div>
                                <div className="flex items-center text-gray-300 font-bold">
                                    <IndianRupee className="h-4 w-4 mr-2 text-green-500" />
                                    {car.pricePerDay}/day
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEditModal(car)}
                                    className="flex-1 border border-white/10 hover:bg-white hover:text-black py-2 rounded-xl text-sm font-bold transition flex items-center justify-center"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(car._id)}
                                    className="px-4 border border-white/10 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50 py-2 rounded-xl text-sm font-bold transition"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <CarModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                car={currentCar}
            />
        </div>
    );
}
