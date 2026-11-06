export type SocialApiSuccess<T> = {
  status: true;
  message?: string;
  data: T;
};

export type SocialApiFailure = {
  status: false;
  message?: string;
  errors?: unknown;
};

export type SocialApiResponse<T> = SocialApiSuccess<T> | SocialApiFailure;

export type SessionStatusResponse = {
  authenticated: boolean;
  /** Cookie presence only — not backend token validity. */
  hasSessionCookie: boolean;
};

export type HealthResponse = {
  ok: true;
  service: "realtorsin-web-app";
  timestamp: string;
};
