import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-realtorsin-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RealtorsIn",
    template: "%s · RealtorsIn",
  },
  description:
    "RealtorsIn — the professional network for real-estate agents and brokers.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F7FA" },
    { media: "(prefers-color-scheme: dark)", color: "#070C14" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} min-h-dvh antialiased`}
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
