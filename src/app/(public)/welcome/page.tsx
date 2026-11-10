import { notFound } from "next/navigation";

// The /welcome page is switched off for now (the landing page lives at "/").
// To bring it back: delete the notFound() version below and uncomment the
// original, and restore the "Back to welcome" link in
// src/components/auth/login-form.tsx.
//
// import { LandingPage } from "@/components/landing/landing-page";
//
// export const metadata = {
//   title: "Welcome",
//   description:
//     "What RealtorsIn is, who it's for and how each feature works — feed, network, off-plan projects, Property Hub, messaging, jobs and events.",
// };
//
// export default function WelcomePage() {
//   return <LandingPage />;
// }

export default function WelcomePage() {
  notFound();
}
