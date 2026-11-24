import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 py-8 mt-20 border-t border-slate-800">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 text-sm md:grid-cols-[1.5fr_1fr_1fr]">
        <div><p className="font-semibold text-white">Bloom & Joy — kwiaty, prezenty i miłe niespodzianki</p><p className="mt-2 max-w-md text-gray-400">Kwiaty na ważne chwile, dostarczane pod wskazany adres.</p></div>
        <div><h2 className="font-semibold text-white">Poznaj nas</h2><div className="mt-3 flex flex-col gap-2"><Link to="/about" className="text-gray-400 hover:text-white">O nas</Link><Link to="/contact" className="text-gray-400 hover:text-white">Kontakt</Link></div></div>
        <div><h2 className="font-semibold text-white">Zakupy</h2><div className="mt-3 flex flex-col gap-2"><Link to="/" className="text-gray-400 hover:text-white">Kwiaty i prezenty</Link><Link to="/favorites" className="text-gray-400 hover:text-white">Ulubione</Link><Link to="/account" className="text-gray-400 hover:text-white">Konto klienta</Link></div></div>
      </div>
      <p className="mx-auto mt-8 max-w-7xl border-t border-slate-800 px-4 pt-5 text-center text-xs text-gray-500">© {new Date().getFullYear()} Bloom & Joy. Z miłości do pięknych gestów.</p>
    </footer>
  );
};
