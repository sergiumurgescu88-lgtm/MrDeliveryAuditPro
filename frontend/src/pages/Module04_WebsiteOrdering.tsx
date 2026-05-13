import { useState, useEffect } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData } from '../hooks/usePlacesData';

const WEBSITE_PROMPT = `Audit tehnic & UX pentru website-ul restaurantului. Structură obligatorie:
1. Performanță tehnică (viteză, Core Web Vitals, mobil vs desktop)
2. Funnel de conversie (vizitatori → meniu → coș → checkout)
3. SEO tehnic (Schema.org, meta tags, indexare, SSL)
4. Optimizare comenzi online (UX coș, upsell, exit-intent, guest checkout)
5. Recomandări prioritizate (Quick Wins / Medium / Long-term)
Ton: expert UX & performance marketing, date acționabile, focus pe conversie. Limba: română.`;

export default function Module04_WebsiteOrdering({ selectedLocation }: { selectedLocation?: string }) {
  const { data: placesData, loading: placesLoading } = usePlacesData(selectedLocation);
  const [audit, setAudit] = useState<any>(null);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    const url = placesData?.website;
    if (!url) return;
    setAuditLoading(true);
    fetch('/api/website/audit?url=' + encodeURIComponent(url))
      .then(r => r.json())
      .then(d => { setAudit(d); setAuditLoading(false); })
      .catch(() => setAuditLoading(false));
  }, [placesData?.website]);

  const loading = placesLoading || auditLoading;
  const website = placesData?.website || null;
  const fmt = (v: number | null) => v !== null ? Math.round(v * 100) + '/100' : 'N/A';
  const scoreColor = (v: number | null) =>
    v === null ? 'bg-slate-50 border-slate-200' :
    v >= 0.7 ? 'bg-emerald-50 border-emerald-200' :
    v >= 0.4 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  const cards = [
    { label: 'Performanță', value: loading ? '🔄...' : fmt(audit?.performance ?? null), sub: audit?.responseTimeMs ? audit.responseTimeMs + 'ms răspuns' : 'Viteză pagină', color: scoreColor(audit?.performance ?? null) },
    { label: 'SEO Tehnic', value: loading ? '🔄...' : fmt(audit?.seo ?? null), sub: audit?.hasSchemaOrg ? '✅ Schema.org prezent' : '⚠️ Fără Schema.org', color: scoreColor(audit?.seo ?? null) },
    { label: 'SSL / HTTPS', value: loading ? '🔄...' : (audit?.hasHttps ? '✅ Activ' : (website ? '❌ Inactiv' : 'N/A')), sub: 'Securitate conexiune', color: audit?.hasHttps ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200' },
    { label: 'Best Practices', value: loading ? '🔄...' : fmt(audit?.bestPractices ?? null), sub: audit?.hasGzip ? '✅ Gzip activ' : '⚠️ Fără compresie', color: scoreColor(audit?.bestPractices ?? null) },
  ];

  const restaurantData = {
    name: placesData?.name || selectedLocation?.split(',')[0]?.trim() || 'Restaurant',
    address: placesData?.address || '',
    rating: placesData?.rating || null,
    reviewCount: placesData?.reviewCount || null,
    website,
    audit: audit ? { performance: audit.performance, seo: audit.seo, hasHttps: audit.hasHttps, hasGzip: audit.hasGzip, hasSchemaOrg: audit.hasSchemaOrg, responseTimeMs: audit.responseTimeMs, opportunities: audit.opportunities } : null,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">04 Website & Ordering</h1>
      <p className="text-slate-400 mb-6">Audit UX, conversie, performanță tehnică și optimizare comenzi online</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <div key={i} className={"p-4 rounded-xl border " + c.color}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-slate-800">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>
      {audit?.opportunities?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-amber-800 mb-2">⚠️ Probleme detectate:</p>
          <ul className="space-y-1">
            {audit.opportunities.map((o: string, i: number) => <li key={i} className="text-sm text-amber-700">• {o}</li>)}
          </ul>
        </div>
      )}
      {!website && !placesLoading && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 mb-4">
          ⚠️ Restaurantul nu are website public în Google Maps. Auditul se va baza pe recomandări standard.
        </div>
      )}
      <LiveModuleGenerator location={selectedLocation} title="Audit Website & Ordering" prompt={WEBSITE_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
