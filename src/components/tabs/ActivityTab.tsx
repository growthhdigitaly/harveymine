import React from 'react';
import { useHarvey } from '../../context/HarveyContext';
import { Icon, dayLabel, timeOfDay } from '../../utils/formatters';

const AGENT_ICONS: Record<string, string> = {
  scout: 'discover',
  writer: 'pen',
  sender: 'campaigns',
  handler: 'message',
  analyst: 'usage',
  user: 'contacts',
  main: 'refresh',
};

export const ActivityTab: React.FC = () => {
  const { activity } = useHarvey();

  return (
    <div className="section active" id="activity">
      <div className="section-head">
        <div>
          <h2>Activity</h2>
          <p>
            Audit log of every action taken across agents. See what Scout discovered, what Writer drafted, what Sender dispatched, and what Handler answered.
          </p>
        </div>
      </div>

      <div id="activity-list">
        {activity.length === 0 ? (
          <div className="card">
            <div className="empty">
              <div className="glyph">
                <Icon name="activity" />
              </div>
              <div className="title">No activity yet</div>
              <div className="copy">
                Harvey hasn't taken any actions yet. Every prospect found, email written, and reply handled will appear here in real time.
              </div>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="timeline">
              {activity.map((a, idx) => {
                const currentDay = dayLabel(a.created_at);
                const prevDay = idx > 0 ? dayLabel(activity[idx - 1].created_at) : '';
                const showDayHeader = currentDay !== prevDay;

                const iconName = AGENT_ICONS[a.agent] || 'activity';

                return (
                  <React.Fragment key={a.id}>
                    {showDayHeader && <div className="tl-day">{currentDay}</div>}
                    <div className={`tl-item ${a.agent === 'main' ? 'quiet' : ''}`}>
                      <span className="tl-time">{timeOfDay(a.created_at)}</span>
                      <span className="tl-icon">
                        <Icon name={iconName} />
                      </span>
                      <span className="tl-text">
                        {a.action_type === 'prospect'
                          ? `Found ${a.details?.prospects_found || 1} new contact at ${a.details?.company || 'target account'}`
                          : a.action_type === 'write_campaign'
                          ? `Wrote “${a.details?.campaign_name}” for ${a.details?.prospect_count} contacts`
                          : a.action_type === 'email_sent'
                          ? `Sent email ${a.details?.step || 1} to ${a.details?.prospect_email}`
                          : a.action_type === 'reply'
                          ? `Answered ${a.details?.prospect_email} · ${a.details?.intent}`
                          : a.action_type === 'stage_campaign'
                          ? `Queued email for ${a.details?.to}`
                          : a.action_type === 'opt_out'
                          ? `${a.details?.prospect_email} opted out · ${a.details?.why}`
                          : a.action_type === 'opt_out_undone'
                          ? 'Undid an opt-out for contact'
                          : a.action_type === 'outbox_edited'
                          ? 'Edited email draft'
                          : `Heartbeat: ${a.action_type.replace(/_/g, ' ')}`}
                      </span>
                      <span className="tl-agent">{a.agent}</span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
