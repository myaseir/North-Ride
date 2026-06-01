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

/* ─── STYLES ───────────────────────────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@1&display=swap');

  .hp-root * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
  .hp-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: #fff;
    overflow-x: hidden;
  }

  /* ── Fade-in animations (CSS only, no framer-motion) ── */
  @keyframes hp-fadein {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes hp-fadein-right {
    from { opacity: 0; transform: translateX(16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes hp-bounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(6px); }
  }
  @keyframes hp-spin-slow {
    to { transform: rotate(360deg); }
  }
  @keyframes hp-shimmer {
    to { background-position: -200% 0; }
  }

  .hp-anim-left  { animation: hp-fadein       0.55s ease both; }
  .hp-anim-right { animation: hp-fadein-right 0.55s ease 0.1s both; }
  .hp-anim-up    { animation: hp-fadein       0.45s ease both; }
  .hp-anim-up-d1 { animation: hp-fadein       0.45s ease 0.1s both; }
  .hp-anim-up-d2 { animation: hp-fadein       0.45s ease 0.2s both; }

  /* ── Loading ── */
  .hp-loading {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .hp-spin { animation: spin 1s linear infinite; }

  /* ── Hero ── */
  .hp-hero {
    position: relative;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    padding: 112px 24px 48px;
    background: #fff;
    overflow: hidden;
  }
  .hp-hero-glow {
    position: absolute;
    top: 0; right: 0;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(209,250,229,0.6) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  .hp-hero-grid {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
    position: relative;
    z-index: 1;
    flex: 1;
    align-items: start;
  }
  @media (min-width: 1024px) {
    .hp-hero { padding-top: 140px; }
    .hp-hero-grid { grid-template-columns: 1fr 1fr; gap: 64px; align-items: start; }
  }

  /* Tag */
  .hp-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 20px;
    font-size: 10.5px;
    font-weight: 700;
    color: #15803d;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 20px;
  }

  /* Heading */
  .hp-h1 {
    font-size: clamp(42px, 7vw, 72px);
    font-weight: 700;
    color: #0f172a;
    line-height: 1.08;
    letter-spacing: -0.03em;
    margin-bottom: 20px;
  }
  .hp-h1-em {
    font-style: italic;
    font-weight: 300;
    color: #16a34a;
    font-family: 'DM Serif Display', Georgia, serif;
  }

  .hp-hero-desc {
    font-size: 15px;
    font-weight: 500;
    color: #64748b;
    line-height: 1.7;
    max-width: 420px;
    margin-bottom: 0;
  }

  /* Auth card wrapper */
  .hp-auth-wrap {
    width: 100%;
    max-width: 440px;
    margin: 0 auto;
    position: relative;
  }
  @media (min-width: 1024px) {
    .hp-auth-wrap { margin: 0 0 0 auto; }
  }

  /* Scroll indicator */
  .hp-scroll-hint {
    display: none;
    flex-direction: column;
    align-items: center;
    position: absolute;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0.45;
    z-index: 2;
  }
  @media (min-width: 1024px) { .hp-scroll-hint { display: flex; } }
  .hp-scroll-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    color: #94a3b8;
  }
  .hp-scroll-arrow {
    margin-top: 6px;
    color: #94a3b8;
    animation: hp-bounce 2s ease-in-out infinite;
  }

  /* ── Section shared ── */
  .hp-section { padding: 80px 24px; }
  .hp-section--gray { background: #f8fafc; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
  .hp-section--white { background: #fff; }
  .hp-inner { max-width: 1120px; margin: 0 auto; }

  .hp-eyebrow {
    font-size: 10px;
    font-weight: 700;
    color: #16a34a;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 10px;
  }
  .hp-section-h2 {
    font-size: clamp(26px, 4vw, 36px);
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }
  .hp-section-center { text-align: center; margin-bottom: 56px; }

  /* ── Feature cards ── */
  .hp-features-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }
  @media (min-width: 768px) { .hp-features-grid { grid-template-columns: repeat(3, 1fr); } }

  .hp-feature-card {
    background: #fff;
    border: 1.5px solid #f1f5f9;
    border-radius: 24px;
    padding: 28px 24px;
    transition: box-shadow 200ms, border-color 200ms, transform 200ms;
  }
  .hp-feature-card:hover {
    box-shadow: 0 8px 32px rgba(0,0,0,0.07);
    border-color: #e2e8f0;
    transform: translateY(-4px);
  }
  .hp-feature-icon {
    width: 48px; height: 48px;
    background: #f8fafc;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 18px;
    transition: background 200ms;
  }
  .hp-feature-card:hover .hp-feature-icon { background: #f0fdf4; }
  .hp-feature-title {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 10px;
  }
  .hp-feature-desc {
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    line-height: 1.65;
  }

  /* ── How it works ── */
  .hp-how-grid {
    display: flex;
    flex-direction: column;
    gap: 48px;
    align-items: center;
  }
  @media (min-width: 768px) {
    .hp-how-grid { flex-direction: row; gap: 64px; }
  }

  .hp-steps { display: flex; flex-direction: column; gap: 28px; flex: 1; }
  .hp-step  { display: flex; gap: 18px; align-items: flex-start; }
  .hp-step-num {
    width: 36px; height: 36px;
    border-radius: 11px;
    background: #f0fdf4;
    border: 1.5px solid #bbf7d0;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: #16a34a;
    flex-shrink: 0;
  }
  .hp-step-title {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }
  .hp-step-text {
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    line-height: 1.6;
  }

  /* Abstract visual */
  .hp-visual {
    flex: 1;
    width: 100%;
    max-width: 360px;
    aspect-ratio: 1;
    background: #f8fafc;
    border: 1.5px solid #f1f5f9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin: 0 auto;
  }
  .hp-visual-ring {
    position: absolute;
    inset: 12px;
    border-radius: 50%;
    border: 1.5px dashed #d1fae5;
    animation: hp-spin-slow 60s linear infinite;
  }
  .hp-visual-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    position: relative;
    z-index: 1;
  }
  .hp-visual-icon {
    width: 56px; height: 56px;
    background: #fff;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
  }
  .hp-visual-bar {
    width: 80px; height: 6px;
    background: #e2e8f0;
    border-radius: 99px;
    overflow: hidden;
  }
  .hp-visual-fill {
    width: 50%; height: 100%;
    background: #34d399;
    border-radius: 99px;
  }

  /* ── Routes ── */
  .hp-routes-header {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 40px;
  }
  @media (min-width: 768px) {
    .hp-routes-header { flex-direction: row; align-items: flex-end; justify-content: space-between; }
  }
  .hp-routes-sub {
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    max-width: 240px;
  }

  .hp-routes-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  @media (min-width: 1024px) {
    .hp-routes-grid { grid-template-columns: repeat(4, 1fr); }
  }

  .hp-route-card {
    background: #fff;
    border: 1.5px solid #f1f5f9;
    border-radius: 20px;
    padding: 20px;
    transition: border-color 200ms;
  }
  .hp-route-card:hover { border-color: #bbf7d0; }
  .hp-route-line {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 16px;
  }
  .hp-route-dot { width: 7px; height: 7px; border-radius: 50%; background: #e2e8f0; flex-shrink: 0; }
  .hp-route-dash { flex: 1; border-top: 1.5px dashed #f1f5f9; }
  .hp-route-from { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 3px; }
  .hp-route-to   { font-size: 14px; font-weight: 700; color: #16a34a; margin-bottom: 12px; }
  .hp-route-time {
    font-size: 9.5px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    padding-top: 12px;
    border-top: 1px solid #f8fafc;
  }

  /* ── CTA ── */
  .hp-cta { text-align: center; padding: 80px 24px; }
  .hp-cta-h2 {
    font-size: clamp(28px, 5vw, 40px);
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;
    margin-bottom: 12px;
  }
  .hp-cta-sub {
    font-size: 14px;
    font-weight: 500;
    color: #64748b;
    margin-bottom: 32px;
  }
  .hp-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    background: #0f172a;
    color: #fff;
    border: none;
    border-radius: 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition: background 150ms, transform 150ms;
  }
  .hp-cta-btn:hover  { background: #16a34a; }
  .hp-cta-btn:active { transform: scale(0.97); }

  /* Mobile bg image */
  .hp-mobile-bg {
    display: block;
    position: absolute;
    top: -120px;
    left: 50%;
    transform: translateX(-50%);
    width: 120%;
    max-width: 500px;
    z-index: -1;
    pointer-events: none;
    opacity: 0.45;
    filter: grayscale(1);
    -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
  }
  @media (min-width: 1024px) { .hp-mobile-bg { display: none; } }
`;

let styleInjected = false;
function injectStyle() {
  if (styleInjected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = STYLE;
  document.head.appendChild(el);
  styleInjected = true;
}

/* ─── PAGE ─────────────────────────────────────────────────────────── */
export default function Home() {
  injectStyle();
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
            {/* Mobile bg */}
            <Image
              src="/bg.webp"
              alt=""
              width={764}
              height={1019}
              priority
              className="hp-mobile-bg"
              aria-hidden="true"
            />

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
          className="hp-cta-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top to sign up"
        >
          Start booking <ArrowRight size={15} aria-hidden="true" />
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