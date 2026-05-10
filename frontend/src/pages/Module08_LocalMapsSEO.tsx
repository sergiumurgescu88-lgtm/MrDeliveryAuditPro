import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';

const LOCAL_SEO_PROMPT = `Generează o strategie completă de Local Maps SEO și optimizare Google Business Profile (GBP) pentru un restaurant. Structură obligatorie:
1. Audit GBP Complet (completeness score, photo freshness, Q&A activity, post frequency, attributes optimization, categorii primare/secundare corecte)
2. Strategie de Citări Locale (top 10 directoare românești relevante, consistență NAP - Name/Address/Phone, cum să corectezi listing-urile duplicate sau greșite)
3. Geo-Targeted Content Loop (Google Posts săptămânale cu evenimente locale, parteneriate comunitare, cuvinte cheie hiperlocale, integrare cu blog/site)
4. Analiză de Proximitate & Autoritate (factori de ranking local: distanță, relevanță, prominență, cum să crești vizibilitatea în "Local Pack", impactul recenziilor și al backlink-urilor locale)
5. Metrici de Urmărit & Benchmark (GBP impressions, search actions, direction requests, phone calls, website clicks, review velocity)
6. Checklist Acționabil (Quick Wins / Medium / Long-term)
Ton: expert în Local SEO & Google Business Profile, orientat spre vizibilitate în "Local Pack", trafic fizic și conversie. Limba: română. Format: clar, cu bullet points, exemple practice și secțiuni distincte.`;

const radarData = [
  { metric: 'Rating', you: 82, rival1: 90, rival2: 85 },
  { metric: 'Recenzii', you: 65, rival1: 88, rival2: 70 },
  { metric: 'Vizibilitate', you: 55, rival1: 80, rival2: 60 },
  { metric: 'Autoritate', you: 60, rival1: 75, rival2: 65 },
  { metric: 'SEO Local', you: 58, rival1: 85, rival2: 72 }
];

const gbpChecklist = [
  { item: 'Categorie Principală Corectă', status: 'ok' },
  { item: 'Descriere cu 3 Cuvinte Cheie Locale', status: 'warn' },
  { item: '10+ Foto Încărcate în Ultimele 30 Zile', status: 'missing' },
  { item: 'Răspuns la 100% din Q&A <24h', status: 'warn' },
  { item: 'Google Posts Săptămânale cu CTA', status: 'missing' },
  { item: 'Atribute Completate (Wi-Fi, Terasă, etc.)', status: 'ok' }
];

const metrics = [
  { label: 'GBP Impressions', value: '1.2k/lună', sub: 'Target: +40%' },
  { label: 'Direction Requests', value: '85', sub: 'Trafic fizic estimat' },
  { label: 'Website Clicks', value: '120', sub: 'Din Local Pack' },
  { label: 'Phone Calls', value: '45', sub: 'Direct din Maps' }
];

export default function Module08_LocalMapsSEO() {
  const restaurantData = { name: 'Dum-Dum Food', address: 'Calea Giulești 123, București', rating: 4.1 };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">08 Local Maps SEO</h1>
      <p className="text-slate-400 mb-6">Optimizare Google Business Profile, citări locale și dominanță în căutările de proximitate</p>

      {/* Radar Chart + Metrics */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">📊 Benchmark Competitiv (Radar)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Restaurantul Tău" dataKey="you" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} strokeWidth={2} />
                <Radar name="Rival 1" dataKey="rival1" stroke="#9ca3af" fill="#9ca3af" fillOpacity={0.1} strokeWidth={1} />
                <Radar name="Rival 2" dataKey="rival2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={1} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">📈 Metrici GBP Estimative</h3>
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((m, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-400 uppercase tracking-wide">{m.label}</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{m.value}</p>
                <p className="text-xs text-amber-600 mt-1">{m.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GBP Checklist */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">✅ GBP Optimization Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {gbpChecklist.map((c, i) => (
            <div key={i} className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${
              c.status === 'ok' ? 'bg-green-50 border-green-200 text-green-700' :
              c.status === 'warn' ? 'bg-amber-50 border-amber-200 text-amber-700' :
              'bg-red-50 border-red-200 text-red-700'
            }`}>
              <span>{c.status === 'ok' ? '✅' : c.status === 'warn' ? '⚠️' : '❌'}</span>
              {c.item}
            </div>
          ))}
        </div>
      </div>

      <LiveModuleGenerator title="Audit Local Maps SEO & GBP" prompt={LOCAL_SEO_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
