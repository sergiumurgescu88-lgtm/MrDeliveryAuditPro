import { useState, useEffect } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';

const GROWTH_PROMPT = `Plan complet de creștere pe 90 de zile pentru restaurant. Structură obligatorie:
1. Roadmap 90 Zile (Sprint-uri: Săptămânile 1-2 Quick Wins, 3-6 Core Improvements, 7-12 Growth Levers)
2. Matrice de Prioritizare (Impact vs Efort: Quick Wins, Proiecte Majore, Optimizări, Time Sinks)
3. KPI Dashboard (Baseline vs Target 90 zile: GBP impressions, review velocity, conversie website, engagement social, AOV, clienți recurenți)
4. Strategii de Scalare (loyalty, parteneriate locale, influenceri micro-locali, automatizări marketing)
5. Moonshot Idea (o strategie neconvențională cu potențial viral local)
Ton: growth strategist HORECA România, focus pe ROI, execuție rapidă și metrici clare. Limba: română.`;

export default function Module10_GrowthPlan({ selectedLocation }: { selectedLocation?: string }) {
  const [metrics, setMetrics] = useState({ baseline: '...', target: '...', priority: '...', moonshot: '...' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!selectedLocation) { setLoading(false); return; }
      try {
        const res = await fetch(`/api/places/details?query=${encodeURIComponent(selectedLocation)}`);
        const d = await res.json();
        const rating = d.rating || 3.5;
        const reviews = d.reviewCount || 0;
        const hasSite = !!d.website;

        const baseline = Math.round(reviews * 0.15);
        const target = Math.round(baseline * 1.4);
        const priority = Math.min(10, (rating > 4 ? 3 : 2) + (hasSite ? 2 : 1) + (reviews > 300 ? 3 : 2)).toFixed(1);
        const moonshot = rating >= 4.0 ? 'Ridicat (comunitate activă)' : 'Mediu (necesită activare)';

        setMetrics({ baseline: `${baseline}/lună`, target: `${target}/lună (+40%)`, priority: `${priority}/10`, moonshot });
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchData();
  }, [selectedLocation]);

  const parts = (selectedLocation || '').split(',');
  const restaurantData = { name: parts[0]?.trim() || 'Restaurant', address: parts.slice(1).join(',').trim() || '', rating: 4.0 };

  const cards = [
    { label: 'Clienți Activi (Baseline)', value: loading ? '🔄...' : metrics.baseline, sub: 'Estimare actuală', color: 'bg-slate-50 border-slate-200' },
    { label: 'Target 90 Zile', value: loading ? '🔄...' : metrics.target, sub: 'Creștere proiectată', color: 'bg-emerald-50 border-emerald-200' },
    { label: 'Prioritate Execuție', value: loading ? '🔄...' : metrics.priority, sub: 'Impact vs Efort', color: 'bg-blue-50 border-blue-200' },
    { label: 'Moonshot Potential', value: loading ? '🔄...' : metrics.moonshot, sub: 'Strategie virală locală', color: 'bg-violet-50 border-violet-200' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">10 Growth Plan</h1>
      <p className="text-slate-400 mb-6">Roadmap 90 zile, matrice de prioritizare, KPIs și strategii de scalare</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <div key={i} className={`p-4 rounded-xl border ${c.color}`}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-slate-800">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>
      <LiveModuleGenerator location={selectedLocation} title="Plan de Creștere 90 Zile" prompt={GROWTH_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
