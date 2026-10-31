import React from 'react';
import { useHarvey } from '../../context/HarveyContext';
import { Campaign, CampaignRecipient, CampaignStep } from '../../types';
import { Icon, StatusBadge, relTime } from '../../utils/formatters';

function fillMergeVars(text: string, r: CampaignRecipient): string {
  const vals: Record<string, string> = {
    first_name: r.first_name || 'there',
    last_name: r.last_name || '',
    company: r.company || 'your company',
    title: r.title || '',
    personalization: r.personalization_notes || '',
  };
  return String(text || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) => {
    const key = k.toLowerCase();
    return vals[key] !== undefined ? vals[key] : m;
  });
}

export const CampaignsTab: React.FC = () => {
  const { campaigns, markSentByHand, addFeedback } = useHarvey();

  const handleOpenInGmail = (
    c: Campaign,
    step: CampaignStep,
    r: CampaignRecipient
  ) => {
    const filledBody = fillMergeVars(step.body, r).trimEnd();
    const finalBody =
      filledBody +
      (c.footer && !filledBody.endsWith(c.footer) ? '\n\n' + c.footer : '');
    const subject = fillMergeVars(step.subject, r);

    const url =
      'https://mail.google.com/mail/?view=cm&fs=1' +
      (c.send_as ? '&authuser=' + encodeURIComponent(c.send_as) : '') +
      '&to=' +
      encodeURIComponent(r.email) +
      '&su=' +
      encodeURIComponent(subject) +
      '&body=' +
      encodeURIComponent(finalBody);

    markSentByHand(c.id, r.id, true);
    window.open(url, '_blank');
  };

  return (
    <div className="section active" id="campaigns">
      <div className="section-head">
        <div>
          <h2>Campaigns</h2>
          <p>
            The sequences Harvey is running. Review the copy, track stage progression, or dispatch emails directly via your own Gmail.
          </p>
        </div>
      </div>

      <div id="campaigns-list">
        {campaigns.length === 0 ? (
          <div className="card">
            <div className="empty">
              <div className="glyph">
                <Icon name="campaigns" />
              </div>
              <div className="title">No campaigns yet</div>
              <div className="copy">
                The Writer agent hasn't drafted any sequences. It kicks in automatically once Harvey has scored prospects to write for.
              </div>
            </div>
          </div>
        ) : (
          campaigns.map((c) => {
            const rs = c.recipients || [];
            const count = (statuses: string[]) =>
              rs.filter((r) => statuses.includes(r.status)).length;

            const contactedCount = count(['contacted']);
            const repliedCount = count(['replied']);
            const interestedCount = count(['interested', 'meeting']);
            const waitingCount = count(['new', 'queued']);
            const totalRecipients = rs.length || 1;

            return (
              <div key={c.id} className="campaign-card">
                <div className="campaign-top">
                  <div className="campaign-title">
                    <h3>{c.name || 'Untitled Campaign'}</h3>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        const comment = prompt(
                          'What should Harvey do differently in the emails it writes next? (e.g. "shorter; don\'t mention pricing")'
                        );
                        if (comment) addFeedback('campaign', c.id, comment);
                      }}
                    >
                      Feedback
                    </button>
                  </div>

                  <div className="meta">
                    <StatusBadge status={c.status} />
                    <span>
                      {rs.length} prospect{rs.length !== 1 ? 's' : ''}
                    </span>
                    <span>{c.sequence.length} emails</span>
                    <span>Created {relTime(c.created_at)}</span>
                  </div>

                  {/* Progress Bar */}
                  {rs.length > 0 && (
                    <div className="campaign-progress">
                      <div className="bar" role="img" aria-label="Campaign stage progress">
                        <span
                          className="c-accent"
                          style={{ width: `${(100 * contactedCount) / totalRecipients}%` }}
                          title={`Contacted: ${contactedCount}`}
                        />
                        <span
                          className="c-active"
                          style={{ width: `${(100 * repliedCount) / totalRecipients}%` }}
                          title={`Replied: ${repliedCount}`}
                        />
                        <span
                          className="c-good"
                          style={{ width: `${(100 * interestedCount) / totalRecipients}%` }}
                          title={`Interested: ${interestedCount}`}
                        />
                        <span
                          className="c-accent-soft"
                          style={{ width: `${(100 * waitingCount) / totalRecipients}%` }}
                          title={`Waiting: ${waitingCount}`}
                        />
                      </div>
                      <div className="campaign-legend">
                        <span>
                          <i className="c-accent" /> Contacted <b>{contactedCount}</b>
                        </span>
                        <span>
                          <i className="c-active" /> Replied <b>{repliedCount}</b>
                        </span>
                        <span>
                          <i className="c-good" /> Interested <b>{interestedCount}</b>
                        </span>
                        <span>
                          <i className="c-accent-soft" /> Waiting <b>{waitingCount}</b>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sequence Steps */}
                <div className="sequence">
                  {c.sequence.map((step, sIdx) => (
                    <div key={sIdx} className="email-step">
                      <span className="step-dot">{step.step}</span>
                      <div style={{ flex: 1 }}>
                        <div className="step-num">
                          {sIdx === 0 ? 'First email' : 'Follow-up'}
                          {step.delay_days > 0 &&
                            ` · ${step.delay_days} days after the last`}
                        </div>
                        <div className="subject">{step.subject}</div>
                        <div className="body">{step.body}</div>

                        {/* Recipient dispatch actions */}
                        <div className="step-actions">
                          {rs.map((r) => {
                            if (r.sent_by_hand) {
                              return (
                                <div key={r.id} className="rcpt">
                                  <span className="rcpt-who">{r.email}</span>
                                  <label
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      fontSize: 13,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked
                                      onChange={(e) =>
                                        markSentByHand(c.id, r.id, e.target.checked)
                                      }
                                    />
                                    &#10003; Sent by you
                                  </label>
                                </div>
                              );
                            }

                            return (
                              <div key={r.id} className="rcpt">
                                <span className="rcpt-who">
                                  {r.email}
                                  {r.email_status === 'risky' && (
                                    <span
                                      className="mini t-waiting"
                                      style={{ marginLeft: 6 }}
                                    >
                                      Catch-all
                                    </span>
                                  )}
                                </span>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleOpenInGmail(c, step, r)}
                                >
                                  Open in Gmail
                                </button>
                                <label
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    fontSize: 12,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    onChange={(e) =>
                                      markSentByHand(c.id, r.id, e.target.checked)
                                    }
                                  />
                                  Mark as sent
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
