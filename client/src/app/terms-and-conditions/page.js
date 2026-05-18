import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-4xl mx-auto bg-zinc-900/50 p-8 rounded-3xl border border-white/10">
        <Link href="/" className="inline-flex items-center text-red-500 hover:text-red-400 mb-8 transition">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-8">Terms & Conditions</h1>
        
        <div className="space-y-6 text-gray-300 leading-relaxed text-sm">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-bold text-white mt-8">1. Introduction</h2>
          <p>Welcome to Mycar4u. By using our website and services, you agree to comply with and be bound by the following terms and conditions of use. Please review these terms carefully.</p>

          <h2 className="text-xl font-bold text-white mt-8">2. Vehicle Rental Policy</h2>
          <p>The renter must possess a valid driving license. The vehicle must be returned in the same condition as it was rented, subject to normal wear and tear. Any damage or loss will be charged to the renter.</p>

          <h2 className="text-xl font-bold text-white mt-8">3. Booking and Payments</h2>
          <p>All bookings are subject to availability. Payment must be made in full before the commencement of the rental period. We use Razorpay as our secure payment gateway.</p>

          <h2 className="text-xl font-bold text-white mt-8">4. Liability</h2>
          <p>Mycar4u is not liable for any indirect, incidental, or consequential damages resulting from the use of our vehicles or services.</p>

          <h2 className="text-xl font-bold text-white mt-8">5. Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes arising from these terms will be subject to the exclusive jurisdiction of the courts in your local jurisdiction.</p>
        </div>
      </div>
    </div>
  );
}
