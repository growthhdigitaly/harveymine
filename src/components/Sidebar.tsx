import React from 'react';
import { useHarvey } from '../context/HarveyContext';
import { TabId } from '../types';
import { Icon } from '../utils/formatters';

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    setSelectedCompany,
    outbox,
    signals,
    signalGroups,
    conversations,
    isRunning,
    theme,
    cycleTheme,
    showToast,
  } = useHarvey() as any;

  const outboxPending = outbox.filter((o: any) => o.status === 'pending_review').length;
  const convosNeedsHuman = conversations.filter(
    (c: any) => c.status === 'needs_human' || !!c.draft
  ).length;
  const proposedSignals = signalGroups
    .flatMap((g: any) => g.signals)
    .filter((s: any) => s.status === 'proposed').length;
  const todayNeedsYou = outboxPending + convosNeedsHuman + (proposedSignals > 0 ? 1 : 0);

  const handleTabClick = (tab: TabId) => {
    setCurrentTab(tab);
    if (tab === 'companies') {
      setSelectedCompany(null);
    }
  };

  const navButton = (tab: TabId, label: string, iconName: string, count?: number) => {
    const isActive = currentTab === tab;
    return (
      <button
        className={isActive ? 'active' : ''}
        onClick={() => handleTabClick(tab)}
      >
        <Icon name={iconName} />
        <span className="label">{label}</span>
        {count !== undefined && count > 0 && (
          <span className="nav-count on">{count}</span>
        )}
      </button>
    );
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <h1>Harvey</h1>
        <div className="tagline">Always Be Closing</div>
      </div>

      <nav aria-label="Sections">
        <div className="nav-group">
          <div className="nav-label">Work</div>
          {navButton('today', 'Today', 'today', todayNeedsYou)}
          {navButton('outbox', 'Outbox', 'outbox', outboxPending)}
          {navButton('conversations', 'Conversations', 'conversations', convosNeedsHuman)}
        </div>

        <div className="nav-group">
          <div className="nav-label">Pipeline</div>
          {navButton('signals', 'Signals', 'signals', proposedSignals)}
          {navButton('discover', 'Discover', 'discover')}
          {navButton('companies', 'Companies', 'companies')}
          {navButton('prospects', 'Contacts', 'contacts')}
          {navButton('campaigns', 'Campaigns', 'campaigns')}
        </div>

        <div className="nav-group">
          <div className="nav-label">System</div>
          {navButton('activity', 'Activity', 'activity')}
          {navButton('usage', 'Usage', 'usage')}
          {navButton('controls', 'Controls', 'controls')}
          {navButton('settings', 'Settings', 'settings')}
          {navButton('help', 'Help', 'help')}
        </div>
      </nav>

      <div className="sidebar-foot">
        <div className="harvey-status" id="header-status">
          <span
            className={`status-dot ${isRunning ? 'running' : 'stopped'}`}
            id="header-dot"
          />
          <span id="header-status-text">
            {isRunning ? 'Harvey is running' : 'Harvey is stopped'}
          </span>
        </div>
        <div className="foot-actions">
          <button
            className="icon-btn"
            id="theme-btn"
            onClick={cycleTheme}
            title="Appearance: follows your system until you pick one"
          >
            {theme}
          </button>
          <button
            className="refresh-btn"
            onClick={() => showToast('Refreshed data.', 'success')}
            title="Refresh this page"
          >
            <Icon name="refresh" className="refresh-icon" />
            Refresh
          </button>
        </div>
      </div>
    </aside>
  );
};
