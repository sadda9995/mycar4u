'use client';

import React, { useEffect, useState } from 'react';
import { Car } from 'lucide-react';

export default function SplashScreen() {
    const [show, setShow] = useState(true);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        // Start fading out after 1.5s
        const fadeTimer = setTimeout(() => {
            setOpacity(0);
        }, 1500);

        // Remove from DOM after 2s
        const removeTimer = setTimeout(() => {
            setShow(false);
        }, 2000);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(removeTimer);
        };
    }, []);

    if (!show) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ease-in-out"
            style={{ opacity: opacity }}
        >
            <div className="animate-bounce">
                <Car className="h-16 w-16 text-red-600 mb-4" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-widest animate-pulse">
                Mycar4u
            </h1>
            <p className="text-gray-500 text-sm mt-2">Premium Experience</p>
        </div>
    );
}
