import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveLead } from '../lib/dataLogger';

interface Props { isOpen: boolean; onClose: () => void; restaurantName?: string; }

export default function GuestLimitModal({ isOpen, onClose, restaurantName = 'Restaurantul Tău' }: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 🔁 Resetăm complet starea când modalul se închide
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setEmail('');
        setSubmitted(false);
        setLoading(false);
        setStatus('idle');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setLoading(true);
    setStatus('idle');

    try {
      // 1. Salvăm lead-ul în Supabase
      await saveLead(email, 'Guest Limit Modal');
      // 2. Încercăm trimiterea email-ului
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, restaurantName })
      });

      if (!res.ok) throw new Error('Email API failed');
      setStatus('success');
      setSubmitted(true);
      setTimeout(onClose, 2500);
    } catch (err) {
      console.warn('⚠️ Lead salvat, dar email-ul a eșuat:', err);
      setStatus('error');
      setSubmitted(true);
      setTimeout(onClose, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="glass-card w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">✕</button>
            {!submitted ? (
              <>
                <div className="text-3xl mb-3">🔐</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Limită Guest Mode Atinsă</h3>
                <p className="text-sm text-slate-500 mb-4">Ai folosit auditurile gratuite. Pentru acces nelimitat și raport PDF complet, lasă-ne email-ul tău.</p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@restaurant.ro" required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition" />
                  <button type="submit" disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-400 transition shadow-md shadow-amber-500/20 disabled:opacity-50">
                    {loading ? '⏳ Se procesează...' : '🚀 Deblochează & Primește Raport'}
                  </button>
                </form>
                <p className="text-xs text-slate-400 mt-3 text-center">Fără spam. Verifică și folderul Spam/Promotions.</p>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">{status === 'success' ? '✅' : '⚠️'}</div>
                <h3 className="text-lg font-bold text-slate-800">{status === 'success' ? 'Mulțumim!' : 'Email netrimis'}</h3>
                <p className="text-sm text-slate-500">
                  {status === 'success'
                    ? `Am trimis detaliile pe ${email}. Verifică inbox-ul (și spam).`
                    : 'Lead-ul a fost salvat în baza de date. Te vom contacta manual.'}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
