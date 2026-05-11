
import { motion } from 'framer-motion';
import { PDFDownloadButton } from '../components/PDFReport';

const STATS = [
  { label: 'Module Active', value: '10/10', icon: '🧩', color: 'text-emerald-600' },
  { label: 'AI Engine', value: 'OpenRouter', icon: '🤖', color: 'text-blue-600' },
  { label: 'Streaming', value: 'Live SSE', icon: '🌊', color: 'text-amber-600' },
  { label: 'Status Sistem', value: 'Online', icon: '✅', color: 'text-green-600' }
];

const ACTIONS = [
  { title: 'Start Audit Nou', desc: 'Caută un restaurant și generează raportul complet', icon: '🔍' },
  { title: 'Guest Mode', desc: 'Testează fără cont (2 audituri gratuite)', icon: '👤' },
  { title: 'Contactează Echipa', desc: 'Solicită implementare sau consultanță', icon: '💬' }
];

export default function Module00_Dashboard({ selectedLocation }: { selectedLocation?: string }) {
  const parts = (selectedLocation || '').split(','); const restaurant = { name: parts[0]?.trim() || 'Restaurant', address: parts.slice(1).join(',').trim() || selectedLocation || '', rating: 4.5 };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
        <h2 className="text-3xl font-bold mb-2 relative z-10 tracking-tight">Bine ai venit în <span className="text-amber-500">Restaurant Audit Pro</span></h2>
        <p className="text-slate-500 max-w-2xl mx-auto relative z-10">Platformă AI de audit digital pentru restaurante. Analizăm SEO, prezența pe Maps, delivery, meniu, social media și generăm un plan de creștere pe 90 de zile.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-5 flex items-center gap-4">
            <div className="text-2xl">{s.icon}</div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">{s.label}</p>
              <p className={`text-lg font-semibold ${s.color}`}>{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Restaurant Auditat</p>
          <h3 className="text-xl font-semibold">{restaurant.name}</h3>
          <p className="text-sm text-slate-500">{restaurant.address} • ⭐ {restaurant.rating}</p>
        </div>
        <PDFDownloadButton restaurantName={restaurant.name} address={restaurant.address} rating={String(restaurant.rating)} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ACTIONS.map((a, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }} className="glass-card p-5 cursor-pointer group">
            <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">{a.icon}</div>
            <h4 className="font-medium text-slate-800">{a.title}</h4>
            <p className="text-xs text-slate-500 mt-1">{a.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6 text-sm text-slate-500 space-y-2">
        <h4 className="text-slate-700 font-medium mb-2">🛠️ Detalii Tehnice</h4>
        <p>• Frontend: React 18 + Vite 8 + TypeScript + Tailwind v4</p>
        <p>• AI Engine: OpenRouter (Gemini 2.0 Flash) • Streaming SSE cu pacing 5s/10s</p>
        <p>• Backend: Node.js + Express • PM2 • Nginx Reverse Proxy + SSL</p>
        <p>• Hosting: VPS Ubuntu 24.04 • Domeniu: mrdelivery.online</p>
      </motion.div>
    </div>
  );
}
