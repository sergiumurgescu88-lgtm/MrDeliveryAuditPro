import { useState } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';

const WEBSITE_PROMPT = `Generează un audit complet pentru website-ul și sistemul de comenzi online al unui restaurant. Structură obligatorie:
1. Analiză UX & Conversie (identifică 3 puncte de fricțiune în user journey, estimare rată de conversie, recomandări de optimizare)
2. Audit Tehnic & Performanță (Core Web Vitals, viteză încărcare mobil, SSL, structură URL, compatibilitate browsere)
3. Optimizare Funnel de Comandă (pași: Vizită → Meniu → Coș → Checkout → Confirmare, cum să reduci abandonul cu 20-30%)
4. Schema.org & SEO Tehnic (LocalBusiness, Menu, FAQ, breadcrumbs, rich snippets pentru rețete/prețuri)
5. Strategii de Retenție & AI Personalization (exit-intent popup, recomandări dinamice bazate pe oră/weather/istoric, loyalty integration)
6. Checklist Acționabil (prioritizat: Quick Wins / Medium / Long-term)
Ton: expert în UX/UI, conversion rate optimization și e-commerce food delivery. Limba: română. Format: clar, cu bullet points, metrici estimative și secțiuni distincte.`;

export default function Module04_WebsiteOrdering() {
  const [uxScore] = useState(58);
  const restaurantData = { name: 'Dum-Dum Food', address: 'Calea Giulești 123, București', rating: 4.1 };

  const funnelSteps = [
    { label: 'Vizitatori', value: '100%', drop: 0 },
    { label: 'Vizualizare Meniu', value: '68%', drop: 32 },
    { label: 'Adăugare în Coș', value: '24%', drop: 44 },
    { label: 'Checkout', value: '12%', drop: 12 },
    { label: 'Comandă Finalizată', value: '8%', drop: 4 }
  ];

  const techChecklist = [
    { item: 'Mobile Responsive', status: 'ok' },
    { item: 'SSL Certificate', status: 'ok' },
    { item: 'Core Web Vitals (LCP < 2.5s)', status: 'warn' },
    { item: 'Schema.org Markup', status: 'missing' },
    { item: 'Page Speed > 80/100', status: 'warn' },
    { item: 'Exit-Intent Popup', status: 'missing' }
  ];

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (uxScore / 100) * circumference;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">04 Website & Ordering</h1>
      <p className="text-slate-400 mb-6">Audit UX, conversie, performanță tehnică și optimizare comenzi online</p>

      {/* UX Score Ring + Funnel */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-w-[160px]">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
              <circle cx="50" cy="50" r="40" stroke="#f59e0b" strokeWidth="8" fill="none"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">{uxScore}</span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-2">UX Score</p>
          <p className="text-xs text-amber-600">Target: 85+</p>
        </div>

        <div className="flex-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Conversion Funnel Estimativ</h3>
          <div className="space-y-3">
            {funnelSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-32 text-xs text-slate-500">{step.label}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden relative">
                  <div className="bg-amber-500 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                    style={{ width: step.value }}>
                    <span className="text-xs font-medium text-white">{step.value}</span>
                  </div>
                </div>
                {step.drop > 0 && <span className="text-xs text-red-500 font-medium">-{step.drop}%</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technical Checklist */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {techChecklist.map((c, i) => (
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

      <LiveModuleGenerator title="Audit Website & Ordering" prompt={WEBSITE_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
