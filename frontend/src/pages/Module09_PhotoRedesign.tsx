import { useState, useEffect } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData } from '../hooks/usePlacesData';

const PHOTO_PROMPT = `Audit complet de identitate vizuală și strategie foto pentru restaurant. Structură obligatorie:
1. Paletă cromatică & mood vizual (culori brand, temperatură lumină, stil recomandat)
2. Shot list prioritar (8 cadre esențiale: hero dish, interior, echipă, proces, macro, exterior, packaging, UGC)
3. Reguli de consistență vizuală (balans de alb, iluminare, fundaluri, crop, saturație)
4. Strategie de conținut foto recurent (calendar lunar, surse UGC, drepturi de autor, storage)
5. Impact asupra conversiei & SEO vizual (cum influențează pozele CTR-ul în Maps, delivery apps și website)
Ton: director de creație & fotograf culinar HORECA, focus pe percepție premium și consistență brand. Limba: română.`;

export default function Module09_PhotoRedesign({ selectedLocation }: { selectedLocation?: string }) {
  const { data: placesData, loading: placesLoading } = usePlacesData(selectedLocation);
  const [photoAnalysis, setPhotoAnalysis] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);

  useEffect(() => {
    const photos = (placesData as any)?.photos;
    if (!photos?.length || !placesData?.name) return;
    setAnalysisLoading(true);
    setAnalysisError(false);
    fetch('/api/photos/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoUrls: photos.slice(0, 4), restaurantName: placesData.name }),
    })
      .then(r => r.json())
      .then(d => { setPhotoAnalysis(d.analysis || null); setAnalysisLoading(false); })
      .catch(() => { setAnalysisError(true); setAnalysisLoading(false); });
  }, [placesData]);

  const loading = placesLoading;
  const rating = placesData?.rating || 3.5;
  const reviews = placesData?.reviewCount || 0;
  const photoCount = (placesData as any)?.photos?.length || 0;
  const consistency = Math.min(95, Math.round(50 + (rating - 3) * 20 + (photoCount > 3 ? 10 : 0)));
  const ugc = reviews > 400 ? 'Ridicat 🔥' : reviews > 150 ? 'Mediu ⚠️' : 'Scăzut ❌';
  const impact = rating >= 4.0 ? '+25% CTR' : '+15% CTR';

  const cards = [
    { label: 'Consistență Vizuală', value: loading ? '🔄...' : `${consistency}/100`, sub: 'Target: 85+', color: consistency >= 85 ? 'bg-emerald-50 border-emerald-200' : consistency >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200' },
    { label: 'Foto pe Google Maps', value: loading ? '🔄...' : `${photoCount} poze`, sub: photoCount >= 10 ? '✅ Suficiente' : '⚠️ Sub optim (min 10)', color: photoCount >= 10 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200' },
    { label: 'UGC Potential', value: loading ? '🔄...' : ugc, sub: `${reviews} recenzii`, color: 'bg-indigo-50 border-indigo-200' },
    { label: 'Impact Estimat', value: loading ? '🔄...' : impact, sub: 'CTR după optimizare', color: 'bg-rose-50 border-rose-200' },
  ];

  const parts = (selectedLocation || '').split(',');
  const restaurantData = {
    name: placesData?.name || parts[0]?.trim() || 'Restaurant',
    address: placesData?.address || parts.slice(1).join(',').trim() || '',
    rating: placesData?.rating || null,
    reviewCount: placesData?.reviewCount || null,
    photoCount,
    photoAnalysis,
  };

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

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 min-h-[80px]">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">🤖 Analiză AI poze reale Google Maps</h3>
        {analysisLoading && <p className="text-sm text-slate-400 animate-pulse">🔄 Gemini analizează pozele restaurantului...</p>}
        {analysisError && <p className="text-sm text-amber-600">⚠️ Nu s-au putut analiza pozele automat.</p>}
        {!analysisLoading && !analysisError && photoAnalysis && <p className="text-sm text-slate-600 leading-relaxed">{photoAnalysis}</p>}
        {!analysisLoading && !analysisError && !photoAnalysis && !placesLoading && (
          <p className="text-sm text-slate-400">{photoCount === 0 ? '❌ Restaurantul nu are poze pe Google Maps.' : '⏳ Pregătim analiza...'}</p>
        )}
      </div>

      <LiveModuleGenerator location={selectedLocation} title="Audit Identitate Vizuală & Foto" prompt={PHOTO_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
