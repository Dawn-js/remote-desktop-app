import { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (id: string) => void;
  onTabClose: (id: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
}

export const TabBar = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab,
}: TabBarProps) => {
  return (
    <div className="flex items-center h-10 px-3 bg-terminal-black border-b border-terminal-selection">
      <div className="flex items-center flex-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            onMouseDown={(e) => e.preventDefault()}
            className={`flex items-center gap-2 px-3 h-full transition-colors ${
              activeTabId === tab.id
                ? 'bg-terminal-bg text-terminal-fg'
                : 'text-terminal-dim hover:bg-terminal-hover'
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span className="truncate max-w-[150px]">{tab.label}</span>
            <button
              onClick={(e) => onTabClose(tab.id, e)}
              className={`ml-2 p-1 rounded ${
                activeTabId === tab.id
                  ? 'hover:bg-terminal-selection'
                  : 'hover:bg-terminal-hover'
              }`}
              tabIndex={-1}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="text-terminal-dim hover:text-terminal-fg"
              >
                <path
                  d="M3 3L9 9M9 3L3 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </button>
        ))}
      </div>
      <button
        onClick={onNewTab}
        className="flex items-center justify-center w-8 h-8 ml-2 rounded hover:bg-terminal-hover transition-colors text-terminal-dim hover:text-terminal-fg"
        aria-label="New tab"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 2V14M2 8H14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};