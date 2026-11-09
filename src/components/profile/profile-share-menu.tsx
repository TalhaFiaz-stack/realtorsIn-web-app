"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Check,
  ChevronRight,
  Copy,
  FileText,
  Link2,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { ProfileFormDialog } from "@/components/profile/profile-form-dialog";
import { ContentShareDialog } from "@/components/chat/content-share-dialog";
import { ProfilePdfPreviewDialog } from "@/components/profile/profile-pdf-preview-dialog";
import { ProfileResumeTemplatesDialog } from "@/components/profile/profile-resume-templates-dialog";
import { Button } from "@/components/ui/button";
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

  const [open, setOpen] = useState(false);
  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  /** Close this popup first so two dialogs never stack (Radix focus trap). */
  function then(next: () => void) {
    setOpen(false);
    window.setTimeout(next, 120);
  }

  function linkMissing() {
    showAppToast.error("Profile link unavailable", "Try again from your profile page.");
  }

  async function copyLink() {
    if (!url) return linkMissing();
    const ok = await copyTextToClipboard(url);
    if (!ok) {
      showAppToast.error("Couldn't copy", "Select the link and copy it manually.");
      return;
    }
    setCopied(true);
    showAppToast.success("Link copied", "Paste it anywhere to share this profile.");
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function shareExternally() {
    if (!url) return linkMissing();
    const outcome = await shareTextExternally({
      title: profile.fullName,
      message: buildShareMessage(profile, url),
      url,
    });
    if (outcome === "cancelled" || outcome === "shared") return;
    if (outcome === "copied") {
      showAppToast.success("Copied", "Paste the profile link in WhatsApp, email, or chat.");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  function shareWhatsApp() {
    if (!url) return linkMissing();
    shareViaWhatsApp(buildShareMessage(profile, url));
  }

  function shareEmail() {
    if (!url) return linkMissing();
    shareViaEmail(`Realtor's In — ${profile.fullName}`, buildShareMessage(profile, url));
  }

  const headline =
    profile.description ||
    [profile.userRole, profile.company].filter(Boolean).join(" at ") ||
    null;

  const targets: Array<{
    label: string;
    icon: React.ReactNode;
    tone: string;
    onClick: () => void;
  }> = [
    {
      label: "Message",
      icon: <MessageCircle className="h-5 w-5" aria-hidden />,
      tone: "bg-primary/10 text-primary",
      onClick: () => (url ? then(() => setChatShareOpen(true)) : linkMissing()),
    },
    {
      label: "WhatsApp",
      icon: <WhatsAppGlyph />,
      tone: "bg-[#25D366]/12 text-[#1DA851]",
      onClick: shareWhatsApp,
    },
    {
      label: "Email",
      icon: <Mail className="h-5 w-5" aria-hidden />,
      tone: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
      onClick: shareEmail,
    },
    {
      label: canNativeShare ? "More" : "Copy text",
      icon: canNativeShare ? (
        <MoreHorizontal className="h-5 w-5" aria-hidden />
      ) : (
        <Copy className="h-5 w-5" aria-hidden />
      ),
      tone: "bg-muted text-foreground/80",
      onClick: () => void shareExternally(),
    },
  ];

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        className={
          compact
            ? "h-7 w-7 shrink-0 rounded-full bg-background/95 shadow-sm backdrop-blur-sm"
            : "h-9 w-9 shrink-0 rounded-full bg-background/95 shadow-sm backdrop-blur-sm"
        }
        aria-label="Share profile"
      >
        {copied ? (
          <Check className={compact ? "h-3.5 w-3.5 text-emerald-600" : "h-4 w-4 text-emerald-600"} />
        ) : (
          <Share2 className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        )}
      </Button>

      <ProfileFormDialog
        open={open}
        onOpenChange={setOpen}
        icon={Share2}
        title="Share profile"
        description={
          profile.isOwn
            ? "Send your profile to clients and colleagues."
            : `Send ${profile.name}'s profile to someone.`
        }
        size="sm"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 p-3">
          <Avatar className="h-12 w-12 shrink-0">
            {profile.profileImage?.url ? <AvatarImage src={profile.profileImage.url} alt="" /> : null}
            <AvatarPlaceholderFallback />
          </Avatar>
          <div className="min-w-0">
            <p className="flex items-center gap-1 truncate text-sm font-semibold text-foreground">
              <span className="truncate">{profile.fullName}</span>
              {profile.isVerified ? (
                <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Verified" />
              ) : null}
            </p>
            {profile.userName ? (
              <p className="truncate text-xs text-muted-foreground">@{profile.userName}</p>
            ) : null}
            {headline ? (
              <p className="mt-0.5 line-clamp-1 text-xs text-foreground/80">{headline}</p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {targets.map((target) => (
            <button
              key={target.label}
              type="button"
              onClick={target.onClick}
              className="group flex flex-col items-center gap-1.5 rounded-xl py-2 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-105 ${target.tone}`}
              >
                {target.icon}
              </span>
              {target.label}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-foreground">Profile link</p>
          <div className="flex items-center gap-2 rounded-full border border-border bg-background py-1 pe-1 ps-3.5">
            <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              readOnly
              value={url ?? "Link unavailable"}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Profile link"
              className="min-w-0 flex-1 truncate bg-transparent text-sm text-foreground/90 outline-none"
            />
            <Button
              type="button"
              size="sm"
              disabled={!url}
              onClick={() => void copyLink()}
              className="h-8 shrink-0 rounded-full px-3.5"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        {profile.isOwn ? (
          <button
            type="button"
            onClick={() => then(() => setTemplatesOpen(true))}
            className="group flex w-full items-center gap-3 rounded-xl border border-border/70 px-3.5 py-3 text-start transition-colors hover:bg-muted/50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <FileText className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">Resume / profile PDF</span>
              <span className="block text-xs text-muted-foreground">
                Pick a template and download your profile as a PDF
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
          </button>
        ) : null}
      </ProfileFormDialog>

      {url ? (
        <ContentShareDialog
          open={chatShareOpen}
          onOpenChange={setChatShareOpen}
          dialogTitle="Send profile as a message"
          messageOnly
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

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.43 9.43 0 0 1-1.45-5.03C2.6 6.83 6.84 2.6 12.05 2.6c2.52 0 4.9.99 6.68 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.45-9.44 9.45zm8.04-17.5A11.3 11.3 0 0 0 12.05.67C5.78.67.68 5.77.67 12.04c0 2 .52 3.96 1.52 5.69L.57 23.33l5.73-1.5a11.33 11.33 0 0 0 5.74 1.46h.01c6.27 0 11.37-5.1 11.38-11.37 0-3.04-1.18-5.9-3.34-8.04z" />
    </svg>
  );
}
