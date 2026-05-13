import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData } from '../hooks/usePlacesData';

const MAPS_IMAGES_PROMPT = `Generează un audit vizual complet pentru imaginile Google Maps ale unui restaurant. Structură obligatorie:
1. Analiza Stării Actuale (presupunem foto UGC standard pe Maps: iluminare slabă, cadre aglomerate, lipsă consistență. Focus pe oportunități de upgrade)
2. Concept de Redesign Premium (direcție artistică tip Michelin, iluminare, mood, paletă cromatică)
3. Shot List Profesional (5 cadre esențiale cu detalii tehnice: unghi, iluminare, compoziție, subiect, echipament recomandat)
4. Calendar Vizual Trimestrial (teme sezoniere și evenimente locale pentru conținut foto recurent)
5. Recomandări Acționabile (prioritizate: Quick Wins / Medium / Long-term)
Ton: expert în fotografie culinară & branding vizual, orientat spre conversie și percepție premium. Limba: română. Format: clar, cu bullet points și secțiuni distincte.`;

interface Photo { url: string; title: string; }

export default function Module02_GoogleMapsImages({ selectedLocation }: { selectedLocation?: string }) {
  const { data: placesData, loading } = usePlacesData(selectedLocation);
  const rawPhotos: string[] = (placesData as any)?.photos || [];
  const photos: Photo[] = rawPhotos.slice(0, 3).map((url, idx) => ({
    url, title: idx === 0 ? 'Interior Panoramic' : idx === 1 ? 'Signature Dish' : 'Bar & Băuturi'
  }));

  const restaurantData = {
    name: placesData?.name || selectedLocation?.split(',')[0]?.trim() || 'Restaurant',
    address: placesData?.address || '',
    rating: placesData?.rating || null,
    reviewCount: placesData?.reviewCount || null,
    photoCount: rawPhotos.length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">02 Google Maps Images</h1>
      <p className="text-slate-400 mb-6">Audit vizual, concepte foto premium și strategie de conținut</p>
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
              <button onClick={() => alert('Poză adăugată în sistemul Michelin: ' + photo.title)}
                className="mt-3 w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:from-amber-600 hover:to-orange-700 transition-colors">
                📸 Creează în sistem Michelin
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-8 text-slate-500">Nu s-au găsit poze pentru acest restaurant</div>
        )}
      </div>
      <LiveModuleGenerator location={selectedLocation} title="Analiză Foto Google Maps" prompt={MAPS_IMAGES_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
