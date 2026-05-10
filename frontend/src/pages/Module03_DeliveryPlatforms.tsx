import { useState } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';

const DELIVERY_PROMPT = `Generează o analiză strategică detaliată pentru optimizarea prezenței unui restaurant pe platformele de delivery (Glovo, Bolt Food, Tazz). Structură obligatorie:
1. Analiza Platformelor (comisioane tipice, vizibilitate în app, UX listing, review aggregation)
2. Adaptarea Meniului per Platformă (cum să modifici descrierile, pozele și porțiile: Glovo=viteză&freshness, Bolt=value&combos, Tazz=local&tradițional)
3. Matrice ROI & Comisioane (calcul estimativ: Avg Order Value × Conversion Rate × Margin % ÷ Commission %)
4. Strategii de Promovare & Retenție (promoții exclusive, first-order discount, loyalty loops, packaging branding)
5. Dynamic Pricing & Promo Engine (reguli automate bazate pe weather, traffic, competitor stock, ore de vârf)
6. Checklist Acționabil (prioritizat: Quick Wins / Medium / Long-term)
Ton: expert în food delivery & growth hacking, orientat spre profitabilitate și conversie. Limba: română. Format: clar, cu bullet points, tabele simple și secțiuni distincte.`;

const PLATFORMS = [
  { id: 'glovo', name: 'Glovo', color: 'bg-green-500', icon: '🟢' },
  { id: 'bolt', name: 'Bolt Food', color: 'bg-green-700', icon: '🟩' },
  { id: 'tazz', name: 'Tazz', color: 'bg-red-500', icon: '🔴' },
  { id: 'general', name: 'Strategie Generală', color: 'bg-amber-500', icon: '📊' }
];

export default function Module03_DeliveryPlatforms() {
  const [activePlatform, setActivePlatform] = useState('glovo');
  const restaurantData = { name: 'Dum-Dum Food', address: 'Calea Giulești 123, București', rating: 4.1 };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">03 Delivery Platforms</h1>
      <p className="text-slate-400 mb-6">Optimizare comisioane, conversie și strategii de creștere pe Glovo, Bolt & Tazz</p>
      <div className="flex flex-wrap gap-3 mb-6">
        {PLATFORMS.map(p => (
          <button key={p.id} onClick={() => setActivePlatform(p.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activePlatform === p.id ? `${p.color} text-white shadow-md` : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            <span>{p.icon}</span> {p.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[{label:'Comision Estimat',value:'25-30%',sub:'Variabil per platformă'},{label:'Avg Order Value',value:'45-65 RON',sub:'Target: +15%'},{label:'Conversion Rate',value:'3.2%',sub:'Industry avg: 2.8%'},{label:'ROI Score',value:'7.4/10',sub:'Bazat pe marjă & volum'}].map((m,i)=>(
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-400 uppercase tracking-wide">{m.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{m.value}</p>
            <p className="text-xs text-amber-600 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>
      <LiveModuleGenerator
        title={`Analiză Delivery: ${PLATFORMS.find(p => p.id === activePlatform)?.name}`}
        prompt={`${DELIVERY_PROMPT}\n\nFocus specific: ${activePlatform === 'general' ? 'Strategie integrată multi-platformă' : `Optimizare avansată pentru ${PLATFORMS.find(p => p.id === activePlatform)?.name}`}`}
        restaurantData={restaurantData}
      />
    </div>
  );
}
