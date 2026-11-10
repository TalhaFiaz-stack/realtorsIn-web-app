import { LandingPage } from "@/components/landing/landing-page";

export const metadata = {
  title: { absolute: "RealtorsIn — the professional network for UAE real estate" },
  description:
    "Connect with agents, brokers and developers, share listings, explore off-plan projects and close deals faster.",
};

// NOTE: not rendered for now — middleware redirects "/" to /login or /feed.
export default function PublicHomePage() {
  return <LandingPage />;
}
