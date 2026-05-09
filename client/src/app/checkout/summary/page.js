'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import { Car, ArrowLeft, Calendar, ShieldCheck, Info, CheckCircle } from 'lucide-react';

function BookingSummaryContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const carId = searchParams.get('carId');
    const startTime = searchParams.get('start') || searchParams.get('startDate');
    const endTime = searchParams.get('end') || searchParams.get('endDate');

    const [car, setCar] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentFailed, setPaymentFailed] = useState(false);
    const [priceDetails, setPriceDetails] = useState(null);
    const [dateError, setDateError] = useState('');

    useEffect(() => {
        let currentUser = null;
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('user');
            if (userData) {
                currentUser = JSON.parse(userData);
                setUser(currentUser);
            }
        }

        if (!currentUser && typeof window !== 'undefined') {
            const backUrl = encodeURIComponent(window.location.pathname + window.location.search);
            router.push(`/login?redirectTo=${backUrl}`);
            return;
        }

        const fetchDetails = async () => {
            try {
                const res = await api.get(`/cars/${carId}`);
                setCar(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (carId) fetchDetails();
    }, [carId]);

    useEffect(() => {
        if (car && startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            const totalHours = (end - start) / 36e5;
            const MIN_HOURS = 4;
            const MAX_DAYS = 30;

            if (end <= start) {
                setPriceDetails(null);
                setDateError('End time must be after start time.');
                return;
            }
            if (totalHours < MIN_HOURS) {
                setPriceDetails(null);
                setDateError(`Minimum trip duration is ${MIN_HOURS} hours.`);
                return;
            }
            if (totalHours > MAX_DAYS * 24) {
                setPriceDetails(null);
                setDateError(`Maximum trip duration is ${MAX_DAYS} days.`);
                return;
            }

            setDateError('');

            const days = Math.floor(totalHours / 24);
            const hours = Math.ceil(totalHours % 24);

            const tripFare = (days * car.pricePerDay) + (hours * car.pricePerHour);
            const total = tripFare;

            setPriceDetails({
                days,
                hours,
                tripFare,
                total
            });
        } else {
            setPriceDetails(null);
            setDateError('');
        }
    }, [car, startTime, endTime]);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        if (!user) {
            const backUrl = encodeURIComponent(`/checkout/summary?carId=${carId}&start=${startTime}&end=${endTime}`);
            return router.push(`/login?redirectTo=${backUrl}`);
        }
        if (!priceDetails || dateError) {
            alert(dateError || 'Please select valid dates');
            return;
        }
        setProcessing(true);
        setPaymentFailed(false);

        const fallbackMock = async () => {
            const mockPaymentResult = {
                razorpay_order_id: `order_mock_${Date.now()}`,
                razorpay_payment_id: `pay_mock_${Date.now()}`,
                razorpay_signature: 'mock_signature'
            };
            const res = await api.post('/bookings', {
                carId: car._id,
                startTime,
                endTime,
                paymentResult: mockPaymentResult,
                totalAmount: priceDetails.total
            });
            router.replace(`/checkout/success?bookingId=${res.data.bookingId}`);
        };

        try {
            const orderRes = await api.post('/payment/create-order', {
                carId: car._id,
                startTime,
                endTime
            });

            const ok = await loadRazorpay();
            if (!ok || !orderRes.data?.key) {
                await fallbackMock();
                return;
            }

            const options = {
                key: orderRes.data.key,
                amount: orderRes.data.amount,
                currency: orderRes.data.currency || 'INR',
                name: `${car.make} ${car.model}`,
                description: `Rental from ${new Date(startTime).toLocaleString()} to ${new Date(endTime).toLocaleString()}`,
                image: car.image?.[0],
                handler: async function (response) {
                    try {
                        const res = await api.post('/bookings', {
                            carId: car._id,
                            startTime,
                            endTime,
                            paymentResult: {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            },
                            totalAmount: priceDetails.total
                        });
                        router.replace(`/checkout/success?bookingId=${res.data.bookingId}`);
                    } catch (err) {
                        console.error(err);
                        router.push('/checkout/failure');
                    } finally {
                        setProcessing(false);
                    }
                },
                prefill: {
                    name: user?.name || 'Guest',
                    contact: user?.mobile,
                    email: user?.email
                },
                notes: {
                    carId: car._id
                },
                theme: {
                    color: '#dc2626'
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                        setPaymentFailed(true);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function () {
                setProcessing(false);
                setPaymentFailed(true);
            });
            rzp.open();
        } catch (error) {
            console.error(error);
            try {
                await fallbackMock();
            } catch (err) {
                router.push('/checkout/failure');
            } finally {
                setProcessing(false);
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
        </div>
    );

    if (!car || !priceDetails) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
            <Info className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Booking details missing</h2>
            <p className="text-gray-400 mb-6 text-center max-w-md">
                {dateError || "We couldn't retrieve the details for this booking. Please try selecting the dates again."}
            </p>
            <button onClick={() => router.back()} className="bg-white text-black px-6 py-2 rounded-lg font-bold">
                Go Back
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24 md:pb-0">
            <nav className="sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-md border-b border-white/10 px-4 h-16 flex items-center">
                <button onClick={() => router.back()} className="mr-4 text-gray-400 hover:text-white transition">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-lg font-bold">Booking Summary</h1>
            </nav>

            <main className="max-w-4xl mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Summary Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Car Info */}
                    <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-2xl flex items-start space-x-4">
                        <div className="h-24 w-32 bg-zinc-800 rounded-xl flex items-center justify-center">
                            <Car className="h-10 w-10 text-gray-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{car.make} {car.model}</h2>
                            <div className="flex items-center space-x-2 mt-2">
                                <span className="text-xs font-mono bg-black px-2 py-0.5 rounded text-gray-400 border border-zinc-700">
                                    {car.registrationNumber}
                                </span>
                                <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-gray-400">
                                    {car.fuelType}
                                </span>
                                <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-gray-400">
                                    {car.transmission}
                                </span>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-gray-400">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(startTime).toLocaleString()} <span className="mx-2">to</span> {new Date(endTime).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Important Info */}
                    <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl flex items-start">
                        <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-200/80">
                            <p className="font-bold mb-1 text-blue-400">Documents Required</p>
                            Original Driving License and Aadhaar Card must be shown at the time of pickup.
                        </div>
                    </div>
                </div>

                {/* Right: Price Breakdown */}
                <div className="md:col-span-1">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 sticky top-24">
                        <h3 className="font-bold text-lg mb-6 border-b border-white/10 pb-4">Fare Details</h3>
                        {dateError && (
                            <div className="bg-red-900/30 border border-red-500/40 text-red-100 text-sm rounded-lg p-3 mb-4">
                                {dateError}
                            </div>
                        )}

                        <div className="space-y-3 text-sm text-gray-300 mb-6">
                            <div className="flex justify-between">
                                <span>Trip Fare ({priceDetails.days}d {priceDetails.hours}h)</span>
                                <span>₹{priceDetails.tripFare}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xl font-bold text-white border-t border-white/10 pt-4 mb-6">
                            <span>Total Amount</span>
                            <span>₹{priceDetails.total}</span>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={processing || dateError}
                            className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center shadow-xl ${
                                processing 
                                ? 'bg-zinc-800 text-gray-500 cursor-not-allowed' 
                                : paymentFailed 
                                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/20' 
                                    : 'bg-white text-black hover:bg-gray-100'
                            }`}
                        >
                            {processing ? (
                                <>
                                    <div className="h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                                    Processing...
                                </>
                            ) : paymentFailed ? (
                                'Retry Payment'
                            ) : (
                                'Pay Now'
                            )}
                        </button>

                        <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Events Secured by Razorpay
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function BookingSummary() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <BookingSummaryContent />
        </Suspense>
    );
}
