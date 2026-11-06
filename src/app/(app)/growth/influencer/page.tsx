import { InfluencerChallengeScreen } from "@/components/influencer/influencer-challenge-screen";
import { SettingsPageShell } from "@/components/settings/settings-page-shell";

export const metadata = { title: "Influencer Challenge" };

export default function InfluencerChallengePage() {
  return (
    <SettingsPageShell
      title="Influencer Challenge"
      description="Post videos consistently to earn the Influencer Badge"
      backHref="/activities"
      backLabel="My activity"
    >
      <InfluencerChallengeScreen />
    </SettingsPageShell>
  );
}
