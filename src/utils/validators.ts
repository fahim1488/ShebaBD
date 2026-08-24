/**
 * validators.ts - Input validation helpers for forms.
 */
export const BD_PHONE_REGEX = /^(?:\+?88|0088)?01[3-9]\d{8}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidBDPhone(phone: string): boolean {
  return BD_PHONE_REGEX.test(phone.trim());
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}
