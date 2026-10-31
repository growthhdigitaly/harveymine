import React from 'react';

export const HelpTab: React.FC = () => {
  return (
    <div className="section active" id="help">
      <div className="section-head">
        <div>
          <h2>Help & Methodology</h2>
          <p>
            The sales principles, email frameworks, and commands that govern Harvey's autonomous pipeline.
          </p>
        </div>
      </div>

      <div className="help-section">
        <h2>Core Sales Philosophy</h2>
        <p>
          <b>A prospect list is a query, not a static file.</b> Instead of buying stale ZoomInfo or Apollo exports with 40% bounce rates, Harvey identifies high-intent accounts by reading live careers pages, press announcements, tech stack changes, and hiring surges.
        </p>
        <p>
          <b>Human in the loop:</b> Cold email impacts your domain reputation. Harvey drafts personalized multi-step sequences with verifiable evidence from company sites, but keeps drafts in the Outbox until you approve them—or until you explicitly arm Autopilot.
        </p>
      </div>

      <div className="help-section">
        <h2>Email Frameworks</h2>
        <details open>
          <summary>Framework 1: Verified Signal &middot; The Problem-Centric Note</summary>
          <div className="faq-body">
            <p>
              Lead with a specific, public fact about their company (e.g. hiring a Head of Growth or expanding to a new city). Transition immediately into the bottleneck that role typically experiences, and propose a low-friction 15-minute call.
            </p>
            <pre>
{`Hi {{first_name}},

Saw {{company}}’s recent job opening for {{hiring_role}} in {{location}}. Hiring senior engineers often pulls focus away from outbound pipeline.

We help SaaS teams automate prospect discovery and draft tailored sequences so you only step in once leads reply.

Open to a brief 15-minute look this Thursday?

Best,
Harvey`}
            </pre>
          </div>
        </details>

        <details>
          <summary>Framework 2: Short 1-Question Qualification</summary>
          <div className="faq-body">
            <p>
              Ideal for executives who scan on mobile. Zero marketing jargon; just one direct question about their current process.
            </p>
            <pre>
{`Hi {{first_name}},

Curious — how is {{company}} currently sourcing and validating high-intent prospects for your outbound campaigns?

We built an autonomous BD agent that reads live job boards and site footprints in real time.

Mind if I send over a 2-minute video breakdown?`}
            </pre>
          </div>
        </details>
      </div>

      <div className="help-section">
        <h2>Objection Handling Matrix</h2>
        <details>
          <summary>“We already have a solution”</summary>
          <div className="faq-body">
            <p>
              <i>“That makes total sense! Most teams we speak with use Apollo or Clay as well. Curious — what is the one thing you wish your current setup did better when it comes to reading live buying signals?”</i>
            </p>
          </div>
        </details>

        <details>
          <summary>“Too expensive / no budget right now”</summary>
          <div className="faq-body">
            <p>
              <i>“Understood, budget timing is everything. Most clients see net-positive pipeline ROI within their first 30 days. Would it make sense to revisit at the start of next quarter, or would a 14-day test pilot be helpful?”</i>
            </p>
          </div>
        </details>
      </div>

      <div className="help-section">
        <h2>Harvey CLI Reference</h2>
        <table className="file-table">
          <tbody>
            <tr>
              <td>harvey start</td>
              <td>Starts the autonomous background daemon loop.</td>
            </tr>
            <tr>
              <td>harvey discover --preset yc</td>
              <td>Runs web discovery for YC startups in target cities.</td>
            </tr>
            <tr>
              <td>harvey warmup</td>
              <td>Checks mailbox domain health, DKIM selector, and TrulyInbox ramp status.</td>
            </tr>
            <tr>
              <td>harvey outbox --approve-all</td>
              <td>Approves all pending non-held drafts in batch.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
