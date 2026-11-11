import { z } from 'zod';
import delivery from '../data/delivery.json';

// Сегодняшняя дата в формате YYYY-MM-DD (по локальному времени)
export const todayISO = () => new Date().toLocaleDateString('sv-SE');

const zoneIds = delivery.zones.map((z) => z.id);

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, 'Вкажіть ваше ім’я'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s()-]{9,16}$/, 'Вкажіть коректний номер телефону'),
  email: z.email('Невірний формат email').or(z.literal('')),

  recipientName: z.string().trim().min(2, 'Вкажіть ім’я отримувача'),
  address: z.string().trim().min(5, 'Вкажіть адресу доставки'),
  zone: z.string().refine((v) => zoneIds.includes(v), 'Оберіть зону доставки'),
  date: z
    .string()
    .min(1, 'Оберіть дату доставки')
    .refine((v) => v >= todayISO(), 'Дата не може бути в минулому'),
  slot: z.string().min(1, 'Оберіть проміжок часу'),
  cardText: z.string().max(200, 'Не більше 200 символів').optional(),
});