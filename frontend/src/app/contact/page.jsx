"use client";

import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto pt-32 md:pt-44 px-6 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* LEFT COLUMN: CONTACT TEXT */}
          <div className="text-center lg:text-left space-y-8">
            <div>
              <div className="inline-block px-3 py-1 mb-6 text-[10px] font-bold tracking-[0.2em] text-emerald-600 uppercase bg-emerald-50 rounded-full">
                Support Center
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                How can we <span className="text-emerald-500 italic font-medium">help?</span>
              </h1>
              <p className="text-slate-500 text-sm md:text-base font-light max-w-md mx-auto lg:mx-0 leading-relaxed">
                Have questions about your ride or want to join as a Captain? Our team is ready to support you 24/7.
              </p>
            </div>
            
            <div className="space-y-6 md:space-y-8 inline-block lg:block text-left">
              <ContactInfo icon={<Mail size={18} />} title="Email Support" detail="northride@gmail.com" />
              <ContactInfo icon={<Phone size={18} />} title="Call Us" detail="+92 316 9030178" />
              <ContactInfo icon={<MapPin size={18} />} title="Our Base" detail="Gilgit-Baltistan, Pakistan" />
            </div>
          </div>

          {/* RIGHT COLUMN: CONTACT FORM */}
          <div className="bg-slate-50 p-8 md:p-10 rounded-[2.5rem] border border-slate-100">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input label="Full Name" placeholder="Your name" />
                <Input label="Email" placeholder="email@example.com" />
              </div>
              <Input label="Subject" placeholder="How can we help?" />
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Message</label>
                <textarea 
                  placeholder="Write your message here..."
                  className="w-full mt-2 p-4 bg-white border border-slate-200 rounded-xl h-32 md:h-40 focus:border-emerald-500 outline-none transition-all resize-none text-sm font-medium" 
                />
              </div>
              <button className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/10">
                Send Message <Send size={14} />
              </button>
            </form>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  );
}

// Small helper for the info items (Email, Phone, etc)
function ContactInfo({ icon, title, detail }) {
  return (
    <div className="flex items-center gap-5 group">
      <div className="w-12 h-12 bg-white text-emerald-600 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest mb-1">{title}</p>
        <p className="text-sm md:text-base font-bold text-slate-900">{detail}</p>
      </div>
    </div>
  );
}

// Small helper for form inputs
function Input({ label, ...props }) {
  return (
    <div className="w-full">
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">{label}</label>
      <input 
        className="w-full mt-2 p-4 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none transition-all text-sm font-medium" 
        {...props} 
      />
    </div>
  );
}