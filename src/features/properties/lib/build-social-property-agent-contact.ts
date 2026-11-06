function formatAgentPhone(profile: Record<string, unknown> | null | undefined) {
  const raw = String(profile?.phone ?? "").trim();
  if (!raw) return null;
  if (raw.startsWith("+")) return raw.replace(/\s/g, "");
  const dial = String(profile?.phone_dial_code ?? "").trim();
  if (!dial) return raw.replace(/\s/g, "");
  const dialNorm = dial.startsWith("+") ? dial : `+${dial}`;
  const phoneNorm = raw.startsWith("0") ? raw.slice(1) : raw;
  return `${dialNorm}${phoneNorm}`.replace(/\s/g, "");
}

function resolveAgentName(profile: Record<string, unknown> | null | undefined) {
  const fullName = [profile?.name, profile?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (fullName) return fullName;
  if (profile?.user_name) return String(profile.user_name);
  return "Agent";
}

export type PropertyAgentContact = {
  receiverId: number | null;
  name: string;
  username: string;
  email: string | null;
  phone: string | null;
  profileImage: string | null;
  prefilledMessage: string;
  hasContactInfo: boolean;
};

export function buildSocialPropertyAgentContact(
  property: Record<string, unknown>
): PropertyAgentContact {
  const profile =
    (property.socialProfile as Record<string, unknown> | undefined) ??
    (property.ownerInfo as Record<string, unknown> | undefined) ??
    {};
  const name = resolveAgentName(profile);
  const area = property.area_start ?? property.area_end ?? "";
  const price = property.price_start ?? property.price_end ?? "";
  const typeLabel = property.property_type ?? property.type ?? "";
  const title = property.title ?? "";

  const prefilledMessage = [
    `Hello ${name}, `,
    "I would like to get more details of the property posted on RealtorsIn",
    "",
    `Title: ${title}`,
    `Area: ${area} SQFT`,
    `Type: ${typeLabel}`,
    `Price: ${price} AED`,
  ].join("\n");

  const receiverRaw =
    profile.id ?? property.user_id ?? property.fk_user_id ?? null;
  const receiverId = Number(receiverRaw);
  const phone = formatAgentPhone(profile);
  const email =
    typeof profile.email === "string" && profile.email.trim()
      ? profile.email.trim()
      : null;

  return {
    receiverId: Number.isFinite(receiverId) && receiverId > 0 ? receiverId : null,
    name,
    username: typeof profile.user_name === "string" ? profile.user_name : "",
    email,
    phone,
    profileImage:
      typeof profile.profile_image === "string" ? profile.profile_image : null,
    prefilledMessage,
    hasContactInfo: Boolean(
      (Number.isFinite(receiverId) && receiverId > 0) || phone || email
    ),
  };
}
