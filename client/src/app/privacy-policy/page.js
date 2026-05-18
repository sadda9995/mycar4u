import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-4xl mx-auto bg-zinc-900/50 p-8 rounded-3xl border border-white/10">
        <Link href="/" className="inline-flex items-center text-red-500 hover:text-red-400 mb-8 transition">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-300 leading-relaxed text-sm">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-bold text-white mt-8">1. Information We Collect</h2>
          <p>We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, or otherwise contact us. The personal information that we collect depends on the context of your interactions with us and the website, the choices you make and the products and features you use.</p>

          <h2 className="text-xl font-bold text-white mt-8">2. How We Use Your Information</h2>
          <p>We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>To facilitate account creation and logon process.</li>
            <li>To fulfill and manage your bookings and payments.</li>
            <li>To send you marketing and promotional communications.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8">3. Sharing Your Information</h2>
          <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We use Razorpay for processing payments, and your payment data may be shared with them to process your transactions securely.</p>

          <h2 className="text-xl font-bold text-white mt-8">4. Data Security</h2>
          <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.</p>
        </div>
      </div>
    </div>
  );
}
