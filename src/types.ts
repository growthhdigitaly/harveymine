export type TabId =
  | 'today'
  | 'outbox'
  | 'conversations'
  | 'signals'
  | 'discover'
  | 'companies'
  | 'prospects'
  | 'campaigns'
  | 'activity'
  | 'usage'
  | 'controls'
  | 'settings'
  | 'help';

export type StatusTone = 'waiting' | 'active' | 'good' | 'bad' | 'idle' | 'note';

export interface Company {
  id: string;
  name: string;
  domain: string;
  website?: string;
  industry: string;
  location: string;
  company_size: string;
  contact_count: number;
  source: string;
  created_at: string;
  signals?: Record<string, string | number | boolean>;
  description?: string;
}

export interface Prospect {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
  company: string;
  company_id?: string;
  phone?: string;
  phone_verified?: boolean;
  linkedin_url?: string;
  status:
    | 'new'
    | 'queued'
    | 'contacted'
    | 'replied'
    | 'interested'
    | 'meeting'
    | 'not_interested'
    | 'bounced'
    | 'write_failed'
    | 'opted_out';
  email_status: 'verified' | 'risky' | 'guess' | 'invalid';
  score?: number;
  source: string;
  created_at: string;
  last_contacted_at?: string;
  opt_out_reason?: {
    rule: 'phrase' | 'no_thanks' | 'only_words' | 'model';
    why: string;
    message?: string;
    at: string;
    history?: Array<{ action: string; at: string }>;
  };
  opt_out_undone?: boolean;
}

export interface OutboxItem {
  id: string;
  prospect_id: string;
  to_email: string;
  step: number;
  subject: string;
  body: string;
  status: 'pending_review' | 'approved' | 'sending' | 'scheduled' | 'sent' | 'failed' | 'rejected' | 'cancelled';
  send_at?: string;
  sent_at?: string;
  updated_at?: string;
  error?: string;
  context?: {
    company?: string;
    website?: string;
    description?: string;
    contact?: string;
    contact_title?: string;
    contact_source?: string;
    email_status?: string;
    score?: number;
    signals?: Record<string, string>;
    campaign?: string;
    notes?: string;
  };
}

export interface Message {
  sender: 'harvey' | 'prospect';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  prospect_id: string;
  first_name: string;
  last_name: string;
  company: string;
  prospect_email: string;
  status: 'open' | 'closed' | 'needs_human';
  stage: 'initial_outreach' | 'engaged' | 'qualifying' | 'presenting' | 'negotiating' | 'closing' | 'closed_won' | 'closed_lost';
  intent?: 'interested' | 'question' | 'objection' | 'meeting' | 'not_interested' | 'ooo' | 'wrong_person' | 'unsubscribe' | 'escalate';
  updated_at: string;
  prospect_status?: string;
  emails?: Array<{
    step: number;
    subject: string;
    body: string;
    sent_at: string;
  }>;
  thread: Message[];
  draft?: {
    body: string;
    created_at: string;
  };
}

export interface Signal {
  code: string;
  label: string;
  description: string;
  group_key: string;
  status: 'confirmed' | 'proposed' | 'rejected';
  cost_note?: string;
  confidence_floor?: number;
  companies?: number;
  value_type?: 'bool' | 'num';
}

export interface SignalGroup {
  key: string;
  label: string;
  blurb: string;
  signals: Signal[];
}

export interface CampaignStep {
  step: number;
  delay_days: number;
  subject: string;
  body: string;
}

export interface CampaignRecipient {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  title?: string;
  personalization_notes?: string;
  email_status: 'verified' | 'risky' | 'guess' | 'invalid';
  status: string;
  sent_by_hand?: boolean;
  can_send_by_hand?: boolean;
  can_mark_sent?: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  prospect_ids: string[];
  sequence: CampaignStep[];
  recipients: CampaignRecipient[];
  created_at: string;
  send_as?: string;
  footer?: string;
}

export interface ActivityItem {
  id: string;
  action_type: string;
  agent: 'scout' | 'writer' | 'sender' | 'handler' | 'analyst' | 'user' | 'main';
  created_at: string;
  details?: Record<string, any>;
}

export interface PipelineStep {
  state: 'done' | 'running' | 'partial' | 'waiting';
  label: string;
  detail: string;
  done: number;
  total: number;
}

export interface LiveStatus {
  cost_usd: number;
  steps: PipelineStep[];
  running: Array<{
    stage: string;
    provider?: string;
    elapsed_min: number;
    eta_text?: string;
  }>;
  stopped: Array<{
    stage: string;
  }>;
  next?: string;
  next_tab?: TabId;
}

export interface UsageDaily {
  day: string;
  output_tokens: number;
  input_tokens: number;
  cache_read_tokens: number;
  calls: number;
}

export interface UsageRow {
  name?: string;
  agent?: string;
  task?: string;
  provider?: string;
  model?: string;
  calls: number;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
}

export interface UsageData {
  totals: {
    today: { calls: number; output_tokens: number; input_tokens: number; cache_read_tokens: number };
    week: { calls: number; output_tokens: number; input_tokens: number; cache_read_tokens: number };
    month: { calls: number; output_tokens: number; input_tokens: number; cache_read_tokens: number };
  };
  by_day: UsageDaily[];
  by_agent: UsageRow[];
  by_task: UsageRow[];
  by_provider: UsageRow[];
  by_model: UsageRow[];
  quota: {
    daily_sends: { used: number; max: number };
    claude_budget_percent: number;
    hunter_searches: { used: number; max: number };
  };
}

export interface SettingsConfig {
  persona: {
    name: string;
    company: string;
    role: string;
    email: string;
    linkedin: string;
    tone: string;
  };
  product: {
    name: string;
    description: string;
    pricing: string;
    key_benefits: string[];
    objection_responses: Record<string, string>;
    offer: {
      primary: string;
      entry: string;
      goal: string;
      booking_method: string;
      booking_url: string;
      meeting_duration: string;
      meeting_owner: string;
    };
  };
  icp: {
    industries: string[];
    company_size: string;
    titles: string[];
    geography: string[];
    hiring_signals: string[];
  };
  channels: {
    email: {
      enabled: boolean;
      provider: 'gmail' | 'microsoft' | 'smtp' | 'instantly';
      max_daily_sends: number;
      require_approval: boolean;
      send_to_risky: boolean;
      max_bounce_rate: number;
      warmup: {
        start_date: string;
        min_days: number;
        start_sends: number;
        daily_increase: number;
        dkim_selector: string;
      };
    };
    linkedin: {
      enabled: boolean;
      max_daily_connections: number;
      max_daily_messages: number;
    };
  };
  env: {
    GMAIL_CLIENT_ID: string;
    GMAIL_CLIENT_SECRET_SET: boolean;
    GMAIL_AUTHORIZED: boolean;
    M365_CLIENT_ID: string;
    M365_TENANT_ID: string;
    M365_AUTHORIZED: boolean;
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USERNAME: string;
    SMTP_PASSWORD_SET: boolean;
    IMAP_HOST: string;
    IMAP_PORT: string;
    IMAP_USERNAME: string;
    IMAP_PASSWORD_SET: boolean;
    INSTANTLY_API_KEY_SET: boolean;
    REOON_API_KEY_SET: boolean;
    ZEROBOUNCE_API_KEY_SET: boolean;
    HUNTER_API_KEY_SET: boolean;
    LINKEDIN_EMAIL: string;
    LINKEDIN_PASSWORD_SET: boolean;
    CLOUDFLARE_ACCOUNT_ID: string;
    CLOUDFLARE_API_TOKEN_SET: boolean;
  };
}
