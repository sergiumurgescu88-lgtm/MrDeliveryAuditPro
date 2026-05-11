import LiveModuleGenerator from '../components/LiveModuleGenerator';

const GROWTH_PROMPT = `Generează un plan de creștere accelerată pe 90 de zile pentru un restaurant, structurat strategic și orientat spre rezultate măsurabile. Structură obligatorie:
1. Matrice de Prioritizare (Impact vs Efort): clasifică recomandările în Quick Wins, Proiecte Majore, Optimizări Treptate și Time Sinks.
2. Roadmap 90 Zile (Sprint-uri):
   - Săptămânile 1-2 (Quick Wins): acțiuni imediate cu cost zero/redus
   - Săptămânile 3-6 (Core Improvements): implementări structurale și optimizări
   - Săptămânile 7-12 (Growth Levers): scalare, parteneriate, campanii avansate
3. Dashboard KPIs & Metrici de Succes (baseline estimat vs target la 90 zile: GBP impressions, review velocity, website conversion, social engagement, repeat customers, AOV)
4. Growth Experiment Backlog (3 idei de testat A/B cu ipoteză, metrică de succes și durată)
5. Moonshot Idea (o idee radicală, risc mediu-mare, potențial 10x impact, specifică HORECA România)
6. Checklist Acționabil & Resurse (buget estimativ, echipă, tool-uri)
Ton: strategist growth hacking & business development HORECA, orientat spre ROI, scalare sustenabilă și execuție rapidă. Limba: română. Format: clar, cu bullet points, timeline și secțiuni distincte.`;

const ROADMAP = [
  { phase: 'Săptămânile 1-2', title: 'Quick Wins', color: 'bg-green-500', tasks: ['Optimizare titlu & descriere GBP', 'Răspuns la toate recenziile vechi', 'Încărcare 5 poze noi pe Google Maps', 'Activare exit-intent popup pe site'] },
  { phase: 'Săptămânile 3-6', title: 'Core Improvements', color: 'bg-amber-500', tasks: ['Rescriere meniu cu neuromarketing', 'Implementare Schema.org & SEO tehnic', 'Lansare campanie UGC pe Instagram', 'Configurare sistem automat de colectare recenzii'] },
  { phase: 'Săptămânile 7-12', title: 'Growth Levers', color: 'bg-blue-500', tasks: ['Parteneriate cu 2 micro-influenceri locali', 'Testare Google Local Service Ads', 'Lansare program de loialitate SMS/Email', 'Optimizare dynamic pricing pe delivery'] }
];

const KPIS = [
  { metric: 'GBP Impressions', baseline: '1.2k/lună', target: '1.8k/lună (+50%)' },
  { metric: 'Review Velocity', baseline: '8/lună', target: '15/lună (+87%)' },
  { metric: 'Website Conversion', baseline: '2.8%', target: '4.2% (+50%)' },
  { metric: 'Social Engagement', baseline: '3.1%', target: '5.0% (+61%)' },
  { metric: 'Repeat Customers', baseline: '18%', target: '28% (+10pp)' },
  { metric: 'Avg Order Value', baseline: '48 RON', target: '58 RON (+20%)' }
];

const MATRIX = [
  { quadrant: '🚀 Quick Wins', desc: 'Impact Mare / Efort Mic', items: ['Optimizare GBP', 'Răspuns recenzii', 'Exit-intent popup', 'Poze noi Maps'] },
  { quadrant: '🏗️ Proiecte Majore', desc: 'Impact Mare / Efort Mare', items: ['Redesign meniu complet', 'Website rebuild & ordering', 'Campanie influenceri', 'Program loialitate'] },
  { quadrant: '🔧 Optimizări', desc: 'Impact Mic / Efort Mic', items: ['Meta tags update', 'Program postări social', 'Ajustare prețuri delivery', 'QR code pe bon'] },
  { quadrant: '⏳ Time Sinks', desc: 'Impact Mic / Efort Mare', items: ['Rebranding complet', 'App mobilă custom', 'Meniu tipărit luxury', 'Evenimente complexe'] }
];

export default function Module10_GrowthPlan({ selectedLocation }: { selectedLocation?: string }) {
  const restaurantData = { name: 'Dum-Dum Food', address: 'Calea Giulești 123, București', rating: 4.1 };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">10 Growth Plan</h1>
      <p className="text-slate-400 mb-6">Roadmap 90 zile, matrice de prioritizare, KPIs și strategii de scalare</p>

      {/* 90-Day Roadmap */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">📅 Roadmap 90 Zile (Sprint-uri)</h3>
        <div className="space-y-4">
          {ROADMAP.map((phase, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${phase.color}`} />
                {i < ROADMAP.length - 1 && <div className="w-0.5 h-full bg-slate-200 mt-1" />}
              </div>
              <div className="flex-1 pb-4">
                <p className="text-xs font-bold text-slate-400 uppercase">{phase.phase}</p>
                <p className="font-semibold text-slate-800">{phase.title}</p>
                <ul className="mt-2 space-y-1">
                  {phase.tasks.map((task, j) => (
                    <li key={j} className="text-sm text-slate-500 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span> {task}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact vs Effort Matrix */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">📊 Matrice Prioritizare (Impact vs Efort)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MATRIX.map((q, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-300">
              <p className="font-semibold text-slate-800 text-sm">{q.quadrant}</p>
              <p className="text-xs text-slate-400 mb-2">{q.desc}</p>
              <ul className="space-y-1">
                {q.items.map((item, j) => (
                  <li key={j} className="text-xs text-slate-500">• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">📈 KPI Dashboard (Baseline vs Target 90 Zile)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-2 rounded-l-lg">Metrică</th>
                <th className="px-4 py-2">Baseline</th>
                <th className="px-4 py-2 rounded-r-lg">Target (90 zile)</th>
              </tr>
            </thead>
            <tbody>
              {KPIS.map((kpi, i) => (
                <tr key={i} className="border-b border-slate-200 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800">{kpi.metric}</td>
                  <td className="px-4 py-3 text-slate-400">{kpi.baseline}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">{kpi.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moonshot Idea */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200 shadow-sm mb-6">
        <h3 className="text-sm font-bold text-amber-800 mb-2">🌙 Moonshot Idea</h3>
        <p className="text-sm text-amber-900 italic">
          "Lansează un 'Mystery Dish' lunar – un preparat secret anunțat doar pe Instagram Stories, disponibil 24h, care creează FOMO, generează UGC masiv și crește traficul în zilele cu vânzări slabe."
        </p>
      </div>

      <LiveModuleGenerator location={selectedLocation} title="Plan de Creștere 90 Zile" prompt={GROWTH_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
