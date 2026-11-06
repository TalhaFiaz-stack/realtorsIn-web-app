"use client";

import { create } from "zustand";

export type AppToastVariant = "success" | "error";

export type AppToastItem = {
  id: string;
  variant: AppToastVariant;
  title: string;
  description?: string;
};

type AppToastState = {
  toasts: AppToastItem[];
  push: (toast: Omit<AppToastItem, "id">) => string;
  dismiss: (id: string) => void;
};

export const useAppToastStore = create<AppToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({
      toasts: [...state.toasts.slice(-2), { ...toast, id }],
    }));
    return id;
  },
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((item) => item.id !== id),
    })),
}));
