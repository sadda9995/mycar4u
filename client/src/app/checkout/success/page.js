'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Home, Calendar } from 'lucide-react';
import dynamic from 'next/dynamic';

// Confetti needs to be client-side only
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

function PaymentSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        }
    }, []);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Confetti */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.1}
                />
            </div>

            <div className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center relative z-10 shadow-2xl shadow-green-500/10">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-12 w-12 text-green-500 animate-bounce" />
                </div>

                <h1 className="text-3xl font-bold mb-2 text-white">Booking Confirmed!</h1>
                <p className="text-gray-400 mb-8">Your ride is ready to zoom.</p>

                <div className="bg-black/40 rounded-xl p-4 mb-8 border border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Booking ID</p>
                    <p className="font-mono text-xl text-green-400 font-bold">{bookingId || 'Loading...'}</p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/settings?tab=bookings')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center shadow-lg shadow-green-900/20"
                    >
                        <Calendar className="mr-2 h-5 w-5" />
                        Go to My Bookings
                    </button>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center"
                    >
                        <Home className="mr-2 h-5 w-5" />
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PaymentSuccess() {
    return (
        <React.Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <PaymentSuccessContent />
        </React.Suspense>
    );
}
