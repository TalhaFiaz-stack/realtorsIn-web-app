import { LandingPage } from "@/components/landing/landing-page";

export const metadata = {
  title: { absolute: "RealtorsIn — the professional network for UAE real estate" },
  description:
    "Connect with agents, brokers and developers, share listings, explore off-plan projects and close deals faster.",
};

export default function PublicHomePage() {
  return <LandingPage />;
}
