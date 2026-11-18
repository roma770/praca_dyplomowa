import { create } from 'zustand';
import { fetchCurrentUser, logoutAccount } from '../lib/orderApi';

const storageKey = 'bloom-joy-auth-session';

const readSession = () => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    return saved?.token && saved?.user ? saved : { token: '', user: null };
  } catch {
    return { token: '', user: null };
  }
};

const initialSession = readSession();

export const useAuthStore = create((set, get) => ({
  token: initialSession.token,
  user: initialSession.user,

  setSession: (session) => {
    const nextSession = { token: session.token, user: session.user };
    sessionStorage.setItem(storageKey, JSON.stringify(nextSession));
    set(nextSession);
  },

  clearSession: () => {
    sessionStorage.removeItem(storageKey);
    set({ token: '', user: null });
  },

  refreshSession: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const user = await fetchCurrentUser(token);
      get().setSession({ token, user });
    } catch {
      get().clearSession();
    }
  },

  logout: async () => {
    const { token } = get();
    try {
      if (token) await logoutAccount(token);
    } catch {

    } finally {
      get().clearSession();
    }
  },
}));
