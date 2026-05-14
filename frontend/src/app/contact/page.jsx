"use client";

import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactPage() {
  // Animation rules for smooth loading
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <main className="min-h-[100svh] bg-white text-slate-900 selection:bg-emerald-100 overflow-hidden">
      <Navbar />
      
      <div className="max-w-6xl mx-auto pt-32 md:pt-44 px-6 pb-24 relative">
        {/* Soft background glow */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-3xl -z-10 translate-x-[-20%] translate-y-[-20%]" />

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT COLUMN: CONTACT TEXT */}
          <motion.div 
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="text-center lg:text-left space-y-10"
          >
            <div>
              <motion.div variants={itemVariants} className="inline-block px-4 py-1.5 mb-6 text-[11px] font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 border border-emerald-100/50 rounded-full">
                Support Center
              </motion.div>
              <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
                How can we <br className="hidden lg:block" />
                <span className="text-emerald-500 italic font-serif font-light">help?</span>
              </motion.h1>
              <motion.p variants={itemVariants} className="text-slate-500 text-base md:text-lg font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
                Have questions about your ride or want to join as a driver? Our team is ready to support you 24/7.
              </motion.p>
            </div>
            
            <motion.div variants={itemVariants} className="space-y-6 inline-block lg:block text-left w-full max-w-md mx-auto lg:mx-0">
              <ContactInfo icon={<Mail size={20} />} title="Email Support" detail="northride@gmail.com" />
              <ContactInfo icon={<Phone size={20} />} title="Call Us" detail="+92 316 9030178" />
              {/* Updated Location */}
              <ContactInfo icon={<MapPin size={20} />} title="Main Office" detail="Islamabad, Pakistan" />
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN: CONTACT FORM */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-slate-50 p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20"
          >
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input label="Full Name" placeholder="Your name" />
                <Input label="Email" placeholder="email@example.com" type="email" />
              </div>
              <Input label="Subject" placeholder="How can we help?" />
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 ml-1">
                  Message
                </label>
                <textarea 
                  placeholder="Write your message here..."
                  className="w-full mt-2 p-4 bg-white border border-slate-200 rounded-2xl h-32 md:h-40 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none text-[15px] font-medium" 
                />
              </div>
              <button 
                type="button"
                className="w-full py-4 mt-2 bg-slate-900 text-white rounded-2xl font-semibold uppercase text-[13px] tracking-wide flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/10"
              >
                Send Message <Send size={16} />
              </button>
            </form>
          </motion.div>

        </div>
      </div>
      <Footer />
    </main>
  );
}

// --- HELPERS ---

function ContactInfo({ icon, title, detail }) {
  return (
    <div className="flex items-center gap-5 group p-4 -ml-4 rounded-2xl hover:bg-slate-50 transition-colors">
      <div className="w-14 h-14 bg-white text-slate-500 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-all duration-300">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-widest mb-1">{title}</p>
        <p className="text-[15px] md:text-base font-bold text-slate-900">{detail}</p>
      </div>
    </div>
  );
}

function Input({ label, type = "text", ...props }) {
  return (
    <div className="w-full">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 ml-1">{label}</label>
      <input 
        type={type}
        className="w-full mt-2 px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-[15px] font-medium" 
        {...props} 
      />
    </div>
  );
}