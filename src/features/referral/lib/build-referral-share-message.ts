const IOS_STORE_URL =
  "https://apps.apple.com/us/app/realtorsin-real-estate-network/id6752862402";
const ANDROID_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.rem.realtorsIn";

export function buildReferralShareMessage(input: {
  referralCode: string;
  signupUrl: string;
}): string {
  const { referralCode, signupUrl } = input;
  return (
    `Join me on RealtorsIn — the network for verified brokers.\n` +
    `Use my referral code when you sign up: ${referralCode}\n\n` +
    `Sign up on the web:\n${signupUrl}\n\n` +
    `Or download the app:\n` +
    `iOS: ${IOS_STORE_URL}\n` +
    `Android: ${ANDROID_STORE_URL}`
  );
}

export function buildReferralSignupUrl(appOrigin: string, referralCode: string) {
  const base = appOrigin.replace(/\/$/, "");
  const params = new URLSearchParams({ ref: referralCode });
  return `${base}/login?${params.toString()}`;
}
