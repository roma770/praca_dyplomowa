import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, LogIn, LogOut, ShieldCheck, UserRound, UserRoundPlus } from 'lucide-react';
import { isOrderApiEnabled, loginAccount, registerAccount } from '../lib/orderApi';
import { useAuthStore } from '../store/useAuthStore';

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100';

export const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setSession = useAuthStore((state) => state.setSession);
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (mode === 'register' && password !== confirmPassword) {
      setError('Hasła nie są takie same.');
      return;
    }

    setLoading(true);
    try {
      const session =
        mode === 'register'
          ? await registerAccount({ name, email, password })
          : await loginAccount(email, password);
      setSession(session);

      const requestedPath = location.state?.from?.pathname;
      const canOpenRequestedPath = requestedPath !== '/admin' || session.user.role === 'admin';
      const destination = canOpenRequestedPath
        ? requestedPath || (session.user.role === 'admin' ? '/admin' : '/')
        : '/';
      navigate(destination, { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setMode('login');
    setPassword('');
  };

  if (!isOrderApiEnabled) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-900">
          Logowanie wymaga połączenia z serwerem kont. Skonfiguruj adres API dla opublikowanej strony.
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 md:py-16">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-9">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            {user.role === 'admin' ? <ShieldCheck size={27} /> : <UserRound size={27} />}
          </div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-rose-500">Twoje konto</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Cześć, {user.name}</h1>
          <p className="mt-2 text-gray-500">{user.email}</p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-3 font-semibold text-white transition hover:bg-rose-600"
              >
                <ShieldCheck size={18} />
                Otwórz panel administratora
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              <LogOut size={18} />
              Wyloguj się
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isRegistering = mode === 'register';

  return (
    <div className="mx-auto max-w-md px-4 py-12 md:py-16">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          {isRegistering ? <UserRoundPlus size={27} /> : <LogIn size={27} />}
        </div>
        <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-rose-500">Konto Bloom & Joy</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          {isRegistering ? 'Utwórz konto' : 'Zaloguj się'}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {isRegistering ? 'Załóż konto, aby korzystać z funkcji sklepu.' : 'Zaloguj się na swoje konto.'}
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`rounded-lg px-3 py-2.5 transition ${!isRegistering ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'}`}
          >
            Zaloguj się
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`rounded-lg px-3 py-2.5 transition ${isRegistering ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'}`}
          >
            Rejestracja
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegistering && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Imię i nazwisko</span>
              <input
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClass}
                minLength={2}
                maxLength={100}
                required
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Adres e-mail</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
              maxLength={160}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Hasło</span>
            <div className="relative">
              <KeyRound size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${inputClass} pl-10`}
                minLength={8}
                maxLength={128}
                required
              />
            </div>
            {isRegistering && <span className="mt-1.5 block text-xs text-gray-400">Co najmniej 8 znaków</span>}
          </label>

          {isRegistering && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Powtórz hasło</span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={inputClass}
                minLength={8}
                maxLength={128}
                required
              />
            </label>
          )}

          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? 'Proszę czekać…' : isRegistering ? 'Utwórz konto' : 'Zaloguj się'}
          </button>
        </form>
      </div>
    </div>
  );
};
