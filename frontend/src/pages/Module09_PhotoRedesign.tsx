import LiveModuleGenerator from '../components/LiveModuleGenerator';

const PHOTO_PROMPT = `Generează un ghid complet de redesign vizual și fotografie profesională pentru un restaurant. Structură obligatorie:
1. Brand Visual Guidelines (mood general, stil fotografic: rustic-modern / minimalist premium / vibrant street-food, paletă cromatică recomandată, reguli de compoziție și fundal)
2. Shot List Prioritar (8 cadre esențiale ordonate după impact: hero dish, interior ambiance, team portrait, process/plating, macro texture, exterior/signage, packaging/unboxing, UGC-style authentic)
3. Direcții de Iluminare & Styling (temperatură culoare 3200K vs 5600K, lumină naturală vs artificială, props recomandate, unghiuri de拍摄, evitarea reflexiilor nedorite)
4. AI Visual Consistency Checker (concept de tool care analizează noile poze încărcate și alertează dacă deviază de la brand guidelines: contrast, saturație, balans alb, compoziție)
5. Calendar de Împrospătare Vizuală (frecvență upload pe Google Maps & social, teme sezoniere, evenimente locale, rotirea cadrelor pentru a menține prospețimea)
6. Checklist Acționabil (Quick Wins / Medium / Long-term)
Ton: expert în food photography & branding vizual HORECA, orientat spre percepție premium, conversie și consistență pe toate canalele. Limba: română. Format: clar, cu bullet points, specificații tehnice și secțiuni distincte.`;

const COLOR_PALETTE = [
  { name: 'Warm Amber', hex: '#D97706', usage: 'Accent & CTA' },
  { name: 'Charcoal', hex: '#1F2937', usage: 'Fundal & Text' },
  { name: 'Cream', hex: '#FEF3C7', usage: 'Fundal deschis & Props' },
  { name: 'Forest Green', hex: '#065F46', usage: 'Elemente naturale & Freshness' },
  { name: 'Copper', hex: '#B45309', usage: 'Detalii metalice & Iluminare caldă' }
];

const SHOT_LIST = [
  { id: 1, title: 'Hero Signature Dish', desc: 'Preparat vedetă, unghi 45°, iluminare laterală caldă, fundal bokeh', priority: '🔥 Critic' },
  { id: 2, title: 'Interior Ambiance', desc: 'Wide shot, atmosferă reală, mese aranjate, lumină ambientală', priority: '🔥 Critic' },
  { id: 3, title: 'Team Portrait', desc: 'Angajați zâmbind, humanizează brandul, fundal neutru sau bucătărie', priority: '⭐ Ridicat' },
  { id: 4, title: 'Process & Plating', desc: 'Acțiune în bucătărie, mâini care aranjează, storytelling vizual', priority: '⭐ Ridicat' },
  { id: 5, title: 'Macro Texture', desc: 'Close-up ingrediente, abur, texturi, apetisant & senzorial', priority: '🟡 Mediu' },
  { id: 6, title: 'Exterior & Signage', desc: 'Fațadă, intrare, vizibilitate stradală, esențial pentru Local SEO', priority: '🟡 Mediu' },
  { id: 7, title: 'Packaging & Unboxing', desc: 'Livrare, branding pe cutii, experiență client acasă', priority: '🟢 Standard' },
  { id: 8, title: 'UGC Authentic Style', desc: 'Cadru "telefon mobil", natural, pentru social proof & reels', priority: '🟢 Standard' }
];

export default function Module09_PhotoRedesign({ selectedLocation }: { selectedLocation?: string }) {
  const parts = (selectedLocation || '').split(','); const restaurantData = { name: parts[0]?.trim() || 'Restaurant', address: parts.slice(1).join(',').trim() || selectedLocation || '', rating: 4.5 };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">09 Photo Redesign</h1>
      <p className="text-slate-400 mb-6">Identitate vizuală, shot list profesional și reguli de consistență foto</p>

      {/* Color Palette & Mood */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">🎨 Paletă Cromatică & Mood Vizual</h3>
        <div className="flex flex-wrap gap-4">
          {COLOR_PALETTE.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border border-slate-300 shadow-inner" style={{ backgroundColor: c.hex }} />
              <div>
                <p className="text-sm font-medium text-slate-800">{c.name}</p>
                <p className="text-xs text-slate-400">{c.usage}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4 italic">Stil recomandat: Rustic-Modern cu iluminare cinematică caldă (3200K) și contrast controlat pentru a evidenția texturile preparatelor.</p>
      </div>

      {/* Shot List Grid */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">📸 Shot List Prioritar (8 Cadre Esențiale)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SHOT_LIST.map((shot) => (
            <div key={shot.id} className="p-4 bg-slate-50 rounded-lg border border-slate-300 flex justify-between items-start">
              <div>
                <p className="font-medium text-slate-800 text-sm">{shot.id}. {shot.title}</p>
                <p className="text-xs text-slate-400 mt-1">{shot.desc}</p>
              </div>
              <span className="text-xs font-semibold whitespace-nowrap px-2 py-1 rounded bg-amber-100 text-amber-800">{shot.priority}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Consistency Rules */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">🔍 Reguli de Consistență Vizuală</h3>
        <ul className="space-y-2 text-sm text-slate-500">
          <li>✅ Balans de alb fixat pe 3200K-4000K pentru toate cadrele indoor</li>
          <li>✅ Evitarea blitz-ului direct; folosește softbox sau lumină naturală difuză</li>
          <li>✅ Fundaluri curate, fără elemente parazite (șervețe mototolite, tacâmuri murdare)</li>
          <li>✅ Crop consistent 4:5 pentru Instagram, 16:9 pentru website & Google Maps</li>
          <li>✅ Saturație moderată (+10-15%), contrast ridicat pentru profunzime</li>
        </ul>
      </div>

      <LiveModuleGenerator location={selectedLocation} title="Audit & Strategie Foto" prompt={PHOTO_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
