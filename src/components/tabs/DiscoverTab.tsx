import React, { useState } from 'react';
import { useHarvey } from '../../context/HarveyContext';

interface Provider {
  key: string;
  label: string;
  blurb: string;
  cost_note: string;
  free_tier: string;
  configured: boolean;
}

const PROVIDERS: Provider[] = [
  {
    key: 'osm',
    label: 'OpenStreetMap',
    blurb: 'Free worldwide geospatial discovery. Great for agencies, clinics, and localized retail.',
    cost_note: 'free',
    free_tier: 'unlimited',
    configured: true,
  },
  {
    key: 'tinyfish',
    label: 'TinyFish Web Agent',
    blurb: 'Deep web scraper that browses company sites, about pages, and pitch decks.',
    cost_note: '$0.010 / query',
    free_tier: '100 free queries',
    configured: true,
  },
  {
    key: 'serper',
    label: 'Serper (Google SERP)',
    blurb: 'Fast Google search API for finding startups announcing raises, press releases, and expansions.',
    cost_note: '$0.005 / query',
    free_tier: '2,500 free queries',
    configured: true,
  },
  {
    key: 'dataforseo_serp',
    label: 'DataForSEO SERP',
    blurb: 'High-volume programmatic SERP queries across organic and local map rankings.',
    cost_note: '$0.003 / query',
    free_tier: 'sandbox mode available',
    configured: true,
  },
];

export const DiscoverTab: React.FC = () => {
  const { runDiscovery, readWebsites, companies } = useHarvey();

  const [selectedProvider, setSelectedProvider] = useState<string>('tinyfish');
  const [preset, setPreset] = useState<string>('yc');
  const [cities, setCities] = useState<string>('Denver, CO; Boulder, CO; San Francisco, CA');
  const [depth, setDepth] = useState<number>(20);
  const [limit, setLimit] = useState<number>(50);
  const [spendCap, setSpendCap] = useState<number>(1.0);

  const [estimate, setEstimate] = useState<{
    cost: number;
    queries: string[];
    isFree: boolean;
  } | null>(null);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastReport, setLastReport] = useState<{
    new_companies: number;
    known_companies: number;
    observations: number;
    actual_cost: number;
  } | null>(null);

  const handleEstimate = () => {
    const cityList = cities.split(/[;\n]/).map((c) => c.trim()).filter(Boolean);
    const queryBase =
      preset === 'yc'
        ? 'site:ycombinator.com/companies "Denver" OR "San Francisco"'
        : preset === 'funding'
        ? '"announced Series A" OR "seed round" 2026 SaaS'
        : 'SaaS OR "Marketing Agency" company';

    const generatedQueries = (cityList.length ? cityList : ['United States']).map(
      (c) => `${queryBase} in ${c}`
    );

    const isFree = selectedProvider === 'osm';
    const costPerQuery = selectedProvider === 'serper' ? 0.005 : selectedProvider === 'dataforseo_serp' ? 0.003 : 0.01;
    const estCost = isFree ? 0 : generatedQueries.length * costPerQuery;

    setEstimate({
      cost: estCost,
      queries: generatedQueries,
      isFree,
    });
  };

  const handleRun = async () => {
    setIsRunning(true);
    const cityList = cities.split(/[;\n]/).map((c) => c.trim()).filter(Boolean);

    try {
      const res = await runDiscovery({
        provider: selectedProvider,
        cities: cityList,
        depth,
        limit,
        maxSpend: spendCap,
        preset,
      });

      setLastReport({
        new_companies: res.count,
        known_companies: companies.length,
        observations: res.count * 3,
        actual_cost: res.cost,
      });
    } finally {
      setIsRunning(false);
      setEstimate(null);
    }
  };

  return (
    <div className="section active" id="discover">
      <div className="section-head">
        <div>
          <h2>Discover</h2>
          <p>
            Find businesses matching your ICP. Pick a source, see what it will cost, then run it &mdash; nothing is called until you press the button.
          </p>
        </div>
      </div>

      {/* Website Profiling Card */}
      <div className="card inset" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>Websites ready for profiling</h3>
            <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>
              Harvey reads company homepages, about pages, and careers links to extract ICP signals.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={readWebsites}>
            Read websites
          </button>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="subhead">Source</div>
      <div className="prov-grid" id="discover-providers">
        {PROVIDERS.map((p) => {
          const isSelected = p.key === selectedProvider;
          return (
            <div
              key={p.key}
              className={`prov-card ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                setSelectedProvider(p.key);
                setEstimate(null);
              }}
            >
              <div className="prov-head">
                <h3>{p.label}</h3>
                <span className="badge t-good">ready</span>
              </div>
              <div className="blurb">{p.blurb}</div>
              <div className="row">
                <span className="k">Cost</span>
                <span className="v">{p.cost_note}</span>
              </div>
              <div className="row">
                <span className="k">Free Tier</span>
                <span className="v">{p.free_tier}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Run Parameters Card */}
      <div className="subhead">Run</div>
      <div className="card">
        <div className="form-row" style={{ marginBottom: 12 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="disc-preset">
              Look for
            </label>
            <select
              className="form-input"
              id="disc-preset"
              value={preset}
              onChange={(e) => {
                setPreset(e.target.value);
                setEstimate(null);
              }}
            >
              <option value="">Your ICP's industries</option>
              <option value="yc">YC startups</option>
              <option value="accelerator">Accelerator startups</option>
              <option value="funding">Recently funded</option>
              <option value="hiring">Companies hiring for your roles</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label" htmlFor="disc-cities">
              Cities
            </label>
            <input
              className="form-input"
              id="disc-cities"
              placeholder="Denver, CO; Boulder, CO; San Francisco, CA"
              value={cities}
              onChange={(e) => {
                setCities(e.target.value);
                setEstimate(null);
              }}
            />
          </div>
        </div>

        <div className="form-row" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">Depth (results/query)</label>
            <input
              type="number"
              className="form-input"
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Limit (max companies)</label>
            <input
              type="number"
              className="form-input"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Max spend cap ($)</label>
            <input
              type="number"
              className="form-input"
              step="0.5"
              value={spendCap}
              onChange={(e) => setSpendCap(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Estimate Display */}
        {estimate && (
          <div className="estimate-box" style={{ marginBottom: 16 }}>
            <div className={`amount ${estimate.isFree ? 'free' : 'paid'}`}>
              {estimate.isFree ? 'Free' : `$${estimate.cost.toFixed(4)}`}
            </div>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
              {estimate.queries.length} queries &middot; cap is ${spendCap.toFixed(2)}
            </div>
            <div className="query-list" style={{ marginTop: 10 }}>
              {estimate.queries.map((q, idx) => (
                <div key={idx}>{q}</div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          {!estimate ? (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleEstimate}
            >
              Estimate first
            </button>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              disabled={isRunning || estimate.cost > spendCap}
              onClick={handleRun}
            >
              {isRunning
                ? 'Running…'
                : estimate.isFree
                ? 'Run — free'
                : `Run — spend up to $${estimate.cost.toFixed(2)}`}
            </button>
          )}
        </div>
      </div>

      {/* Last Run Report */}
      {lastReport && (
        <div style={{ marginTop: 24 }}>
          <div className="subhead">Last run results</div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="label">New companies</div>
              <div className="value" style={{ color: 'var(--accent)' }}>
                {lastReport.new_companies}
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Already known</div>
              <div className="value">{lastReport.known_companies}</div>
            </div>
            <div className="stat-card">
              <div className="label">Observations</div>
              <div className="value">{lastReport.observations}</div>
            </div>
            <div className="stat-card">
              <div className="label">Actual cost</div>
              <div className="value">
                {lastReport.actual_cost ? `$${lastReport.actual_cost.toFixed(4)}` : 'free'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
