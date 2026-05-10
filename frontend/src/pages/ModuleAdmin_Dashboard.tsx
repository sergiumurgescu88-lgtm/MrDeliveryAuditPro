import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getLeads, getAuditLogs, exportToCSV, type Lead, type AuditLog } from '../lib/dataLogger';

const ADMIN_PASSWORD = 'mrdelivery2024';

export default function ModuleAdmin_Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        setLoading(true);
        const [l, a] = await Promise.all([getLeads(), getAuditLogs()]);
        setLeads(l);
        setAudits(a);
        setLoading(false);
      };
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) { setIsAuthenticated(true); setError(''); }
    else setError('Parolă incorectă');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 w-full max-w-sm text-center">
          <div className="text-3xl mb-4">🔐</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Acces Admin</h2>
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Parola admin"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition" />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-400 transition shadow-md shadow-amber-500/20">🔓 Deblochează</button>
          </form>
        </motion.div>
      </div>
    );
  }

  const successAudits = audits.filter(a => a.status === 'success').length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">📊 Admin Dashboard (Supabase)</h2>
          <p className="text-sm text-slate-500">Date persistente în cloud • Export CSV disponibil</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => exportToCSV(leads, 'Leads')} className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20">📥 Export Leads</button>
          <button onClick={() => exportToCSV(audits, 'Audituri')} className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-400 transition shadow-md shadow-blue-500/20">📥 Export Audituri</button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Lead-uri Capturate', value: leads.length, icon: '📩', color: 'text-emerald-600' },
          { label: 'Audituri Generate', value: successAudits, icon: '🤖', color: 'text-blue-600' },
          { label: 'Rată Succes', value: audits.length ? `${Math.round((successAudits / audits.length) * 100)}%` : '0%', icon: '📈', color: 'text-amber-600' },
          { label: 'Ultima Activitate', value: audits[0] ? new Date(audits[0].created_at).toLocaleDateString('ro-RO') : '-', icon: '⏱️', color: 'text-slate-600' }
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-5 flex items-center gap-4">
            <div className="text-2xl">{s.icon}</div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">{s.label}</p>
              <p className={`text-lg font-semibold ${s.color}`}>{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">⏳ Se încarcă datele din cloud...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">📩 Lead-uri Recente</h3>
            <div className="overflow-x-auto max-h-64 overflow-y-auto pr-2">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 uppercase text-xs sticky top-0">
                  <tr><th className="px-3 py-2 rounded-l-lg">Email</th><th className="px-3 py-2">Sursă</th><th className="px-3 py-2 rounded-r-lg">Data</th></tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? <tr><td colSpan={3} className="px-3 py-4 text-center text-slate-400">Niciun lead capturat.</td></tr> :
                  leads.map((l, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition">
                      <td className="px-3 py-2 font-medium text-slate-800">{l.email}</td>
                      <td className="px-3 py-2 text-slate-500">{l.source}</td>
                      <td className="px-3 py-2 text-slate-400 text-xs">{new Date(l.created_at).toLocaleString('ro-RO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">🤖 Istoric Audituri</h3>
            <div className="overflow-x-auto max-h-64 overflow-y-auto pr-2">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 uppercase text-xs sticky top-0">
                  <tr><th className="px-3 py-2 rounded-l-lg">Restaurant</th><th className="px-3 py-2">Modul</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 rounded-r-lg">Data</th></tr>
                </thead>
                <tbody>
                  {audits.length === 0 ? <tr><td colSpan={4} className="px-3 py-4 text-center text-slate-400">Niciun audit generat.</td></tr> :
                  audits.map((a, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition">
                      <td className="px-3 py-2 font-medium text-slate-800">{a.restaurant_name}</td>
                      <td className="px-3 py-2 text-slate-500">{a.module}</td>
                      <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{a.status}</span></td>
                      <td className="px-3 py-2 text-slate-400 text-xs">{new Date(a.created_at).toLocaleString('ro-RO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
