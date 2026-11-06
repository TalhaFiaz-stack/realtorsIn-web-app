"use client";

import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { AppToastHost } from "@/components/common/app-toast-host";
import { ConfirmProvider } from "@/components/common/confirm-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createQueryClient } from "@/lib/query/client";
import { I18nProvider } from "@/features/localization/providers/i18n-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => createQueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <ConfirmProvider>
            <TooltipProvider delayDuration={200}>
              {children}
              <AppToastHost />
            </TooltipProvider>
          </ConfirmProvider>
        </I18nProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
