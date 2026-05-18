'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingsRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/settings?tab=bookings');
    }, [router]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
        </div>
    );
}
