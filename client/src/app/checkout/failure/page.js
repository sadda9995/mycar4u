'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, RefreshCw, MessageCircle } from 'lucide-react';

export default function PaymentFailure() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center shadow-2xl shadow-red-500/10">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="h-12 w-12 text-red-500" />
                </div>

                <h1 className="text-3xl font-bold mb-2 text-white">Payment Failed</h1>
                <p className="text-gray-400 mb-8">Oops! Something went wrong with your transaction. No money was deducted.</p>

                <div className="space-y-3">
                    <button
                        onClick={() => router.back()}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center shadow-lg shadow-red-900/20"
                    >
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Try Again
                    </button>

                    <button
                        onClick={() => window.open('https://wa.me/91XXXXXXXXXX', '_blank')}
                        className="w-full bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center"
                    >
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Chat with Support
                    </button>
                </div>

                <p className="mt-8 text-xs text-gray-500">
                    If your money was deducted, it will be refunded within 5-7 business days.
                </p>
            </div>
        </div>
    );
}
