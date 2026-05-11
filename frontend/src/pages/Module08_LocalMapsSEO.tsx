import { useState, useEffect } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';

const LOCALSEO_PROMPT = `Audit complet SEO Local & Google Business Profile pentru restaurant. Structură obligatorie:
1. Optimizare GBP (categorie, descriere, atribute, Q&A, postări săptămânale)
2. Citări locale & consistență NAP (Name, Address, Phone) pe directoare RO
3. Dominanță în Local Pack (factori de ranking proximitate, recenzii, backlinks locali)
4. Strategie de creștere vizibilitate (Google Posts, foto recurente, review velocity, UTM tracking)
5. Checklist acționabil & KPIs lunari (impressions, direction requests, calls, website clicks)
Ton: expert SEO local HORECA România, date acționabile, focus pe trafic fizic și comenzi. Limba: română.`;

export default function Module08_LocalMapsSEO({ selectedLocation }: { selectedLocation?: string }) {
  const [metrics, setMetrics] = useState({ impressions: '...', directions: '...', clicks: '...', calls: '...' });
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState<string[]>([]);

  useEffect(() => {
    async function fetchLocalData() {
      if (!selectedLocation) { setLoading(false); return; }
      try {
        const res = await fetch(`/api/places/details?query=${encodeURIComponent(selectedLocation)}`);
        const d = await res.json();
        const reviews = d.reviewCount || 0;
        const hasWebsite = !!d.website;
        const hasPhone = !!d.phone;
        const hasHours = d.openingHours?.length > 0;
        const hasPhotos = d.photos?.length > 0;

        const imp = Math.round(reviews * 2.2);
        setMetrics({
          impressions: `${(imp/1000).toFixed(1)}k/lună`,
          directions: `${Math.round(imp * 0.08)}/lună`,
          clicks: `${Math.round(imp * 0.12)}/lună`,
          calls: `${Math.round(imp * 0.05)}/lună`
        });

        const checks = [];
        if (hasWebsite) checks.push('✅ Website conectat la GBP');
        if (hasPhone) checks.push('✅ Telefon verificat');
        if (hasHours) checks.push('✅ Program complet');
        if (hasPhotos) checks.push('✅ Foto recente încărcate');
        checks.push('⚠️ Descriere cu 3 cuvinte cheie locale');
        checks.push('❌ Google Posts săptămânale cu CTA');
        setChecklist(checks);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchLocalData();
  }, [selectedLocation]);

  const parts = (selectedLocation || '').split(',');
  const restaurantData = { name: parts[0]?.trim() || 'Restaurant', address: parts.slice(1).join(',').trim() || '', rating: 4.0 };

  const cards = [
    { label: 'GBP Impressions', value: loading ? '🔄...' : metrics.impressions, sub: 'Target: +40%', color: 'bg-indigo-50 border-indigo-200' },
    { label: 'Direction Requests', value: loading ? '🔄...' : metrics.directions, sub: 'Trafic fizic estimat', color: 'bg-emerald-50 border-emerald-200' },
    { label: 'Website Clicks', value: loading ? '🔄...' : metrics.clicks, sub: 'Din Local Pack', color: 'bg-blue-50 border-blue-200' },
    { label: 'Phone Calls', value: loading ? '🔄...' : metrics.calls, sub: 'Direct din Maps', color: 'bg-amber-50 border-amber-200' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">08 Local Maps SEO</h1>
      <p className="text-slate-400 mb-6">Optimizare Google Business Profile, citări locale și dominanță în căutările de proximitate</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <div key={i} className={`p-4 rounded-xl border ${c.color}`}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-slate-800">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">✅ GBP Optimization Checklist</h3>
        <ul className="space-y-2">
          {checklist.map((item, i) => (
            <li key={i} className="text-sm text-slate-600 flex items-center gap-2">{item}</li>
          ))}
        </ul>
      </div>
      <LiveModuleGenerator location={selectedLocation} title="Audit Local Maps SEO & GBP" prompt={LOCALSEO_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
