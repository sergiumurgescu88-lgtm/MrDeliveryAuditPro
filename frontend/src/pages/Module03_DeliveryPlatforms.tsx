import { useState, useEffect } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData, getAOV } from '../hooks/usePlacesData';

const buildDeliveryPrompt = (rd: any): string => {
  const platforms = rd.delivery || { glovo: false, bolt: false, wolt: false };
  const present = [platforms.glovo && "Glovo", platforms.bolt && "Bolt", platforms.wolt && "Wolt"].filter(Boolean);
  const absent = [!platforms.glovo && "Glovo", !platforms.bolt && "Bolt", !platforms.wolt && "Wolt"].filter(Boolean);
  
  const sampleReview = (rd.recentReviews?.[0]?.text || "").slice(0, 120);
  
  return `Ești consultant delivery HORECA România. Analizează EXCLUSIV datele reale.

REGULI ABSOLUTE (încalcă-le = output invalid):
1. NU rupe cuvinte: "Iată", "de înaltă", "aspecte", "înseamnă", "documente", "Optimizare", "rezoluție", "chedar", "recenzii", "Ajustare", "Lansare", "${rd.name}"
2. Fără spații în numere/orare: "02:00", "40-70 RON", "4.6⭐"
3. NU cita chei JSON ("deliveryPresence", "photos") — folosește limbaj natural
4. Citează date: rating ${rd.rating}⭐, ${rd.reviewCount} recenzii, ${present.length}/3 platforme prezente
5. MAXIM 550 cuvinte. Fii concis, acționabil.
6. Recomandări SPECIFICE pentru ${rd.address} — nu generice

CONTEXT INJECTAT:
• ${rd.name} | ${rd.address}
• Rating: ${rd.rating}⭐ (${rd.reviewCount} recenzii) | Recenzie recentă: "${sampleReview}..."
• Platforme: ✅ ${present.join(', ') || 'Niciuna'} | ❌ ${absent.join(', ') || 'Niciuna'}
• AOV estimat: 40-70 RON | Conversie: ~3.2%

STRUCTURĂ OBLIGATORIE:
### 1. Prezență Platforme
▸ ✅ Prezente: [listează + 1 acțiune de optimizare per platformă]
▸ ❌ Absente: [listează + impact estimat în Tunari/Ilfov]

### 2. Comisioane & Negociere
▸ Strategie bazată pe rating ${rd.rating}⭐ și volum recenzii
▸ 1 propoziție de negociere concretă per platformă absentă

### 3. Optimizare AOV & Coș Mediu
▸ 2 bundle-uri specifice preparatelor din recenzii (ex: burger angus + cartofi + sos)
▸ 1 prag livrare gratuită adaptat zonei Tunari

### 4. Funnel Conversie (pe platforme)
▸ Foto: [ce tip de cadre din cele ${rd.photoCount || 0} existente]
▸ Descrieri: [cum transformi recenziile în copy care vinde]
▸ Categorii: [structură meniu intuitivă pentru fast-casual]

### 5. Plan 30 Zile (acțiuni concrete)
🔴 Săptămâna 1-2: [2 quick wins cu owner clar]
🟡 Săptămâna 3-4: [1 acțiune fundație + 1 KPI de monitorizat]

Limba: română. Format: ### titluri, ▸ bullets. Fără JSON keys.`;
};

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
        prompt={buildDeliveryPrompt(restaurantData)}
        restaurantData={restaurantData}
      />
    </div>
  );
}
