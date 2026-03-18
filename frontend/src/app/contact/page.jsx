"use client";
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto pt-32 md:pt-44 px-6 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* LEFT COLUMN: TEXT & INFO */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-[1000] text-slate-900 tracking-tighter mb-6 italic leading-none">
              Get in <span className="text-emerald-500">Touch.</span>
            </h1>
            <p className="text-slate-500 text-base md:text-lg mb-10 md:mb-12 max-w-lg mx-auto lg:mx-0">
              Have questions about the fleet? Our mission control is available 24/7 to assist captains and passengers.
            </p>
            
            <div className="space-y-6 md:space-y-8 inline-block lg:block text-left">
              <ContactInfo icon={<Mail size={20} />} title="Email" detail="northride@gmail.com" />
              <ContactInfo icon={<Phone size={20} />} title="Phone" detail="+92 3169030178" />
              <ContactInfo icon={<MapPin size={20} />} title="Location" detail="Gilgit Baltistan" />
            </div>
          </div>

          {/* RIGHT COLUMN: FORM */}
          <div className="bg-slate-50 p-6 sm:p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100">
            <form className="space-y-5 md:space-y-6">
              <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                <Input label="Full Name" placeholder="your full name" />
                <Input label="Email Address" placeholder="email@example.com" />
              </div>
              <Input label="Subject" placeholder="How can we help?" />
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Message</label>
                <textarea 
                  placeholder="Type your transmission..."
                  className="w-full mt-2 p-4 md:p-5 bg-white border border-slate-200 rounded-2xl h-32 md:h-40 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none text-sm" 
                />
              </div>
              <button className="w-full py-4 md:py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all active:scale-[0.98]">
                Send Message <Send size={16} />
              </button>
            </form>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  );
}

function ContactInfo({ icon, title, detail }) {
  return (
    <div className="flex items-center gap-4 md:gap-5">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{title}</p>
        <p className="text-sm md:text-lg font-bold text-slate-900 break-all sm:break-normal">{detail}</p>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{label}</label>
      <input 
        className="w-full mt-2 p-3.5 md:p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm" 
        {...props} 
      />
    </div>
  );
}