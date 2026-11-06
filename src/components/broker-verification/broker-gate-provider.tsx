"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { BrokerVerificationRequiredDialog } from "@/components/broker-verification/broker-verification-required-dialog";
import { useBrokerVerificationStatus } from "@/features/broker-verification/hooks/use-broker-verification";
import {
  resolveBrokerGateState,
  type BrokerGateState,
} from "@/features/broker-verification/lib/broker-gate";

type GateEvent = { preventDefault: () => void; stopPropagation: () => void };

type BrokerGateContextValue = {
  openPrompt: () => void;
  state: BrokerGateState;
  setState: (s: BrokerGateState) => void;
};

const BrokerGateContext = createContext<BrokerGateContextValue | null>(null);

export function BrokerGateProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<BrokerGateState>("unknown");
  const value = useMemo(
    () => ({ openPrompt: () => setOpen(true), state, setState }),
    [state]
  );
  return (
    <BrokerGateContext.Provider value={value}>
      {children}
      <BrokerVerificationRequiredDialog
        open={open}
        state={state}
        onOpenChange={setOpen}
      />
    </BrokerGateContext.Provider>
  );
}

/**
 * Verified-broker gate (mobile parity: unverified users get a popup instead of
 * project access). `guard` returns true when the action may proceed.
 */
export function useBrokerGate() {
  const ctx = useContext(BrokerGateContext);
  const router = useRouter();
  const query = useBrokerVerificationStatus(true);
  const state = resolveBrokerGateState(query.data);
  const { refetch } = query;
  const openPrompt = ctx?.openPrompt;
  const setCtxState = ctx?.setState;

  const guard = useCallback(
    (event?: GateEvent | null, href?: string): boolean => {
      if (state === "verified") return true;
      event?.preventDefault();
      event?.stopPropagation();

      const show = (s: BrokerGateState) => {
        setCtxState?.(s);
        openPrompt?.();
      };

      if (state === "unknown") {
        // Status not loaded yet (or failed): re-check once, fail closed.
        void refetch().then((res) => {
          const next = resolveBrokerGateState(res.data);
          if (next === "verified") {
            if (href) router.push(href);
          } else {
            show(next === "unknown" ? "unverified" : next);
          }
        });
        return false;
      }
      show(state);
      return false;
    },
    [state, refetch, router, openPrompt, setCtxState]
  );

  return {
    state,
    isVerified: state === "verified",
    isLoading: query.isLoading,
    isError: query.isError,
    refetch,
    guard,
    openPrompt: () => {
      setCtxState?.(state === "unknown" ? "unverified" : state);
      openPrompt?.();
    },
  };
}
