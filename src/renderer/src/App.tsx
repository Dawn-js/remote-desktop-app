import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import TabBar from './components/TabBar';
import Terminal from './components/Terminal';
import ConnectionModal from './components/ConnectionModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ServerConfig, TerminalTab } from '../../shared/types';

export default function App() {
  const [servers, setServers] = useState<ServerConfig[]>([]);
  const [tabs, setTabs] = useState<TerminalTab[]>([
    { id: 'local-terminal', title: 'Local Terminal', type: 'local', isActive: true, isConnected: false },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('local-terminal');
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const addLocalTerminal = () => {
    const id = `local-${Date.now()}`;
    const newTab: TerminalTab = {
      id,
      title: `Local Terminal ${tabs.filter((t) => t.type === 'local').length + 1}`,
      type: 'local',
      isActive: true,
      isConnected: false,
    };
    setTabs((prev) => {
      const updated = prev.map((t) => ({ ...t, isActive: false }));
      return [...updated, newTab];
    });
    setActiveTabId(id);
  };

  const openServer = async (server: ServerConfig) => {
    const sessionId = `ssh-${server.id}-${Date.now()}`;
    const newTab: TerminalTab = {
      id: sessionId,
      title: server.name,
      type: 'ssh',
      serverId: server.id,
      serverName: server.name,
      isActive: true,
      isConnected: false,
    };
    setTabs((prev) => {
      const updated = prev.map((t) => ({ ...t, isActive: false }));
      return [...updated, newTab];
    });
    setActiveTabId(sessionId);

    try {
      const result = await window.electronAPI.server.getWithCredentials(server.id);
      if (!result) return;

      const sshResult = await window.electronAPI.ssh.createSession({
        sessionId,
        serverId: server.id,
        cols: 80,
        rows: 24,
      });

      if (sshResult.success) {
        setTabs((prev) =>
          prev.map((t) => (t.id === sessionId ? { ...t, isConnected: true } : t))
        );
      }
    } catch {
      // ignore
    }
  };

  const closeTab = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (filtered.length === 0) {
        setActiveTabId('local-terminal');
        return [{ id: 'local-terminal', title: 'Local Terminal', type: 'local', isActive: true, isConnected: false }];
      }
      const idx = prev.findIndex((t) => t.id === id);
      const nextActive = filtered[idx - 1] || filtered[0];
      nextActive.isActive = true;
      setActiveTabId(nextActive.id);
      return filtered;
    });
    window.electronAPI.ssh.closeSession(id);
  };

  const closeActiveTab = () => {
    if (activeTabId && activeTabId !== 'local-terminal') {
      setTabs((prev) => {
        const filtered = prev.filter((t) => t.id !== activeTabId);
        if (filtered.length === 0) {
          setActiveTabId('local-terminal');
          return [{ id: 'local-terminal', title: 'Local Terminal', type: 'local', isActive: true, isConnected: false }];
        }
        const idx = prev.findIndex((t) => t.id === activeTabId);
        const nextActive = filtered[idx - 1] || filtered[0];
        nextActive.isActive = true;
        setActiveTabId(nextActive.id);
        return filtered;
      });
      window.electronAPI.ssh.closeSession(activeTabId);
    }
  };

  const handleConnection = async (server: {
    name: string;
    host: string;
    port: number;
    username: string;
    authMethod: 'password' | 'key';
    password?: string;
    privateKeyPath?: string;
    group: string;
  }) => {
    try {
      const newServer = await window.electronAPI.server.add({
        ...server,
        keepAlive: true,
        keepAliveInterval: 10000,
      });
      setServers((prev) => [...prev, newServer]);
      setShowConnectionModal(false);
      openServer(newServer);
    } catch {
      // ignore
    }
  };

  useKeyboardShortcuts({
    onNewTab: addLocalTerminal,
    onCloseTab: closeActiveTab,
    onNewConnection: () => setShowConnectionModal(true),
  });

  useEffect(() => {
    window.electronAPI.config.get().then((config) => {
      if (config?.servers?.length) {
        setServers(config.servers);
      }
    });
  }, []);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="flex h-full w-full bg-terminal-bg text-terminal-fg">
      <Sidebar
        servers={servers}
        groups={['Local', 'Cloud', 'Production', 'Development']}
        activeTabId={activeTabId}
        onServerClick={openServer}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <TabBar
          tabs={tabs.map((t) => ({ id: t.id, label: t.title }))}
          activeTabId={activeTabId}
          onTabClick={setActiveTabId}
          onTabClose={closeTab}
          onNewTab={addLocalTerminal}
        />

        <div className="flex-1 relative bg-terminal-bg">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`absolute inset-0 ${tab.id === activeTabId ? 'block' : 'hidden'}`}
            >
              {tab.isConnected || tab.type === 'local' ? (
                <Terminal
                  sessionId={tab.id}
                  type={tab.type}
                  serverId={tab.serverId}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-terminal-dim text-sm">
                  Connecting to {tab.title}...
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {showConnectionModal && (
        <ConnectionModal onClose={() => setShowConnectionModal(false)} onConnect={handleConnection} />
      )}
    </div>
  );
}
