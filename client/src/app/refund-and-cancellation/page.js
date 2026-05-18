import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RefundAndCancellation() {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-4xl mx-auto bg-zinc-900/50 p-8 rounded-3xl border border-white/10">
        <Link href="/" className="inline-flex items-center text-red-500 hover:text-red-400 mb-8 transition">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-8">Refund & Cancellation Policy</h1>
        
        <div className="space-y-6 text-gray-300 leading-relaxed text-sm">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-bold text-white mt-8">1. Cancellation by User</h2>
          <p>You can cancel your booking through the Mycar4u website or app. Cancellation charges may apply depending on the time of cancellation relative to the scheduled booking start time:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Cancellation up to 24 hours before pickup: 100% refund.</li>
            <li>Cancellation within 24 hours of pickup: 50% refund.</li>
            <li>No-shows: No refund will be provided.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8">2. Cancellation by Mycar4u</h2>
          <p>We reserve the right to cancel any booking due to unforeseen circumstances (e.g., vehicle breakdown). In such cases, a full refund will be processed immediately.</p>

          <h2 className="text-xl font-bold text-white mt-8">3. Refund Processing</h2>
          <p>All approved refunds will be processed to the original method of payment (via Razorpay) within 5-7 business days. Please note that it may take additional time for the refund to reflect in your bank account depending on your bank's processing time.</p>

          <h2 className="text-xl font-bold text-white mt-8">4. Early Returns</h2>
          <p>If you return the vehicle earlier than the booked end time, no refund will be provided for the unused time period.</p>
        </div>
      </div>
    </div>
  );
}
