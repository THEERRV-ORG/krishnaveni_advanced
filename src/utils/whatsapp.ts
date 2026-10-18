const DEFAULT_MESSAGE = 'Hello Dr. Sai Tejaswini, I would like to book an online physiotherapy consultation.';

export function whatsappLink(number: string, message: string = DEFAULT_MESSAGE): string {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}
