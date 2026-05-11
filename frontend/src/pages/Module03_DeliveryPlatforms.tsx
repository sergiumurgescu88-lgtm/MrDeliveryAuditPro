import { useState } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData, getAOV, getRatingTarget } from '../hooks/usePlacesData';

const DELIVERY_PROMPT = `Generează o analiză strategică detaliată pentru optimizarea prezenței unui restaurant pe platformele de delivery (Glovo, Bolt Food, Wolt). Structură obligatorie:
1. Analiza Platformelor (comisioane tipice, vizibilitate în app, UX listing, review aggregation)
2. Adaptarea Meniului per Platformă (Glovo=viteză&freshness, Bolt=value&combos, Wolt=premium&experiență)
3. Matrice ROI & Comisioane (calcul estimativ: Avg Order Value × Conversion Rate × Margin % ÷ Commission %)
4. Strategii de Promovare & Retenție (promoții exclusive, first-order discount, loyalty loops, packaging branding)
5. Dynamic Pricing & Promo Engine (reguli automate bazate pe weather, traffic, ore de vârf)
6. Checklist Acționabil (prioritizat: Quick Wins / Medium / Long-term)
Ton: expert în food delivery & growth hacking, orientat spre profitabilitate și conversie. Limba: română. Format: clar, cu bullet points, tabele simple și secțiuni distincte.`;

const PLATFORMS = [
  { id: 'glovo', name: 'Glovo', color: 'bg-green-500', icon: '🟢' },
  { id: 'bolt', name: 'Bolt Food', color: 'bg-green-700', icon: '🟩' },
  { id: 'wolt', name: 'Wolt', color: 'bg-blue-500', icon: '🔵' },
  { id: 'general', name: 'Strategie Generală', color: 'bg-amber-500', icon: '📊' }
];

export default function Module03_DeliveryPlatforms({ selectedLocation }: { selectedLocation?: string }) {
  const [activePlatform, setActivePlatform] = useState('glovo');
  const { data: places, loading } = usePlacesData(selectedLocation);
  const parts = (selectedLocation || '').split(',');
  const restaurantData = { name: parts[0]?.trim() || 'Restaurant', address: parts.slice(1).join(',').trim() || selectedLocation || '', rating: places?.rating || 4.5 };

  const aov = getAOV(places?.priceLevel ?? null);
  const roiScore = places?.rating ? (places.rating * 1.8).toFixed(1) + '/10' : '7.4/10';
  const ratingTarget = getRatingTarget(places?.rating ?? null);

  const metrics = [
    { label: 'Comision Estimat', value: '25-30%', sub: 'Glovo/Bolt/Wolt standard RO' },
    { label: 'Avg Order Value', value: loading ? '...' : aov, sub: `Target: +15% → ${aov.split('-')[1] || aov}` },
    { label: 'Rating pe Maps', value: loading ? '...' : places?.rating ? `${places.rating} ⭐` : 'N/A', sub: `Target: ${ratingTarget}` },
    { label: 'ROI Score', value: loading ? '...' : roiScore, sub: 'Bazat pe rating & preț' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">03 Delivery Platforms</h1>
      <p className="text-slate-400 mb-6">Optimizare comisioane, conversie și strategii de creștere pe Glovo, Bolt & Wolt</p>
      <div className="flex flex-wrap gap-3 mb-6">
        {PLATFORMS.map(p => (
          <button key={p.id} onClick={() => setActivePlatform(p.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activePlatform === p.id ? `${p.color} text-white shadow-md` : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            <span>{p.icon}</span> {p.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-400 uppercase tracking-wide">{m.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{m.value}</p>
            <p className="text-xs text-amber-600 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>
      <LiveModuleGenerator location={selectedLocation}
        title={`Analiză Delivery: ${PLATFORMS.find(p => p.id === activePlatform)?.name}`}
        prompt={`${DELIVERY_PROMPT}\n\nFocus specific: ${activePlatform === 'general' ? 'Strategie integrată multi-platformă' : `Optimizare avansată pentru ${PLATFORMS.find(p => p.id === activePlatform)?.name}`}`}
        restaurantData={restaurantData}
      />
    </div>
  );
}
