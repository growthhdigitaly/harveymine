import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  TabId,
  Company,
  Prospect,
  OutboxItem,
  Conversation,
  SignalGroup,
  Campaign,
  ActivityItem,
  LiveStatus,
  UsageData,
  SettingsConfig,
} from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_PROSPECTS,
  INITIAL_OUTBOX,
  INITIAL_CONVERSATIONS,
  INITIAL_SIGNAL_GROUPS,
  INITIAL_CAMPAIGNS,
  INITIAL_ACTIVITY,
  INITIAL_LIVE_STATUS,
  INITIAL_USAGE,
  INITIAL_SETTINGS,
} from '../data/initialData';

interface Toast {
  id: string;
  msg: string;
  type: 'success' | 'error';
}

interface HarveyContextType {
  currentTab: TabId;
  setCurrentTab: (tab: TabId) => void;
  companies: Company[];
  prospects: Prospect[];
  outbox: OutboxItem[];
  conversations: Conversation[];
  signalGroups: SignalGroup[];
  campaigns: Campaign[];
  activity: ActivityItem[];
  liveStatus: LiveStatus;
  usage: UsageData;
  settings: SettingsConfig;
  isRunning: boolean;
  sendingMode: 'approval' | 'autopilot';
  sendingPaused: boolean;
  selectedCompany: Company | null;
  setSelectedCompany: (c: Company | null) => void;
  logs: string[];
  theme: 'auto' | 'light' | 'dark';
  cycleTheme: () => void;
  toasts: Toast[];
  showToast: (msg: string, type?: 'success' | 'error') => void;
  removeToast: (id: string) => void;

  startHarvey: () => void;
  stopHarvey: () => void;
  approveDraft: (id: string) => void;
  rejectDraft: (id: string) => void;
  editDraft: (id: string, subject: string, body: string) => void;
  approveAllDrafts: () => void;
  pauseSending: () => void;
  resumeSending: () => void;
  setSendingMode: (mode: 'approval' | 'autopilot', confirmText?: string) => boolean;
  setSignalStatus: (codes: string[], status: 'confirmed' | 'rejected') => void;
  setConversationStatus: (id: string, status: 'open' | 'closed' | 'needs_human') => void;
  undoOptOut: (prospectId: string) => void;
  markSentByHand: (campaignId: string, prospectId: string, sent: boolean) => void;
  runDiscovery: (params: {
    provider: string;
    cities: string[];
    depth: number;
    limit: number;
    maxSpend: number;
    preset: string;
  }) => Promise<{ count: number; cost: number }>;
  readWebsites: () => void;
  addFeedback: (entityType: 'contact' | 'campaign', entityId: string, comment: string) => void;
  updateSettings: (updater: (prev: SettingsConfig) => SettingsConfig) => void;
  addProspect: (p: Omit<Prospect, 'id' | 'created_at'>) => void;
  exportContactsCsv: () => void;
  exportCohortCsv: (
    require: string[],
    exclude: string[],
    ranges: Record<string, { min: number | null; max: number | null }>
  ) => void;
}

const HarveyContext = createContext<HarveyContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem('harvey_' + key);
    if (s) return JSON.parse(s);
  } catch (e) {
    // Ignore storage parse error
  }
  return fallback;
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem('harvey_' + key, JSON.stringify(value));
  } catch (e) {
    // Ignore storage quota error
  }
}

export const HarveyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<TabId>('today');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [companies, setCompanies] = useState<Company[]>(() =>
    loadFromStorage('companies', INITIAL_COMPANIES)
  );
  const [prospects, setProspects] = useState<Prospect[]>(() =>
    loadFromStorage('prospects', INITIAL_PROSPECTS)
  );
  const [outbox, setOutbox] = useState<OutboxItem[]>(() =>
    loadFromStorage('outbox', INITIAL_OUTBOX)
  );
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    loadFromStorage('conversations', INITIAL_CONVERSATIONS)
  );
  const [signalGroups, setSignalGroups] = useState<SignalGroup[]>(() =>
    loadFromStorage('signalGroups', INITIAL_SIGNAL_GROUPS)
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    loadFromStorage('campaigns', INITIAL_CAMPAIGNS)
  );
  const [activity, setActivity] = useState<ActivityItem[]>(() =>
    loadFromStorage('activity', INITIAL_ACTIVITY)
  );
  const [liveStatus, setLiveStatus] = useState<LiveStatus>(() =>
    loadFromStorage('liveStatus', INITIAL_LIVE_STATUS)
  );
  const [usage, setUsage] = useState<UsageData>(() =>
    loadFromStorage('usage', INITIAL_USAGE)
  );
  const [settings, setSettings] = useState<SettingsConfig>(() =>
    loadFromStorage('settings', INITIAL_SETTINGS)
  );

  const [isRunning, setIsRunning] = useState<boolean>(() =>
    loadFromStorage('isRunning', true)
  );
  const [sendingMode, setSendingModeState] = useState<'approval' | 'autopilot'>(() =>
    loadFromStorage('sendingMode', 'approval')
  );
  const [sendingPaused, setSendingPaused] = useState<boolean>(() =>
    loadFromStorage('sendingPaused', false)
  );

  const [theme, setThemeState] = useState<'auto' | 'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('harvey-theme');
      if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
    } catch {}
    return 'auto';
  });

  const [logs, setLogs] = useState<string[]>([
    '[2026-10-31 05:40:12] [main] Harvey background daemon listening (PID 4892)',
    '[2026-10-31 05:40:15] [main] Sending window active (08:00 - 17:00 America/New_York)',
    '[2026-10-31 05:42:00] [scout] Checking signals for 6 discovered companies',
    '[2026-10-31 05:43:21] [writer] Formatted sequence step 1 for RetainLoop Technologies',
    '[2026-10-31 05:44:02] [sender] Checked quiet hours. Scheduled sends: 2 queued for review',
    '[2026-10-31 05:45:00] [handler] Checked Gmail inbox for replies: 1 new incoming message found',
    '[2026-10-31 05:45:05] [handler] Classified Elena Rostova reply as QUESTION (intent score 0.94)',
    '[2026-10-31 05:45:06] [writer] Generated candidate answer draft for Elena Rostova',
  ]);

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    try {
      localStorage.setItem('harvey-theme', theme);
    } catch {}
  }, [theme]);

  // Persist state changes
  useEffect(() => saveToStorage('companies', companies), [companies]);
  useEffect(() => saveToStorage('prospects', prospects), [prospects]);
  useEffect(() => saveToStorage('outbox', outbox), [outbox]);
  useEffect(() => saveToStorage('conversations', conversations), [conversations]);
  useEffect(() => saveToStorage('signalGroups', signalGroups), [signalGroups]);
  useEffect(() => saveToStorage('campaigns', campaigns), [campaigns]);
  useEffect(() => saveToStorage('activity', activity), [activity]);
  useEffect(() => saveToStorage('liveStatus', liveStatus), [liveStatus]);
  useEffect(() => saveToStorage('usage', usage), [usage]);
  useEffect(() => saveToStorage('settings', settings), [settings]);
  useEffect(() => saveToStorage('isRunning', isRunning), [isRunning]);
  useEffect(() => saveToStorage('sendingMode', sendingMode), [sendingMode]);
  useEffect(() => saveToStorage('sendingPaused', sendingPaused), [sendingPaused]);

  // Simulation heartbeat when running
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      setLogs((prev) => [
        ...prev.slice(-100),
        `[${now}] [main] Heartbeat check: pipeline healthy, 0 errors`,
      ]);
    }, 30000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const cycleTheme = () => {
    const modes: ('auto' | 'light' | 'dark')[] = ['auto', 'light', 'dark'];
    const next = modes[(modes.indexOf(theme) + 1) % modes.length];
    setThemeState(next);
    showToast(`Appearance: ${next}`);
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const startHarvey = () => {
    setIsRunning(true);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setLogs((prev) => [...prev, `[${now}] [main] Harvey started (PID 5120)`]);
    showToast('Harvey started.', 'success');
  };

  const stopHarvey = () => {
    setIsRunning(false);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setLogs((prev) => [...prev, `[${now}] [main] Harvey stopped by user`]);
    showToast('Harvey stopped.', 'success');
  };

  const approveDraft = (id: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const item = outbox.find((o) => o.id === id);
    if (!item) return;

    setOutbox((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: 'approved',
              send_at: new Date(Date.now() + 15 * 60000).toISOString().replace('T', ' ').slice(0, 19),
              updated_at: now,
            }
          : o
      )
    );

    setActivity((prev) => [
      {
        id: 'act-' + Math.random().toString(36).slice(2, 7),
        agent: 'sender',
        action_type: 'stage_campaign',
        created_at: now,
        details: { staged: 1, to: item.to_email },
      },
      ...prev,
    ]);

    showToast(`Approved email to ${item.to_email}. Scheduled to send.`, 'success');
  };

  const rejectDraft = (id: string) => {
    const item = outbox.find((o) => o.id === id);
    if (!item) return;

    setOutbox((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'rejected' } : o))
    );
    showToast(`Draft to ${item.to_email} rejected.`, 'success');
  };

  const editDraft = (id: string, subject: string, body: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setOutbox((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, subject, body, updated_at: now } : o
      )
    );
    setActivity((prev) => [
      {
        id: 'act-' + Math.random().toString(36).slice(2, 7),
        agent: 'user',
        action_type: 'outbox_edited',
        created_at: now,
        details: {},
      },
      ...prev,
    ]);
    showToast('Draft changes saved.', 'success');
  };

  const approveAllDrafts = () => {
    const pendingNonHeld = outbox.filter(
      (o) => o.status === 'pending_review' && !o.error
    );
    if (!pendingNonHeld.length) {
      showToast('No non-held pending drafts to approve.');
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setOutbox((prev) =>
      prev.map((o) =>
        o.status === 'pending_review' && !o.error
          ? {
              ...o,
              status: 'approved',
              send_at: new Date(Date.now() + 10 * 60000).toISOString().replace('T', ' ').slice(0, 19),
              updated_at: now,
            }
          : o
      )
    );

    showToast(`Approved ${pendingNonHeld.length} drafts.`, 'success');
  };

  const pauseSending = () => {
    setSendingPaused(true);
    showToast('All sending paused. Approved mail remains queued.', 'success');
  };

  const resumeSending = () => {
    setSendingPaused(false);
    showToast('Sending resumed.', 'success');
  };

  const setSendingMode = (mode: 'approval' | 'autopilot', confirmText?: string): boolean => {
    if (mode === 'autopilot') {
      if ((confirmText || '').trim().toLowerCase() !== 'autopilot') {
        showToast('Please type "autopilot" to confirm.', 'error');
        return false;
      }
      setSendingModeState('autopilot');
      showToast('Autopilot is on. Harvey sends on its own; held emails wait for review.', 'success');
      return true;
    } else {
      setSendingModeState('approval');
      showToast('Autopilot turned off. Every draft now waits in the Outbox.', 'success');
      return true;
    }
  };

  const setSignalStatus = (codes: string[], status: 'confirmed' | 'rejected') => {
    setSignalGroups((prev) =>
      prev.map((g) => ({
        ...g,
        signals: g.signals.map((s) =>
          codes.includes(s.code) ? { ...s, status } : s
        ),
      }))
    );
    showToast(
      status === 'confirmed'
        ? `Confirmed ${codes.length} signal${codes.length === 1 ? '' : 's'}.`
        : `Turned off ${codes.length} signal${codes.length === 1 ? '' : 's'}.`,
      'success'
    );
  };

  const setConversationStatus = (
    id: string,
    status: 'open' | 'closed' | 'needs_human'
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status, updated_at: now } : c
      )
    );
    showToast(
      status === 'open'
        ? 'Conversation reopened. Harvey will monitor next replies.'
        : status === 'closed'
        ? 'Conversation closed.'
        : 'Handed back to Harvey.',
      'success'
    );
  };

  const undoOptOut = (prospectId: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setProspects((prev) =>
      prev.map((p) =>
        p.id === prospectId
          ? {
              ...p,
              status: 'replied',
              opt_out_undone: true,
              opt_out_reason: p.opt_out_reason
                ? {
                    ...p.opt_out_reason,
                    history: [
                      ...(p.opt_out_reason.history || []),
                      { action: 'opt_out_undone', at: now },
                    ],
                  }
                : undefined,
            }
          : p
      )
    );
    setActivity((prev) => [
      {
        id: 'act-' + Math.random().toString(36).slice(2, 7),
        agent: 'user',
        action_type: 'opt_out_undone',
        created_at: now,
        details: { prospect_id: prospectId },
      },
      ...prev,
    ]);
    showToast('Opt-out undone. Contact marked as replied.', 'success');
  };

  const markSentByHand = (
    campaignId: string,
    prospectId: string,
    sent: boolean
  ) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        return {
          ...c,
          recipients: c.recipients.map((r) =>
            r.id === prospectId ? { ...r, sent_by_hand: sent } : r
          ),
        };
      })
    );
    showToast(sent ? 'Marked as sent by you.' : 'Unmarked.', 'success');
  };

  const runDiscovery = async (params: {
    provider: string;
    cities: string[];
    depth: number;
    limit: number;
    maxSpend: number;
    preset: string;
  }) => {
    const newCompany: Company = {
      id: 'comp-' + Math.random().toString(36).slice(2, 7),
      name:
        params.preset === 'yc'
          ? 'PulseVector Labs'
          : params.preset === 'funding'
          ? 'BeaconScale Cloud'
          : 'Summit Marketing Partners',
      domain:
        params.preset === 'yc'
          ? 'pulsevector.ai'
          : params.preset === 'funding'
          ? 'beaconscale.io'
          : 'summitagency.com',
      website:
        params.preset === 'yc'
          ? 'https://pulsevector.ai'
          : 'https://summitagency.com',
      industry: params.preset === 'agency' ? 'Marketing Agency' : 'SaaS',
      location: params.cities[0] || 'San Francisco, CA',
      company_size: '20-50 employees',
      contact_count: 1,
      source: params.provider,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      description: 'Found via discovery search: ' + params.provider,
      signals: {
        DISCOVERY_RUN: params.provider,
        HIRING_ROLE: 'Head of Growth',
      },
    };

    const newProspect: Prospect = {
      id: 'prospect-' + Math.random().toString(36).slice(2, 7),
      first_name: 'Alex',
      last_name: 'Rivera',
      email: 'alex@' + newCompany.domain,
      title: 'Head of Growth',
      company: newCompany.name,
      company_id: newCompany.id,
      email_status: 'verified',
      score: 86,
      status: 'new',
      source: params.provider,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setCompanies((prev) => [newCompany, ...prev]);
    setProspects((prev) => [newProspect, ...prev]);

    const cost = params.provider === 'osm' ? 0 : 0.04;
    setLiveStatus((prev) => ({
      ...prev,
      cost_usd: prev.cost_usd + cost,
      steps: prev.steps.map((s, idx) =>
        idx === 0 ? { ...s, done: s.done + 1, total: s.total + 1 } : s
      ),
    }));

    showToast(
      `Discovery complete: 1 new company and 1 contact added (${params.provider}).`,
      'success'
    );
    return { count: 1, cost };
  };

  const readWebsites = () => {
    showToast('Read 6 of 6 company websites and extracted ICP signals.', 'success');
  };

  const addFeedback = (
    entityType: 'contact' | 'campaign',
    entityId: string,
    comment: string
  ) => {
    showToast(
      entityType === 'campaign'
        ? 'Feedback saved. Harvey follows it in upcoming sequences.'
        : 'Feedback saved. Harvey uses it for this contact’s outreach.',
      'success'
    );
  };

  const updateSettings = (updater: (prev: SettingsConfig) => SettingsConfig) => {
    setSettings(updater);
    showToast('Settings saved successfully.', 'success');
  };

  const addProspect = (p: Omit<Prospect, 'id' | 'created_at'>) => {
    const newP: Prospect = {
      ...p,
      id: 'prospect-' + Math.random().toString(36).slice(2, 7),
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setProspects((prev) => [newP, ...prev]);
    showToast(`Added contact ${newP.first_name} ${newP.last_name}.`, 'success');
  };

  const exportContactsCsv = () => {
    const headers = [
      'Name',
      'Title',
      'Company',
      'Email',
      'Phone',
      'Deliverability',
      'Score',
      'Status',
      'Source',
      'Created',
    ];
    const rows = prospects.map((p) => [
      `"${p.first_name} ${p.last_name}"`,
      `"${p.title}"`,
      `"${p.company}"`,
      `"${p.email}"`,
      `"${p.phone || ''}"`,
      `"${p.email_status}"`,
      `"${p.score ?? ''}"`,
      `"${p.status}"`,
      `"${p.source}"`,
      `"${p.created_at}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported contacts CSV.', 'success');
  };

  const exportCohortCsv = (
    require: string[],
    exclude: string[],
    ranges: Record<string, { min: number | null; max: number | null }>
  ) => {
    const matchingCompanies = companies.filter((c) => {
      const sigs = c.signals || {};
      for (const req of require) {
        if (!sigs[req]) return false;
      }
      for (const exc of exclude) {
        if (sigs[exc]) return false;
      }
      return true;
    });

    const headers = ['Company', 'Domain', 'Industry', 'Location', 'Size', 'Signals'];
    const rows = matchingCompanies.map((c) => [
      `"${c.name}"`,
      `"${c.domain}"`,
      `"${c.industry}"`,
      `"${c.location}"`,
      `"${c.company_size}"`,
      `"${Object.keys(c.signals || {}).join('; ')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cohort-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported cohort CSV.', 'success');
  };

  return (
    <HarveyContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        companies,
        prospects,
        outbox,
        conversations,
        signalGroups,
        campaigns,
        activity,
        liveStatus,
        usage,
        settings,
        isRunning,
        sendingMode,
        sendingPaused,
        selectedCompany,
        setSelectedCompany,
        logs,
        theme,
        cycleTheme,
        toasts,
        showToast,
        removeToast,
        startHarvey,
        stopHarvey,
        approveDraft,
        rejectDraft,
        editDraft,
        approveAllDrafts,
        pauseSending,
        resumeSending,
        setSendingMode,
        setSignalStatus,
        setConversationStatus,
        undoOptOut,
        markSentByHand,
        runDiscovery,
        readWebsites,
        addFeedback,
        updateSettings,
        addProspect,
        exportContactsCsv,
        exportCohortCsv,
      }}
    >
      {children}
    </HarveyContext.Provider>
  );
};

export const useHarvey = () => {
  const context = useContext(HarveyContext);
  if (!context) {
    throw new Error('useHarvey must be used within a HarveyProvider');
  }
  return context;
};
