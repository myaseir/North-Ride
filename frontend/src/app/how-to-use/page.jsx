"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Smartphone, 
  MapPin, 
  Zap, 
  Trophy, 
  ChevronRight, 
  Star,
  ShieldCheck,
  CreditCard,
  User,
  Car,
  Navigation
} from 'lucide-react';

export default function HowToUse() {
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

      {/* --- HERO SECTION --- */}
      <section className="pt-32 md:pt-40 pb-16 px-6 relative">
        {/* Soft background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-50/50 rounded-full blur-3xl -z-10" />

        <motion.div 
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 mb-8">
            <Smartphone size={14} className="text-emerald-600" />
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">User Guide</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6">
            Master the <span className="text-emerald-500 italic font-serif font-light">App.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="max-w-xl mx-auto text-slate-500 text-base md:text-lg font-medium leading-relaxed">
            Everything you need to know about using North Ride. Find out how to book a safe trip or how to earn money by driving.
          </motion.p>
        </motion.div>
      </section>

      {/* --- PASSENGER GUIDE --- */}
      <section className="py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto mb-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
            <User className="text-slate-700" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">For Passengers</h2>
            <p className="text-slate-500 text-sm font-medium">How to book your mountain journey.</p>
          </div>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-4xl mx-auto space-y-4"
        >
          <StepCard 
            number="01"
            icon={<MapPin size={24} className="text-emerald-600" />}
            title="Choose Your Destination"
            desc="Open the app and enter where you want to go. You can book a ride for right now, or schedule one for later."
            tag="Search"
          />

          <StepCard 
            number="02"
            icon={<Navigation size={24} className="text-emerald-600" />}
            title="Pick a Driver"
            desc="See a list of available cars. You can check the driver's ratings, car type, and the fixed price before you say yes."
            tag="Select"
          />

          <StepCard 
            number="03"
            icon={<ShieldCheck size={24} className="text-emerald-600" />}
            title="Travel Safely"
            desc="Sit back and enjoy the views. Your ride is tracked on GPS, and our support team is always awake to help you."
            tag="Enjoy"
          />
        </motion.div>
      </section>

      {/* --- DIVIDER --- */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="w-full h-[1px] bg-slate-100"></div>
      </div>

      {/* --- DRIVER GUIDE --- */}
      <section className="py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto mb-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <Car className="text-emerald-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">For Drivers</h2>
            <p className="text-slate-500 text-sm font-medium">How to start earning money.</p>
          </div>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-4xl mx-auto space-y-4"
        >
          <StepCard 
            number="01"
            icon={<Zap size={24} className="text-emerald-600" />}
            title="Set Up Your Profile"
            desc="Download the app and upload your ID and car papers. We check your details fast so you can start driving."
            tag="Start Here"
          />

          <StepCard 
            number="02"
            icon={<Star size={24} className="text-emerald-600" />}
            title="Get 5 Stars"
            desc="Good service gets you high ratings. High ratings unlock special rides (like tourists) and faster payments."
            tag="Grow"
          />

          <StepCard 
            number="03"
            icon={<CreditCard size={24} className="text-emerald-600" />}
            title="Easy Payments"
            desc="See your money in the app. Send your earnings directly to your bank account whenever you want."
            tag="Get Paid"
          />
        </motion.div>
      </section>

      {/* --- DRIVER RANKS SECTION (Only for drivers, kept light) --- */}
      <section className="py-12 px-4 md:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto bg-slate-50 text-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 md:p-16 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-white border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest rounded-lg mb-4">
                Driver Ranks
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
                Earn More as You <br className="hidden md:block" />
                <span className="text-emerald-500 italic font-serif font-light">Drive.</span>
              </h2>
              <p className="text-slate-500 text-sm md:text-base mb-10 font-medium leading-relaxed">
                The more trips you complete, the higher your rank. Higher ranks mean you keep more of the money you earn.
              </p>
              
              <div className="space-y-3">
                <TierRow rank="Beginner" bonus="Standard Share" active />
                <TierRow rank="Experienced" bonus="+5% Extra Earnings" />
                <TierRow rank="Pro" bonus="+12% Extra Earnings" />
                <TierRow rank="Legend" bonus="+20% & Best Rides" />
              </div>
            </div>
            
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
               <Trophy size={40} className="text-emerald-500 mb-6" />
               <h3 className="text-xl font-bold text-slate-900 mb-4 uppercase tracking-wider">Legendary Status</h3>
               <p className="text-slate-500 mb-8 leading-relaxed text-sm font-medium">
                 Legend drivers are our best partners. They get the first choice for long trips, airport rides, and tourists.
               </p>
               <Link href="/login" className="flex items-center justify-between w-full p-4 bg-emerald-600 text-white rounded-2xl font-semibold uppercase text-xs tracking-wider hover:bg-emerald-700 transition-all active:scale-95">
                 Become a Driver <ChevronRight size={18} />
               </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- COMMUNITY RULES SECTION --- */}
      <section className="py-24 max-w-5xl mx-auto px-6">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="text-center mb-16">
            <h2 className="text-[11px] font-bold text-emerald-600 uppercase tracking-[0.3em] mb-4">Our Rules</h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Community Standards</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={itemVariants} className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <ShieldCheck className="text-emerald-600 mb-5" size={32} />
              <h4 className="font-bold text-slate-900 mb-3 uppercase text-sm tracking-wider">For Drivers</h4>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Safety is our top priority. Always follow speed limits, keep your car clean, and be polite. Do not cancel trips without a good reason.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <Star className="text-emerald-600 mb-5" size={32} />
              <h4 className="font-bold text-slate-900 mb-3 uppercase text-sm tracking-wider">For Passengers</h4>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Treat your driver and their car with respect. Be ready on time for your pickup, and enjoy the beautiful journey.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}

// --- HELPERS ---

function StepCard({ number, icon, title, desc, tag }) {
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div variants={itemVariants} className="group flex flex-col md:flex-row gap-6 p-6 md:p-8 bg-white border border-slate-100 rounded-3xl hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5 transition-all duration-300">
      <div className="flex flex-row md:flex-col items-center justify-between md:justify-start gap-4">
        <span className="text-4xl md:text-5xl font-bold text-slate-100 group-hover:text-emerald-100 transition-colors leading-none">
          {number}
        </span>
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
          {icon}
        </div>
      </div>
      <div className="flex-1 md:pt-2">
        <div className="inline-block px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest rounded-lg mb-3">
          {tag}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

function TierRow({ rank, bonus, active }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
      active 
      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
      : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
    }`}>
      <span className="font-bold uppercase tracking-wider text-[12px]">{rank}</span>
      <span className="font-semibold text-[12px]">{bonus}</span>
    </div>
  );
}