import React from 'react';
import { useHarvey } from '../../context/HarveyContext';
import {
  Icon,
  StatusBadge,
  relTime,
  sourceLabel,
  initials,
} from '../../utils/formatters';

export const CompaniesTab: React.FC = () => {
  const { companies, prospects, selectedCompany, setSelectedCompany } = useHarvey();

  const handleSelectCompany = (c: any) => {
    setSelectedCompany(c);
  };

  const handleBackToAll = () => {
    setSelectedCompany(null);
  };

  // If viewing a specific company's contacts
  if (selectedCompany) {
    const companyContacts = prospects.filter(
      (p) => p.company_id === selectedCompany.id || p.company === selectedCompany.name
    );

    return (
      <div className="section active" id="companies">
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleBackToAll}
          style={{ marginBottom: 12 }}
        >
          &larr; All companies
        </button>

        <div className="card flush">
          <div className="card-head">
            <h3>{selectedCompany.name}</h3>
            <span className="meta">
              {[selectedCompany.industry, selectedCompany.location]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </div>

          {companyContacts.length === 0 ? (
            <div className="empty">
              <div className="copy">No contacts found at this company yet.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>LinkedIn</th>
                  <th>Status</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {companyContacts.map((p) => (
                  <tr key={p.id}>
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
                    <td>
                      {p.email}{' '}
                      <span className={`email-tag ${p.email_status}`}>
                        {p.email_status}
                      </span>
                    </td>
                    <td>
                      {p.phone || ''}
                      {p.phone_verified && (
                        <span className="muted" title="Phone verified">
                          {' '}
                          &#10003;
                        </span>
                      )}
                    </td>
                    <td>
                      {p.linkedin_url ? (
                        <a
                          href={p.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Profile &#8599;
                        </a>
                      ) : (
                        <span className="muted">&mdash;</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="muted">{sourceLabel(p.source)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="section active" id="companies">
      <div className="section-head">
        <div>
          <h2>Companies</h2>
          <p>
            The businesses Harvey has found. Click any company to inspect detected signals and contacts.
          </p>
        </div>
      </div>

      <div id="companies-list">
        {companies.length === 0 ? (
          <div className="card">
            <div className="empty">
              <div className="glyph">
                <Icon name="companies" />
              </div>
              <div className="title">No companies yet</div>
              <div className="copy">
                Confirm your <b>Signals</b>, then find businesses on the <b>Discover</b> tab.
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="table-card">
              <table className="nowrap">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Industry</th>
                    <th>Location</th>
                    <th>Size</th>
                    <th className="num">Contacts</th>
                    <th>Source</th>
                    <th>Added</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => {
                    const contactsAtCompany = prospects.filter(
                      (p) => p.company_id === c.id || p.company === c.name
                    ).length;

                    return (
                      <tr
                        key={c.id}
                        className="clickable"
                        onClick={() => handleSelectCompany(c)}
                      >
                        <td>
                          <div className="cell-stack">
                            <span className="cell-main">{c.name}</span>
                            <span className="cell-sub">
                              {c.website ? (
                                <a
                                  href={c.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {c.domain}
                                </a>
                              ) : (
                                c.domain
                              )}
                            </span>
                          </div>
                        </td>
                        <td>
                          {c.industry && <span className="tag">{c.industry}</span>}
                        </td>
                        <td>{c.location}</td>
                        <td className="muted">{c.company_size}</td>
                        <td className="num">{contactsAtCompany || c.contact_count}</td>
                        <td className="muted">{sourceLabel(c.source)}</td>
                        <td className="muted">{relTime(c.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="table-foot">
              {companies.length} compan{companies.length === 1 ? 'y' : 'ies'}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
