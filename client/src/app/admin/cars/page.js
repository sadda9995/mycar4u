'use client';

import React, { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Plus, X } from 'lucide-react';

export default function AdminCars() {
    const [cars, setCars] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        registrationNumber: '',
        make: '',
        model: '',
        type: 'Hatchback',
        pricePerHour: '',
        pricePerDay: '',
        fuelType: 'Petrol',
        transmission: 'Manual',
        location: { city: 'Bangalore' } // Simplified for now
    });

    const fetchCars = async () => {
        try {
            const res = await api.get('/cars?limit=100');
            setCars(res.data.cars || []);
        } catch (error) {
            console.error('Failed to fetch cars', error);
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Basic transform for location if needed, currently sending flat city structure needs adjustment based on model
            const payload = {
                ...formData,
                location: { city: formData.city || 'Bangalore', address: 'Main Hub' }
            }

            await api.post('/cars', payload);
            setShowModal(false);
            fetchCars();
            // Reset form
        } catch (error) {
            console.error('Failed to create car', error);
            alert('Failed to create car');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Car Management</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Car
                </button>
            </div>

            {/* Car List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                    <div key={car._id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-white">{car.make} {car.model}</h3>
                                <p className="text-gray-400 text-sm">{car.registrationNumber}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${car.status === 'available' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                {car.status}
                            </span>
                        </div>
                        <div className="mt-4 space-y-1">
                            <p className="text-gray-400 text-sm">Type: {car.type}</p>
                            <p className="text-gray-400 text-sm">Fuel: {car.fuelType} | {car.transmission}</p>
                            <p className="text-white font-bold mt-2">₹{car.pricePerDay}/day</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Car Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Add New Car</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="registrationNumber" placeholder="Registration Number" onChange={handleChange} className="w-full bg-zinc-800 text-white p-2 rounded border border-zinc-700" required />
                            <div className="grid grid-cols-2 gap-4">
                                <input name="make" placeholder="Make (e.g. Maruti)" onChange={handleChange} className="w-full bg-zinc-800 text-white p-2 rounded border border-zinc-700" required />
                                <input name="model" placeholder="Model (e.g. Swift)" onChange={handleChange} className="w-full bg-zinc-800 text-white p-2 rounded border border-zinc-700" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <select name="type" onChange={handleChange} className="w-full bg-zinc-800 text-white p-2 rounded border border-zinc-700">
                                    <option>Hatchback</option>
                                    <option>Sedan</option>
                                    <option>SUV</option>
                                    <option>Luxury</option>
                                </select>
                                <select name="fuelType" onChange={handleChange} className="w-full bg-zinc-800 text-white p-2 rounded border border-zinc-700">
                                    <option>Petrol</option>
                                    <option>Diesel</option>
                                    <option>CNG</option>
                                    <option>EV</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input name="pricePerDay" type="number" placeholder="Price/Day" onChange={handleChange} className="w-full bg-zinc-800 text-white p-2 rounded border border-zinc-700" required />
                                <input name="pricePerHour" type="number" placeholder="Price/Hour" onChange={handleChange} className="w-full bg-zinc-800 text-white p-2 rounded border border-zinc-700" required />
                            </div>
                            {/* Hidden fields for MVP speed: hardcoded defaults for others */}

                            <button type="submit" className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
                                Create Car
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
