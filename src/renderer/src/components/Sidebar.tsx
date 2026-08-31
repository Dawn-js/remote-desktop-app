import React from 'react';
import { ServerConfig } from '../../../shared/types';

interface SidebarProps {
  servers: ServerConfig[];
  groups: string[];
  activeTabId: string | null;
  onServerClick: (server: ServerConfig) => void;
}

export default function Sidebar({ servers, groups, activeTabId, onServerClick }: SidebarProps) {
  const grouped = groups.map((group) => ({
    group,
    items: servers.filter((s) => s.group === group),
  })).filter((g) => g.items.length > 0);

  return (
    <aside className="w-[260px] flex-shrink-0 bg-terminal-black border-r border-terminal-selection flex flex-col">
      <div className="px-4 py-3 border-b border-terminal-selection">
        <h1 className="text-lg font-semibold text-terminal-fg">SSH Client</h1>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {grouped.map((section) => (
          <div key={section.group}>
            <h2 className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-terminal-brightBlack">
              {section.group}
            </h2>
            <ul className="space-y-1">
              {section.items.map((server) => (
                <li key={server.id}>
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-terminal-fg transition-colors ${
                      activeTabId === server.id
                        ? 'bg-terminal-selection'
                        : 'hover:bg-terminal-selection'
                    }`}
                    onClick={() => onServerClick(server)}
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
  );
}
