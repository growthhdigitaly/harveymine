import React, { useState } from 'react';
import { useHarvey } from '../../context/HarveyContext';
import { Icon } from '../../utils/formatters';

export const SettingsTab: React.FC = () => {
  const {
    settings,
    updateSettings,
    sendingMode,
    setSendingMode,
    showToast,
  } = useHarvey();

  // Autopilot arming state
  const [autopilotArmed, setAutopilotArmed] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>('');

  // Form states
  const [personaName, setPersonaName] = useState(settings.persona.name);
  const [personaCompany, setPersonaCompany] = useState(settings.persona.company);
  const [personaRole, setPersonaRole] = useState(settings.persona.role);
  const [personaEmail, setPersonaEmail] = useState(settings.persona.email);
  const [personaTone, setPersonaTone] = useState(settings.persona.tone);

  const [productName, setProductName] = useState(settings.product.name);
  const [productDesc, setProductDesc] = useState(settings.product.description);
  const [productPricing, setProductPricing] = useState(settings.product.pricing);
  const [bookingUrl, setBookingUrl] = useState(settings.product.offer.booking_url);

  const [gmailId, setGmailId] = useState(settings.env.GMAIL_CLIENT_ID);
  const [m365Client, setM365Client] = useState(settings.env.M365_CLIENT_ID);
  const [smtpHost, setSmtpHost] = useState(settings.env.SMTP_HOST);
  const [smtpUser, setSmtpUser] = useState(settings.env.SMTP_USERNAME);

  const handleSavePersona = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings((prev) => ({
      ...prev,
      persona: {
        ...prev.persona,
        name: personaName,
        company: personaCompany,
        role: personaRole,
        email: personaEmail,
        tone: personaTone,
      },
      product: {
        ...prev.product,
        name: productName,
        description: productDesc,
        pricing: productPricing,
        offer: {
          ...prev.product.offer,
          booking_url: bookingUrl,
        },
      },
    }));
  };

  const handleSaveEnv = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings((prev) => ({
      ...prev,
      env: {
        ...prev.env,
        GMAIL_CLIENT_ID: gmailId,
        M365_CLIENT_ID: m365Client,
        SMTP_HOST: smtpHost,
        SMTP_USERNAME: smtpUser,
      },
    }));
  };

  return (
    <div className="section active" id="settings">
      <div className="section-head">
        <div>
          <h2>Settings</h2>
          <p>
            Configure your sending behavior, AI persona, ICP criteria, and outbound email credentials.
          </p>
        </div>
      </div>

      {/* Sending Mode Card */}
      <div className="card mode-card" id="sending-mode-card" style={{ marginBottom: 20 }}>
        <h3>
          Sending mode:{' '}
          <span style={{ color: sendingMode === 'autopilot' ? 'var(--accent)' : 'var(--text)' }}>
            {sendingMode === 'autopilot' ? 'Autopilot' : 'Approval'}
          </span>
        </h3>
        <p>
          <b>Approval</b> (the default): every email Harvey writes, first emails, follow-ups and replies, waits in the Outbox until you approve it.
        </p>
        <p>
          <b>Autopilot</b>: Harvey sends on its own, on schedule, within your daily limit and quiet hours. It still holds an email for you when it links to an external domain or quotes uncertain signals.
        </p>
        <p className="muted" style={{ fontSize: 13 }}>
          Booking page: <code>{settings.product.offer.booking_url}</code> &middot; Allowed link domains: <code>{settings.persona.company.toLowerCase().replace(/\s+/g, '')}.com</code>
        </p>

        {sendingMode === 'autopilot' ? (
          <div className="convo-actions">
            <span className="muted">
              Turning it off works at once: emails autopilot approved that haven't dispatched return to the Outbox.
            </span>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setSendingMode('approval')}
            >
              Turn off autopilot
            </button>
          </div>
        ) : autopilotArmed ? (
          <div className="convo-actions mode-confirm">
            <span className="muted">
              Approve a batch by hand first. Type <b>autopilot</b> to confirm automated sending:
            </span>
            <input
              className="form-input"
              style={{ width: '12rem' }}
              placeholder="autopilot"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
            <button
              className="btn btn-primary btn-sm"
              disabled={confirmText.trim().toLowerCase() !== 'autopilot'}
              onClick={() => {
                const ok = setSendingMode('autopilot', confirmText);
                if (ok) {
                  setAutopilotArmed(false);
                  setConfirmText('');
                }
              }}
            >
              Turn on autopilot
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setAutopilotArmed(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="convo-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setAutopilotArmed(true)}
            >
              Turn on autopilot…
            </button>
          </div>
        )}
      </div>

      {/* Persona & Offer Configuration Form */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2>Persona & Offer Configuration</h2>
        <form onSubmit={handleSavePersona}>
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label">Agent Name</label>
              <input
                className="form-input"
                value={personaName}
                onChange={(e) => setPersonaName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                className="form-input"
                value={personaCompany}
                onChange={(e) => setPersonaCompany(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label">Sender Role</label>
              <input
                className="form-input"
                value={personaRole}
                onChange={(e) => setPersonaRole(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sender Email Address</label>
              <input
                type="email"
                className="form-input"
                value={personaEmail}
                onChange={(e) => setPersonaEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Voice & Tone</label>
            <input
              className="form-input"
              value={personaTone}
              onChange={(e) => setPersonaTone(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Product / Service Pitch</label>
            <textarea
              className="form-input"
              rows={3}
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
            />
          </div>

          <div className="grid-2" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Pricing / Offer</label>
              <input
                className="form-input"
                value={productPricing}
                onChange={(e) => setProductPricing(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Calendar Booking URL</label>
              <input
                className="form-input"
                value={bookingUrl}
                onChange={(e) => setBookingUrl(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            Save Persona & Pitch
          </button>
        </form>
      </div>

      {/* Mailbox Channels Configuration */}
      <div className="card">
        <h2>Mailbox & Integration Credentials</h2>
        <form onSubmit={handleSaveEnv}>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">
              Gmail Client ID{' '}
              <span className="email-tag verified" style={{ marginLeft: 6 }}>
                authorized
              </span>
            </label>
            <input
              className="form-input"
              value={gmailId}
              onChange={(e) => setGmailId(e.target.value)}
            />
          </div>

          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label">Microsoft 365 Client ID</label>
              <input
                className="form-input"
                placeholder="Optional Azure App Client ID"
                value={m365Client}
                onChange={(e) => setM365Client(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">SMTP Host</label>
              <input
                className="form-input"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">SMTP Username / Mailbox</label>
            <input
              className="form-input"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            Save Channel Credentials
          </button>
        </form>
      </div>
    </div>
  );
};
