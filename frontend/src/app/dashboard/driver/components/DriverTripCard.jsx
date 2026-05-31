"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation, Users, Play, Square, Loader2,
  Edit2, Check, X, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { playPopSound } from '../../../utils/sounds';
import { toast } from 'react-hot-toast';

/* ─── GLOBAL STYLES injected once ─────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');

  .dtc-root * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

  .dtc-bar {
    position: fixed;
    top: 0; left: 50%; z-index: 9999;
    width: 100%; max-width: 520px;
    padding: 10px 12px 0;
    transform: translateX(-50%) translateY(-110%);
    transition: transform 300ms cubic-bezier(0.34, 1.45, 0.64, 1);
    font-family: 'DM Sans', sans-serif;
  }
  .dtc-bar.dtc-bar--open {
    transform: translateX(-50%) translateY(0px);
  }
  .dtc-bar-inner {
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 12px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.07);
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .dtc-bar-top {
    display: flex;
    align-items: flex-start;
    gap: 11px;
  }
  .dtc-bar-icon {
    flex-shrink: 0;
    width: 38px; height: 38px;
    border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
  }
  .dtc-bar-icon--warn { background: #fff8ed; border: 1.5px solid #f6c96b; }
  .dtc-bar-icon--ok   { background: #f0fdf6; border: 1.5px solid #86efac; }
  .dtc-bar-text { flex: 1; }
  .dtc-bar-title {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }
  .dtc-bar-body {
    margin: 4px 0 0;
    font-size: 11.5px;
    font-weight: 500;
    color: #64748b;
    line-height: 1.5;
  }
  .dtc-bar-body strong { color: #0f172a; font-weight: 700; }
  .dtc-bar-actions {
    display: flex;
    gap: 8px;
  }
  .dtc-btn-cancel {
    flex: 1;
    padding: 9px;
    border-radius: 11px;
    border: 1.5px solid #e2e8f0;
    background: #f8fafc;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    cursor: pointer;
    letter-spacing: 0.01em;
    transition: background 150ms, color 150ms;
  }
  .dtc-btn-cancel:hover { background: #f1f5f9; color: #334155; }
  .dtc-btn-confirm {
    flex: 2;
    padding: 9px;
    border-radius: 11px;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    letter-spacing: 0.01em;
    transition: opacity 150ms, transform 150ms;
  }
  .dtc-btn-confirm--warn { background: #f59e0b; }
  .dtc-btn-confirm--ok   { background: #16a34a; }
  .dtc-btn-confirm:hover { opacity: 0.88; transform: scale(1.01); }

  .dtc-backdrop {
    position: fixed; inset: 0; z-index: 9998;
    background: rgba(0,0,0,0.15);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 250ms ease;
  }
  .dtc-backdrop--open { opacity: 1; pointer-events: auto; }

  /* Card */
  .dtc-card {
    font-family: 'DM Sans', sans-serif;
    background: #fff;
    border-radius: 28px;
    border: 1.5px solid #f1f5f9;
    padding: 22px;
    position: relative;
    overflow: hidden;
    transition: border-color 300ms, box-shadow 300ms;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  }
  .dtc-card--live {
    border-color: #34d399;
    box-shadow: 0 4px 24px rgba(52,211,153,0.12);
  }

  .dtc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .dtc-route {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  .dtc-city {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .dtc-arrow { color: #cbd5e1; font-size: 14px; }
  .dtc-badge {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 9px;
    border-radius: 20px;
    flex-shrink: 0;
    margin-left: 8px;
  }
  .dtc-badge--live { background: #dcfce7; color: #15803d; }
  .dtc-badge--full { background: #fef9c3; color: #854d0e; }
  .dtc-badge--open { background: #f1f5f9; color: #64748b; }

  .dtc-meta {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  .dtc-meta-cell {
    flex: 1;
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 14px;
    padding: 11px 13px;
  }
  .dtc-meta-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 3px;
  }
  .dtc-meta-value {
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
    font-family: 'DM Mono', monospace;
  }

  .dtc-seats-row {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 16px;
  }
  .dtc-seat {
    flex: 1;
    height: 5px;
    border-radius: 99px;
    transition: background 300ms;
  }
  .dtc-seat--filled { background: #0f172a; }
  .dtc-seat--empty  { background: #e2e8f0; }
  .dtc-seats-label {
    font-size: 10px;
    font-weight: 600;
    color: #94a3b8;
    white-space: nowrap;
    font-family: 'DM Mono', monospace;
  }

  .dtc-fare-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 14px;
    padding: 11px 13px;
    margin-bottom: 16px;
    min-height: 52px;
  }
  .dtc-fare-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 2px;
  }
  .dtc-fare-value {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    font-family: 'DM Mono', monospace;
  }
  .dtc-fare-sub {
    font-size: 10px;
    font-weight: 500;
    color: #94a3b8;
    font-family: 'DM Sans', sans-serif;
    margin-left: 3px;
  }
  .dtc-edit-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 7px 12px;
    background: #fff;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 700;
    color: #64748b;
    cursor: pointer;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    transition: border-color 150ms, color 150ms;
    flex-shrink: 0;
  }
  .dtc-edit-btn:hover { border-color: #0f172a; color: #0f172a; }
  .dtc-price-input-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }
  .dtc-price-prefix {
    font-size: 10px;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .dtc-price-input {
    flex: 1;
    background: #fff;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 6px 10px;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
    outline: none;
    -moz-appearance: textfield;
    appearance: textfield;
    transition: border-color 150ms;
    min-width: 0;
  }
  .dtc-price-input::-webkit-outer-spin-button,
  .dtc-price-input::-webkit-inner-spin-button { -webkit-appearance: none; }
  .dtc-price-input:focus { border-color: #0f172a; }
  .dtc-icon-btn {
    width: 32px; height: 32px;
    border-radius: 9px;
    border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: opacity 150ms;
    flex-shrink: 0;
  }
  .dtc-icon-btn:hover { opacity: 0.8; }
  .dtc-icon-btn--save   { background: #0f172a; color: #fff; }
  .dtc-icon-btn--cancel { background: #f1f5f9; border: 1px solid #e2e8f0; color: #94a3b8; }

  .dtc-action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #0f172a;
    border-radius: 18px;
    padding: 10px 10px 10px 16px;
    gap: 12px;
  }
  .dtc-pax-info { display: flex; align-items: center; gap: 10px; }
  .dtc-pax-icon {
    width: 34px; height: 34px;
    border-radius: 10px;
    background: rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.5);
    flex-shrink: 0;
  }
  .dtc-pax-count {
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    font-family: 'DM Mono', monospace;
    letter-spacing: -0.02em;
  }
  .dtc-pax-sub {
    font-size: 9px;
    font-weight: 600;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 1px;
  }
  .dtc-action-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 11px 20px;
    border-radius: 13px;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 150ms, transform 150ms;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .dtc-action-btn:active:not(:disabled) { transform: scale(0.97); }
  .dtc-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .dtc-action-btn--start { background: #34d399; color: #0f172a; }
  .dtc-action-btn--end   { background: #fff; color: #e11d48; }

  .dtc-glow {
    position: absolute;
    bottom: -30px; right: -30px;
    width: 120px; height: 120px;
    border-radius: 50%;
    filter: blur(40px);
    pointer-events: none;
    transition: background 500ms;
  }

  @keyframes dtc-spin { to { transform: rotate(360deg); } }
  .dtc-spin { animation: dtc-spin 1s linear infinite; }
`;

let styleInjected = false;
function injectStyle() {
  if (styleInjected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = STYLE;
  document.head.appendChild(el);
  styleInjected = true;
}

/* ─── NOTIFICATION BAR ─────────────────────────────────────────────── */
function NotificationBar({ notification, onConfirm, onCancel }) {
  const [open, setOpen] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (notification) { setExiting(false); requestAnimationFrame(() => setOpen(true)); }
    else setOpen(false);
  }, [notification]);

  if (!notification) return null;

  const isWarn = notification.type === 'warn';

  const confirm = () => { setExiting(true); setTimeout(() => { setOpen(false); onConfirm(); }, 220); };
  const cancel  = () => { setExiting(true); setTimeout(() => { setOpen(false); onCancel(); }, 220); };

  const showing = open && !exiting;

  return (
    <>
      <div className={`dtc-backdrop${showing ? ' dtc-backdrop--open' : ''}`} onClick={cancel} />
      <div className={`dtc-bar${showing ? ' dtc-bar--open' : ''}`}>
        <div className="dtc-bar-inner">
          <div className="dtc-bar-top">
            <div className={`dtc-bar-icon${isWarn ? ' dtc-bar-icon--warn' : ' dtc-bar-icon--ok'}`}>
              {isWarn
                ? <AlertTriangle size={18} color="#f59e0b" />
                : <CheckCircle2 size={18} color="#16a34a" />}
            </div>
            <div className="dtc-bar-text">
              <p className="dtc-bar-title">{notification.title}</p>
              <p className="dtc-bar-body" dangerouslySetInnerHTML={{ __html: notification.body }} />
            </div>
          </div>
          <div className="dtc-bar-actions">
            <button className="dtc-btn-cancel" onClick={cancel}>Cancel</button>
            <button
              className={`dtc-btn-confirm${isWarn ? ' dtc-btn-confirm--warn' : ' dtc-btn-confirm--ok'}`}
              onClick={confirm}
            >
              {notification.confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── MAIN CARD ────────────────────────────────────────────────────── */
export default function DriverTripCard({ trip, onStart, onEnd }) {
  injectStyle();

  const [status, setStatus]               = useState(trip.status || 'scheduled');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isEditingPrice, setIsEditingPrice]   = useState(false);
  const [livePrice, setLivePrice]             = useState(trip.price || 0);
  const [notification, setNotification]       = useState(null);
  const pendingAction = useRef(null);

  const passengerCount = trip.passengers?.length || 0;
  const totalSeats     = trip.total_seats || 4;
  const isFull         = passengerCount >= totalSeats;
  const emptySeats     = totalSeats - passengerCount;
  const live           = status === 'in-progress';

  useEffect(() => { if (trip.price) setLivePrice(trip.price); }, [trip.price]);

  const formatTime = (t) => {
    if (!t) return "—";
    try {
      const [h, m] = t.split(':').map(Number);
      return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
    } catch { return t; }
  };

  const formatDate = (d) => {
    if (!d) return "Today";
    try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); }
    catch { return d; }
  };

  const showNotif = (config, cb) => { pendingAction.current = cb; setNotification(config); };
  const handleConfirm = () => { setNotification(null); pendingAction.current?.(); pendingAction.current = null; };
  const handleCancel  = () => { setNotification(null); pendingAction.current = null; };

  const handleSavePrice = async () => {
    if (!livePrice || Number(livePrice) < 500) { toast.error("Minimum fare is Rs. 500"); return; }
    try {
      setIsActionLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${trip.id}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ new_price: Number(livePrice) })
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Could not update"); }
      toast.success("Price updated!");
      setIsEditingPrice(false);
    } catch (err) { toast.error(err.message); setLivePrice(trip.price); }
    finally { setIsActionLoading(false); }
  };

  const handleStartTrip = () => {
    if (!isFull) {
      showNotif({
        type: 'warn',
        title: `${emptySeats} seat${emptySeats > 1 ? 's' : ''} still empty`,
        body: `You have <strong>${passengerCount} of ${totalSeats} passengers</strong>.<br/>After you start, no one new can book this trip.`,
        confirmLabel: 'Yes, Start Now',
      }, executeStart);
    } else {
      showNotif({
        type: 'ok',
        title: 'All seats filled!',
        body: `<strong>${totalSeats} passengers</strong> ready to go.<br/>${trip.origin} → ${trip.destination}`,
        confirmLabel: 'Start Trip',
      }, executeStart);
    }
  };

  const executeStart = async () => {
    try {
      setIsActionLoading(true);
      playPopSound();
      if (onStart) { await onStart(trip.id); setStatus('in-progress'); setIsEditingPrice(false); toast.success("Trip started. Drive safe!"); }
    } catch { toast.error("Could not start trip."); }
    finally { setIsActionLoading(false); }
  };

  const handleEndTrip = () => {
    showNotif({
      type: 'ok',
      title: 'End this trip?',
      body: 'This will mark the journey as <strong>completed</strong> for all passengers.',
      confirmLabel: 'End Trip',
    }, executeEnd);
  };

  const executeEnd = async () => {
    try {
      setIsActionLoading(true);
      playPopSound();
      if (onEnd) { await onEnd(trip.id); setStatus('completed'); toast.success("Trip completed."); setTimeout(() => window.location.reload(), 1000); }
    } catch { toast.error("Could not end trip."); }
    finally { setIsActionLoading(false); }
  };

  return (
    <div className="dtc-root">
      <NotificationBar notification={notification} onConfirm={handleConfirm} onCancel={handleCancel} />

      <div className={`dtc-card${live ? ' dtc-card--live' : ''}`}>

        {/* ── Header ── */}
        <div className="dtc-header">
          <div className="dtc-route">
            <span className="dtc-city">{trip.origin}</span>
            <span className="dtc-arrow">→</span>
            <span className="dtc-city">{trip.destination}</span>
          </div>
          <span className={`dtc-badge ${live ? 'dtc-badge--live' : isFull ? 'dtc-badge--full' : 'dtc-badge--open'}`}>
            {live ? '● Live' : isFull ? 'Full' : 'Open'}
          </span>
        </div>

        {/* ── Date + Time ── */}
        <div className="dtc-meta">
          <div className="dtc-meta-cell">
            <div className="dtc-meta-label">Date</div>
            <div className="dtc-meta-value">{formatDate(trip.date)}</div>
          </div>
          <div className="dtc-meta-cell">
            <div className="dtc-meta-label">Departure</div>
            <div className="dtc-meta-value">{formatTime(trip.time)}</div>
          </div>
        </div>

        {/* ── Seat bar ── */}
        <div className="dtc-seats-row">
          {Array.from({ length: totalSeats }).map((_, i) => (
            <div key={i} className={`dtc-seat ${i < passengerCount ? 'dtc-seat--filled' : 'dtc-seat--empty'}`} />
          ))}
          <span className="dtc-seats-label">{passengerCount}/{totalSeats}</span>
        </div>

        {/* ── Fare ── */}
        <div className="dtc-fare-row">
          {isEditingPrice && !live ? (
            <div className="dtc-price-input-wrap">
              <span className="dtc-price-prefix">PKR</span>
              <input
                className="dtc-price-input"
                type="number"
                value={livePrice}
                disabled={isActionLoading}
                onChange={(e) => setLivePrice(e.target.value)}
              />
              <button className="dtc-icon-btn dtc-icon-btn--save" disabled={isActionLoading} onClick={handleSavePrice}>
                {isActionLoading ? <Loader2 size={13} className="dtc-spin" /> : <Check size={13} />}
              </button>
              <button className="dtc-icon-btn dtc-icon-btn--cancel" disabled={isActionLoading}
                onClick={() => { setIsEditingPrice(false); setLivePrice(trip.price); }}>
                <X size={13} />
              </button>
            </div>
          ) : (
            <>
              <div>
                <div className="dtc-fare-label">Fare per seat</div>
                <div>
                  <span className="dtc-fare-value">PKR {Number(livePrice).toLocaleString()}</span>
                  <span className="dtc-fare-sub">/ seat</span>
                </div>
              </div>
              {!live && (
                <button className="dtc-edit-btn" onClick={() => setIsEditingPrice(true)}>
                  <Edit2 size={10} /> Edit
                </button>
              )}
            </>
          )}
        </div>

        {/* ── Action bar ── */}
        <div className="dtc-action-bar">
          <div className="dtc-pax-info">
            <div className="dtc-pax-icon"><Users size={14} /></div>
            <div>
              <div className="dtc-pax-count">{passengerCount} passenger</div>
              <div className="dtc-pax-sub">{live ? 'In transit' : 'Booked'}</div>
            </div>
          </div>

          {!live ? (
            <button className="dtc-action-btn dtc-action-btn--start" disabled={isActionLoading} onClick={handleStartTrip}>
              {isActionLoading
                ? <Loader2 size={13} className="dtc-spin" />
                : <Play size={13} fill="currentColor" />}
              {isActionLoading ? 'Please wait…' : 'Start Trip'}
            </button>
          ) : (
            <button className="dtc-action-btn dtc-action-btn--end" disabled={isActionLoading} onClick={handleEndTrip}>
              {isActionLoading
                ? <Loader2 size={13} className="dtc-spin" />
                : <Square size={13} fill="currentColor" />}
              {isActionLoading ? 'Please wait…' : 'End Trip'}
            </button>
          )}
        </div>

        {/* Glow */}
        <div className="dtc-glow" style={{ background: live ? 'rgba(52,211,153,0.15)' : 'rgba(148,163,184,0.08)' }} />
      </div>
    </div>
  );
}