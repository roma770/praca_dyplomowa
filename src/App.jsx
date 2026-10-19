import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Заглушки для страниц (скоро создадим их)
const Home = () => <div className="p-8 text-center text-xl font-bold">Головна сторінка каталогу</div>;
const Builder = () => <div className="p-8 text-center text-xl font-bold">Онлайн-конструктор букета</div>;
const Mens = () => <div className="p-8 text-center text-xl font-bold">Чоловічі букети (Ковбаси, сири)</div>;
const Checkout = () => <div className="p-8 text-center text-xl font-bold">Оформлення замовлення та доставка</div>;

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/mens" element={<Mens />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}