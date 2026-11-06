import { redirect } from "next/navigation";

export const metadata = { title: "Off Plan" };

export default function OffPlanPage() {
  redirect("/listings?tab=off-plan");
}
