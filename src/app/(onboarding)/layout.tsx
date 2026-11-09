/**
 * Onboarding routes choose their own chrome: the profile form uses the
 * compact auth card, the getting-started tour uses a full-width layout.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
