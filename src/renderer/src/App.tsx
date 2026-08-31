import React, { useState } from 'react';

const servers = [
  { group: 'Local', items: [{ name: 'Local Linux', id: 'local-linux' }] },
  { group: 'Cloud', items: [{ name: 'Cloud Server', id: 'cloud-server' }] },
  { group: 'Production', items: [{ name: 'Production DB', id: 'production-db' }] },
];

const tabs = [
  { id: 'local-linux', label: 'Local Linux' },
  { id: 'cloud-server', label: 'Cloud Server' },
  { id: 'production-db', label: 'Production DB' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('local-linux');

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const idx = tabs.findIndex(t => t.id === id);
    if (idx > 0) setActiveTab(tabs[idx - 1].id);
  };

  return (
    <div className="flex h-full w-full bg-terminal-bg text-terminal-fg">
      <aside className="w-[260px] flex-shrink-0 bg-terminal-black border-r border-terminal-selection flex flex-col">
        <div className="px-4 py-3 border-b border-terminal-selection">
          <h1 className="text-lg font-semibold text-terminal-fg">SSH Client</h1>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
          {servers.map((section) => (
            <div key={section.group}>
              <h2 className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-terminal-brightBlack">
                {section.group}
              </h2>
              <ul className="space-y-1">
                {section.items.map((server) => (
                  <li key={server.id}>
                    <button
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-terminal-fg transition-colors ${
                        activeTab === server.id
                          ? 'bg-terminal-selection'
                          : 'hover:bg-terminal-selection'
                      }`}
                      onClick={() => setActiveTab(server.id)}
                    >
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span>{server.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center h-10 px-3 bg-terminal-black border-b border-terminal-selection">
          <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-thin">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary-400 bg-terminal-selection'
                    : 'text-terminal-brightBlack hover:text-terminal-fg hover:bg-terminal-black'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                <button
                  className="ml-1 p-0.5 rounded hover:bg-terminal-brightBlack/20 transition-colors"
                  onClick={(e) => closeTab(e, tab.id)}
                  aria-label={`Close ${tab.label}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </button>
            ))}
            <button
              className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-terminal-brightBlack hover:text-terminal-fg hover:bg-terminal-black transition-colors"
              aria-label="New tab"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center bg-terminal-bg">
          <div className="text-terminal-brightBlack text-sm">Terminal will appear here</div>
        </div>
      </main>
    </div>
  );
}