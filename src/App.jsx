import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { EventModal } from './components/EventModal';
import { Home } from './pages/Home';
import { MensSection } from './pages/MensSection';
import { Builder } from './pages/Builder';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Admin } from './pages/Admin';
import { Account } from './pages/Account';
import { isOrderApiEnabled } from './lib/orderApi';
import { useAuthStore } from './store/useAuthStore';

const AuthBootstrap = () => {
  const token = useAuthStore((state) => state.token);
  const refreshSession = useAuthStore((state) => state.refreshSession);

  useEffect(() => {
    if (token && isOrderApiEnabled) refreshSession();
  }, [token, refreshSession]);

  return null;
};

export default function App() {
  return (
    <Router>
      <AuthBootstrap />
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/mens" element={<MensSection />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:id" element={<OrderSuccess />} />
            <Route path="/account" element={<Account />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
        {/* Одно модальное окно на всё приложение */}
        <EventModal />
      </div>
    </Router>
  );
}
