import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Reset password</h1>
      <Alert>
        <AlertTitle>Deferred</AlertTitle>
        <AlertDescription>
          Primary sign-in uses OTP or an existing social password.
          The older REM <code>forget_password</code> flow is not wired for this
          web app yet. Sign in with OTP, then set a password in profile
          completion or settings.
        </AlertDescription>
      </Alert>
      <Button asChild className="w-full" variant="outline">
        <Link href="/login">Back to sign in</Link>
      </Button>
    </div>
  );
}
