import { create } from "zustand";

type UiState = {
  isMobileNavOpen: boolean;
  isRightSidebarOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  toggleRightSidebar: () => void;
};

/**
 * UI-only state. Do not store API entities or auth tokens here.
 */
export const useUiStore = create<UiState>((set) => ({
  isMobileNavOpen: false,
  isRightSidebarOpen: true,
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
  toggleRightSidebar: () =>
    set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),
}));
