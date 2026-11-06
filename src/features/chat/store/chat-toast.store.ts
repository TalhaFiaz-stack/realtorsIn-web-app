"use client";

import { create } from "zustand";

export type ChatToastItem = {
  id: string;
  conversationId: number;
  title: string;
  body: string;
  href: string;
};

type ChatToastState = {
  toasts: ChatToastItem[];
  push: (toast: Omit<ChatToastItem, "id">) => void;
  dismiss: (id: string) => void;
};

export const useChatToastStore = create<ChatToastState>((set) => ({
  toasts: [],
  push: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts.slice(-2),
        { ...toast, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
      ],
    })),
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((item) => item.id !== id),
    })),
}));
