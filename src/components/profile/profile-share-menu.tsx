"use client";

import { useState } from "react";
import { Check, Copy, FileText, MessageCircle, Share2 } from "lucide-react";
import { ContentShareDialog } from "@/components/chat/content-share-dialog";
import { ProfilePdfPreviewDialog } from "@/components/profile/profile-pdf-preview-dialog";
import { ProfileResumeTemplatesDialog } from "@/components/profile/profile-resume-templates-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  GeneratedCvPdf,
  SocialProfile,
} from "@/features/profile/types/profile.types";
import { copyTextToClipboard } from "@/lib/clipboard";
import {
  shareTextExternally,
  shareViaEmail,
  shareViaWhatsApp,
} from "@/lib/share/share-external";
import { showAppToast } from "@/lib/toast/app-toast";

function buildShareMessage(profile: SocialProfile, url: string) {
  if (profile.isOwn) {
    return `Check out my Realtor's In profile: ${url}`;
  }
  return `Check out ${profile.fullName}'s Realtor's In profile: ${url}`;
}

export function ProfileShareMenu({
  profile,
  compact = false,
}: {
  profile: SocialProfile;
  /** Smaller trigger for tight layouts (left rail cover). */
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [pdf, setPdf] = useState<GeneratedCvPdf | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [chatShareOpen, setChatShareOpen] = useState(false);
  const url = profile.publicProfileUrl;

  async function copyLink() {
    if (!url) {
      window.alert("Profile link is not available");
      return;
    }
    const ok = await copyTextToClipboard(url);
    if (!ok) {
      window.alert("Unable to copy profile link");
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function shareExternally() {
    if (!url) {
      showAppToast.error("Profile link unavailable", "Try again from your profile page.");
      return;
    }
    const message = buildShareMessage(profile, url);
    const outcome = await shareTextExternally({
      title: profile.fullName,
      message,
      url,
    });
    if (outcome === "cancelled") return;
    if (outcome === "shared") {
      showAppToast.success("Shared", "Profile link sent via your device share menu.");
      return;
    }
    if (outcome === "copied") {
      showAppToast.success("Copied", "Paste the profile link in WhatsApp, email, or chat.");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      return;
    }
    showAppToast.success(
      "Opening WhatsApp",
      "Finish sending the prefilled message in WhatsApp."
    );
  }

  function shareWhatsApp() {
    if (!url) return;
    shareViaWhatsApp(buildShareMessage(profile, url));
    showAppToast.success(
      "Opening WhatsApp",
      "Finish sending the prefilled message in WhatsApp."
    );
  }

  function shareEmail() {
    if (!url) return;
    const message = buildShareMessage(profile, url);
    shareViaEmail(`Realtor's In — ${profile.fullName}`, message);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={
              compact
                ? "h-7 w-7 shrink-0 rounded-full bg-background/95 shadow-sm backdrop-blur-sm"
                : "h-9 w-9 shrink-0 rounded-full bg-background/95 shadow-sm backdrop-blur-sm"
            }
            aria-label="Share profile"
          >
            {copied ? (
              <Check
                className={
                  compact
                    ? "h-3.5 w-3.5 text-emerald-600"
                    : "h-4 w-4 text-emerald-600"
                }
              />
            ) : (
              <Share2 className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Share profile</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer flex-col items-start gap-0.5 py-2.5"
            onSelect={() => setChatShareOpen(true)}
          >
            <span className="inline-flex items-center gap-2 font-medium">
              <MessageCircle className="h-4 w-4" />
              Share as Message
            </span>
            <span className="locale-text ps-6 text-xs text-muted-foreground">
              Send this profile as a direct message to your connections
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer flex-col items-start gap-0.5 py-2.5"
            onSelect={() => void copyLink()}
          >
            <span className="inline-flex items-center gap-2 font-medium">
              <Copy className="h-4 w-4" />
              Copy link
            </span>
            <span className="locale-text ps-6 text-xs text-muted-foreground">
              Copy the public profile link to share anywhere
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer flex-col items-start gap-0.5 py-2.5"
            onSelect={() => void shareExternally()}
          >
            <span className="inline-flex items-center gap-2 font-medium">
              <Share2 className="h-4 w-4" />
              Share via device
            </span>
            <span className="locale-text ps-6 text-xs text-muted-foreground">
              System share sheet, then clipboard or WhatsApp as fallback
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer flex-col items-start gap-0.5 py-2.5"
            onSelect={shareWhatsApp}
          >
            <span className="font-medium">WhatsApp</span>
            <span className="text-xs text-muted-foreground">
              Open WhatsApp with your profile link prefilled
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer flex-col items-start gap-0.5 py-2.5"
            onSelect={shareEmail}
          >
            <span className="font-medium">Email</span>
            <span className="text-xs text-muted-foreground">
              Compose an email with the profile link
            </span>
          </DropdownMenuItem>
          {profile.isOwn ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer flex-col items-start gap-0.5 py-2.5"
                onSelect={() => setTemplatesOpen(true)}
              >
                <span className="inline-flex items-center gap-2 font-medium">
                  <FileText className="h-4 w-4" />
                  Resume templates
                </span>
                <span className="locale-text ps-6 text-xs text-muted-foreground">
                  Choose a template or generate a profile PDF
                </span>
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {url ? (
        <ContentShareDialog
          open={chatShareOpen}
          onOpenChange={setChatShareOpen}
          dialogTitle="Share Profile"
          publicUrl={url}
          externalTitle={profile.fullName}
          externalMessage={buildShareMessage(profile, url)}
          chatEntity={{ type: "profile", profileId: profile.id }}
        />
      ) : null}

      {profile.isOwn ? (
        <>
          <ProfileResumeTemplatesDialog
            open={templatesOpen}
            onOpenChange={setTemplatesOpen}
            profile={profile}
            onPdfGenerated={(next) => {
              setPdf(next);
              setPdfOpen(true);
            }}
          />
          <ProfilePdfPreviewDialog
            open={pdfOpen}
            onOpenChange={(next) => {
              setPdfOpen(next);
              if (!next) setPdf(null);
            }}
            pdf={pdf}
          />
        </>
      ) : null}
    </>
  );
}
