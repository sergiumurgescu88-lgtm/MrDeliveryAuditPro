import { useState, useEffect } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';

const WEBSITE_PROMPT = `Audit tehnic & UX pentru website-ul restaurantului. Structură obligatorie:
1. Performanță tehnică (viteză, Core Web Vitals, mobil vs desktop)
2. Funnel de conversie (vizitatori → meniu → coș → checkout)
3. SEO tehnic (Schema.org, meta tags, indexare, SSL)
4. Optimizare comenzi online (UX coș, upsell, exit-intent, guest checkout)
5. Recomandări prioritizate (Quick Wins / Medium / Long-term)
Ton: expert UX & performance marketing, date acționabile, focus pe conversie. Limba: română.`;

export default function Module04_WebsiteOrdering({ selectedLocation }: { selectedLocation?: string }) {
  const [metrics, setMetrics] = useState({ speed: '...', mobile: 'Verificare...', ssl: 'Verificare...', schema: 'Verificare...' });
  const [loading, setLoading] = useState(true);
  const [website, setWebsite] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSiteData() {
      if (!selectedLocation) { setLoading(false); return; }
      try {
        const res = await fetch(`/api/places/details?query=${encodeURIComponent(selectedLocation)}`);
        const d = await res.json();
        const url = d.website;
        setWebsite(url);
        if (!url) {
          setMetrics({ speed: 'N/A', mobile: 'N/A', ssl: 'N/A', schema: 'N/A' });
          setLoading(false);
          return;
        }
        // PageSpeed Insights API (free, no key, CORS enabled)
        const psUrl = `https://pagespeedonline.googleapis.com/pagespeedonline/v5?url=${encodeURIComponent(url)}&category=PERFORMANCE&strategy=mobile`;
        const psRes = await fetch(psUrl);
        const psData = await psRes.json();
        const score = psData?.lighthouseResult?.categories?.performance?.score ?? null;
        const speedScore = score ? Math.round(score * 100) : null;
        setMetrics({
          speed: speedScore !== null ? `${speedScore}/100` : 'Eroare scan',
          mobile: speedScore !== null ? (speedScore >= 50 ? '✅ Optimizat' : '⚠️ Necesită fix') : 'N/A',
          ssl: url.startsWith('https') ? '✅ Activ' : '❌ Inactiv',
          schema: '⚠️ Verificare AI'
        });
      } catch (e) {
        console.error(e);
        setMetrics({ speed: 'Eroare', mobile: 'Eroare', ssl: 'Eroare', schema: 'Eroare' });
      }
      setLoading(false);
    }
    fetchSiteData();
  }, [selectedLocation]);

  const parts = (selectedLocation || '').split(',');
  const restaurantData = { name: parts[0]?.trim() || 'Restaurant', address: parts.slice(1).join(',').trim() || '', website, rating: 4.0 };

  const cards = [
    { label: 'PageSpeed Mobile', value: loading ? '🔄...' : metrics.speed, sub: 'Target: 80+', color: 'bg-blue-50 border-blue-200' },
    { label: 'Mobile UX', value: loading ? '🔄...' : metrics.mobile, sub: 'Responsive & tap targets', color: 'bg-emerald-50 border-emerald-200' },
    { label: 'SSL Certificate', value: loading ? '🔄...' : metrics.ssl, sub: 'HTTPS obligatoriu', color: 'bg-violet-50 border-violet-200' },
    { label: 'Schema.org', value: loading ? '🔄...' : metrics.schema, sub: 'Restaurant markup', color: 'bg-amber-50 border-amber-200' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">04 Website & Ordering</h1>
      <p className="text-slate-400 mb-6">Audit UX, conversie, performanță tehnică și optimizare comenzi online</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <div key={i} className={`p-4 rounded-xl border ${c.color}`}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-slate-800">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>
      {!website && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 mb-4">
          ⚠️ Restaurantul nu are website public în Google Maps. Auditul se va baza pe recomandări standard.
        </div>
      )}
      <LiveModuleGenerator location={selectedLocation} title="Audit Website & Ordering" prompt={WEBSITE_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
