import React, { useState } from 'react';
import { useHarvey } from '../../context/HarveyContext';
import { StatusBadge } from '../../utils/formatters';

export const SignalsTab: React.FC = () => {
  const { signalGroups, setSignalStatus, companies, exportCohortCsv } = useHarvey();

  // Cohort state
  const [requiredCodes, setRequiredCodes] = useState<Set<string>>(new Set(['HIRING_ROLE']));
  const [excludedCodes, setExcludedCodes] = useState<Set<string>>(new Set());
  const [ranges, setRanges] = useState<Record<string, { min: number | null; max: number | null }>>({});

  const allSignals = signalGroups.flatMap((g) => g.signals);
  const confirmedCount = allSignals.filter((s) => s.status === 'confirmed').length;
  const proposedCount = allSignals.filter((s) => s.status === 'proposed').length;
  const rejectedCount = allSignals.filter((s) => s.status === 'rejected').length;
  const totalSignals = allSignals.length || 1;

  const toggleRequired = (code: string) => {
    setRequiredCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
        setExcludedCodes((exc) => {
          const excNext = new Set(exc);
          excNext.delete(code);
          return excNext;
        });
      }
      return next;
    });
  };

  const toggleExcluded = (code: string) => {
    setExcludedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
        setRequiredCodes((req) => {
          const reqNext = new Set(req);
          reqNext.delete(code);
          return reqNext;
        });
      }
      return next;
    });
  };

  // Filter companies matching cohort criteria
  const matchingCompanies = companies.filter((c) => {
    const sigs = c.signals || {};
    for (const req of requiredCodes) {
      if (!sigs[req]) return false;
    }
    for (const exc of excludedCodes) {
      if (sigs[exc]) return false;
    }
    return true;
  });

  const confirmedList = allSignals.filter((s) => s.status === 'confirmed');

  return (
    <div className="section active" id="signals">
      <div className="section-head">
        <div>
          <h2>Signals</h2>
          <p>
            Harvey proposes what it knows how to look for. You decide what actually defines a good prospect &mdash; nothing is collected until you confirm it.
          </p>
        </div>
      </div>

      {/* Summary Funnel Card */}
      <div className="card sig-summary" id="signals-summary">
        <div className="funnel-bar">
          <span
            className="seg c-good"
            style={{ flex: confirmedCount }}
            title={`Confirmed: ${confirmedCount}`}
          />
          <span
            className="seg c-wait"
            style={{ flex: proposedCount }}
            title={`Proposed: ${proposedCount}`}
          />
          <span
            className="seg c-idle"
            style={{ flex: rejectedCount }}
            title={`Turned off: ${rejectedCount}`}
          />
        </div>
        <div className="funnel-legend">
          <div className="legend-item">
            <span className="legend-key">
              <i className="c-good" /> Confirmed
            </span>
            <span className="legend-val">
              {confirmedCount}
              <small>{Math.round((100 * confirmedCount) / totalSignals)}%</small>
            </span>
          </div>
          <div className="legend-item">
            <span className="legend-key">
              <i className="c-wait" /> Waiting on you
            </span>
            <span className="legend-val">
              {proposedCount}
              <small>{Math.round((100 * proposedCount) / totalSignals)}%</small>
            </span>
          </div>
          <div className="legend-item">
            <span className="legend-key">
              <i className="c-idle" /> Turned off
            </span>
            <span className="legend-val">
              {rejectedCount}
              <small>{Math.round((100 * rejectedCount) / totalSignals)}%</small>
            </span>
          </div>
        </div>
      </div>

      {/* Signal Groups */}
      <div id="signals-groups">
        {signalGroups.map((group) => {
          const undecided = group.signals.filter((s) => s.status === 'proposed');
          const undecidedCodes = undecided.map((s) => s.code);
          return (
            <div key={group.key} className="sig-group">
              <div className="sig-group-head">
                <div>
                  <h3>{group.label}</h3>
                  <p>{group.blurb}</p>
                </div>
                {undecided.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setSignalStatus(undecidedCodes, 'confirmed')}
                    >
                      Confirm all {undecided.length}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSignalStatus(undecidedCodes, 'rejected')}
                    >
                      Skip all {undecided.length}
                    </button>
                  </div>
                )}
              </div>

              <div className="card flush">
                {group.signals.map((sig) => {
                  const isFree = /free|included/i.test(sig.cost_note || '');
                  return (
                    <div
                      key={sig.code}
                      className={`sig-row ${sig.status === 'rejected' ? 'rejected' : ''}`}
                    >
                      <div className="sig-main">
                        <div className="sig-label">
                          {sig.label || sig.code}
                          <span className="sig-code">{sig.code}</span>
                        </div>
                        <div className="sig-desc">{sig.description}</div>
                        <div className="sig-meta">
                          <span
                            className={`cost-chip ${isFree ? 'free' : 'paid'}`}
                          >
                            {sig.cost_note || 'cost unknown'}
                          </span>
                          {sig.confidence_floor && (
                            <span className="cost-chip">
                              only recorded above{' '}
                              {Math.round(sig.confidence_floor * 100)}% confidence
                            </span>
                          )}
                          {sig.companies && (
                            <span className="cost-chip">
                              seen on {sig.companies} compan
                              {sig.companies === 1 ? 'y' : 'ies'} so far
                            </span>
                          )}
                          <StatusBadge status={sig.status} />
                        </div>
                      </div>

                      <div className="sig-decide">
                        {sig.status === 'confirmed' ? (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSignalStatus([sig.code], 'rejected')}
                          >
                            Turn off
                          </button>
                        ) : sig.status === 'rejected' ? (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSignalStatus([sig.code], 'confirmed')}
                          >
                            Turn on
                          </button>
                        ) : (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setSignalStatus([sig.code], 'confirmed')}
                            >
                              Confirm
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setSignalStatus([sig.code], 'rejected')}
                            >
                              Skip
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cohort Builder */}
      <div className="subhead">Cohort builder</div>
      <div className="card">
        <p className="lede">
          A prospect list is a query, not a file. Pick the signals a good prospect must have &mdash; and any that disqualify them &mdash; and see how many companies match right now.
        </p>

        {confirmedList.length === 0 ? (
          <p className="muted" style={{ fontSize: 13 }}>
            Confirm some signals above and they become the building blocks here.
          </p>
        ) : (
          <div>
            <div>
              <div className="subhead" style={{ marginTop: 0 }}>
                Must have{' '}
                <span
                  className="muted"
                  style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}
                >
                  &mdash; every company in the cohort carries all of these
                </span>
              </div>
              <div className="cohort-grid">
                {confirmedList.map((s) => (
                  <label key={s.code} className="cohort-pick">
                    <input
                      type="checkbox"
                      checked={requiredCodes.has(s.code)}
                      onChange={() => toggleRequired(s.code)}
                    />
                    <span>{s.label || s.code}</span>
                    <span className="n">{s.companies || 0}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ height: 18 }} />

            <div>
              <div className="subhead" style={{ marginTop: 0 }}>
                Must not have{' '}
                <span
                  className="muted"
                  style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}
                >
                  &mdash; disqualifiers
                </span>
              </div>
              <div className="cohort-grid">
                {confirmedList.map((s) => (
                  <label key={s.code} className="cohort-pick">
                    <input
                      type="checkbox"
                      checked={excludedCodes.has(s.code)}
                      onChange={() => toggleExcluded(s.code)}
                    />
                    <span>{s.label || s.code}</span>
                    <span className="n">{s.companies || 0}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Matching Results */}
            <div
              style={{
                borderTop: '1px solid var(--line)',
                marginTop: 24,
                paddingTop: 20,
              }}
            >
              <div className="cohort-size">{matchingCompanies.length}</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                compan{matchingCompanies.length === 1 ? 'y matches' : 'ies match'} this cohort right now
              </div>

              {matchingCompanies.length > 0 && (
                <>
                  <div className="table-card" style={{ marginTop: 16 }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Company</th>
                          <th>Domain</th>
                          <th>Industry</th>
                          <th>Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchingCompanies.map((c) => (
                          <tr key={c.id}>
                            <td>{c.name}</td>
                            <td className="muted">{c.domain}</td>
                            <td className="muted">{c.industry}</td>
                            <td className="muted">{c.location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    <span className="muted" style={{ fontSize: 12 }}>
                      Showing 1&ndash;{matchingCompanies.length} of {matchingCompanies.length}
                    </span>
                    <span style={{ flex: 1 }} />
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() =>
                        exportCohortCsv(
                          Array.from(requiredCodes),
                          Array.from(excludedCodes),
                          ranges
                        )
                      }
                    >
                      Export CSV
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
