import React from 'react';
import { StatusTone } from '../types';

export const STATUS_MAP: Record<string, [string, StatusTone]> = {
  // prospects
  new: ['New', 'active'],
  contacted: ['Contacted', 'active'],
  replied: ['Replied', 'good'],
  interested: ['Interested', 'good'],
  meeting: ['Meeting booked', 'note'],
  not_interested: ['Not interested', 'bad'],
  bounced: ['Bounced', 'bad'],
  write_failed: ["Couldn't write", 'bad'],
  queued: ['Queued', 'active'],
  opted_out: ['Opted out', 'bad'],
  // campaigns
  draft: ['Draft', 'waiting'],
  active: ['Active', 'good'],
  completed: ['Completed', 'idle'],
  paused: ['Paused', 'bad'],
  // conversations
  open: ['Open', 'active'],
  closed: ['Closed', 'idle'],
  closed_won: ['Won', 'good'],
  closed_lost: ['Lost', 'bad'],
  objection: ['Objection', 'waiting'],
  question: ['Question', 'active'],
  ooo: ['Out of office', 'idle'],
  wrong_person: ['Wrong person', 'waiting'],
  unsubscribe: ['Unsubscribed', 'bad'],
  escalate: ['Needs a human', 'bad'],
  needs_human: ['Needs you', 'waiting'],
  // outbox
  pending_review: ['Waiting on you', 'waiting'],
  approved: ['Approved', 'good'],
  sending: ['Sending now', 'active'],
  scheduled: ['Scheduled', 'active'],
  sent: ['Sent', 'good'],
  failed: ['Failed', 'bad'],
  rejected: ['Rejected', 'idle'],
  cancelled: ['Cancelled', 'idle'],
  // signals
  proposed: ['Waiting on you', 'waiting'],
  confirmed: ['Confirmed', 'good'],
  // email deliverability
  verified: ['Verified', 'good'],
  risky: ['Catch-all', 'waiting'],
  guess: ['Unverified', 'idle'],
  invalid: ['Invalid', 'bad'],
  // runs
  running: ['Running', 'active'],
  stale: ['Stale', 'bad'],
  stalled: ['Stopped', 'bad'],
};

export function getStatusMeta(status: string): { label: string; tone: StatusTone } {
  const key = String(status || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  if (STATUS_MAP[key]) {
    return { label: STATUS_MAP[key][0], tone: STATUS_MAP[key][1] };
  }
  const clean = String(status || 'unknown').replace(/_/g, ' ');
  return {
    label: clean.charAt(0).toUpperCase() + clean.slice(1),
    tone: 'idle',
  };
}

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const meta = getStatusMeta(status);
  return <span className={`badge t-${meta.tone}`}>{meta.label}</span>;
};

export function formatDate(d?: string): string {
  if (!d) return '';
  try {
    let t = String(d).trim().replace(' ', 'T');
    if (/^\d{4}-\d\d-\d\dT/.test(t) && !/[zZ]$|[+-]\d\d:?\d\d$/.test(t)) t += 'Z';
    const dt = new Date(t);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return d;
  }
}

export function relTime(d?: string): string {
  if (!d) return '';
  let t = String(d).trim().replace(' ', 'T');
  if (t && !/[zZ]$|[+-]\d\d:?\d\d$/.test(t)) t += 'Z';
  const dt = new Date(t);
  if (isNaN(dt.getTime())) return d;

  const mins = Math.round((Date.now() - dt.getTime()) / 60000);
  if (mins < -1 && mins > -60) return 'in ' + -mins + 'm';
  if (mins < -1 && mins > -60 * 24) return 'in ' + Math.round(-mins / 60) + 'h';
  if (mins >= -1 && mins < 1) return 'just now';
  if (mins >= 1 && mins < 60) return mins + 'm ago';
  if (mins >= 60 && mins < 60 * 24) return Math.round(mins / 60) + 'h ago';
  if (mins >= 60 * 24 && mins < 60 * 48) return 'Yesterday';

  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (dt.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
  return dt.toLocaleDateString('en-US', opts);
}

export function dayLabel(d?: string): string {
  if (!d) return '';
  let t = String(d).trim().replace(' ', 'T');
  if (t && !/[zZ]$|[+-]\d\d:?\d\d$/.test(t)) t += 'Z';
  const dt = new Date(t);
  if (isNaN(dt.getTime())) return '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const that = new Date(dt);
  that.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - that.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return dt.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function timeOfDay(d?: string): string {
  if (!d) return '';
  let t = String(d).trim().replace(' ', 'T');
  if (t && !/[zZ]$|[+-]\d\d:?\d\d$/.test(t)) t += 'Z';
  const dt = new Date(t);
  return isNaN(dt.getTime())
    ? ''
    : dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function initials(first?: string, last?: string): string {
  const a = String(first || '').trim();
  const b = String(last || '').trim();
  const ch1 = Array.from(a)[0] || '';
  const ch2 = Array.from(b)[0] || '';
  return (ch1 + ch2).toUpperCase() || '?';
}

const SOURCE_LABELS: Record<string, string> = {
  company_website: 'Team page',
  known_company_backfill: 'Team page',
  scraped_mailto: 'Published address',
  hunter_domain_search: 'Hunter',
  linkedin_search: 'LinkedIn',
  job_board: 'Job board',
  web_search: 'Web search',
  company_inbox: 'Company inbox',
  osm: 'OpenStreetMap',
  dataforseo_listings: 'DataForSEO',
  dataforseo_serp: 'DataForSEO SERP',
  dataforseo_maps: 'DataForSEO Maps',
  serper: 'Serper',
  tinyfish: 'TinyFish',
  scavio_maps: 'Scavio Maps',
  scavio_search: 'Scavio Search',
};

export function sourceLabel(s?: string): string {
  if (!s) return '';
  return SOURCE_LABELS[s] || s.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

export const SegmentedMeter: React.FC<{ pct: number; segments?: number }> = ({
  pct,
  segments = 10,
}) => {
  const v = Math.max(0, Math.min(100, Number(pct) || 0));
  const on = Math.round((v / 100) * segments);
  return (
    <span className="meter-row">
      <span
        className="meter"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v}
      >
        {Array.from({ length: segments }, (_, i) => (
          <i key={i} className={i < on ? 'on' : ''} />
        ))}
      </span>
      <span className="v">{v}</span>
    </span>
  );
};

export function fmtTokens(n?: number): string {
  const v = Number(n) || 0;
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return (v / 1000).toFixed(0) + 'k';
  return String(v);
}

export const Icon: React.FC<{ name: string; className?: string; style?: React.CSSProperties }> = ({
  name,
  className,
  style,
}) => (
  <svg className={`icon ${className || ''}`} style={style} aria-hidden="true">
    <use href={`#i-${name}`} />
  </svg>
);
