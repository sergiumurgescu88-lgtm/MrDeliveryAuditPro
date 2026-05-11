import { useState, useEffect } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';

const PHOTO_PROMPT = `Audit complet de identitate vizuală și strategie foto pentru restaurant. Structură obligatorie:
1. Paletă cromatică & mood vizual (culori brand, temperatură lumină, stil recomandat)
2. Shot list prioritar (8 cadre esențiale: hero dish, interior, echipă, proces, macro, exterior, packaging, UGC)
3. Reguli de consistență vizuală (balans de alb, iluminare, fundaluri, crop, saturație)
4. Strategie de conținut foto recurent (calendar lunar, surse UGC, drepturi de autor, storage)
5. Impact asupra conversiei & SEO vizual (cum influențează pozele CTR-ul în Maps, delivery apps și website)
Ton: director de creație & fotograf culinar HORECA, focus pe percepție premium și consistență brand. Limba: română.`;

export default function Module09_PhotoRedesign({ selectedLocation }: { selectedLocation?: string }) {
  const [metrics, setMetrics] = useState({ consistency: '...', shots: '...', ugc: '...', impact: '...' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPhotoData() {
      if (!selectedLocation) { setLoading(false); return; }
      try {
        const res = await fetch(`/api/places/details?query=${encodeURIComponent(selectedLocation)}`);
        const d = await res.json();
        const rating = d.rating || 3.5;
        const reviews = d.reviewCount || 0;
        const photoCount = d.photos?.length || 0;
        
        const consistency = Math.min(95, Math.round(50 + (rating - 3) * 20 + (photoCount > 3 ? 10 : 0))).toString();
        const shots = rating >= 4.0 ? '8 cadre critice' : '5 cadre esențiale';
        const ugc = reviews > 400 ? 'Ridicat (clienți activi)' : 'Mediu (necesită stimulare)';
        const impact = rating >= 4.0 ? '+25% CTR estimat' : '+15% CTR estimat';
        
        setMetrics({ consistency: `${consistency}/100`, shots, ugc, impact });
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchPhotoData();
  }, [selectedLocation]);

  const parts = (selectedLocation || '').split(',');
  const restaurantData = { name: parts[0]?.trim() || 'Restaurant', address: parts.slice(1).join(',').trim() || '', rating: 4.0 };

  const cards = [
    { label: 'Consistență Vizuală', value: loading ? '🔄...' : metrics.consistency, sub: 'Target: 85+', color: 'bg-rose-50 border-rose-200' },
    { label: 'Shot List Prioritar', value: loading ? '🔄...' : metrics.shots, sub: 'Cadre esențiale', color: 'bg-slate-50 border-slate-200' },
    { label: 'UGC Potential', value: loading ? '🔄...' : metrics.ugc, sub: 'Bazat pe recenzii', color: 'bg-indigo-50 border-indigo-200' },
    { label: 'Impact Conversie', value: loading ? '🔄...' : metrics.impact, sub: 'După implementare', color: 'bg-amber-50 border-amber-200' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">09 Photo Redesign</h1>
      <p className="text-slate-400 mb-6">Identitate vizuală, shot list profesional și reguli de consistență foto</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <div key={i} className={`p-4 rounded-xl border ${c.color}`}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-slate-800">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>
      <LiveModuleGenerator location={selectedLocation} title="Audit Identitate Vizuală & Foto" prompt={PHOTO_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
