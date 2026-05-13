import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData, getAOV } from '../hooks/usePlacesData';

const DELIVERY_PROMPT = `Analiză completă delivery pentru restaurant. Structură obligatorie:
1. Comisioane Glovo/Bolt/Tazz & negociere
2. AOV real vs target, optimizare coș mediu
3. Rata de conversie pe platforme & funnel optimizat
4. ROI estimat & prag de rentabilitate
5. Strategie de creștere (promoții, bundle-uri, loyalty, timing)
Ton: consultant delivery România, date acționabile, focus pe profitabilitate. Limba: română.`;

export default function Module03_DeliveryPlatforms({ selectedLocation }: { selectedLocation?: string }) {
  const { data: placesData, loading } = usePlacesData(selectedLocation);
  const rating = placesData?.rating || 3.5;
  const reviews = placesData?.reviewCount || 0;
  const aov = getAOV(placesData?.priceLevel || null);
  const conv = Math.min(6, Math.max(2, 2.5 + (rating - 3.5) * 0.6)).toFixed(1) + '%';
  const roi = Math.min(10, 5 + (rating / 5) * 2.5 + (reviews > 300 ? 1 : 0)).toFixed(1) + '/10';

  const restaurantData = {
    name: placesData?.name || selectedLocation?.split(',')[0]?.trim() || 'Restaurant',
    address: placesData?.address || '',
    rating, reviewCount: reviews,
    priceLevel: placesData?.priceLevel || null,
    website: placesData?.website || null,
    types: placesData?.types || [],
  };

  const cards = [
    { label: 'Comision Estimat', value: '25-30%', sub: 'Variabil per platformă', color: 'bg-emerald-50 border-emerald-200' },
    { label: 'Avg Order Value', value: loading ? '...' : aov, sub: 'Target: +15%', color: 'bg-blue-50 border-blue-200' },
    { label: 'Conversion Rate', value: loading ? '...' : conv, sub: 'Industry avg: 2.8%', color: 'bg-amber-50 border-amber-200' },
    { label: 'ROI Score', value: loading ? '...' : roi, sub: 'Bazat pe rating & volum', color: 'bg-violet-50 border-violet-200' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">03 Delivery Platforms</h1>
      <p className="text-slate-400 mb-6">Optimizare comisioane, conversie și strategii de creștere pe Glovo, Bolt & Tazz</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <div key={i} className={"p-4 rounded-xl border " + c.color}>
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
