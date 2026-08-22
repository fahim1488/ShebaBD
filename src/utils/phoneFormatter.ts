/**
 * phoneFormatter.ts - Format and detect Bangladeshi mobile telecom carriers.
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

export function detectCarrier(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const prefix = cleaned.startsWith('880') ? cleaned.slice(3, 5) : cleaned.slice(1, 3);
  const carriers: Record<string, string> = {
    '17': 'Grameenphone',
    '13': 'Grameenphone',
    '19': 'Banglalink',
    '14': 'Banglalink',
    '18': 'Robi',
    '16': 'Airtel',
    '15': 'Teletalk'
  };
  return carriers[prefix] || 'Unknown Carrier';
}
