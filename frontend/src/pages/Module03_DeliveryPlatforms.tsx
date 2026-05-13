import { useState, useEffect } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData, getAOV } from '../hooks/usePlacesData';

const DELIVERY_PROMPT = `Ești un consultant delivery senior specializat în HORECA România. Analizează EXCLUSIV datele reale din JSON.

REGULI OBLIGATORII:
- Nu rupe cuvintele în mijloc, nu adăuga spații extra în cuvinte sau URL-uri
- Câmpul "deliveryPresence" arată prezența REALĂ pe platforme (true/false) — citează-l explicit
- Format: titluri cu ###, bullet points cu ▸
- Maxim 500 cuvinte total

### 1. Prezență pe Platforme
Analizează deliveryPresence din JSON. Pentru fiecare platformă (Glovo, Bolt, Wolt):
- Dacă true: ✅ prezent — recomandări de optimizare profil
- Dacă false: ❌ absent — impact estimat și pași de înregistrare

### 2. Comisioane & Negociere
Comisioane tipice România (20-35%). Strategii de negociere bazate pe rating-ul real și volumul de recenzii din date.

### 3. Optimizare AOV & Coș Mediu
Bazat pe priceLevel și tipul de restaurant din date. Bundle-uri, upselling, prag livrare gratuită.

### 4. Funnel de Conversie
Optimizare profil pe platforme: foto, descrieri, categorii, răspuns recenzii negative (citează recenziile reale din recentReviews dacă există).

### 5. Plan de Creștere 30 Zile
🔴 Săptămâna 1-2: Quick Wins | 🟡 Săptămâna 3-4: Fundație
KPIs: target comenzi/lună, AOV target, rating target pe platforme.

Limba: română.`;

interface DeliveryPresence {
  glovo: boolean;
  bolt: boolean | null;
  wolt: boolean;
}

export default function Module03_DeliveryPlatforms({ selectedLocation }: { selectedLocation?: string }) {
  const { data: placesData, loading } = usePlacesData(selectedLocation);
  const [delivery, setDelivery] = useState<DeliveryPresence | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  useEffect(() => {
    if (!placesData?.name) return;
    setDeliveryLoading(true);
    const name = encodeURIComponent(placesData.name);
    fetch(`/api/delivery/check?name=${encodeURIComponent(name)}&lat=${placesData.lat ?? ''}&lon=${placesData.lng ?? ''}`)
      .then(r => r.json())
      .then(d => { setDelivery(d); setDeliveryLoading(false); })
      .catch(() => setDeliveryLoading(false));
  }, [placesData]);

  const rating = placesData?.rating || 3.5;
  const reviews = placesData?.reviewCount || 0;
  const aov = getAOV(placesData?.priceLevel || null);
  const conv = Math.min(6, Math.max(2, 2.5 + (rating - 3.5) * 0.6)).toFixed(1) + '%';
  const platformCount = delivery ? [delivery.glovo, delivery.bolt, delivery.wolt].filter(Boolean).length : null;

  const platformCard = deliveryLoading
    ? '🔄 Se verifică...'
    : delivery
      ? `${platformCount}/3 platforme`
      : '—';
  const platformColor = platformCount === 3
    ? 'bg-emerald-50 border-emerald-200'
    : platformCount && platformCount > 0
      ? 'bg-amber-50 border-amber-200'
      : 'bg-red-50 border-red-200';

  const cards = [
    { label: 'Prezență Platforme', value: platformCard,
      sub: delivery ? `Glovo:${delivery.glovo?'✅':'❌'} Bolt:${delivery.bolt===null?'❓':''+( delivery.bolt?'✅':'❌')} Wolt:${delivery.wolt?'✅':'❌'}` : 'Glovo · Bolt · Wolt',
      color: platformColor },
    { label: 'Avg Order Value', value: loading ? '...' : aov, sub: 'Target: +15%', color: 'bg-blue-50 border-blue-200' },
    { label: 'Conversion Rate', value: loading ? '...' : conv, sub: 'Industry avg: 2.8%', color: 'bg-amber-50 border-amber-200' },
    { label: 'Comision Estimat', value: '25-30%', sub: 'Negociabil cu volum', color: 'bg-violet-50 border-violet-200' },
  ];

  const restaurantData = {
    name: placesData?.name || selectedLocation?.split(',')[0]?.trim() || 'Restaurant',
    address: placesData?.address || '',
    rating,
    reviewCount: reviews,
    priceLevel: placesData?.priceLevel || null,
    website: placesData?.website || null,
    types: placesData?.types || [],
    recentReviews: placesData?.recentReviews || [],
    deliveryPresence: delivery || { glovo: false, bolt: false, wolt: false },
    aov,
    conversionRate: conv,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">03 Delivery Platforms</h1>
      <p className="text-slate-400 mb-6">Optimizare comisioane, conversie și strategii de creștere pe Glovo, Bolt & Wolt</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <div key={i} className={`p-4 rounded-xl border ${c.color}`}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-slate-800">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>
      <LiveModuleGenerator
        location={selectedLocation}
        title="Analiză Delivery: Glovo/Bolt/Wolt"
        prompt={DELIVERY_PROMPT}
        restaurantData={restaurantData}
      />
    </div>
  );
}
