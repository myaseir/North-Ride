"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Auth from './components/Auth';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Image from 'next/image';
import {
  Loader2, ShieldCheck, MapPin,
  Zap, ChevronDown, Car, ArrowRight
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token   = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const u = JSON.parse(userStr);
        router.push(u.roles?.includes('DRIVER') ? '/dashboard/driver' : '/dashboard/passenger');
        return;
      } catch {}
    }
    setLoading(false);
  }, [router]);

  const handleLoginSuccess = (res) => {
    localStorage.setItem('token', res.access_token);
    localStorage.setItem('user', JSON.stringify(res.user));
    router.push(res.user.roles?.includes('DRIVER') ? '/dashboard/driver' : '/dashboard/passenger');
  };

  if (loading) return (
    <div className="hp-loading" role="status" aria-label="Loading">
      <Loader2 size={30} color="#34d399" className="hp-spin" />
    </div>
  );

  return (
    <main className="hp-root">
      <Navbar />

      {/* ── 1. HERO ── */}
      <section className="hp-hero" aria-label="Hero">
        <div className="hp-hero-glow" aria-hidden="true" />

        <div className="hp-hero-grid">
          {/* Left — text */}
          <div className="hp-anim-left" style={{ position: 'relative' }}>
            
            {/* 🎯 THE DESKTOP HIDE: Image only loads or visualizes on mobile screens */}
            <div className="block lg:hidden">
              <Image
                src="/bg.webp"
                alt="Karakoram Mountains Background"
                width={764}
                height={1019}
                priority={true}          
                fetchPriority="high"            
                loading="eager"                
                aria-hidden="true"
                className="hp-mobile-bg"
                sizes="(max-width: 1024px) 100vw, 1px"
              />
            </div>

            <div className="hp-tag">
              <MapPin size={11} aria-hidden="true" />
              Gilgit-Baltistan &amp; Twin Cities
            </div>

            <h1 className="hp-h1">
              Three Ranges.<br />
              <span className="hp-h1-em">One Road.</span>
            </h1>

            <p className="hp-hero-desc">
              Book a safe, comfortable seat across the mountains.
              Simple travel for everyone.
            </p>
          </div>

          {/* Right — auth form */}
          <div className="hp-anim-right">
            <div className="hp-auth-wrap">
              <Auth onLoginSuccess={handleLoginSuccess} />
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="hp-scroll-hint" aria-hidden="true">
          <span className="hp-scroll-label">Discover More</span>
          <ChevronDown size={17} className="hp-scroll-arrow" />
        </div>
      </section>

      {/* ── 2. FEATURES ── */}
      <section className="hp-section hp-section--gray" aria-labelledby="features-heading">
        <div className="hp-inner">
          <div className="hp-section-center">
            <h2 id="features-heading" className="hp-section-h2">Travel with confidence</h2>
          </div>
          <div className="hp-features-grid">
            <FeatureCard
              icon={<ShieldCheck size={24} color="#16a34a" />}
              title="Always Safe"
              desc="We check every driver's ID. Your trip is tracked from start to finish so you can relax."
            />
            <FeatureCard
              icon={<Zap size={24} color="#16a34a" />}
              title="Fixed Prices"
              desc="You see the price before you book. No bargaining, no hidden fees — just fair rates."
            />
            <FeatureCard
              icon={<Car size={24} color="#16a34a" />}
              title="Clean Cars"
              desc="We only allow clean, well-maintained cars with heating and air conditioning."
            />
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ── */}
      <section className="hp-section hp-section--white" aria-labelledby="how-heading">
        <div className="hp-inner">
          <div className="hp-how-grid">
            <div className="hp-steps">
              <div>
                <p className="hp-eyebrow">How it works</p>
                <h2 id="how-heading" className="hp-section-h2">Book your seat<br />in 3 steps.</h2>
              </div>
              <StepItem n="1" title="Choose your route"  text="Tell us where you are and where you want to go." />
              <StepItem n="2" title="Pick a driver"      text="Look at driver ratings and choose the best car for you." />
              <StepItem n="3" title="Enjoy the ride"     text="Meet your driver and travel safely to your destination." />
            </div>

            <div className="hp-visual" aria-hidden="true">
              <div className="hp-visual-ring" />
              <div className="hp-visual-center">
                <div className="hp-visual-icon">
                  <MapPin size={28} color="#16a34a" />
                </div>
                <div className="hp-visual-bar">
                  <div className="hp-visual-fill" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. ROUTES ── */}
      <section className="hp-section hp-section--gray" aria-labelledby="routes-heading">
        <div className="hp-inner">
          <div className="hp-routes-header">
            <div>
              <p className="hp-eyebrow">Where we go</p>
              <h2 id="routes-heading" className="hp-section-h2">Our top routes</h2>
            </div>
            <p className="hp-routes-sub">We connect the Twin Cities to the highest peaks.</p>
          </div>
          <div className="hp-routes-grid">
            <RouteCard from="Islamabad / Rawalpindi" to="Gilgit"  time="12–14 hrs" />
            <RouteCard from="Islamabad / Rawalpindi" to="Skardu"  time="18–20 hrs" />
            <RouteCard from="Gilgit"                 to="Hunza"   time="Coming soon" />
            <RouteCard from="Gilgit"                 to="Skardu"  time="Coming soon" />
          </div>
        </div>
      </section>

      {/* ── 5. CTA ── */}
      <section className="hp-cta" aria-labelledby="cta-heading">
        <h2 id="cta-heading" className="hp-cta-h2">Ready to travel?</h2>
        <p className="hp-cta-sub">Create your account today. It takes less than a minute.</p>
        <button 
          onClick={() => {
            if (typeof window !== "undefined") {
              requestAnimationFrame(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              });
            }
          }} 
          className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-semibold uppercase text-[12px] tracking-wide transition-all active:scale-95 shadow-xl shadow-slate-200 duration-150"
        >
          Start Booking <ArrowRight size={16} />
        </button>
      </section>

      <Footer />
    </main>
  );
}

/* ─── SUB-COMPONENTS ───────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="hp-feature-card">
      <div className="hp-feature-icon" aria-hidden="true">{icon}</div>
      <h3 className="hp-feature-title">{title}</h3>
      <p className="hp-feature-desc">{desc}</p>
    </div>
  );
}

function StepItem({ n, title, text }) {
  return (
    <div className="hp-step">
      <div className="hp-step-num" aria-hidden="true">{n}</div>
      <div>
        <h3 className="hp-step-title">{title}</h3>
        <p className="hp-step-text">{text}</p>
      </div>
    </div>
  );
}

function RouteCard({ from, to, time }) {
  return (
    <div className="hp-route-card">
      <div className="hp-route-line" aria-hidden="true">
        <span className="hp-route-dot" />
        <span className="hp-route-dash" />
        <MapPin size={14} color="#34d399" />
      </div>
      <p className="hp-route-from">{from}</p>
      <p className="hp-route-to">{to}</p>
      <p className="hp-route-time">Est. {time}</p>
    </div>
  );
}