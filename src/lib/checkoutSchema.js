import { z } from 'zod';
import delivery from '../data/delivery.json';

// Сегодняшняя дата в формате YYYY-MM-DD (по локальному времени)
export const todayISO = () => new Date().toLocaleDateString('sv-SE');

const zoneIds = delivery.zones.map((z) => z.id);

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, 'Podaj imię i nazwisko.'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s()-]{9,16}$/, 'Podaj prawidłowy numer telefonu.'),
  email: z.email('Podaj prawidłowy adres e-mail.').or(z.literal('')),

  recipientName: z.string().trim().min(2, 'Podaj imię odbiorcy.'),
  address: z.string().trim().min(5, 'Podaj adres dostawy.'),
  zone: z.string().refine((v) => zoneIds.includes(v), 'Wybierz obszar dostawy.'),
  date: z
    .string()
    .min(1, 'Wybierz datę dostawy.')
    .refine((v) => v >= todayISO(), 'Data dostawy nie może przypadać w przeszłości.'),
  slot: z.string().min(1, 'Wybierz przedział godzinowy.'),
  cardText: z.string().max(200, 'Wiadomość może mieć maksymalnie 200 znaków.').optional(),
});
