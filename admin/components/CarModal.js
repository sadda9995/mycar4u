'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '@/lib/api';

const emptyForm = {
    registrationNumber: '',
    make: '',
    model: '',
    type: 'Hatchback',
    locationCity: '',
    pricePerDay: '',
    pricePerHour: '',
    dailyKmLimit: 300,
    extraKmCharge: '',
    lateFeePerHour: '',
    fuelType: 'Petrol',
    transmission: 'Manual',
    status: 'available',
    image: '',
    year: new Date().getFullYear(),
    kmsDriven: 0,
    seats: 5,
    engineCapacity: '',
    enginePower: '',
    engineTorque: '',
    engineFuelTank: '',
    dimLength: '',
    dimWidth: '',
    dimBootSpace: '',
    dimGroundClearance: '',
    safetyAirbags: '',
    safetyAbs: 'true',
    safetyNcapRating: '',
    featuresText: '',
    maintStart: '',
    maintEnd: '',
    maintReason: ''
};

export default function CarModal({ isOpen, onClose, onSave, car }) {
    const [formData, setFormData] = useState(emptyForm);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        const loadCities = async () => {
            try {
                const res = await api.get('/cities');
                const active = res.data.filter(c => c.isActive !== false);
                setCities(active);
                if (!car && active.length && !formData.locationCity) {
                    setFormData(prev => ({ ...prev, locationCity: active[0].name }));
                }
            } catch (err) {
                console.error('Failed to load cities', err);
            }
        };
        loadCities();
        if (!isOpen) return;

        if (car) {
            setFormData({
                ...emptyForm,
                registrationNumber: car.registrationNumber || '',
                make: car.make || '',
                model: car.model || '',
                type: car.type || 'Hatchback',
                locationCity: car.location?.city || '',
                pricePerDay: car.pricePerDay ?? '',
                pricePerHour: car.pricePerHour ?? '',
                dailyKmLimit: car.dailyKmLimit ?? 300,
                extraKmCharge: car.extraKmCharge ?? '',
                lateFeePerHour: car.lateFeePerHour ?? '',
                fuelType: car.fuelType || 'Petrol',
                transmission: car.transmission || 'Manual',
                status: car.status || 'available',
                image: car.image?.length ? car.image.join(', ') : '',
                year: car.year ?? new Date().getFullYear(),
                kmsDriven: car.kmsDriven ?? 0,
                seats: car.seats ?? 5,
                engineCapacity: car.engine?.capacity || '',
                enginePower: car.engine?.power || '',
                engineTorque: car.engine?.torque || '',
                engineFuelTank: car.engine?.fuelTank || '',
                dimLength: car.dimensions?.length || '',
                dimWidth: car.dimensions?.width || '',
                dimBootSpace: car.dimensions?.bootSpace || '',
                dimGroundClearance: car.dimensions?.groundClearance || '',
                safetyAirbags: car.safety?.airbags ?? '',
                safetyAbs: (car.safety?.abs ?? true).toString(),
                safetyNcapRating: car.safety?.ncapRating ?? '',
                featuresText: car.features?.length ? car.features.join('\n') : '',
                maintStart: car.maintenanceWindows?.[0]?.start ? car.maintenanceWindows[0].start.slice(0, 16) : '',
                maintEnd: car.maintenanceWindows?.[0]?.end ? car.maintenanceWindows[0].end.slice(0, 16) : '',
                maintReason: car.maintenanceWindows?.[0]?.reason || ''
            });
        } else {
            setFormData(emptyForm);
        }
    }, [car, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const imageUrls = formData.image
            .split(',')
            .map(url => url.trim())
            .filter(Boolean);

        const features = formData.featuresText
            .split(/[\n,]/)
            .map(f => f.trim())
            .filter(Boolean);

        const submissionData = {
            registrationNumber: formData.registrationNumber.trim(),
            make: formData.make.trim(),
            model: formData.model.trim(),
            type: formData.type,
            pricePerDay: Number(formData.pricePerDay) || 0,
            pricePerHour: Number(formData.pricePerHour) || 0,
            dailyKmLimit: Number(formData.dailyKmLimit) || 0,
            extraKmCharge: Number(formData.extraKmCharge) || 0,
            lateFeePerHour: Number(formData.lateFeePerHour) || 0,
            fuelType: formData.fuelType,
            transmission: formData.transmission,
            status: formData.status,
            year: Number(formData.year) || new Date().getFullYear(),
            kmsDriven: Number(formData.kmsDriven) || 0,
            seats: Number(formData.seats) || 5,
            image: imageUrls,
            engine: {
                capacity: formData.engineCapacity,
                power: formData.enginePower,
                torque: formData.engineTorque,
                fuelTank: formData.engineFuelTank
            },
            dimensions: {
                length: formData.dimLength,
                width: formData.dimWidth,
                bootSpace: formData.dimBootSpace,
                groundClearance: formData.dimGroundClearance
            },
            safety: {
                airbags: Number(formData.safetyAirbags) || 0,
                abs: formData.safetyAbs === 'true' || formData.safetyAbs === true,
                ncapRating: Number(formData.safetyNcapRating) || 0
            },
            features,
            location: { city: formData.locationCity },
            maintenanceWindows: formData.maintStart && formData.maintEnd ? [{
                start: new Date(formData.maintStart),
                end: new Date(formData.maintEnd),
                reason: formData.maintReason || 'Maintenance'
            }] : []
        };

        onSave(submissionData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-zinc-900 border-b border-white/10 p-6 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-white">
                        {car ? 'Edit Car (what customers see)' : 'Add New Car'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Make</label>
                            <input
                                type="text"
                                name="make"
                                value={formData.make}
                                onChange={handleChange}
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                                placeholder="e.g. Maruti"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Model</label>
                            <input
                                type="text"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                                placeholder="e.g. Swift"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Registration Number</label>
                            <input
                                type="text"
                                name="registrationNumber"
                                value={formData.registrationNumber}
                                onChange={handleChange}
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                                placeholder="KA 03 AB 1234"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            >
                                <option value="Hatchback">Hatchback</option>
                                <option value="Sedan">Sedan</option>
                                <option value="SUV">SUV</option>
                                <option value="Luxury">Luxury</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
                            <select
                                name="locationCity"
                                value={formData.locationCity}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                                required
                            >
                                <option value="">Select city</option>
                                {cities.map(city => (
                                    <option key={city._id} value={city.name}>{city.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Price Per Day (₹)</label>
                            <input
                                type="number"
                                name="pricePerDay"
                                value={formData.pricePerDay}
                                onChange={handleChange}
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Price Per Hour (₹)</label>
                            <input
                                type="number"
                                name="pricePerHour"
                                value={formData.pricePerHour}
                                onChange={handleChange}
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Extra Km Charge (₹)</label>
                            <input
                                type="number"
                                name="extraKmCharge"
                                value={formData.extraKmCharge}
                                onChange={handleChange}
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Late Fee Per Hour (₹)</label>
                            <input
                                type="number"
                                name="lateFeePerHour"
                                value={formData.lateFeePerHour}
                                onChange={handleChange}
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Daily KM Limit</label>
                            <input
                                type="number"
                                name="dailyKmLimit"
                                value={formData.dailyKmLimit}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Seats</label>
                            <input
                                type="number"
                                name="seats"
                                value={formData.seats}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            />
                        </div>
                    </div>

                    {/* Maintenance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Maintenance Start</label>
                            <input
                                type="datetime-local"
                                name="maintStart"
                                value={formData.maintStart}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Maintenance End</label>
                            <input
                                type="datetime-local"
                                name="maintEnd"
                                value={formData.maintEnd}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Maintenance Reason</label>
                        <input
                            type="text"
                            name="maintReason"
                            value={formData.maintReason}
                            onChange={handleChange}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            placeholder="e.g., Scheduled service"
                        />
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Transmission</label>
                            <select
                                name="transmission"
                                value={formData.transmission}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            >
                                <option value="Manual">Manual</option>
                                <option value="Automatic">Automatic</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Fuel Type</label>
                            <select
                                name="fuelType"
                                value={formData.fuelType}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            >
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                                <option value="CNG">CNG</option>
                                <option value="EV">EV</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            >
                                <option value="available">Available</option>
                                <option value="booked">Booked</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Year</label>
                            <input
                                type="number"
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Kms Driven</label>
                            <input
                                type="number"
                                name="kmsDriven"
                                value={formData.kmsDriven}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            />
                        </div>
                    </div>

                    {/* Engine & Performance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-3">Engine & Performance</h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    name="engineCapacity"
                                    value={formData.engineCapacity}
                                    onChange={handleChange}
                                    placeholder="Capacity e.g. 1197 cc"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                                />
                                <input
                                    type="text"
                                    name="enginePower"
                                    value={formData.enginePower}
                                    onChange={handleChange}
                                    placeholder="Max Power e.g. 88 bhp"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                                />
                                <input
                                    type="text"
                                    name="engineTorque"
                                    value={formData.engineTorque}
                                    onChange={handleChange}
                                    placeholder="Max Torque e.g. 113 Nm"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                                />
                                <input
                                    type="text"
                                    name="engineFuelTank"
                                    value={formData.engineFuelTank}
                                    onChange={handleChange}
                                    placeholder="Fuel Tank e.g. 37 Litres"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-white mb-3">Dimensions</h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    name="dimLength"
                                    value={formData.dimLength}
                                    onChange={handleChange}
                                    placeholder="Length e.g. 3845 mm"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                                />
                                <input
                                    type="text"
                                    name="dimWidth"
                                    value={formData.dimWidth}
                                    onChange={handleChange}
                                    placeholder="Width e.g. 1735 mm"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                                />
                                <input
                                    type="text"
                                    name="dimBootSpace"
                                    value={formData.dimBootSpace}
                                    onChange={handleChange}
                                    placeholder="Boot Space e.g. 268 Litres"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                                />
                                <input
                                    type="text"
                                    name="dimGroundClearance"
                                    value={formData.dimGroundClearance}
                                    onChange={handleChange}
                                    placeholder="Ground Clearance e.g. 170 mm"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Safety */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Airbags</label>
                            <input
                                type="number"
                                name="safetyAirbags"
                                value={formData.safetyAirbags}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">ABS</label>
                            <select
                                name="safetyAbs"
                                value={formData.safetyAbs}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">NCAP Rating</label>
                            <input
                                type="number"
                                name="safetyNcapRating"
                                value={formData.safetyNcapRating}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            />
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Features (one per line or comma separated)</label>
                        <textarea
                            name="featuresText"
                            value={formData.featuresText}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition"
                            placeholder="AC&#10;Bluetooth&#10;Rear Camera"
                        />
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Car Image</label>

                        <div className="flex items-center gap-4">
                            {formData.image && (
                                <div className="h-20 w-32 relative rounded-xl overflow-hidden border border-white/10">
                                    <img src={formData.image.split(',')[0]} alt="Preview" className="h-full w-full object-cover" />
                                </div>
                            )}

                            <label className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-center w-full px-4 py-3 border border-dashed border-white/20 rounded-xl hover:bg-white/5 transition group">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-400 group-hover:text-white transition">
                                            Click to Upload Image
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP (Max 5MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            const data = new FormData();
                                            data.append('image', file);

                                            try {
                                                const res = await api.post('/upload', data);
                                                if (res.data.filePath) {
                                                    setFormData(prev => ({ ...prev, image: res.data.filePath }));
                                                }
                                            } catch (err) {
                                                console.error('Upload failed', err);
                                                const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
                                                alert('Image upload failed: ' + errorMsg);
                                            }
                                        }}
                                    />
                                </div>
                            </label>
                        </div>
                        <input
                            type="text"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition mt-2"
                            placeholder="Paste one or more image URLs, separated by commas"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-red-900/20 transition"
                        >
                            {car ? 'Update Car' : 'Add Car'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
