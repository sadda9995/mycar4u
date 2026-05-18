'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import Header from '@/components/Header';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
    ArrowLeft, Car, Calendar, Fuel, Gauge, Settings,
    Shield, Star, Zap, MapPin, CheckCircle, Info, ThumbsUp, User,
    MoveHorizontal, Cog
} from 'lucide-react';

function CarDetailsContent() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    const [car, setCar] = useState(null);
    const [user, setUser] = useState(null);
    const [bookingDates, setBookingDates] = useState({ 
        start: startParam || '', 
        end: endParam || '' 
    });
    const [startDate, setStartDate] = useState(startParam ? new Date(startParam) : null);
    const [endDate, setEndDate] = useState(endParam ? new Date(endParam) : null);

    const isSameDay = (a, b) => a && b && a.toDateString() === b.toDateString();
    const startOfDay = (d) => {
        const dt = new Date(d);
        dt.setHours(0, 0, 0, 0);
        return dt;
    };
    const endOfDay = (d) => {
        const dt = new Date(d);
        dt.setHours(23, 59, 59, 999);
        return dt;
    };
    const [loading, setLoading] = useState(true);
    const [priceEstimate, setPriceEstimate] = useState(null);
    const [dateError, setDateError] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('user');
            if (userData) setUser(JSON.parse(userData));
        }
        const fetchCar = async () => {
            try {
                const res = await api.get(`/cars/${id}`);
                setCar(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchCar();
    }, [id]);

    useEffect(() => {
        if (car && bookingDates.start && bookingDates.end) {
            const start = new Date(bookingDates.start);
            const end = new Date(bookingDates.end);
            const totalHours = (end - start) / 36e5;
            const MIN_HOURS = 4;
            const MAX_DAYS = 30;

            if (end <= start) {
                setPriceEstimate(null);
                setDateError('End time must be after start time.');
                return;
            }
            if (totalHours < MIN_HOURS) {
                setPriceEstimate(null);
                setDateError(`Minimum trip duration is ${MIN_HOURS} hours.`);
                return;
            }
            if (totalHours > MAX_DAYS * 24) {
                setPriceEstimate(null);
                setDateError(`Maximum trip duration is ${MAX_DAYS} days.`);
                return;
            }

            setDateError('');

            const days = Math.floor(totalHours / 24);
            const hours = Math.ceil(totalHours % 24);

            const baseFare = (days * car.pricePerDay) + (hours * car.pricePerHour);
            const total = baseFare;

            const durationStr = `${days > 0 ? days + ' Days ' : ''}${hours} Hours`;
            setPriceEstimate({
                total,
                durationStr,
                hours: Math.ceil(totalHours),
                breakdown: { baseFare }
            });
        } else {
            setPriceEstimate(null);
            setDateError('');
        }
    }, [bookingDates, car]);



    const handleBook = () => {
        if (!user) {
            const summaryUrl = `/checkout/summary?carId=${id}&start=${bookingDates.start}&end=${bookingDates.end}`;
            return router.push(`/login?redirectTo=${encodeURIComponent(summaryUrl)}`);
        }
        if (!bookingDates.start || !bookingDates.end) {
            alert('Please select start and end dates');
            return;
        }

        const query = new URLSearchParams({
            carId: car._id,
            start: bookingDates.start,
            end: bookingDates.end
        }).toString();

        router.push(`/checkout/summary?${query}`);
    };

    if (loading || !car) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div></div>;

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24 md:pb-0">
            <Header />

            <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Image Area */}
                    <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 aspect-video flex items-center justify-center relative group">
                        {car.image && car.image.length > 0 ? (
                            <img 
                                src={car.image[0].startsWith('http') ? car.image[0] : `${process.env.NEXT_PUBLIC_API_URL || ''}${car.image[0]}`} 
                                alt={car.model} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <Car className="h-32 w-32 text-zinc-700" />
                        )}
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Settings, label: 'Transmission', value: car.transmission },
                            { icon: Fuel, label: 'Fuel Type', value: car.fuelType },
                            { icon: Car, label: 'Type', value: car.type },
                            { icon: Gauge, label: 'Year', value: car.year || '2023' },
                        ].map((spec, i) => (
                            <div key={i} className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
                                <spec.icon className="h-6 w-6 text-red-500 mb-2" />
                                <span className="text-xs text-gray-500 uppercase tracking-wider">{spec.label}</span>
                                <span className="font-semibold">{spec.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* About & Host */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-zinc-900/30 rounded-2xl p-6 border border-white/5 space-y-4">
                            <h3 className="text-xl font-bold">About This Car</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Experience the {car.make} {car.model}, maintained in pristine condition.
                                Driven only {car.kmsDriven || '12,000'} kms. Perfect for your next trip.
                            </p>
                        </div>
                        <div className="bg-zinc-900/30 rounded-2xl p-6 border border-white/5 flex flex-col justify-center">
                            <div className="flex items-center space-x-4 mb-3">
                                <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center border border-white/10">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Hosted By</p>
                                    <p className="font-bold">Mycar4u Premium</p>
                                </div>
                            </div>
                            <div className="flex items-center text-yellow-400 text-sm font-bold">
                                <Star className="h-4 w-4 fill-yellow-400 mr-2" /> 4.9 Rating (1.2k Trips)
                            </div>
                        </div>
                    </div>

                    {/* Technical Specs (New Section) */}
                    {car.engine && (
                        <div className="bg-zinc-900/30 rounded-2xl p-6 border border-white/5">
                            <div className="flex items-center mb-6">
                                <Cog className="h-5 w-5 mr-2 text-red-500" />
                                <h3 className="text-xl font-bold">Technical Specifications</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                <div>
                                    <h4 className="text-gray-500 uppercase text-xs font-bold mb-3 border-b border-white/10 pb-1">Engine & Performance</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between"><span className="text-gray-400">Capacity</span> <span>{car.engine.capacity}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Max Power</span> <span>{car.engine.power}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Max Torque</span> <span>{car.engine.torque}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Fuel Tank</span> <span>{car.engine.fuelTank}</span></div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-gray-500 uppercase text-xs font-bold mb-3 border-b border-white/10 pb-1">Dimensions</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between"><span className="text-gray-400">Length</span> <span>{car.dimensions.length}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Width</span> <span>{car.dimensions.width}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Boot Space</span> <span>{car.dimensions.bootSpace}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Ground Clearance</span> <span>{car.dimensions.groundClearance}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Safety Features */}
                    {car.safety && (
                        <div className="bg-zinc-900/30 rounded-2xl p-6 border border-white/5">
                            <h3 className="text-xl font-bold mb-4 flex items-center">
                                <Shield className="h-5 w-5 mr-2 text-green-500" /> Safety
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-black/40 p-3 rounded-lg text-center">
                                    <span className="block text-2xl font-bold text-white">{car.safety.ncapRating}<span className="text-sm text-yellow-400">★</span></span>
                                    <span className="text-xs text-gray-500">NCAP Rating</span>
                                </div>
                                <div className="bg-black/40 p-3 rounded-lg text-center">
                                    <span className="block text-2xl font-bold text-white">{car.safety.airbags}</span>
                                    <span className="text-xs text-gray-500">Airbags</span>
                                </div>
                                <div className="bg-black/40 p-3 rounded-lg text-center flex flex-col items-center justify-center">
                                    <span className={`block text-lg font-bold ${car.safety.abs ? 'text-green-400' : 'text-gray-500'}`}>{car.safety.abs ? 'YES' : 'NO'}</span>
                                    <span className="text-xs text-gray-500">ABS</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Features List */}
                    <div className="bg-zinc-900/30 rounded-2xl p-6 border border-white/5 space-y-6">
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <h3 className="text-xl font-bold flex items-center">
                                <Shield className="h-5 w-5 mr-2 text-green-500" />
                                Premium Features
                            </h3>
                            <span className="text-xs font-mono text-gray-500 border border-zinc-700 px-2 py-1 rounded">
                                {car.registrationNumber}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {car.features.map(f => (
                                <span key={f} className="px-3 py-1.5 bg-white/5 rounded-lg text-sm border border-white/10 flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-2 text-red-500" /> {f}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Rental Terms & Conditions (New) */}
                    <div className="bg-zinc-900/30 rounded-2xl p-6 border border-white/5">
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                            <Info className="h-5 w-5 mr-2 text-blue-500" />
                            Rental Terms & Charges
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                <p className="text-gray-400 text-xs uppercase mb-1">Free Km Limit</p>
                                <p className="text-lg font-bold text-white">{car.dailyKmLimit} km <span className="text-xs font-normal text-gray-500">/ day</span></p>
                            </div>
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                <p className="text-gray-400 text-xs uppercase mb-1">Excess Km Charge</p>
                                <p className="text-lg font-bold text-white">₹{car.extraKmCharge} <span className="text-xs font-normal text-gray-500">/ km</span></p>
                            </div>
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                <p className="text-gray-400 text-xs uppercase mb-1">Late Return Fee</p>
                                <p className="text-lg font-bold text-white">₹{car.lateFeePerHour} <span className="text-xs font-normal text-gray-500">/ hour</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Booking Widget */}
                <div id="booking-widget" className="mt-8 lg:mt-0">
                    <div className="sticky top-24 bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <p className="text-sm text-gray-400">Price per day</p>
                                <p className="text-3xl font-bold">₹{car.pricePerDay}</p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center text-yellow-400 font-bold">
                                    <Star className="h-4 w-4 fill-yellow-400 mr-1" /> 4.8
                                </div>
                                <p className="text-xs text-green-400">Available</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <label className="block text-xs font-medium text-gray-400">Trip Window</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => {
                                        setStartDate(date);
                                        setBookingDates(prev => ({ ...prev, start: date ? date.toISOString() : '' }));
                                        if (date && endDate && endDate < date) {
                                            setEndDate(null);
                                            setBookingDates(prev => ({ ...prev, end: '' }));
                                        }
                                    }}
                                    showTimeSelect
                                    timeIntervals={30}
                                    minDate={new Date()}
                                    minTime={startDate ? startOfDay(startDate) : startOfDay(new Date())}
                                    maxTime={startDate ? endOfDay(startDate) : endOfDay(new Date())}
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    placeholderText="Start date & time"
                                    className="w-full bg-black/70 border border-zinc-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:border-red-600 outline-none"
                                    calendarClassName="bg-zinc-900 text-white border border-white/10 rounded-xl shadow-xl"
                                    dayClassName={() => 'text-white'}
                                    popperClassName="z-50"
                                />
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => {
                                        setEndDate(date);
                                        setBookingDates(prev => ({ ...prev, end: date ? date.toISOString() : '' }));
                                    }}
                                    showTimeSelect
                                    timeIntervals={30}
                                    minDate={startDate || new Date()}
                                    minTime={
                                        endDate && startDate && isSameDay(endDate, startDate)
                                            ? startDate
                                            : startDate
                                                ? startOfDay(startDate)
                                                : startOfDay(new Date())
                                    }
                                    maxTime={
                                        endDate && startDate && isSameDay(endDate, startDate)
                                            ? endOfDay(startDate)
                                            : startDate
                                                ? endOfDay(startDate)
                                                : endOfDay(new Date())
                                    }
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    placeholderText="End date & time"
                                    className="w-full bg-black/70 border border-zinc-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:border-red-600 outline-none"
                                    calendarClassName="bg-zinc-900 text-white border border-white/10 rounded-xl shadow-xl"
                                    dayClassName={() => 'text-white'}
                                    popperClassName="z-50"
                                />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-gray-500">
                                <span>30-min steps, same-day bookings allowed.</span>
                                <button
                                    onClick={() => { setStartDate(null); setEndDate(null); setBookingDates({ start: '', end: '' }); }}
                                    className="text-red-400 hover:text-red-200 font-semibold">
                                    Clear
                                </button>
                            </div>
                        </div>

                        {priceEstimate && !dateError && (
                            <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-4 mb-6 space-y-2 text-sm text-gray-300">
                                <div className="flex justify-between">
                                    <span>Duration</span>
                                    <span className="font-bold text-white">{priceEstimate.durationStr}</span>
                                </div>
                                <div className="flex justify-between border-b border-red-900/30 pb-2">
                                    <span>Base Fare</span>
                                    <span className="font-bold text-white">₹{priceEstimate.breakdown.baseFare}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-white pt-1">
                                    <span>Total</span>
                                    <span>₹{priceEstimate.total}</span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleBook}
                            disabled={!priceEstimate || !!dateError || (car.maintenanceWindows?.length > 0)}
                            className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${priceEstimate && !dateError && !(car.maintenanceWindows?.length > 0)
                                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20 cursor-pointer'
                                : 'bg-zinc-800 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {car.maintenanceWindows?.length > 0 ? 'Unavailable' : priceEstimate ? 'Review & Book' : 'Select Dates'}
                        </button>
                    </div>
                </div>
            </main>
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-white/10 p-4 z-50 flex items-center justify-between safe-area-pb">
                <div>
                    {priceEstimate ? (
                        <>
                            <p className="text-xs text-gray-400">Total for {priceEstimate.durationStr}</p>
                            <p className="text-xl font-bold text-white">₹{priceEstimate.total}</p>
                        </>
                    ) : (
                        <>
                            <p className="text-xs text-gray-400">Daily Rate</p>
                            <p className="text-xl font-bold text-white">₹{car.pricePerDay}</p>
                        </>
                    )}
                </div>
                {(!bookingDates.start || !bookingDates.end) ? (
                    <button 
                        onClick={() => document.getElementById('booking-widget')?.scrollIntoView({ behavior: 'smooth' })} 
                        className="bg-white text-black px-6 py-3 rounded-xl font-bold shadow-xl cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                        Select Dates
                    </button>
                ) : (
                    <button onClick={handleBook} className="bg-red-600 px-8 py-3 rounded-xl font-bold text-white">Book Now</button>
                )}
            </div>
        </div>
    );
}

export default function CarDetails() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div></div>}>
            <CarDetailsContent />
        </Suspense>
    );
}
