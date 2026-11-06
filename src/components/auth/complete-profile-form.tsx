"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthBrandHeader } from "@/components/auth/auth-brand-header";
import { AuthSecurityNote } from "@/components/auth/auth-security-note";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { PasswordField } from "@/components/auth/password-field";
import { completeProfileRequest } from "@/features/auth/services/auth.client";
import type { PublicMember } from "@/features/auth/types/auth.types";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { REFERRAL_CODE_SESSION_KEY } from "@/features/referral/constants/referral.constants";

const ROLES = [
  "Broker",
  "Agent",
  "Sales Manager",
  "Marketing",
  "Developer",
  "Other",
];

export function CompleteProfileForm({ member }: { member: PublicMember }) {
  const router = useRouter();
  const [name, setName] = useState(member.name ?? "");
  const [lastName, setLastName] = useState(member.lastName ?? "");
  const [userName, setUserName] = useState(member.userName ?? "");
  const [company, setCompany] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [userRole, setUserRole] = useState("Agent");
  const [reraNumber, setReraNumber] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(REFERRAL_CODE_SESSION_KEY);
      if (stored?.trim()) {
        setReferralCode(stored.trim().toUpperCase());
      }
    } catch {
      /* ignore */
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const result = await completeProfileRequest({
        name,
        lastName,
        userName,
        company,
        agencyName: agencyName || undefined,
        userRole,
        reraNumber: reraNumber || undefined,
        password: password || undefined,
        referralCode: referralCode || undefined,
      });
      router.replace(result.redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save profile");
    } finally {
      setPending(false);
    }
  }

  const authInputClass = "auth-field-input h-[50px] px-3 shadow-none";

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <AuthBrandHeader
        title="Complete your profile"
        description="Tell the network who you are. You can refine details later."
      />

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Save failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">First name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name"
            disabled={pending}
            required
            className={authInputClass}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            disabled={pending}
            required
            className={authInputClass}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="userName">Username</Label>
        <Input
          id="userName"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Choose a unique username"
          disabled={pending}
          required
          className={authInputClass}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Your company name"
          disabled={pending}
          required
          className={authInputClass}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="agencyName">Agency (optional)</Label>
        <Input
          id="agencyName"
          value={agencyName}
          onChange={(e) => setAgencyName(e.target.value)}
          placeholder="Agency or brokerage"
          disabled={pending}
          className={authInputClass}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="userRole">Role</Label>
        <select
          id="userRole"
          className={cn(authInputClass, "flex w-full appearance-none")}
          value={userRole}
          onChange={(e) => setUserRole(e.target.value)}
          disabled={pending}
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rera">RERA number (optional)</Label>
        <Input
          id="rera"
          value={reraNumber}
          onChange={(e) => setReraNumber(e.target.value)}
          placeholder="RERA license number"
          disabled={pending}
          className={authInputClass}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Create password (optional)</Label>
        <PasswordField
          id="newPassword"
          variant="auth"
          value={password}
          onChange={setPassword}
          disabled={pending}
          autoComplete="new-password"
          placeholder="Create a password"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="referral">Referral code (optional)</Label>
        <Input
          id="referral"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          placeholder="Referral code"
          disabled={pending}
          className={authInputClass}
        />
      </div>

      <AuthSubmitButton pending={pending} pendingLabel="Saving…" className="mt-0">
        Continue
      </AuthSubmitButton>
      <AuthSecurityNote />
    </form>
  );
}
