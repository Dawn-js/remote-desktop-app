import { create } from 'zustand';

interface Tab {
  id: string;
  [key: string]: any;
}

interface AppState {
  tabs: Tab[];
  activeTabId: string | null;
  showConnectionModal: boolean;
  addTab: (tab: Tab) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string | null) => void;
  setShowConnectionModal: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  tabs: [],
  activeTabId: null,
  showConnectionModal: false,
  addTab: (tab) => set((state) => ({ tabs: [...state.tabs, tab], activeTabId: tab.id })),
  closeTab: (tabId) => set((state) => {
    const tabs = state.tabs.filter((t) => t.id !== tabId);
    let activeTabId = state.activeTabId;
    if (state.activeTabId === tabId) {
      activeTabId = tabs.length > 0 ? tabs[tabs.length - 1].id : null;
    }
    return { tabs, activeTabId };
  }),
  setActiveTab: (tabId) => set({ activeTabId: tabId }),
  setShowConnectionModal: (show) => set({ showConnectionModal: show }),
}));