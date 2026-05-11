import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

declare global { interface Window { google: any; } }

export interface User { id: string; name: string; email: string; credits: number; }
interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('mrdelivery_token');
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { if (data.user) setUser(data.user); })
        .catch(() => localStorage.removeItem('mrdelivery_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = () => {
    const client = window.google?.accounts.id;
    if (!client) return alert('Google SDK nu s-a încărcat. Reîncarcă pagina.');
    client.initialize({
      client_id: 'YOUR_GOOGLE_CLIENT_ID',
      callback: async (response: any) => {
        try {
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.credential })
          });
          const data = await res.json();
          if (data.token && data.user) {
            localStorage.setItem('mrdelivery_token', data.token);
            setUser(data.user);
          } else {
            alert(data.error || 'Eroare la autentificare');
          }
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

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx; };
