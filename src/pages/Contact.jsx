import { useState } from 'react';
import { Clock3, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import delivery from '../data/delivery.json';
import { isOrderApiEnabled, submitContactMessage } from '../lib/orderApi';

const emptyForm = { name: '', email: '', subject: '', message: '' };

export const Contact = () => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await submitContactMessage(form);
      setForm(emptyForm);
      setSuccess('Dziękujemy za wiadomość. Skontaktujemy się z Tobą na podany adres e-mail.');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-50">
      <section className="bg-gray-900 px-4 py-14 text-center text-white md:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-300">Bloom & Joy</p>
        <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">Porozmawiajmy</h1>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-300">Masz pytanie o bukiet, dostawę albo zamówienie? Napisz do nas, a wrócimy z odpowiedzią.</p>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-14">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-gray-900">Wyślij wiadomość</h2>
          {success && <p role="status" className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">{success}</p>}
          {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {!isOrderApiEnabled && <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Formularz będzie aktywny po podłączeniu serwera sklepu.</p>}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">Imię i nazwisko<input required minLength={2} maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-rose-400" /></label>
            <label className="text-sm font-medium text-gray-700">Adres e-mail<input required type="email" maxLength={160} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-rose-400" /></label>
            <label className="text-sm font-medium text-gray-700 sm:col-span-2">Temat<input required minLength={2} maxLength={120} value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-rose-400" /></label>
            <label className="text-sm font-medium text-gray-700 sm:col-span-2">Wiadomość<textarea required minLength={10} maxLength={2000} rows={6} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="mt-1.5 w-full resize-y rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-rose-400" /></label>
          </div>
          <button type="submit" disabled={saving || !isOrderApiEnabled} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-6 py-3 font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-gray-300"><Send size={17} />{saving ? 'Wysyłanie…' : 'Wyślij wiadomość'}</button>
        </form>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-gray-100 bg-white p-5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500"><MessageCircle size={21} /></span><h2 className="mt-4 font-bold text-gray-900">Pomożemy wybrać</h2><p className="mt-2 text-sm leading-6 text-gray-500">Napisz, komu chcesz sprawić radość i z jakiej okazji — podpowiemy, który prezent będzie odpowiedni.</p></article>
          <article className="rounded-2xl border border-gray-100 bg-white p-5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500"><MapPin size={21} /></span><h2 className="mt-4 font-bold text-gray-900">Obszar dostawy</h2><p className="mt-2 text-sm leading-6 text-gray-500">Dostępne strefy: {delivery.zones.map((zone) => zone.name.toLocaleLowerCase('pl-PL')).join(', ')}.</p></article>
          <article className="rounded-2xl border border-gray-100 bg-white p-5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500"><Clock3 size={21} /></span><h2 className="mt-4 font-bold text-gray-900">Szybki kontakt</h2><p className="mt-2 text-sm leading-6 text-gray-500">W sprawie zamówienia podaj jego numer i preferowaną formę odpowiedzi.</p><div className="mt-3 flex items-center gap-2 text-sm text-gray-500"><Mail size={16} className="text-rose-500" /> Odpowiemy na podany e-mail</div></article>
        </aside>
      </div>
    </div>
  );
};
