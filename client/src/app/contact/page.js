import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-4xl mx-auto bg-zinc-900/50 p-8 rounded-3xl border border-white/10">
        <Link href="/" className="inline-flex items-center text-red-500 hover:text-red-400 mb-8 transition">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
        
        <div className="space-y-6 text-gray-300 leading-relaxed text-sm">
          <p>If you have any questions, concerns, or need assistance, please feel free to reach out to our support team.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-black/50 p-6 rounded-2xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-red-500" /> Email Us
              </h3>
              <p>For general inquiries and support:</p>
              <a href="mailto:support@mycar4u.com" className="text-red-400 hover:underline">support@mycar4u.com</a>
            </div>

            <div className="bg-black/50 p-6 rounded-2xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-red-500" /> Call Us
              </h3>
              <p>Our helpline is available 24/7:</p>
              <a href="tel:+919876543210" className="text-red-400 hover:underline">+91 98765 43210</a>
            </div>

            <div className="bg-black/50 p-6 rounded-2xl border border-white/5 md:col-span-2">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-red-500" /> Head Office
              </h3>
              <p>Mycar4u HQ<br />123, Tech Park Road, Bengaluru<br />Karnataka, India 560001</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
