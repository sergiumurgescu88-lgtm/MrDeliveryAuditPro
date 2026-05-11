import { useState, useEffect } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';

const DELIVERY_PROMPT = `Analiză completă delivery pentru restaurant. Structură obligatorie:
1. Comisioane Glovo/Bolt/Tazz & negociere
2. AOV real vs target, optimizare coș mediu
3. Rata de conversie pe platforme & funnel optimizat
4. ROI estimat & prag de rentabilitate
5. Strategie de creștere (promoții, bundle-uri, loyalty, timing)
Ton: consultant delivery România, date acționabile, focus pe profitabilitate. Limba: română.`;

export default function Module03_DeliveryPlatforms({ selectedLocation }: { selectedLocation?: string }) {
  const [metrics, setMetrics] = useState({ aov: '50-70 RON', conv: '2.8%', roi: '6.5/10', commission: '25-30%' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      if (!selectedLocation) { setLoading(false); return; }
      try {
        const res = await fetch(`/api/places/details?query=${encodeURIComponent(selectedLocation)}`);
        const d = await res.json();
        const rating = d.rating || 3.5;
        const reviews = d.reviewCount || 0;
        const pl = d.priceLevel;
        const aovMap: Record<number, string> = { 1: '35-45 RON', 2: '45-65 RON', 3: '70-90 RON', 4: '95+ RON' };
        const aov = pl ? aovMap[pl] : '50-70 RON';
        const conv = Math.min(6, Math.max(2, 2.5 + (rating - 3.5) * 0.6)).toFixed(1) + '%';
        const roi = Math.min(10, 5 + (rating / 5) * 2.5 + (reviews > 300 ? 1 : 0)).toFixed(1) + '/10';
        setMetrics({ aov, conv, roi, commission: '25-30%' });
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchMetrics();
  }, [selectedLocation]);

  const parts = (selectedLocation || '').split(',');
  const restaurantData = { name: parts[0]?.trim() || 'Restaurant', address: parts.slice(1).join(',').trim() || '', rating: 4.0 };

  const cards = [
    { label: 'Comision Estimat', value: metrics.commission, sub: 'Variabil per platformă', color: 'bg-emerald-50 border-emerald-200' },
    { label: 'Avg Order Value', value: loading ? '...' : metrics.aov, sub: 'Target: +15%', color: 'bg-blue-50 border-blue-200' },
    { label: 'Conversion Rate', value: loading ? '...' : metrics.conv, sub: `Industry avg: 2.8%`, color: 'bg-amber-50 border-amber-200' },
    { label: 'ROI Score', value: loading ? '...' : metrics.roi, sub: 'Bazat pe rating & volum', color: 'bg-violet-50 border-violet-200' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">03 Delivery Platforms</h1>
      <p className="text-slate-400 mb-6">Optimizare comisioane, conversie și strategii de creștere pe Glovo, Bolt & Tazz</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <div key={i} className={`p-4 rounded-xl border ${c.color}`}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-slate-800">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>
      <LiveModuleGenerator location={selectedLocation} title="Analiză Delivery: Glovo/Bolt/Tazz" prompt={DELIVERY_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
