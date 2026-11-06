import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Create account</h1>
      <Alert>
        <AlertTitle>Use phone or email OTP</AlertTitle>
        <AlertDescription>
          Your profile is created when you verify a phone or email code. There
          is no separate registration step for the primary flow.
        </AlertDescription>
      </Alert>
      <Button asChild className="w-full">
        <Link href="/login">Continue to sign in</Link>
      </Button>
    </div>
  );
}
