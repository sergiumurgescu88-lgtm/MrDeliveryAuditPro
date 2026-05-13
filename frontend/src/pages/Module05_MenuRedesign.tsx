import { useEffect, useState } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData } from '../hooks/usePlacesData';

const buildMenuPrompt = (rd: any): string => {
  const dishesList = rd.menuDishes && rd.menuDishes.length > 0
    ? rd.menuDishes.slice(0, 10).map((d: any) => `- ${d.name} (×${d.mentions}, ${d.sentiment})`).join("\n")
    : "Date indisponibile din recenzii";
  const topDishLine = rd.topDish ? `Preparatul star menționat cel mai des: **${rd.topDish}**` : "";
  const summaryLine = rd.dishesSummary ? `Rezumat recenzii: "${rd.dishesSummary}"` : "";
  const priceLine = rd.priceLevel ? `Nivel de prețuri: ${"$".repeat(rd.priceLevel)} (${rd.priceLevel}/4)` : "";

  return `Ești expert în menu engineering & neuromarketing HORECA. Realizează un audit complet pentru restaurantul **${rd.name}** (rating Google: ${rd.rating}/5, ${rd.reviewCount || "?"} recenzii).

DATE REALE RESTAURANT:
${priceLine}
${topDishLine}
${summaryLine}
Preparate menționate în recenzii:
${dishesList}

STRUCTURĂ OBLIGATORIE:

### 1. Analiza structurii actuale
Bazat pe tipul localului (rating ${rd.rating}, preț ${rd.priceLevel}/4), identifică probleme reale: aglomerare categorii, lipsă ierarhie vizuală, prețuri nepsihologice.

### 2. Transformare descrieri (Before → After)
Alege 3 preparate din lista de mai sus (prioritizează ${rd.topDish || "preparatele star"}) și rescrie descrierile cu cuvinte senzoriale și storytelling. Format:
▸ **[Preparat]** — Before: descriere plată → After: descriere cu trigger apetit

### 3. Matrice Profitabilitate
Clasifică preparatele găsite în: Stars ⭐, Puzzles ❓, Plowhorses 🐎, Dogs 🐕. Recomandări concrete de repoziționare sau eliminare.

### 4. Psihologia prețurilor
Strategii specifice: ancorare, decoy pricing, eliminare simbol RON, bundle-uri recomandate pentru ${rd.name}.

### 5. Layout & UX Meniu
Regula triunghiului de aur aplicată la meniul acestui restaurant. Highlight preparate signature. Recomandare QR code dinamic.

REGULI OBLIGATORII:
- Citează ÎNTOTDEAUNA datele reale (rating ${rd.rating}, preparatele găsite, topDish)
- Nu rupe cuvintele în mijloc
- Nu adăuga spații în interiorul cuvintelor sau URL-urilor
- Maxim 600 cuvinte total
- Limba: română`;
};

interface Dish {
  name: string;
  mentions: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  quotes?: string[];
}

interface DishesData {
  dishes: Dish[];
  topDish: string | null;
  summary: string | null;
  reviewsAnalyzed: number;
}

export default function Module05_MenuRedesign({ selectedLocation }: { selectedLocation?: string }) {
  const { data: placesData, loading } = usePlacesData(selectedLocation);
  const [dishesData, setDishesData] = useState<DishesData | null>(null);
  const [dishesLoading, setDishesLoading] = useState(false);

  const rating = placesData?.rating || 3.5;
  const pl = placesData?.priceLevel || 2;
  const neuroScore = Math.min(95, Math.round(60 + (rating - 3) * 15));
  const profitScore = Math.min(10, pl * 2 + (rating > 4 ? 2 : 1)).toFixed(1);
  const estItems = pl >= 3 ? '45-60' : pl === 2 ? '30-45' : '20-35';
  const aovBoost = rating >= 4.0 ? '+18-22%' : '+12-15%';

  useEffect(() => {
    const placeId = placesData?.placeId;
    if (!placeId || dishesData) return;
    setDishesLoading(true);
    const name = encodeURIComponent(placesData?.name || selectedLocation?.split(',')[0]?.trim() || '');
    fetch(`/api/menu/dishes?placeId=${placeId}&restaurantName=${name}`)
      .then(r => r.json())
      .then(d => setDishesData(d))
      .catch(() => setDishesData(null))
      .finally(() => setDishesLoading(false));
  }, [placesData?.placeId]);

  const sentimentColor = (s: string) =>
    s === 'positive' ? 'bg-emerald-100 text-emerald-700' :
    s === 'negative' ? 'bg-red-100 text-red-700' :
    'bg-slate-100 text-slate-600';

  const restaurantData = {
    name: placesData?.name || selectedLocation?.split(',')[0]?.trim() || 'Restaurant',
    address: placesData?.address || '',
    rating, reviewCount: placesData?.reviewCount || null,
    priceLevel: pl, website: placesData?.website || null,
    types: placesData?.types || [],
    openingHours: placesData?.openingHours || [],
    menuDishes: dishesData?.dishes || [],
    topDish: dishesData?.topDish || null,
    dishesSummary: dishesData?.summary || null,
  };

  const cards = [
    { label: 'Neuromarketing Score', value: loading ? '...' : neuroScore + '/100', sub: 'Target: 85+', color: 'bg-pink-50 border-pink-200' },
    { label: 'Profit Potential', value: loading ? '...' : profitScore + '/10', sub: 'Bazat pe preț & rating', color: 'bg-emerald-50 border-emerald-200' },
    { label: 'Meniu Optim (nr. itemi)', value: loading ? '...' : estItems, sub: 'Recomandat pentru conversie', color: 'bg-blue-50 border-blue-200' },
    { label: 'AOV Boost Estimativ', value: loading ? '...' : aovBoost, sub: 'După redesign & bundling', color: 'bg-amber-50 border-amber-200' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">05 Menu Redesign</h1>
      <p className="text-slate-400 mb-6">Neuromarketing, profit engineering și descrieri care vând</p>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className={"p-4 rounded-xl border " + c.color}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-slate-800">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Preparate din recenzii */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">🍽️ Preparate menționate în recenzii</h2>
          {dishesData && (
            <span className="text-xs text-slate-400">{dishesData.reviewsAnalyzed} recenzii analizate</span>
          )}
        </div>

        {dishesLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
            Extrag preparate din recenzii Google...
          </div>
        )}

        {!dishesLoading && dishesData && dishesData.dishes.length > 0 && (
          <>
            {dishesData.summary && (
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 mb-4 italic">
                💬 {dishesData.summary}
              </p>
            )}
            {dishesData.topDish && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-slate-500">Preparat star:</span>
                <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  ⭐ {dishesData.topDish}
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {dishesData.dishes
                .sort((a, b) => b.mentions - a.mentions)
                .map((dish, i) => (
                  <div key={i} className="group relative">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium cursor-default ${sentimentColor(dish.sentiment)}`}>
                      {dish.name}
                      {dish.mentions > 1 && (
                        <span className="text-xs opacity-70">×{dish.mentions}</span>
                      )}
                    </span>
                    {dish.quotes && dish.quotes[0] && (
                      <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-800 text-white text-xs rounded-lg p-2 hidden group-hover:block z-10 shadow-lg">
                        „{dish.quotes[0]}"
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </>
        )}

        {!dishesLoading && (!dishesData || dishesData.dishes.length === 0) && (
          <p className="text-sm text-slate-400 py-2">Nu s-au găsit preparate în recenzii.</p>
        )}
      </div>

      <LiveModuleGenerator
        location={selectedLocation}
        title="Audit Meniu & Neuromarketing"
        prompt={buildMenuPrompt(restaurantData)}
        restaurantData={restaurantData}
      />
    </div>
  );
}
