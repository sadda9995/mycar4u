'use client';

import React, { useEffect, useState } from 'react';

export default function SplashScreen() {
    const [show, setShow] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Progress simulation for smooth progress bar
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 5;
            });
        }, 60);

        // Trigger exit animation after 1.8s
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, 1800);

        // Remove from DOM after 2.3s
        const removeTimer = setTimeout(() => {
            setShow(false);
        }, 2300);

        return () => {
            clearInterval(interval);
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, []);

    if (!show) return null;

    const brandName = "Mycar4u";

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070708] overflow-hidden select-none transition-all duration-700 ease-in-out ${isExiting ? 'opacity-0 scale-105 blur-md pointer-events-none' : 'opacity-100 scale-100'}`}
        >
            {/* Embed custom CSS styles for advanced preloader animations */}
            <style>{`
                @keyframes spin-slow {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes spin-reverse {
                    0% { transform: rotate(360deg); }
                    100% { transform: rotate(0deg); }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.3; transform: scale(1); filter: blur(60px); }
                    50% { opacity: 0.6; transform: scale(1.15); filter: blur(80px); }
                }
                @keyframes char-reveal {
                    0% { opacity: 0; transform: translateY(20px); filter: blur(4px); }
                    100% { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                .animate-spin-slow {
                    animation: spin-slow 4s linear infinite;
                }
                .animate-spin-reverse {
                    animation: spin-reverse 2.5s linear infinite;
                }
                .animate-pulse-glow {
                    animation: pulse-glow 3s ease-in-out infinite;
                }
                .char-reveal {
                    display: inline-block;
                    animation: char-reveal 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                    opacity: 0;
                }
            `}</style>

            {/* Glowing ambient radial background light */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.06)_0%,rgba(0,0,0,0)_70%)] z-0 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-600/10 rounded-full animate-pulse-glow z-0 pointer-events-none" />

            {/* Grid overlay for digital texture */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px] z-0 pointer-events-none" />

            {/* Ring / Loader Container */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Visual ring container */}
                <div className="relative h-32 w-32 mb-8 flex items-center justify-center">
                    
                    {/* Outer Glowing Neon Ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-red-600/10 border-t-red-600 border-r-red-600/40 animate-spin-slow shadow-[0_0_20px_rgba(220,38,38,0.15)]" />
                    
                    {/* Inner Dashed Action Ring */}
                    <div className="absolute inset-2 rounded-full border border-dashed border-zinc-700/40 border-b-zinc-400/50 animate-spin-reverse" />
                    
                    {/* Tiny Center Orbit Point */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <img 
                            src="/favicon.png" 
                            alt="Logo" 
                            className="h-16 w-16 object-contain relative z-10 transition-transform duration-500 hover:scale-105 filter drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]" 
                        />
                    </div>
                </div>

                {/* Typography reveal */}
                <h1 className="text-3xl font-black text-white tracking-[0.2em] uppercase text-center mb-1 pl-[0.2em]">
                    {brandName.split("").map((char, index) => (
                        <span 
                            key={index} 
                            className="char-reveal" 
                            style={{ animationDelay: `${index * 0.08}s` }}
                        >
                            {char}
                        </span>
                    ))}
                </h1>

                {/* Subtitle */}
                <p 
                    className="text-gray-500 text-xs font-semibold uppercase tracking-[0.3em] pl-[0.3em] mb-8 transition-all duration-1000 ease-out"
                    style={{ 
                        opacity: progress > 40 ? 1 : 0,
                        transform: progress > 40 ? 'translateY(0)' : 'translateY(5px)' 
                    }}
                >
                    Premium Experience
                </p>

                {/* Progress bar container */}
                <div className="w-48 h-[2px] bg-zinc-950 rounded-full overflow-hidden border border-white/5 relative">
                    <div 
                        className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-75 ease-out shadow-[0_0_8px_rgba(220,38,38,0.6)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                
                {/* Progress percentage display */}
                <span className="text-[10px] font-mono text-zinc-600 mt-2 tracking-wider">
                    {progress}% LOADED
                </span>
            </div>
        </div>
    );
}
