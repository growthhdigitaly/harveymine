import React, { useState } from 'react';
import { useHarvey } from '../../context/HarveyContext';
import { Prospect } from '../../types';
import {
  Icon,
  StatusBadge,
  SegmentedMeter,
  relTime,
  sourceLabel,
  initials,
} from '../../utils/formatters';

const CONTACT_FILTERS = [
  { key: 'all', label: 'All', statuses: null },
  { key: 'todo', label: 'To write', statuses: ['new', 'queued'] },
  { key: 'contacted', label: 'Contacted', statuses: ['contacted'] },
  { key: 'replied', label: 'Replied', statuses: ['replied', 'interested', 'meeting'] },
  { key: 'closed', label: 'Closed out', statuses: ['not_interested', 'bounced', 'opted_out'] },
];

export const ProspectsTab: React.FC = () => {
  const {
    prospects,
    undoOptOut,
    exportContactsCsv,
    addFeedback,
    addProspect,
  } = useHarvey();

  const [query, setQuery] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [expandedOptOutId, setExpandedOptOutId] = useState<string | null>(null);
  const [undoArmed, setUndoArmed] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Contact Form state
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');

  const matchesFilter = (p: Prospect, fKey: string) => {
    if (fKey === 'all') return true;
    const filterDef = CONTACT_FILTERS.find((f) => f.key === fKey);
    return filterDef?.statuses ? filterDef.statuses.includes(p.status) : true;
  };

  const matchesSearch = (p: Prospect) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return [p.first_name, p.last_name, p.company, p.email, p.title]
      .join(' ')
      .toLowerCase()
      .includes(q);
  };

  const filteredProspects = prospects.filter(
    (p) => matchesFilter(p, filter) && matchesSearch(p)
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newCompany) return;
    addProspect({
      first_name: newFirstName,
      last_name: newLastName,
      email: newEmail,
      title: newTitle || 'Lead',
      company: newCompany,
      email_status: 'verified',
      score: 80,
      status: 'new',
      source: 'company_inbox',
    });
    setNewFirstName('');
    setNewLastName('');
    setNewEmail('');
    setNewTitle('');
    setNewCompany('');
    setShowAddModal(false);
  };

  return (
    <div className="section active" id="prospects">
      <div className="section-head">
        <div>
          <h2>Contacts</h2>
          <p>
            People matching your ICP. Harvey scores each person and drafts tailored outreach sequences.
          </p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={exportContactsCsv}
          >
            Export CSV
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddModal(true)}
          >
            + Add Contact
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <label className="search">
          <Icon name="discover" />
          <input
            className="form-input"
            type="search"
            placeholder="Search name, company, email, title"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <div className="segmented" role="group" aria-label="Filter contacts">
          {CONTACT_FILTERS.map((f) => {
            const count = prospects.filter(
              (p) => matchesFilter(p, f.key) && matchesSearch(p)
            ).length;
            return (
              <button
                key={f.key}
                className={f.key === filter ? 'on' : ''}
                onClick={() => setFilter(f.key)}
              >
                {f.label} <span className="n">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contacts Table */}
      <div id="contact-rows">
        {filteredProspects.length === 0 ? (
          <div className="table-card">
            <div className="empty">
              <div className="glyph">
                <Icon name="discover" />
              </div>
              <div className="title">No matches</div>
              <div className="copy">Nothing matches that search and filter.</div>
            </div>
          </div>
        ) : (
          <>
            <div className="table-card">
              <table className="nowrap">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Added</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredProspects.map((p) => {
                    const isOptedOut = p.status === 'opted_out';
                    const isExpanded = expandedOptOutId === p.id;

                    return (
                      <React.Fragment key={p.id}>
                        <tr>
                          <td>
                            <div className="cell-row">
                              <span className="avatar">
                                {initials(p.first_name, p.last_name)}
                              </span>
                              <div className="cell-stack">
                                <span className="cell-main">
                                  {p.first_name} {p.last_name}
                                </span>
                                <span className="cell-sub">{p.title}</span>
                              </div>
                            </div>
                          </td>
                          <td>{p.company}</td>
                          <td>
                            <div className="cell-stack">
                              <span>{p.email}</span>
                              <span className="cell-sub">
                                <span className={`email-tag ${p.email_status}`}>
                                  {p.email_status}
                                </span>
                                {p.phone && ` · ${p.phone}`}
                              </span>
                            </div>
                          </td>
                          <td>
                            {p.score !== undefined && (
                              <SegmentedMeter pct={p.score} />
                            )}
                          </td>
                          <td>
                            <StatusBadge status={p.status} />
                          </td>
                          <td className="muted">{sourceLabel(p.source)}</td>
                          <td className="muted" style={{ whiteSpace: 'nowrap' }}>
                            {relTime(p.created_at)}
                          </td>
                          <td>
                            <div className="cell-row">
                              {(isOptedOut || p.opt_out_undone) && (
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() =>
                                    setExpandedOptOutId(isExpanded ? null : p.id)
                                  }
                                >
                                  {isOptedOut ? 'Why?' : 'Opt-out history'}
                                </button>
                              )}
                              <button
                                className="btn btn-ghost btn-sm row-action"
                                onClick={() => {
                                  const comment = prompt(
                                    `Anything Harvey should know before writing to ${p.first_name}?`
                                  );
                                  if (comment) addFeedback('contact', p.id, comment);
                                }}
                              >
                                Feedback
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Opt-out reason panel */}
                        {isExpanded && (
                          <tr className="detail-row">
                            <td colSpan={8}>
                              <div className="optout-panel">
                                <h4>
                                  {isOptedOut
                                    ? `Why Harvey stopped emailing ${p.first_name} ${p.last_name}`
                                    : `Opt-out history for ${p.first_name} ${p.last_name}`}
                                </h4>
                                {p.opt_out_reason && (
                                  <>
                                    <p>{p.opt_out_reason.why}</p>
                                    <div className="optout-meta">
                                      Rule: {p.opt_out_reason.rule} &middot;{' '}
                                      {relTime(p.opt_out_reason.at)}
                                    </div>
                                    {p.opt_out_reason.message && (
                                      <div className="thread-msg received">
                                        <div className="sender">
                                          {p.first_name} &middot;{' '}
                                          {relTime(p.opt_out_reason.at)}
                                        </div>
                                        {p.opt_out_reason.message}
                                      </div>
                                    )}
                                  </>
                                )}

                                {isOptedOut ? (
                                  undoArmed ? (
                                    <div className="convo-actions">
                                      <span className="muted">
                                        Harvey will treat them as having replied. Nothing is sent automatically, and any draft waits for your approval.
                                      </span>
                                      <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => {
                                          undoOptOut(p.id);
                                          setUndoArmed(false);
                                        }}
                                      >
                                        Confirm undo
                                      </button>
                                      <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => setUndoArmed(false)}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="convo-actions">
                                      <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setUndoArmed(true)}
                                      >
                                        Undo opt-out
                                      </button>
                                    </div>
                                  )
                                ) : (
                                  <div className="convo-actions">
                                    <span className="muted">
                                      Not opted out now ({p.status}).
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="table-foot">
              {filteredProspects.length} of {prospects.length} contacts
            </div>
          </>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div className="card" style={{ maxWidth: 480, width: '100%' }}>
            <h2>Add New Contact</h2>
            <form onSubmit={handleAddSubmit}>
              <div className="form-row" style={{ marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    className="form-input"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    className="form-input"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Job Title</label>
                <input
                  className="form-input"
                  placeholder="e.g. VP Marketing"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Company Name</label>
                <input
                  className="form-input"
                  required
                  placeholder="e.g. Acme SaaS Inc."
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
