import React from 'react';
import { useHarvey } from './context/HarveyContext';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { TodayTab } from './components/tabs/TodayTab';
import { OutboxTab } from './components/tabs/OutboxTab';
import { ConversationsTab } from './components/tabs/ConversationsTab';
import { SignalsTab } from './components/tabs/SignalsTab';
import { DiscoverTab } from './components/tabs/DiscoverTab';
import { CompaniesTab } from './components/tabs/CompaniesTab';
import { ProspectsTab } from './components/tabs/ProspectsTab';
import { CampaignsTab } from './components/tabs/CampaignsTab';
import { ActivityTab } from './components/tabs/ActivityTab';
import { UsageTab } from './components/tabs/UsageTab';
import { ControlsTab } from './components/tabs/ControlsTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { HelpTab } from './components/tabs/HelpTab';

export const AppContent: React.FC = () => {
  const { currentTab } = useHarvey();

  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <div className="content-inner">
          {currentTab === 'today' && <TodayTab />}
          {currentTab === 'outbox' && <OutboxTab />}
          {currentTab === 'conversations' && <ConversationsTab />}
          {currentTab === 'signals' && <SignalsTab />}
          {currentTab === 'discover' && <DiscoverTab />}
          {currentTab === 'companies' && <CompaniesTab />}
          {currentTab === 'prospects' && <ProspectsTab />}
          {currentTab === 'campaigns' && <CampaignsTab />}
          {currentTab === 'activity' && <ActivityTab />}
          {currentTab === 'usage' && <UsageTab />}
          {currentTab === 'controls' && <ControlsTab />}
          {currentTab === 'settings' && <SettingsTab />}
          {currentTab === 'help' && <HelpTab />}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};
