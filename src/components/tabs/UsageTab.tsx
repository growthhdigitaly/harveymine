import React from 'react';
import { useHarvey } from '../../context/HarveyContext';
import { fmtTokens } from '../../utils/formatters';

export const UsageTab: React.FC = () => {
  const { usage } = useHarvey();

  const maxOut = Math.max(...usage.by_day.map((d) => d.output_tokens || 0), 1);

  const renderTable = (
    title: string,
    rows: any[],
    keyField: string,
    keyLabel: string
  ) => {
    const maxCalls = Math.max(...rows.map((r) => r.calls || 0), 1);
    return (
      <div className="card flush" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <h3>{title}</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>{keyLabel}</th>
              <th>Calls</th>
              <th className="num">Input</th>
              <th className="num">Output</th>
              <th className="num">Cache read</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx}>
                <td className="cell-main">{r[keyField]}</td>
                <td>
                  <span className="meter-row">
                    <span className="bar" style={{ width: 120 }}>
                      <span
                        style={{
                          width: `${(100 * (r.calls || 0)) / maxCalls}%`,
                          background: 'var(--accent)',
                        }}
                      />
                    </span>
                    <span className="v">{r.calls}</span>
                  </span>
                </td>
                <td className="num muted">{fmtTokens(r.input_tokens)}</td>
                <td className="num">{fmtTokens(r.output_tokens)}</td>
                <td className="num muted">{fmtTokens(r.cache_read_tokens)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="section active" id="usage">
      <div className="section-head">
        <div>
          <h2>Usage</h2>
          <p>
            Track model tokens, subscription quotas, and agent operations without surprise overages.
          </p>
        </div>
      </div>

      {/* Quota meters */}
      <div className="card" id="usage-quota" style={{ marginBottom: 20 }}>
        <div className="progress-wrap">
          <div className="progress-label">
            <span className="text">Daily send limit &middot; resets midnight UTC</span>
            <span className="pct">
              {usage.quota.daily_sends.used} / {usage.quota.daily_sends.max}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill fill-accent"
              style={{
                width: `${Math.round(
                  (100 * usage.quota.daily_sends.used) / usage.quota.daily_sends.max
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="progress-wrap" style={{ marginTop: 14 }}>
          <div className="progress-label">
            <span className="text">Claude token budget</span>
            <span className="pct">{usage.quota.claude_budget_percent}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill fill-good"
              style={{ width: `${usage.quota.claude_budget_percent}%` }}
            />
          </div>
        </div>

        <div className="progress-wrap" style={{ marginTop: 14 }}>
          <div className="progress-label">
            <span className="text">Hunter.io monthly email pattern lookups</span>
            <span className="pct">
              {usage.quota.hunter_searches.used} / {usage.quota.hunter_searches.max}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill fill-active"
              style={{
                width: `${Math.round(
                  (100 * usage.quota.hunter_searches.used) /
                    usage.quota.hunter_searches.max
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Totals Cards */}
      <div className="stats-grid" id="usage-stats" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="label">Today</div>
          <div className="value">{usage.totals.today.calls}</div>
          <div className="breakdown">
            <span className="chip">calls</span>
            <span className="chip">
              out <b>{fmtTokens(usage.totals.today.output_tokens)}</b>
            </span>
            <span className="chip">
              in <b>{fmtTokens(usage.totals.today.input_tokens)}</b>
            </span>
            <span className="chip">
              cached <b>{fmtTokens(usage.totals.today.cache_read_tokens)}</b>
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="label">Last 7 Days</div>
          <div className="value">{usage.totals.week.calls}</div>
          <div className="breakdown">
            <span className="chip">calls</span>
            <span className="chip">
              out <b>{fmtTokens(usage.totals.week.output_tokens)}</b>
            </span>
            <span className="chip">
              in <b>{fmtTokens(usage.totals.week.input_tokens)}</b>
            </span>
            <span className="chip">
              cached <b>{fmtTokens(usage.totals.week.cache_read_tokens)}</b>
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="label">Last 30 Days</div>
          <div className="value">{usage.totals.month.calls}</div>
          <div className="breakdown">
            <span className="chip">calls</span>
            <span className="chip">
              out <b>{fmtTokens(usage.totals.month.output_tokens)}</b>
            </span>
            <span className="chip">
              in <b>{fmtTokens(usage.totals.month.input_tokens)}</b>
            </span>
            <span className="chip">
              cached <b>{fmtTokens(usage.totals.month.cache_read_tokens)}</b>
            </span>
          </div>
        </div>
      </div>

      {/* Daily Output Tokens Chart */}
      <div className="card" id="usage-daily" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Output tokens per day{' '}
          <span className="hint muted" style={{ fontWeight: 400, fontSize: 13 }}>
            last {usage.by_day.length} days &middot; peak {fmtTokens(maxOut)}
          </span>
        </h2>
        <div
          className="chart-cols"
          role="img"
          aria-label="Output tokens per day"
          style={{ height: 120, display: 'flex', alignItems: 'flex-end', gap: 6 }}
        >
          {usage.by_day.map((d, idx) => {
            const hPct = Math.max(4, Math.round((d.output_tokens / maxOut) * 100));
            return (
              <span
                key={idx}
                className="col"
                style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%' }}
                title={`${d.day}: ${fmtTokens(d.output_tokens)} out, ${d.calls} calls`}
              >
                <i
                  style={{
                    height: `${hPct}%`,
                    width: '100%',
                    background: 'var(--accent)',
                    borderRadius: '2px 2px 0 0',
                    display: 'block',
                  }}
                />
              </span>
            );
          })}
        </div>
        <div className="chart-axis" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span className="muted" style={{ fontSize: 12 }}>
            {usage.by_day[0]?.day}
          </span>
          <span className="muted" style={{ fontSize: 12 }}>
            {usage.by_day[usage.by_day.length - 1]?.day}
          </span>
        </div>
      </div>

      {/* Detailed Breakdown Tables */}
      <div id="usage-tables">
        {renderTable('By Provider', usage.by_provider, 'provider', 'Provider')}
        {renderTable('By Agent', usage.by_agent, 'agent', 'Agent')}
        {renderTable('By Task', usage.by_task, 'task', 'Task')}
        {renderTable('By Model', usage.by_model, 'model', 'Model')}
      </div>
    </div>
  );
};
