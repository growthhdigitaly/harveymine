import React, { useState } from 'react';
import { useHarvey } from '../../context/HarveyContext';
import { Icon, StatusBadge, formatDate, initials } from '../../utils/formatters';

export const OutboxTab: React.FC = () => {
  const {
    outbox,
    sendingMode,
    setSendingMode,
    sendingPaused,
    pauseSending,
    resumeSending,
    approveDraft,
    rejectDraft,
    editDraft,
    approveAllDrafts,
    setCurrentTab,
  } = useHarvey();

  const pendingItems = outbox.filter((o) => o.status === 'pending_review');
  const approvedItems = outbox.filter((o) => o.status === 'approved' || o.status === 'scheduled');
  const sentItems = outbox.filter((o) => o.status === 'sent');
  const failedItems = outbox.filter(
    (o) => o.status === 'failed' || o.status === 'rejected' || o.status === 'cancelled'
  );

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editSubject, setEditSubject] = useState<string>('');
  const [editBody, setEditBody] = useState<string>('');

  const currentItem = pendingItems[activeIndex] || null;

  const startEdit = () => {
    if (!currentItem) return;
    setEditSubject(currentItem.subject);
    setEditBody(currentItem.body);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const saveEdit = () => {
    if (!currentItem) return;
    editDraft(currentItem.id, editSubject, editBody);
    setIsEditing(false);
  };

  const handleApprove = () => {
    if (!currentItem) return;
    approveDraft(currentItem.id);
    if (activeIndex >= pendingItems.length - 1) {
      setActiveIndex(Math.max(0, pendingItems.length - 2));
    }
  };

  const handleReject = () => {
    if (!currentItem) return;
    rejectDraft(currentItem.id);
    if (activeIndex >= pendingItems.length - 1) {
      setActiveIndex(Math.max(0, pendingItems.length - 2));
    }
  };

  const nonHeldCount = pendingItems.filter((p) => !p.error).length;

  return (
    <div className="section active" id="outbox">
      <div className="section-head">
        <div>
          <h2>Outbox</h2>
          <p>
            Review and sign off on emails drafted by Harvey. Approvals move straight into the scheduled sending window.
          </p>
        </div>
        <div className="page-actions" id="outbox-actions">
          {pendingItems.length > 0 && !sendingPaused && nonHeldCount > 0 && (
            <button
              className="btn btn-primary btn-sm"
              onClick={approveAllDrafts}
              title="Emails Harvey held are left for you to approve one by one"
            >
              Approve all {nonHeldCount}
            </button>
          )}
          {sendingPaused ? (
            <button className="btn btn-secondary btn-sm" onClick={resumeSending}>
              Resume sending
            </button>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={pauseSending}>
              Pause all sending
            </button>
          )}
        </div>
      </div>

      {/* Sending Mode Banner */}
      <div id="outbox-banner">
        {sendingMode === 'autopilot' ? (
          <div className="banner wait mode-banner" style={{ marginBottom: 16 }}>
            <Icon name="alert" />
            <div>
              <b>Autopilot is on</b>
              <p>
                Harvey sends email on its own schedule. It holds anything that links to outside domains or quotes confidential signals; those wait here.
              </p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSendingMode('approval')}
            >
              Turn off autopilot
            </button>
          </div>
        ) : (
          <div className="banner mode-banner" style={{ marginBottom: 16 }}>
            <Icon name="check" />
            <div>
              <b>Approval mode</b>
              <p>
                Every email Harvey writes waits here until you approve it.{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentTab('settings');
                  }}
                >
                  Configure autopilot
                </a>
              </p>
            </div>
          </div>
        )}

        {sendingPaused && (
          <div className="banner bad" style={{ marginBottom: 16 }}>
            <Icon name="alert" />
            <div>
              <b>Sending is paused</b>
              <p>Approved mail stays queued until you resume.</p>
            </div>
          </div>
        )}
      </div>

      {/* Desk View */}
      {pendingItems.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="glyph">
              <Icon name="check" />
            </div>
            <div className="title">Nothing to review</div>
            <div className="copy">
              {sendingMode === 'autopilot'
                ? 'Autopilot is on, so Harvey sends on its own. Anything it holds for you shows up here.'
                : 'Every draft Harvey writes lands here first. Approve one and it sends on schedule.'}
            </div>
          </div>
        </div>
      ) : (
        <div className="desk" id="outbox-desk">
          {/* Left Rail */}
          <div className="desk-rail">
            {pendingItems.map((item, idx) => {
              const who = item.context?.contact || item.to_email;
              const isHeld = !!item.error;
              return (
                <div
                  key={item.id}
                  className={`desk-item ${idx === activeIndex ? 'active' : ''}`}
                  onClick={() => {
                    setActiveIndex(idx);
                    setIsEditing(false);
                  }}
                >
                  <span className="avatar">
                    {initials(
                      item.context?.contact?.split(' ')[0],
                      item.context?.contact?.split(' ')[1]
                    )}
                  </span>
                  <div className="di-text">
                    <div className="to">
                      {who}
                      {isHeld && (
                        <span
                          className="tag t-bad"
                          style={{ marginLeft: 6 }}
                          title="Harvey held this instead of sending it"
                        >
                          Held
                        </span>
                      )}
                    </div>
                    <div className="sub">{item.subject || '(no subject)'}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Main Review Pane */}
          {currentItem && (
            <div className="desk-pane">
              <div className="desk-head">
                <div className="to-line">
                  <span className="avatar">
                    {initials(
                      currentItem.context?.contact?.split(' ')[0],
                      currentItem.context?.contact?.split(' ')[1]
                    )}
                  </span>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                      {currentItem.context?.contact || currentItem.to_email}
                    </h3>
                    <div className="sub muted" style={{ fontSize: 13 }}>
                      {currentItem.to_email} &middot; Step {currentItem.step} of 2
                    </div>
                  </div>
                </div>
              </div>

              {/* Context Block */}
              {currentItem.context && (
                <div className="desk-context">
                  <div className="k">Company</div>
                  <div className="v">{currentItem.context.company}</div>

                  {currentItem.context.website && (
                    <>
                      <div className="k">Website</div>
                      <div className="v">
                        <a
                          href={currentItem.context.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {currentItem.context.website.replace(/^https?:\/\//i, '')} &#8599;
                        </a>
                      </div>
                    </>
                  )}

                  {currentItem.context.description && (
                    <>
                      <div className="k">About</div>
                      <div className="v">{currentItem.context.description}</div>
                    </>
                  )}

                  <div className="k">Contact</div>
                  <div className="v">
                    {[currentItem.context.contact, currentItem.context.contact_title]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>

                  <div className="k">Email Deliverability</div>
                  <div className="v">
                    <span className="badge t-good">{currentItem.context.email_status}</span>
                    {currentItem.context.score && ` · score ${currentItem.context.score}/100`}
                  </div>

                  {currentItem.context.signals && (
                    <>
                      <div className="k">Signals detected</div>
                      <div className="v">
                        {Object.entries(currentItem.context.signals).map(([k, v]) => (
                          <div key={k} style={{ marginBottom: 2 }}>
                            {k}: <b>{v}</b>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {currentItem.context.notes && (
                    <>
                      <div className="k">Writer notes</div>
                      <div className="v">{currentItem.context.notes}</div>
                    </>
                  )}
                </div>
              )}

              {/* If held warning */}
              {currentItem.error && (
                <div className="banner wait desk-held">
                  <Icon name="alert" />
                  <div>
                    <b>Held for review</b>
                    <p>{currentItem.error}</p>
                  </div>
                </div>
              )}

              {/* Subject & Body */}
              <div style={{ padding: '16px 20px' }}>
                {isEditing ? (
                  <div>
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label className="form-label">Subject Line</label>
                      <input
                        className="form-input"
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Body</label>
                      <textarea
                        className="form-input"
                        rows={8}
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        style={{ fontFamily: 'var(--sans)', lineHeight: 1.6 }}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        marginBottom: 14,
                        paddingBottom: 10,
                        borderBottom: '1px solid var(--line)',
                      }}
                    >
                      {currentItem.subject}
                    </div>
                    <div
                      style={{
                        whiteSpace: 'pre-wrap',
                        fontSize: 14,
                        lineHeight: 1.65,
                        color: 'var(--text)',
                      }}
                    >
                      {currentItem.body}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="convo-actions" style={{ marginTop: 24 }}>
                  {isEditing ? (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={saveEdit}>
                        Save changes
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={handleApprove}>
                        Approve & Send
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={handleReject}>
                        Reject
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={startEdit}>
                        Edit draft
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Approved / Scheduled Table */}
      {approvedItems.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div className="subhead">
            Approved & scheduled <span className="hint">{approvedItems.length}</span>
          </div>
          <div className="table-card">
            <table className="nowrap clip">
              <thead>
                <tr>
                  <th>To</th>
                  <th>Step</th>
                  <th>Subject</th>
                  <th>Scheduled Send</th>
                </tr>
              </thead>
              <tbody>
                {approvedItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.to_email}</td>
                    <td>{item.step}</td>
                    <td>{item.subject}</td>
                    <td className="muted">{formatDate(item.send_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sent Table */}
      {sentItems.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="subhead">
            Recently sent <span className="hint">{sentItems.length}</span>
          </div>
          <div className="table-card">
            <table className="nowrap clip">
              <thead>
                <tr>
                  <th>To</th>
                  <th>Step</th>
                  <th>Subject</th>
                  <th>Sent At</th>
                </tr>
              </thead>
              <tbody>
                {sentItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.to_email}</td>
                    <td>{item.step}</td>
                    <td>{item.subject}</td>
                    <td className="muted">{formatDate(item.sent_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Failed / Rejected Table */}
      {failedItems.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="subhead">
            Didn't send <span className="hint">{failedItems.length}</span>
          </div>
          <div className="table-card">
            <table className="nowrap clip">
              <thead>
                <tr>
                  <th>To</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {failedItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.to_email}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="muted">{item.error || 'Rejected by user review'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
