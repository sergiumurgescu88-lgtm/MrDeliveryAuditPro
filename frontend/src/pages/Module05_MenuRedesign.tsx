import { useState, useEffect } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';

const MENU_PROMPT = `Audit complet de redesign meniu cu neuromarketing & profit engineering. Structură obligatorie:
1. Analiza structurii actuale (categorii, aglomerare vizuală, lipsă ierarhie, prețuri nepsihologice)
2. Transformare descrieri (Before → After) pentru 3 preparate cheie, folosind cuvinte senzoriale, storytelling și trigger-e de apetit
3. Matrice de Profitabilitate (Stars, Puzzles, Plowhorses, Dogs) cu recomandări de repoziționare
4. Psihologia prețurilor (ancorare, decoy, eliminare simbol valută, bundle-uri strategice)
5. Layout & UX Meniu (regula triunghiului de aur, spațiere, highlight preparate signature, QR code optimizat)
Ton: expert în menu engineering & neuromarketing HORECA, date acționabile, focus pe creșterea AOV și marjei. Limba: română.`;

export default function Module05_MenuRedesign({ selectedLocation }: { selectedLocation?: string }) {
  const [metrics, setMetrics] = useState({ neuro: '...', profit: '...', items: '...', aovBoost: '...' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenuData() {
      if (!selectedLocation) { setLoading(false); return; }
      try {
        const res = await fetch(`/api/places/details?query=${encodeURIComponent(selectedLocation)}`);
        const d = await res.json();
        const rating = d.rating || 3.5;
        const pl = d.priceLevel || 2;
        const neuroScore = Math.min(95, Math.round(60 + (rating - 3) * 15)).toString();
        const profitScore = Math.min(10, (pl * 2 + (rating > 4 ? 2 : 1))).toFixed(1);
        const estItems = pl >= 3 ? '45-60' : pl === 2 ? '30-45' : '20-35';
        const aovBoost = rating >= 4.0 ? '+18-22%' : '+12-15%';
        setMetrics({ neuro: `${neuroScore}/100`, profit: `${profitScore}/10`, items: estItems, aovBoost });
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchMenuData();
  }, [selectedLocation]);

  const parts = (selectedLocation || '').split(',');
  const restaurantData = { name: parts[0]?.trim() || 'Restaurant', address: parts.slice(1).join(',').trim() || '', rating: 4.0 };

  const cards = [
    { label: 'Neuromarketing Score', value: loading ? '🔄...' : metrics.neuro, sub: 'Target: 85+', color: 'bg-pink-50 border-pink-200' },
    { label: 'Profit Potential', value: loading ? '🔄...' : metrics.profit, sub: 'Bazat pe preț & rating', color: 'bg-emerald-50 border-emerald-200' },
    { label: 'Meniu Optim (nr. itemi)', value: loading ? '🔄...' : metrics.items, sub: 'Recomandat pentru conversie', color: 'bg-blue-50 border-blue-200' },
    { label: 'AOV Boost Estimativ', value: loading ? '🔄...' : metrics.aovBoost, sub: 'După redesign & bundling', color: 'bg-amber-50 border-amber-200' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">05 Menu Redesign</h1>
      <p className="text-slate-400 mb-6">Neuromarketing, profit engineering și descrieri care vând</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <div key={i} className={`p-4 rounded-xl border ${c.color}`}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-slate-800">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>
      <LiveModuleGenerator location={selectedLocation} title="Audit Meniu & Neuromarketing" prompt={MENU_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
