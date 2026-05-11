import LiveModuleGenerator from '../components/LiveModuleGenerator';

const MENU_PROMPT = `Generează o strategie completă de redesign al meniului pentru un restaurant, folosind principii de neuromarketing și profit engineering. Structură obligatorie:
1. Analiza Psihologică a Structurii Actuale (identifică decoy items, anchor pricing, golden triangle placement, categorii neoptimizate)
2. Redenumire Categorii & Naming Strategic (ex: "Aperitive" → "Gustări de Început", "Oferte" → "Preferatele Chef-ului")
3. Descrieri Emoționale & Senzoriale (rescrie 3 preparate exemplu folosind limbaj care stimulează simțurile, evidențiază ingrediente locale, texturi, arome)
4. Matrice de Profitabilitate (Item Profit Priority = Margin % × Frecvență Comandă × Appeal Vizual ÷ Complexitate Preparare)
5. Dynamic Menu Engine (secțiuni care se adaptează la inventory, ore de vârf, weather, trending items)
6. Checklist Acționabil (Quick Wins / Medium / Long-term)
Ton: expert în menu engineering & food psychology, orientat spre creșterea ticket-ului mediu și conversie. Limba: română. Format: clar, cu exemple concrete, bullet points și secțiuni distincte.`;

export default function Module05_MenuRedesign({ selectedLocation }: { selectedLocation?: string }) {
  const parts = (selectedLocation || '').split(','); const restaurantData = { name: parts[0]?.trim() || 'Restaurant', address: parts.slice(1).join(',').trim() || selectedLocation || '', rating: 4.5 };

  const beforeAfter = [
    { before: 'Ciorbă de pui', after: 'Ciorbă rădăuțeană cremoasă, gătită lent 6 ore cu carne de pui de la ferme locale, smântână proaspătă și leuștean cules din grădină.' },
    { before: 'Salată Caesar', after: 'Frunze crocante de romaine, scăldate în dressing Caesar artizanal, cu parmezan ras fin și crutoane aurii, coapte în cuptor.' },
    { before: 'Clătite cu ciocolată', after: 'Clătite pufoase, învăluite în ciocolată belgiană topită lent, cu note de vanilie și un strop de zmeură proaspătă.' }
  ];

  const profitMatrix = [
    { item: 'Preparat Signature', margin: '72%', freq: 'Ridicată', priority: '⭐⭐⭐⭐⭐' },
    { item: 'Garnituri Standard', margin: '85%', freq: 'Medie', priority: '⭐⭐⭐⭐' },
    { item: 'Băuturi Răcoritoare', margin: '90%', freq: 'Foarte Ridicată', priority: '⭐⭐⭐⭐⭐' },
    { item: 'Deserturi Complexe', margin: '45%', freq: 'Scăzută', priority: '⭐⭐' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">05 Menu Redesign</h1>
      <p className="text-slate-400 mb-6">Neuromarketing, profit engineering și descrieri care vând</p>

      {/* Before/After Neuromarketing */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">🧠 Transformare Descrieri (Before → After)</h3>
        <div className="space-y-4">
          {beforeAfter.map((ex, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-400 line-through">{ex.before}</div>
              <div className="text-sm text-slate-800 font-medium">{ex.after}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Profit Matrix */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">📊 Matrice de Profitabilitate & Prioritate</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-2 rounded-l-lg">Preparat</th>
                <th className="px-4 py-2">Marjă</th>
                <th className="px-4 py-2">Frecvență</th>
                <th className="px-4 py-2 rounded-r-lg">Prioritate Meniu</th>
              </tr>
            </thead>
            <tbody>
              {profitMatrix.map((row, i) => (
                <tr key={i} className="border-b border-slate-200 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800">{row.item}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">{row.margin}</td>
                  <td className="px-4 py-3 text-slate-500">{row.freq}</td>
                  <td className="px-4 py-3">{row.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LiveModuleGenerator location={selectedLocation} title="Audit & Redesign Meniu" prompt={MENU_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
