import { Link } from 'react-router-dom';
import { Flower2, Gift, Heart, Sparkles } from 'lucide-react';

const values = [
  { icon: Flower2, title: 'Kompozycje z pomysłem', text: 'Od klasycznych róż po bukiety sezonowe i jadalne prezenty — pomagamy znaleźć formę, która pasuje do okazji.' },
  { icon: Sparkles, title: 'Twój własny projekt', text: 'W kreatorze dobierzesz kwiaty i opakowanie, a podgląd 3D pokaże kompozycję przed dodaniem jej do koszyka.' },
  { icon: Heart, title: 'Małe gesty, ważne chwile', text: 'Urodziny, rocznica, podziękowanie albo zwykły dzień — dobry prezent nie potrzebuje specjalnego powodu.' },
];

export const About = () => (
  <div className="bg-white">
    <section className="relative overflow-hidden bg-rose-50">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-24">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-600">Bloom & Joy</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-gray-900 md:text-6xl">Prezenty, które mówią <span className="text-rose-500">od serca</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">Tworzymy miejsce, w którym łatwo znaleźć piękny bukiet, wyjątkowy upominek albo przygotować własną kompozycję od podstaw.</p>
          <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-6 py-3 font-semibold text-white transition hover:bg-rose-600"><Gift size={18} /> Zobacz ofertę</Link>
        </div>
        <div className="relative">
          <img src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=85" alt="Kolorowy bukiet kwiatów Bloom & Joy" className="h-72 w-full rounded-3xl object-cover shadow-xl md:h-[430px]" />
          <div className="absolute -bottom-4 left-4 rounded-2xl bg-white px-5 py-4 shadow-lg md:-left-6"><p className="text-sm font-semibold text-gray-900">Znajdź prezent na każdą okazję</p><p className="mt-1 text-xs text-gray-500">Kwiaty · upominki · bukiety na zamówienie</p></div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">Nasze podejście</p><h2 className="mt-3 text-3xl font-bold text-gray-900">Piękno tkwi w osobistym geście</h2><p className="mt-4 leading-7 text-gray-500">Bloom & Joy łączy wygodne zakupy online z radością tworzenia prezentu dopasowanego do konkretnej osoby.</p></div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {values.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500"><Icon size={23} /></span><h3 className="mt-5 text-lg font-bold text-gray-900">{title}</h3><p className="mt-2 text-sm leading-6 text-gray-500">{text}</p></article>)}
      </div>
    </section>
  </div>
);
