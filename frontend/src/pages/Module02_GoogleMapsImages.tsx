import LiveModuleGenerator from '../components/LiveModuleGenerator';

const MAPS_IMAGES_PROMPT = `Generează un audit vizual complet pentru imaginile Google Maps ale unui restaurant. Structură obligatorie:
1. Analiza Stării Actuale (calitate tehnică, relevanță, prospețime, diversitate cadre, frecvență upload)
2. Concept de Redesign Premium (direcție artistică tip Michelin, iluminare, mood, paletă cromatică)
3. Shot List Profesional (5 cadre esențiale cu detalii tehnice: unghi, iluminare, compoziție, subiect, echipament recomandat)
4. Calendar Vizual Trimestrial (teme sezoniere și evenimente locale pentru conținut foto recurent)
5. Recomandări Acționabile (prioritizate: Quick Wins / Medium / Long-term)
Ton: expert în fotografie culinară & branding vizual, orientat spre conversie și percepție premium. Limba: română. Format: clar, cu bullet points și secțiuni distincte.`;

export default function Module02_GoogleMapsImages({ selectedLocation }: { selectedLocation?: string }) {
  const parts = (selectedLocation || '').split(','); const restaurantData = { name: parts[0]?.trim() || 'Restaurant', address: parts.slice(1).join(',').trim() || selectedLocation || '', rating: 4.5 };
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">02 Google Maps Images</h1>
      <p className="text-slate-400 mb-6">Audit vizual, concepte foto premium și strategie de conținut</p>
      
      {/* Visual Concept Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {['Interior Panoramic', 'Signature Dish', 'Bar & Băuturi'].map((frame, i) => (
          <div key={i} className="bg-slate-100 rounded-lg p-4 text-center border border-slate-300">
            <div className="w-full h-24 bg-gradient-to-br from-amber-100 to-orange-200 rounded-md mb-3 flex items-center justify-center">
              <span className="text-2xl">📸</span>
            </div>
            <p className="text-sm font-medium text-slate-700">{frame}</p>
            <p className="text-xs text-slate-400 mt-1">Concept AI Premium</p>
          </div>
        ))}
      </div>

      <LiveModuleGenerator location={selectedLocation} title="Analiză Foto Google Maps" prompt={MAPS_IMAGES_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
