"use client";

import React from 'react';
import { Star, User, MapPin, Info } from 'lucide-react';

/* ─── STYLES ───────────────────────────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');

  .dr-root * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
  .dr-root {
    font-family: 'DM Sans', sans-serif;
    max-width: 480px;
    margin: 0 auto;
    padding-bottom: 32px;
  }

  /* ── Score card ── */
  .dr-score-card {
    background: #0f172a;
    border-radius: 24px;
    padding: 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
  }
  .dr-score-label {
    font-size: 10px;
    font-weight: 700;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.07em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .dr-score-number {
    font-size: 40px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    font-family: 'DM Mono', monospace;
    letter-spacing: -0.03em;
  }
  .dr-score-stars {
    display: flex;
    gap: 3px;
    margin-top: 8px;
  }
  .dr-divider {
    width: 1px;
    height: 48px;
    background: rgba(255,255,255,0.08);
    flex-shrink: 0;
  }
  .dr-trips-num {
    font-size: 28px;
    font-weight: 700;
    color: #34d399;
    font-family: 'DM Mono', monospace;
    letter-spacing: -0.03em;
    line-height: 1;
  }
  .dr-trips-label {
    font-size: 10px;
    font-weight: 700;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.07em;
    text-transform: uppercase;
    margin-top: 5px;
  }

  /* ── Section heading ── */
  .dr-section-title {
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 12px;
    padding: 0 2px;
  }

  /* ── Review card ── */
  .dr-review {
    background: #fff;
    border: 1.5px solid #f1f5f9;
    border-radius: 20px;
    padding: 16px;
    margin-bottom: 10px;
    transition: border-color 200ms, box-shadow 200ms;
  }
  .dr-review:last-child { margin-bottom: 0; }
  .dr-review:hover {
    border-color: #e2e8f0;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  }

  .dr-review-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
  }
  .dr-reviewer {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .dr-avatar {
    width: 36px; height: 36px;
    border-radius: 11px;
    background: #f8fafc;
    border: 1.5px solid #f1f5f9;
    display: flex; align-items: center; justify-content: center;
    color: #94a3b8;
    flex-shrink: 0;
  }
  .dr-name {
    font-size: 12.5px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.01em;
    margin-bottom: 4px;
  }
  .dr-stars { display: flex; gap: 2px; }
  .dr-date {
    font-size: 10px;
    font-weight: 600;
    color: #94a3b8;
    font-family: 'DM Mono', monospace;
    white-space: nowrap;
    flex-shrink: 0;
    padding-top: 2px;
  }

  .dr-comment {
    font-size: 12.5px;
    font-weight: 500;
    color: #475569;
    line-height: 1.6;
    padding-left: 12px;
    border-left: 2px solid #e2e8f0;
    margin-bottom: 0;
    font-style: italic;
  }
  .dr-no-comment {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 600;
    color: #cbd5e1;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .dr-route {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f8fafc;
    font-size: 10.5px;
    font-weight: 600;
    color: #94a3b8;
    overflow: hidden;
  }
  .dr-route-city {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100px;
  }
  .dr-route-arrow { color: #cbd5e1; flex-shrink: 0; }

  /* ── Empty state ── */
  .dr-empty {
    border: 2px dashed #f1f5f9;
    border-radius: 20px;
    padding: 48px 20px;
    text-align: center;
    background: #fafafa;
  }
  .dr-empty-icon {
    width: 44px; height: 44px;
    background: #fff;
    border: 1.5px solid #f1f5f9;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 12px;
  }
  .dr-empty-title {
    font-size: 13px;
    font-weight: 700;
    color: #94a3b8;
    margin-bottom: 4px;
  }
  .dr-empty-sub {
    font-size: 11px;
    font-weight: 500;
    color: #cbd5e1;
  }

  /* ── Footer ── */
  .dr-footer {
    text-align: center;
    font-size: 10px;
    font-weight: 600;
    color: #cbd5e1;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 20px;
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

/* ── Star renderer ─────────────────────────────────────────────────── */
function Stars({ rating, size = 11 }) {
  return (
    <div className="dr-stars" aria-label={`${rating} out of 5 stars`}>
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={size}
          style={{
            color: i <= Math.round(rating) ? '#fbbf24' : '#e2e8f0',
            fill:  i <= Math.round(rating) ? '#fbbf24' : '#e2e8f0',
          }}
        />
      ))}
    </div>
  );
}

/* ── Date formatter ────────────────────────────────────────────────── */
function fmtDate(str) {
  if (!str) return 'Recent';
  try {
    return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return 'Recent'; }
}

/* ─── MAIN COMPONENT ───────────────────────────────────────────────── */
export default function DriverReviews({ reviews = [], averageRating = 0, totalReviews = 0 }) {
  injectStyle();

  return (
    <section className="dr-root" aria-label="Driver reviews">

      {/* Score summary */}
      <div className="dr-score-card">
        <div>
          <p className="dr-score-label">Your rating</p>
          <p className="dr-score-number" aria-label={`Average rating ${averageRating}`}>
            {Number(averageRating).toFixed(1)}
          </p>
          <div className="dr-score-stars">
            <Stars rating={averageRating} size={12} />
          </div>
        </div>
        <div className="dr-divider" />
        <div>
          <p className="dr-trips-num">{totalReviews}</p>
          <p className="dr-trips-label">Reviews</p>
        </div>
      </div>

      {/* Reviews list */}
      <p className="dr-section-title">What passengers said</p>

      {reviews.length === 0 ? (
        <div className="dr-empty" role="status">
          <div className="dr-empty-icon">
            <Star size={20} color="#e2e8f0" />
          </div>
          <p className="dr-empty-title">No reviews yet</p>
          <p className="dr-empty-sub">Finish trips to get your first review</p>
        </div>
      ) : (
        <div>
          {reviews.map((review, i) => {
            const name    = review.passenger_name || review.name || review.username || 'Passenger';
            const comment = review.review_text || review.review || review.comment;
            const rating  = review.rating || 5;
            const date    = review.rated_at || review.created_at;

            return (
              <article key={review.id || i} className="dr-review">

                {/* Top row */}
                <div className="dr-review-top">
                  <div className="dr-reviewer">
                    <div className="dr-avatar" aria-hidden="true">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="dr-name">{name}</p>
                      <Stars rating={rating} />
                    </div>
                  </div>
                  <time className="dr-date" dateTime={date}>{fmtDate(date)}</time>
                </div>

                {/* Comment */}
                {comment ? (
                  <p className="dr-comment">"{comment}"</p>
                ) : (
                  <div className="dr-no-comment">
                    <Info size={11} />
                    <span>Star rating only</span>
                  </div>
                )}

                {/* Route */}
                {(review.origin || review.destination) && (
                  <div className="dr-route" aria-label={`Trip from ${review.origin} to ${review.destination}`}>
                    <MapPin size={10} color="#34d399" style={{ flexShrink: 0 }} />
                    <span className="dr-route-city">{review.origin?.split(',')[0]}</span>
                    <span className="dr-route-arrow">→</span>
                    <span className="dr-route-city">{review.destination?.split(',')[0]}</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <p className="dr-footer">Verified by North Ride</p>
    </section>
  );
}