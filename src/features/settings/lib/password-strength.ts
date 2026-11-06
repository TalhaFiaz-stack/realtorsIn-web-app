export type PasswordValidation = {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
};

export function getPasswordValidation(password: string): PasswordValidation {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
}

export function isPasswordStrong(password: string): boolean {
  return Object.values(getPasswordValidation(password)).every(Boolean);
}

export const PASSWORD_REQUIREMENT_LABELS: {
  key: keyof PasswordValidation;
  label: string;
}[] = [
  { key: "length", label: "At least 8 characters" },
  { key: "uppercase", label: "At least one uppercase letter (A–Z)" },
  { key: "lowercase", label: "At least one lowercase letter (a–z)" },
  { key: "number", label: "At least one number (0–9)" },
  {
    key: "special",
    label: "At least one special character (!@#$%^&*)",
  },
];

export const PASSWORD_SECURITY_TIPS = [
  "Use a unique password that you don't use anywhere else",
  "Avoid using personal information like names or birthdates",
  "Consider using a password manager",
  "Change your password if you suspect your account was accessed",
] as const;
