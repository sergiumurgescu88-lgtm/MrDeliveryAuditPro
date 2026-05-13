import { useState, useEffect } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData } from '../hooks/usePlacesData';

const MAPS_IMAGES_PROMPT = `Ești un director de creație și fotograf culinar HORECA cu 15 ani experiență în România. Analizează EXCLUSIV datele reale furnizate în JSON.

REGULI OBLIGATORII DE FORMATARE:
- Nu rupe cuvintele în mijloc (ex: "consis tență" e greșit, "consistență" e corect)
- Nu adăuga spații în URL-uri sau în interiorul cuvintelor
- Dacă există câmpul "photoAnalysis" în date, citează-l explicit la început ca "Analiză Gemini Vision:"
- Format: titluri cu ###, bullet points cu ▸

### 1. Analiză Stare Actuală
Începe cu: "Gemini Vision a identificat: [photoAnalysis din JSON]". Apoi extinde analiza pe baza numărului de poze (photoCount) și rating-ului.

### 2. Concept Redesign Premium
Direcție artistică specifică tipului de restaurant (fast-food/casual/fine-dining bazat pe types și priceLevel din date). Iluminare, mood, paletă cromatică.

### 3. Shot List Profesional
5 cadre esențiale cu: unghi, iluminare, compoziție, subiect, echipament. Adaptate la tipul real de restaurant.

### 4. Calendar Vizual Trimestrial
Teme sezoniere specifice Bucureștiului și evenimentelor locale.

### 5. Recomandări Prioritizate
🔴 Critice | 🟡 Mediu termen | 🟢 Long-term
Dacă photoCount < 10: marchează ca 🔴 CRITIC — sub minimul Google recomandat.

Limba: română. Fii specific și concis — maxim 600 cuvinte total.`;

interface Photo { url: string; title: string; }

export default function Module02_GoogleMapsImages({ selectedLocation }: { selectedLocation?: string }) {
  const { data: placesData, loading } = usePlacesData(selectedLocation);
  const [photoAnalysis, setPhotoAnalysis] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);

  useEffect(() => {
    const photos = (placesData as any)?.photos as string[] | undefined;
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

  const rawPhotos: string[] = (placesData as any)?.photos || [];
  const photos: Photo[] = rawPhotos.slice(0, 3).map((url, idx) => ({
    url, title: idx === 0 ? 'Fotografie #1' : idx === 1 ? 'Fotografie #2' : 'Fotografie #3'
  }));

  const photoCount = rawPhotos.length;

  const restaurantData = {
    name: placesData?.name || selectedLocation?.split(',')[0]?.trim() || 'Restaurant',
    address: placesData?.address || '',
    rating: placesData?.rating || null,
    reviewCount: placesData?.reviewCount || null,
    photoCount,
    photoAnalysis,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">02 Google Maps Images</h1>
      <p className="text-slate-400 mb-6">Audit vizual, concepte foto premium și strategie de conținut</p>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2">
        <div className={`p-4 rounded-xl border ${photoCount >= 10 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          <p className="text-xs text-slate-500 mb-1">Foto pe Google Maps</p>
          <p className="text-lg font-bold text-slate-800">{loading ? '🔄...' : `${photoCount} poze`}</p>
          <p className="text-xs text-slate-400 mt-1">{photoCount >= 10 ? '✅ Suficiente' : '⚠️ Sub optim (min 10)'}</p>
        </div>
        <div className="p-4 rounded-xl border bg-indigo-50 border-indigo-200">
          <p className="text-xs text-slate-500 mb-1">Rating actual</p>
          <p className="text-lg font-bold text-slate-800">{loading ? '🔄...' : placesData?.rating ? `${placesData.rating} ⭐` : 'N/A'}</p>
          <p className="text-xs text-slate-400 mt-1">{placesData?.reviewCount ? `${placesData.reviewCount} recenzii` : '—'}</p>
        </div>
        <div className="p-4 rounded-xl border bg-rose-50 border-rose-200 col-span-2 md:col-span-1">
          <p className="text-xs text-slate-500 mb-1">Analiză AI Vizuală</p>
          <p className="text-lg font-bold text-slate-800">
            {analysisLoading ? '🔄 Se analizează...' : photoAnalysis ? '✅ Completă' : analysisError ? '⚠️ Eroare' : loading ? '⏳ Aștept date...' : '—'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Gemini Vision pe poze reale</p>
        </div>
      </div>

      {/* AI Photo Analysis box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[80px]">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">🤖 Analiză AI poze reale Google Maps</h3>
        {analysisLoading && (
          <p className="text-sm text-slate-400 animate-pulse">🔄 Gemini analizează pozele restaurantului...</p>
        )}
        {analysisError && (
          <p className="text-sm text-amber-600">⚠️ Nu s-au putut analiza pozele automat.</p>
        )}
        {!analysisLoading && !analysisError && photoAnalysis && (
          <p className="text-sm text-slate-600 leading-relaxed">{photoAnalysis}</p>
        )}
        {!analysisLoading && !analysisError && !photoAnalysis && !loading && (
          <p className="text-sm text-slate-400">
            {photoCount === 0 ? '❌ Restaurantul nu are poze pe Google Maps.' : '⏳ Pregătim analiza...'}
          </p>
        )}
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="bg-slate-100 rounded-lg p-4 border border-slate-300 animate-pulse">
              <div className="w-full h-48 bg-slate-300 rounded-md mb-3"></div>
              <div className="h-4 bg-slate-300 rounded w-3/4 mx-auto"></div>
            </div>
          ))
        ) : photos.length > 0 ? (
          photos.map((photo, i) => (
            <div key={i} className="bg-white rounded-lg p-4 border border-slate-300 shadow-sm">
              <img src={photo.url} alt={photo.title} className="w-full h-48 object-cover rounded-md mb-3" />
              <p className="text-sm font-medium text-slate-700 text-center">{photo.title}</p>
              <button
                onClick={() => alert('Poză adăugată în sistemul Michelin: ' + photo.title)}
                className="mt-3 w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:from-amber-600 hover:to-orange-700 transition-colors"
              >
                📸 Creează în sistem Michelin
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-8 text-slate-500">Nu s-au găsit poze pentru acest restaurant</div>
        )}
      </div>

      <LiveModuleGenerator
        location={selectedLocation}
        title="Analiză Foto Google Maps"
        prompt={MAPS_IMAGES_PROMPT}
        restaurantData={restaurantData}
      />
    </div>
  );
}
