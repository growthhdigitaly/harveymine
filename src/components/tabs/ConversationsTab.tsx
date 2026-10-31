import React, { useState } from 'react';
import { useHarvey } from '../../context/HarveyContext';
import { Icon, StatusBadge, relTime, initials } from '../../utils/formatters';

const STAGE_LABELS: Record<string, string> = {
  initial_outreach: 'Outreach',
  engaged: 'Engaged',
  qualifying: 'Qualifying',
  presenting: 'Presenting',
  negotiating: 'Negotiating',
  closing: 'Closing',
  closed_won: 'Won',
  closed_lost: 'Lost',
};

export const ConversationsTab: React.FC = () => {
  const { conversations, setConversationStatus, setCurrentTab } = useHarvey();
  const [filter, setFilter] = useState<'needs' | 'open' | 'closed' | 'all'>('needs');

  const needsCount = conversations.filter(
    (c) => !!c.draft || c.status === 'needs_human'
  ).length;
  const openCount = conversations.filter((c) => c.status !== 'closed').length;
  const closedCount = conversations.filter((c) => c.status === 'closed').length;

  const filteredConversations = conversations.filter((c) => {
    if (filter === 'needs') return !!c.draft || c.status === 'needs_human';
    if (filter === 'open') return c.status !== 'closed';
    if (filter === 'closed') return c.status === 'closed';
    return true;
  });

  return (
    <div className="section active" id="conversations">
      <div className="section-head">
        <div>
          <h2>Conversations</h2>
          <p>
            Prospects who replied to outreach. The Handler agent classifies incoming intent, drafts responses, and loops you in for negotiations or escalations.
          </p>
        </div>
      </div>

      {/* Toolbar filters */}
      <div className="toolbar">
        <div className="segmented" role="group" aria-label="Filter conversations">
          <button
            className={filter === 'needs' ? 'on' : ''}
            onClick={() => setFilter('needs')}
          >
            Needs you <span className="n">{needsCount}</span>
          </button>
          <button
            className={filter === 'open' ? 'on' : ''}
            onClick={() => setFilter('open')}
          >
            Open <span className="n">{openCount}</span>
          </button>
          <button
            className={filter === 'closed' ? 'on' : ''}
            onClick={() => setFilter('closed')}
          >
            Closed <span className="n">{closedCount}</span>
          </button>
          <button
            className={filter === 'all' ? 'on' : ''}
            onClick={() => setFilter('all')}
          >
            All <span className="n">{conversations.length}</span>
          </button>
        </div>
      </div>

      {/* Conversation Cards List */}
      <div id="conversations-list">
        {filteredConversations.length === 0 ? (
          <div className="card">
            <div className="empty">
              <div className="glyph">
                <Icon name="check" />
              </div>
              <div className="title">Nothing here</div>
              <div className="copy">No conversation matches this filter.</div>
            </div>
          </div>
        ) : (
          filteredConversations.map((c) => {
            const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Unknown';
            return (
              <div key={c.id} className="convo-card">
                <div className="convo-head">
                  <span className="avatar">{initials(c.first_name, c.last_name)}</span>
                  <div>
                    <h3>{name}</h3>
                    <div className="sub">
                      {[c.company, c.prospect_email].filter(Boolean).join(' · ')} &middot;{' '}
                      {relTime(c.updated_at)}
                    </div>
                  </div>
                  <div className="tags">
                    {c.intent && <StatusBadge status={c.intent} />}
                    {c.stage && (
                      <span className="tag">
                        {STAGE_LABELS[c.stage] || c.stage}
                      </span>
                    )}
                    <StatusBadge status={c.status} />
                  </div>
                </div>

                <div className="thread">
                  {/* Sent cold emails */}
                  {c.emails?.map((e, idx) => (
                    <div key={idx} className="thread-email">
                      <div className="te-head">
                        <Icon name="campaigns" />
                        <b>Email {e.step}</b>
                        <span>{e.subject}</span>
                        <span className="te-when">{relTime(e.sent_at)}</span>
                      </div>
                      <div className="te-body">{e.body}</div>
                    </div>
                  ))}

                  {/* Thread messages */}
                  {c.thread.map((msg, idx) => {
                    const isHarvey = msg.sender === 'harvey';
                    return (
                      <div
                        key={idx}
                        className={`thread-msg ${isHarvey ? 'sent' : 'received'}`}
                      >
                        <div className="sender">
                          {isHarvey ? 'Harvey' : c.first_name || 'They'} &middot;{' '}
                          {relTime(msg.timestamp)}
                        </div>
                        {msg.content}
                      </div>
                    );
                  })}

                  {/* Pending Draft from Handler */}
                  {c.draft && (
                    <div className="thread-draft">
                      <div className="sender">
                        <Icon name="pen" />
                        Harvey drafted a reply &middot; waiting for you
                      </div>
                      <div className="td-body">{c.draft.body}</div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setCurrentTab('outbox')}
                      >
                        Review in Outbox
                        <Icon name="arrow" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Conversation Actions */}
                <div className="convo-actions">
                  {c.status === 'needs_human' ? (
                    <>
                      <span className="muted">
                        <Icon name="alert" />
                        Harvey handed this to you. Reply from your inbox, then:
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setConversationStatus(c.id, 'open')}
                      >
                        Hand back to Harvey
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setConversationStatus(c.id, 'closed')}
                      >
                        Close
                      </button>
                    </>
                  ) : c.status === 'open' ? (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setConversationStatus(c.id, 'closed')}
                    >
                      Close conversation
                    </button>
                  ) : (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setConversationStatus(c.id, 'open')}
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
