import React from 'react';
import { useHarvey } from '../../context/HarveyContext';
import { Icon, relTime, sourceLabel } from '../../utils/formatters';

export const TodayTab: React.FC = () => {
  const {
    companies,
    prospects,
    outbox,
    conversations,
    signalGroups,
    activity,
    liveStatus,
    setCurrentTab,
  } = useHarvey();

  const pendingOutbox = outbox.filter((o) => o.status === 'pending_review');
  const needsHumanConvos = conversations.filter(
    (c) => c.status === 'needs_human' || !!c.draft
  );
  const proposedSignals = signalGroups
    .flatMap((g) => g.signals)
    .filter((s) => s.status === 'proposed');
  const confirmedSignals = signalGroups
    .flatMap((g) => g.signals)
    .filter((s) => s.status === 'confirmed');

  // Build Needs You items
  const queueItems = [];
  if (pendingOutbox.length > 0) {
    queueItems.push({
      tone: 'warn',
      title: `${pendingOutbox.length} cold email draft${pendingOutbox.length > 1 ? 's' : ''} to review`,
      detail:
        'Harvey drafted outreach sequences tailored to company signals and needs your sign-off before sending.',
      action: 'Review in Outbox',
      tab: 'outbox' as const,
    });
  }
  if (needsHumanConvos.length > 0) {
    queueItems.push({
      tone: 'warn',
      title: `${needsHumanConvos.length} conversation${needsHumanConvos.length > 1 ? 's' : ''} waiting on you`,
      detail:
        'Prospects replied with questions or objections that require your decision or draft sign-off.',
      action: 'Open Conversations',
      tab: 'conversations' as const,
    });
  }
  if (proposedSignals.length > 0) {
    queueItems.push({
      tone: 'good',
      title: `${proposedSignals.length} new buying signal${proposedSignals.length > 1 ? 's' : ''} proposed`,
      detail:
        'Harvey identified signals from job boards and company pages. Confirm them to add to automated scouting.',
      action: 'Confirm Signals',
      tab: 'signals' as const,
    });
  }

  // Funnel counts
  const totalContacts = prospects.length;
  const toWriteCount = prospects.filter((p) => p.status === 'new' || p.status === 'queued').length;
  const contactedCount = prospects.filter((p) => p.status === 'contacted').length;
  const repliedCount = prospects.filter((p) => p.status === 'replied').length;
  const interestedCount = prospects.filter((p) => p.status === 'interested').length;
  const meetingCount = prospects.filter((p) => p.status === 'meeting').length;
  const closedCount = prospects.filter(
    (p) => p.status === 'not_interested' || p.status === 'bounced' || p.status === 'opted_out'
  ).length;

  const funnelStages = [
    { label: 'To write', count: toWriteCount, cls: 'c-accent-soft' },
    { label: 'Contacted', count: contactedCount, cls: 'c-accent' },
    { label: 'Replied', count: repliedCount, cls: 'c-active' },
    { label: 'Interested', count: interestedCount, cls: 'c-good' },
    { label: 'Ready to meet', count: meetingCount, cls: 'c-note' },
    { label: 'Closed out', count: closedCount, cls: 'c-idle' },
  ];

  // Mock 14-day sparkline values
  const sparkFound = [2, 3, 1, 4, 2, 5, 3, 2, 6, 4, 5, 7, 3, 4];
  const sparkSent = [1, 2, 0, 3, 2, 4, 2, 1, 3, 2, 4, 3, 2, 2];
  const sparkReplies = [0, 1, 0, 1, 0, 2, 1, 0, 1, 1, 2, 1, 1, 1];

  const renderSparkBars = (values: number[]) => {
    const max = Math.max(...values, 1);
    return (
      <span className="spark" role="img" aria-label="14-day trend">
        {values.map((v, i) => (
          <i
            key={i}
            className={v ? 'on' : ''}
            style={{ height: Math.max(2, Math.round((v / max) * 28)) }}
            title={String(v)}
          />
        ))}
      </span>
    );
  };

  return (
    <div className="section active" id="today">
      <div className="section-head">
        <div>
          <h2>Today</h2>
          <p>What's waiting on you, and how the pipeline is moving.</p>
        </div>
      </div>

      {/* Setup Checklist Banner */}
      <div className="card inset" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="check" style={{ color: 'var(--good)' }} />
              Workspace ready &middot; Outbound active
            </h3>
            <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>
              Ideal Customer Profile configured &middot; Mailbox verified &middot;{' '}
              {confirmedSignals.length} signals active
            </p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setCurrentTab('settings')}
          >
            Review Settings
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpis">
        <div className="kpi">
          <div className="kpi-label">Contacts found</div>
          <div className="kpi-main">
            <span className="kpi-value">{totalContacts}</span>
            {renderSparkBars(sparkFound)}
          </div>
          <span className="kpi-note">
            <b>+7</b> this week
          </span>
        </div>

        <div className="kpi">
          <div className="kpi-label">Emails sent</div>
          <div className="kpi-main">
            <span className="kpi-value">28</span>
            {renderSparkBars(sparkSent)}
          </div>
          <span className="kpi-note">
            last 14 days &middot; <b>{outbox.filter((o) => o.status === 'approved').length}</b> scheduled
          </span>
        </div>

        <div className="kpi">
          <div className="kpi-label">Conversations</div>
          <div className="kpi-main">
            <span className="kpi-value">{conversations.length}</span>
            {renderSparkBars(sparkReplies)}
          </div>
          <span className="kpi-note">
            <b>{conversations.filter((c) => c.status === 'open' || c.status === 'needs_human').length}</b> active now
          </span>
        </div>

        <div className="kpi">
          <div className="kpi-label">Waiting on you</div>
          <div className="kpi-main">
            <span className={`kpi-value ${queueItems.length === 0 ? 'zero' : ''}`}>
              {pendingOutbox.length + needsHumanConvos.length}
            </span>
          </div>
          <span className="kpi-note">
            {pendingOutbox.length > 0 ? `${pendingOutbox.length} to approve` : 'nothing to approve'}
            {needsHumanConvos.length > 0 ? ` &middot; ${needsHumanConvos.length} handed to you` : ''}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-main">
        <div>
          <div className="subhead">Needs you</div>
          {queueItems.length === 0 ? (
            <div className="queue-clear">
              <div className="queue-icon">
                <Icon name="check" />
              </div>
              <div>
                <div className="qtitle">Nothing needs you</div>
                <div className="qdetail">
                  Harvey has everything it needs. Anything that requires a decision — an
                  email to approve, a signal to confirm — shows up here.
                </div>
              </div>
            </div>
          ) : (
            <div className="queue">
              {queueItems.map((item, idx) => (
                <div key={idx} className={`queue-item ${item.tone}`}>
                  <div className="queue-icon">
                    <Icon name={item.tone === 'good' ? 'check' : 'alert'} />
                  </div>
                  <div className="qtext">
                    <div className="qtitle">{item.title}</div>
                    <div className="qdetail">{item.detail}</div>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentTab(item.tab)}
                  >
                    {item.action}
                    <Icon name="arrow" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pipeline Right Now */}
          <div className="subhead">Pipeline right now</div>
          <div className="card" id="live-status">
            <div className="live-head">
              <span className="live-now">
                <span className="pulse" />
                Autonomous pipeline in progress &middot; 4 mins elapsed
              </span>
              <span className="setup-pct">Cost so far ${liveStatus.cost_usd.toFixed(2)}</span>
            </div>
            <div className="steps">
              {liveStatus.steps.map((s, idx) => {
                const pct = s.total ? Math.min(100, Math.round((100 * s.done) / s.total)) : 0;
                return (
                  <div key={idx} className="step">
                    <span className={`step-icon ${s.state}`}>
                      {s.state === 'done' ? (
                        <Icon name="check" />
                      ) : s.state === 'running' ? (
                        <span className="pulse" />
                      ) : null}
                    </span>
                    <span className="step-label">{s.label}</span>
                    <span className="step-detail">{s.detail}</span>
                    {s.total > 0 && (
                      <div className="bar">
                        <span
                          style={{
                            width: `${pct}%`,
                            background:
                              s.state === 'done'
                                ? 'var(--good)'
                                : 'var(--accent)',
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {liveStatus.next && (
              <div className="live-next">
                <Icon name="arrow" />
                <span>
                  <b>Next</b> &middot; {liveStatus.next}
                </span>
                {liveStatus.next_tab && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentTab(liveStatus.next_tab!)}
                  >
                    Go
                  </button>
                )}
              </div>
            )}
            <div className="live-flag">
              Running continuously &middot; Updated just now
            </div>
          </div>

          {/* Recent Activity */}
          <div className="subhead">
            Recent activity{' '}
            <span className="hint">
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentTab('activity'); }}>
                See all
              </a>
            </span>
          </div>
          <div className="card">
            <div className="timeline">
              {activity.slice(0, 5).map((a) => (
                <div key={a.id} className="tl-item">
                  <span className="tl-time">{relTime(a.created_at)}</span>
                  <span className="tl-icon">
                    <Icon name={a.agent === 'handler' ? 'message' : a.agent === 'writer' ? 'pen' : 'discover'} />
                  </span>
                  <span className="tl-text">
                    {a.action_type === 'reply' && a.details?.prospect_email
                      ? `Answered ${a.details.prospect_email} · ${a.details.intent}`
                      : a.action_type === 'email_sent'
                      ? `Sent email ${a.details?.step || 1} to ${a.details?.prospect_email}`
                      : a.action_type === 'write_campaign'
                      ? `Wrote “${a.details?.campaign_name}” for ${a.details?.prospect_count} contacts`
                      : a.action_type === 'prospect'
                      ? `Found ${a.details?.prospects_found} contacts at ${a.details?.company}`
                      : a.action_type === 'opt_out'
                      ? `${a.details?.prospect_email} opted out · ${a.details?.why}`
                      : 'Heartbeat check completed'}
                  </span>
                  <span className="tl-agent">{a.agent}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aside */}
        <aside>
          <div className="subhead">Contacts by stage</div>
          <div className="card">
            <div className="funnel-bar" role="img" aria-label="Contacts by stage">
              {funnelStages
                .filter((s) => s.count > 0)
                .map((s, idx) => (
                  <span
                    key={idx}
                    className={`seg ${s.cls}`}
                    style={{ flex: s.count }}
                    title={`${s.label}: ${s.count}`}
                  />
                ))}
            </div>
            <div className="legend-rows">
              {funnelStages.map((s, idx) => (
                <div key={idx} className="legend-row">
                  <span className="legend-key">
                    <i className={s.cls} />
                    {s.label}
                  </span>
                  <span className="legend-val">{s.count}</span>
                  <span className="legend-pct">
                    {totalContacts ? Math.round((100 * s.count) / totalContacts) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="facts">
            <span>
              <b>{companies.length}</b> companies
            </span>
            <span>
              <b>0</b> sites not read yet
            </span>
            <span>
              <b>{confirmedSignals.length}</b> signals on
            </span>
          </div>

          <div>
            <div className="subhead">Collector runs</div>
            <div className="card" style={{ paddingTop: 8, paddingBottom: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>
                    <b>Web search</b> (TinyFish)
                  </span>
                  <span className="badge t-good">completed</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>
                    <b>Job board scanner</b>
                  </span>
                  <span className="badge t-good">completed</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>
                    <b>LinkedIn scout</b>
                  </span>
                  <span className="badge t-idle">idle</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
