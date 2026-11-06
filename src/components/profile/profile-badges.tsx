"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { SocialProfile } from "@/features/profile/types/profile.types";

/**
 * Fixed square slot so SVG viewBoxes (verified / connector / influencer)
 * render at the same visual size and stay centered with the name.
 */
function BadgeSlot({
  size,
  children,
  title,
}: {
  size: number;
  children: ReactNode;
  title: string;
}) {
  return (
    <span
      title={title}
      className="inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      {children}
    </span>
  );
}

function BadgeImage({
  src,
  alt,
  size,
}: {
  src: string;
  alt: string;
  size: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="h-full w-full object-contain"
      draggable={false}
    />
  );
}

/** Mobile VerificationBadge / broker verifiedIcon */
export function VerifiedBadgeIcon({ size = 18 }: { size?: number }) {
  return (
    <BadgeSlot size={size} title="Verified">
      <BadgeImage
        src="/profile/badges/verified.svg"
        alt="Verified"
        size={size}
      />
    </BadgeSlot>
  );
}

/** Mobile ConnectorBadgeIcon */
export function ConnectorBadgeIcon({ size = 18 }: { size?: number }) {
  return (
    <BadgeSlot
      size={size}
      title="This broker has helped grow the RealtorsIn network"
    >
      <BadgeImage
        src="/profile/badges/connector.svg"
        alt="Connector"
        size={size}
      />
    </BadgeSlot>
  );
}

/** Mobile InfluencerBadgeIcon */
export function InfluencerBadgeIcon({ size = 18 }: { size?: number }) {
  return (
    <BadgeSlot
      size={size}
      title="This broker earned the Influencer Badge by posting consistently on RealtorsIn"
    >
      <BadgeImage
        src="/profile/badges/influencer.svg"
        alt="Influencer"
        size={size}
      />
    </BadgeSlot>
  );
}

const NAME_BADGE_SIZE = 18;
const CHIP_ICON_SIZE = 14;

export function ProfileNameBadges({ profile }: { profile: SocialProfile }) {
  if (
    !profile.isVerified &&
    !profile.hasConnectorBadge &&
    !profile.hasInfluencerBadge
  ) {
    return null;
  }

  return (
    <span className="inline-flex h-[1.15em] items-center gap-1 self-center">
      {profile.isVerified ? (
        <VerifiedBadgeIcon size={NAME_BADGE_SIZE} />
      ) : null}
      {profile.hasConnectorBadge ? (
        <ConnectorBadgeIcon size={NAME_BADGE_SIZE} />
      ) : null}
      {profile.hasInfluencerBadge ? (
        <InfluencerBadgeIcon size={NAME_BADGE_SIZE} />
      ) : null}
    </span>
  );
}

export function ProfileStatusChips({ profile }: { profile: SocialProfile }) {
  const chips: ReactNode[] = [];

  if (profile.activeStatus === "inactive") {
    chips.push(
      <span
        key="inactive"
        className="inline-flex h-6 items-center rounded-full border border-border bg-muted px-2 text-[11px] font-semibold leading-none text-muted-foreground"
      >
        Inactive
      </span>
    );
  }

  if (profile.brokerCardVerified) {
    // Mobile brokerVerifiedBadge: successSurface + #059669 text
    chips.push(
      <span
        key="broker-verified"
        className="inline-flex h-6 items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 text-[11px] font-semibold leading-none text-[#059669] dark:border-[#065F46] dark:bg-[#064E3B] dark:text-[#6EE7B7]"
      >
        <VerifiedBadgeIcon size={CHIP_ICON_SIZE} />
        <span>Verified Broker</span>
      </span>
    );
  } else if (profile.isOwn && profile.brokerCardStatus === "pending") {
    chips.push(
      <Link
        key="broker-pending"
        href="/settings/broker-verification"
        className="inline-flex h-6 items-center rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2.5 text-[11px] font-semibold leading-none text-[#D97706] transition hover:opacity-90 dark:border-[#92400E] dark:bg-[#78350F] dark:text-[#FCD34D]"
      >
        Broker verification pending
      </Link>
    );
  } else if (profile.isOwn && profile.brokerCardStatus === "rejected") {
    chips.push(
      <Link
        key="broker-rejected"
        href="/settings/broker-verification"
        className="inline-flex h-6 items-center rounded-full border border-[#FECACA] bg-[#FEF2F2] px-2.5 text-[11px] font-semibold leading-none text-[#DC2626] transition hover:opacity-90 dark:border-[#991B1B] dark:bg-[#7F1D1D] dark:text-[#FCA5A5]"
      >
        Broker card rejected
      </Link>
    );
  } else if (profile.isOwn && !profile.brokerCardVerified) {
    chips.push(
      <Link
        key="broker-verify"
        href="/settings/broker-verification"
        className="inline-flex h-6 items-center rounded-full border border-border bg-muted px-2.5 text-[11px] font-semibold leading-none text-foreground transition hover:bg-muted/80"
      >
        Verify broker card
      </Link>
    );
  }

  if (!chips.length) return null;

  return <div className="flex flex-wrap items-center gap-1.5">{chips}</div>;
}
