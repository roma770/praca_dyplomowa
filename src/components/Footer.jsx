import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 py-8 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm">
        <p className="font-semibold text-white">Bloom & Joy — kwiaty, prezenty i miłe niespodzianki</p>
        <p className="mt-2 text-gray-400">Kwiaty na ważne chwile, dostarczane pod wskazany adres.</p>
        <Link to="/admin" className="mt-4 inline-block text-xs text-gray-500 hover:text-gray-300">
          Panel administratora
        </Link>
      </div>
    </footer>
  );
};
