import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

declare global { interface Window { google: any; } }

export interface User { id: string; name: string; email: string; credits: number; }
interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
  buyCredits: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('mrdelivery_token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.user) setUser(data.user);
      else localStorage.removeItem('mrdelivery_token');
    } catch { localStorage.removeItem('mrdelivery_token'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUser(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      fetch(`/api/stripe/verify?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => { if (data.success) fetchUser(); })
        .catch(console.error)
        .finally(() => window.history.replaceState({}, '', window.location.pathname));
    }
  }, []);

  const login = () => {
    const client = window.google?.accounts.id;
    if (!client) return alert('Google SDK nu s-a încărcat. Reîncarcă pagina.');
    client.initialize({
      client_id: '732798017063-ginkk970frfq8bj8okfa2ahir18dlo8g.apps.googleusercontent.com',
      callback: async (response: any) => {
        try {
          const res = await fetch('/api/auth/google', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.credential })
          });
          const data = await res.json();
          if (data.token && data.user) {
            localStorage.setItem('mrdelivery_token', data.token);
            setUser(data.user);
          } else alert(data.error || 'Eroare la autentificare');
        } catch { alert('Eroare de rețea'); }
      }
    });
    client.prompt();
  };

  const logout = () => {
    localStorage.removeItem('mrdelivery_token');
    setUser(null);
    window.google?.accounts.id.disableAutoSelect();
  };

  const buyCredits = async () => {
    const token = localStorage.getItem('mrdelivery_token');
    if (!token) return login();
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Eroare la inițierea plății');
    } catch { alert('Eroare de rețea'); }
  };

  const refreshUser = async () => { await fetchUser(); };

  return <AuthContext.Provider value={{ user, login, logout, loading, buyCredits, refreshUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx; };
