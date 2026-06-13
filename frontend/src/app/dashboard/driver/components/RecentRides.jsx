"use client";

import { useState } from 'react';
import { History, ArrowUpRight, Ban, CheckCircle2, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ─── STYLES ───────────────────────────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');

  .rr-root * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
  .rr-root { font-family: 'DM Sans', sans-serif; margin-top: 24px; }

  .rr-card {
    background: #fff;
    border: 1.5px solid #f1f5f9;
    border-radius: 28px;
    padding: 22px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  }

  /* Header */
  .rr-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .rr-header-left { display: flex; align-items: center; gap: 10px; }
  .rr-header-icon {
    width: 36px; height: 36px;
    background: #0f172a;
    border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .rr-title {
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.01em;
  }
  .rr-count-badge {
    font-size: 10px;
    font-weight: 700;
    color: #16a34a;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 20px;
    padding: 4px 10px;
    font-family: 'DM Mono', monospace;
  }

  /* Ride row */
  .rr-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px;
    border-radius: 18px;
    border: 1.5px solid #f1f5f9;
    background: #fafafa;
    margin-bottom: 8px;
    transition: border-color 200ms, background 200ms, box-shadow 200ms;
  }
  .rr-row:last-child { margin-bottom: 0; }
  .rr-row:hover {
    background: #fff;
    border-color: #e2e8f0;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  }

  .rr-row-left { display: flex; align-items: center; gap: 12px; min-width: 0; }

  .rr-status-icon {
    width: 38px; height: 38px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .rr-status-icon--done   { background: #f0fdf4; color: #16a34a; }
  .rr-status-icon--cancel { background: #fff1f2; color: #e11d48; }

  .rr-info { min-width: 0; }
  .rr-route {
    font-size: 12.5px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 3px;
  }
  .rr-route-arrow { color: #cbd5e1; margin: 0 4px; }
  .rr-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .rr-date {
    font-size: 10px;
    font-weight: 600;
    color: #94a3b8;
  }
  .rr-dot {
    width: 3px; height: 3px;
    border-radius: 50%;
    background: #cbd5e1;
    flex-shrink: 0;
  }
  .rr-status-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .rr-status-label--done   { color: #16a34a; }
  .rr-status-label--cancel { color: #e11d48; }
  .rr-id-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 5px;
  }
  .rr-id {
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    font-weight: 500;
    color: #94a3b8;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 2px 7px;
  }
  .rr-copy-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #cbd5e1;
    padding: 2px;
    display: flex;
    align-items: center;
    transition: color 150ms;
  }
  .rr-copy-btn:hover { color: #16a34a; }

  /* Earnings */
  .rr-earnings { text-align: right; flex-shrink: 0; }
  .rr-amount {
    font-size: 14px;
    font-weight: 700;
    font-family: 'DM Mono', monospace;
    letter-spacing: -0.02em;
  }
  .rr-amount--done   { color: #0f172a; }
  .rr-amount--cancel { color: #cbd5e1; text-decoration: line-through; }
  .rr-currency {
    font-size: 9px;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  /* Expand / collapse */
  .rr-expand-btn {
    width: 100%;
    margin-top: 12px;
    padding: 13px;
    background: #f8fafc;
    border: 1.5px solid #f1f5f9;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    cursor: pointer;
    transition: background 150ms, border-color 150ms, color 150ms;
    letter-spacing: 0.02em;
  }
  .rr-expand-btn:hover { background: #f0fdf4; border-color: #bbf7d0; color: #16a34a; }

  .rr-collapse-btn {
    width: 100%;
    margin-top: 6px;
    padding: 10px;
    background: none;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 700;
    color: #94a3b8;
    cursor: pointer;
    transition: color 150ms;
    letter-spacing: 0.02em;
  }
  .rr-collapse-btn:hover { color: #e11d48; }

  /* Empty state */
  .rr-empty {
    padding: 40px 20px;
    text-align: center;
    border: 2px dashed #f1f5f9;
    border-radius: 18px;
    background: #fafafa;
  }
  .rr-empty-icon {
    width: 44px; height: 44px;
    background: #fff;
    border: 1.5px solid #f1f5f9;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 12px;
  }
  .rr-empty-text {
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
  }
`;

let styleInjected = false;
function injectStyle() {
  if (styleInjected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = STYLE;
  document.head.appendChild(el);
  styleInjected = true;
}

/* ─── COMPONENT ────────────────────────────────────────────────────── */
export default function RecentRides({ rides = [] }) {
  injectStyle();
  const [viewMode, setViewMode] = useState(3);

  const copyTripId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    toast.success("ID copied", {
      style: {
        borderRadius: '12px',
        background: '#0f172a',
        color: '#fff',
        fontSize: '12px',
        fontWeight: '600',
        fontFamily: "'DM Sans', sans-serif",
      }
    });
  };

  const displayed = viewMode === 'all' ? rides : rides.slice(0, viewMode);
  const hasMore   = rides.length > displayed.length;
  const canLess   = viewMode !== 3;

  return (
    <div className="rr-root">
      <div className="rr-card">

        {/* Header */}
        <div className="rr-header">
          <div className="rr-header-left">
            <div className="rr-header-icon">
              <History color="#34d399" size={16} />
            </div>
            <span className="rr-title">Past Trips</span>
          </div>
          {rides.length > 0 && (
            <span className="rr-count-badge">{rides.length} trips</span>
          )}
        </div>

        {/* List */}
        {displayed.length > 0 ? (
          <>
            {displayed.map((ride, i) => {
              const isDone = (ride.status || 'completed').toLowerCase() === 'completed';
              const date   = ride.timestamp
                ? new Date(ride.timestamp).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
                : 'Recent';

              // 🎯 THE REVENUE CALCULATION ENGINE CORRECTION
              // Check for explicit pre-computed platform earnings first. 
              // If missing, look for confirmed passengers on board to scale the fare accurately.
             // 🎯 UPDATED REVENUE CALCULATION ENGINE
// 🎯 UPDATED REVENUE CALCULATION ENGINE
let totalEarnings = 0;

if (ride.earnings != null) {
  totalEarnings = Number(ride.earnings);
} else {
  // Sum up 'total_price' from all confirmed bookings
  const bookings = ride.bookings || [];
  
  totalEarnings = bookings.reduce((sum, b) => {
    // Only count confirmed/completed bookings
    const isConfirmed = b.status?.toLowerCase() === 'completed' || b.status?.toLowerCase() === 'confirmed';
    if (!isConfirmed) return sum;
    
    // Use the pre-calculated total from the backend
    return sum + Number(b.total_price || 0);
  }, 0);
}

              return (
                <div key={ride._id || i} className="rr-row">
                  <div className="rr-row-left">
                    {/* Icon */}
                    <div className={`rr-status-icon ${isDone ? 'rr-status-icon--done' : 'rr-status-icon--cancel'}`}>
                      {isDone ? <ArrowUpRight size={16} /> : <Ban size={16} />}
                    </div>

                    {/* Info */}
                    <div className="rr-info">
                      <div className="rr-route">
                        {ride.origin || 'Start'}
                        <span className="rr-route-arrow">→</span>
                        {ride.destination || 'End'}
                      </div>
                      <div className="rr-meta">
                        <span className="rr-date">{date}</span>
                        <span className="rr-dot" />
                        <span className={`rr-status-label ${isDone ? 'rr-status-label--done' : 'rr-status-label--cancel'}`}>
                          {isDone ? 'Done' : 'Cancelled'}
                        </span>
                      </div>
                      <div className="rr-id-row">
                        <span className="rr-id">{ride.id ? ride.id.substring(0, 8) : 'N/A'}</span>
                        <button className="rr-copy-btn" onClick={() => copyTripId(ride.id)} title="Copy ID">
                          <Copy size={11} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Earnings */}
                  <div className="rr-earnings">
                    <div className={`rr-amount ${isDone ? 'rr-amount--done' : 'rr-amount--cancel'}`}>
                      {isDone ? `+${totalEarnings.toLocaleString()}` : '—'}
                    </div>
                    <div className="rr-currency">PKR</div>
                  </div>
                </div>
              );
            })}

            {/* Show more / less */}
            {hasMore && (
              <button className="rr-expand-btn" onClick={() => setViewMode(viewMode === 3 ? 10 : 'all')}>
                <ChevronDown size={14} />
                {viewMode === 3 ? 'Show 10 trips' : 'Show all trips'}
              </button>
            )}
            {canLess && (
              <button className="rr-collapse-btn" onClick={() => setViewMode(3)}>
                <ChevronUp size={13} />
                Show less
              </button>
            )}
          </>
        ) : (
          <div className="rr-empty">
            <div className="rr-empty-icon">
              <History color="#cbd5e1" size={18} />
            </div>
            <p className="rr-empty-text">No trips yet</p>
          </div>
        )}

      </div>
    </div>
  );
}