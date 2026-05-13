import { useState, useEffect } from 'react';
import { usePlacesData } from '../hooks/usePlacesData';
import LiveModuleGenerator from '../components/LiveModuleGenerator';

interface WebsiteAudit {
  performance: number | null; seo: number | null;
  accessibility: number | null; bestPractices: number | null;
  lcp: string | null; fcp: string | null; cls: string | null;
  tbt: string | null; tti: string | null;
  pagespeed: boolean; hasHttps: boolean;
  responseTimeMs: number; htmlSizeKb: number;
  hasGzip: boolean; hasCacheControl: boolean;
  hasTitle: boolean; hasMetaDesc: boolean; hasH1: boolean;
  hasSchemaOrg: boolean; imgTotal: number; imgNoAlt: number;
  opportunities: string[]; error?: string;
}

const scoreColor = (s: number | null | undefined) => {
  if (s === undefined) return 'text-slate-400';
  if (s === null) return 'text-slate-400';
  if (s >= 0.9) return 'text-emerald-600';
  if (s >= 0.5) return 'text-amber-500';
  return 'text-red-500';
};

const scoreBg = (s: number | null | undefined) => {
  if (s === undefined) return 'bg-slate-100';
  if (s === null) return 'bg-slate-100';
  if (s >= 0.9) return 'bg-emerald-50 border-emerald-200';
  if (s >= 0.5) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
};

const pct = (s: number | null | undefined) => s !== null && s !== undefined ? `${Math.round(s * 100)}` : '—';

export default function Module04_Website({ selectedLocation }: { selectedLocation?: string }) {
  const { data: placesData, loading: placesLoading } = usePlacesData(selectedLocation);
  const [audit, setAudit] = useState<WebsiteAudit | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [isSocialOnly, setIsSocialOnly] = useState(false);

  useEffect(() => {
    if (!placesData?.website) return;
    const w = placesData.website;
    const social = /facebook\.com|instagram\.com|tiktok\.com/i.test(w);
    setIsSocialOnly(social);
    if (social) return;
    setAuditLoading(true);
    fetch(`/api/website/audit?url=${encodeURIComponent(w)}`)
      .then(r => r.json())
      .then(d => { setAudit(d); setAuditLoading(false); })
      .catch(() => setAuditLoading(false));
  }, [placesData?.website]);

  const hasWebsite = !!placesData?.website && !isSocialOnly;

  const auditJson = audit ? JSON.stringify({
    restaurantName: placesData?.name,
    website: placesData?.website,
    isSocialOnly,
    hasWebsite,
    audit
  }, null, 2) : null;

const buildWebsitePrompt = (rd: any): string => {
  const hasSite = rd.hasWebsite && rd.website && !rd.isSocialOnly;
  const isSocial = rd.isSocialOnly;
  const audit = rd.audit || {};
  const pct = (v: any) => v != null ? `${Math.round(v * 100)}` : 'N/A';

  let structure = '';
  if (!hasSite && !isSocial) {
    structure = `### 1. Diagnostic Actual
▸ Website LIPSĂ — impact critic asupra credibilității și SEO local în ${rd.address || 'zona ta'}
▸ De ce un site propriu convertește mai bine decât Facebook/Instagram

### 2. Pași Critici de Lansare (Rapid & Cost-Eficient)
▸ 2 soluții rapide (ex: meniu digital QR, integrare comenzi WhatsApp/Glovo)
▸ 1 acțiune de legătură cu GBP (buton "Comandă online", link în descriere)

### 3. SEO Local & Conversie
▸ Cum capitalizezi pe rating-ul ${rd.rating}⭐ și cele ${rd.reviewCount} recenzii fără website
▸ 2 cuvinte cheie locale de pregătit pentru viitorul homepage

### 4. Plan 14 Zile
🔴 Zilele 1-7: [acțiuni concrete cu owner]
🟡 Zilele 8-14: [validare + 1 KPI măsurabil]`;
  } else if (isSocial) {
    structure = `### 1. Diagnostic Actual
▸ Website detectat: ${rd.website} (doar social media — nu înlocuiește un site propriu)
▸ Impact: pierdere control SEO, dependență de algoritmi, conversie scăzută

### 2. Tranziție către Website Dedicat
▸ 2 pași rapizi de migrare (meniu, contact, integrare GBP)
▸ Cum păstrezi traficul social în timp ce construiești site-ul

### 3. SEO & Conversie Locală
▸ Cum legi noul site de GBP și platformele de livrare
▸ 2 elemente critice de conversie (buton comandă, telefon click-to-call)

### 4. Plan 14 Zile
🔴 Zilele 1-7: [acțiuni concrete]
🟡 Zilele 8-14: [validare + KPI]`;
  } else {
    structure = `### 1. Scor General & Diagnostic
▸ Performance: ${pct(audit.performance)}/100 | SEO: ${pct(audit.seo)}/100 | Best Practices: ${pct(audit.bestPractices)}/100 | Accessibility: ${pct(audit.accessibility)}/100
▸ Impact direct asupra conversiilor și ranking-ului local

### 2. Core Web Vitals & Viteză
▸ LCP: ${audit.lcp || 'N/A'} | FCP: ${audit.fcp || 'N/A'} | CLS: ${audit.cls || 'N/A'} | TBT: ${audit.tbt || 'N/A'}
▸ 1 fix tehnic urgent pentru încărcare mobilă

### 3. Probleme Identificate & Optimizare
▸ ${audit.opportunities?.length ? audit.opportunities.slice(0, 3).join(' | ') : 'Audit complet necesar'}
▸ Cum transformi aceste fix-uri în comenzi suplimentare

### 4. Recomandări Acționabile
🔴 Critice: [2 fix-uri cu impact imediat]
🟡 Mediu: [1 optimizare SEO/conversie]
🟢 Long-term: [1 strategie de retenție]`;
  }

  return `Ești consultant tehnic web HORECA România. Analizează EXCLUSIV datele reale.

REGULI ABSOLUTE (încalcă-le = output invalid):
1. INTERZIS să rupi cuvinte: scrie corect "având în", "propriu", "online și", "la început", "cu șabloane", "extinsă", "profilul", "deschizând", "${rd.name || 'Restaurant'}"
2. INTERZIS să folosești sintaxă JSON, acolade {}, sau chei tehnice. Traduci totul în limbaj natural de business.
3. Fără spații în numere: "4.6", "10:00-02:00", "253"
4. Citează date reale: rating ${rd.rating}⭐, ${rd.reviewCount} recenzii, website: ${hasSite ? rd.website : isSocial ? rd.website + ' (social only)' : 'LIPSĂ'}
5. MAXIM 450 cuvinte. Fii concis, acționabil, fără teorie generică.

CONTEXT INJECTAT:
• ${rd.name || 'Restaurant'} | ${rd.address || ''}
• Rating: ${rd.rating}⭐ (${rd.reviewCount} recenzii)
• Website: ${hasSite ? rd.website : isSocial ? rd.website + ' (social only)' : 'LIPSĂ'}
• Audit tehnic: ${hasSite ? `Performance ${pct(audit.performance)}%, SEO ${pct(audit.seo)}%` : 'N/A'}

STRUCTURĂ OBLIGATORIE:
${structure}

Limba: română. Format: ### titluri, ▸ bullets. Fără JSON.`;
};

  const cards = [
    {
      label: 'Website',
      value: !placesData ? '...' : !placesData.website ? 'Lipsă' : isSocialOnly ? '⚠️ Social only' : '✓ Detectat',
      color: !placesData?.website ? 'text-red-500' : isSocialOnly ? 'text-amber-500' : 'text-emerald-600'
    },
    {
      label: 'Performance',
      value: auditLoading ? '...' : audit ? `${pct(audit.performance)}/100` : placesData?.website ? '—' : 'N/A',
      color: scoreColor(audit?.performance ?? null)
    },
    {
      label: 'SEO Score',
      value: auditLoading ? '...' : audit ? `${pct(audit.seo)}/100` : placesData?.website ? '—' : 'N/A',
      color: scoreColor(audit?.seo ?? null)
    },
    {
      label: 'HTTPS',
      value: auditLoading ? '...' : audit ? (audit.hasHttps ? '✓ Activ' : '✗ Lipsă') : 'N/A',
      color: audit?.hasHttps ? 'text-emerald-600' : 'text-red-500'
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">04 Website Audit</h1>
      <p className="text-slate-400 mb-6">Analiză tehnică: viteză, SEO, mobile-friendly, securitate</p>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Scoruri detaliate */}
      {audit && !audit.error && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Performance', val: audit.performance },
            { label: 'SEO', val: audit.seo },
            { label: 'Best Practices', val: audit.bestPractices },
            { label: 'Accessibility', val: audit.accessibility },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-4 ${scoreBg(s.val)}`}>
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${scoreColor(s.val)}`}>{pct(s.val)}</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                <div
                  className={`h-1.5 rounded-full ${s.val !== null && s.val >= 0.9 ? 'bg-emerald-500' : s.val !== null && s.val >= 0.5 ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${s.val !== null ? Math.round(s.val * 100) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Core Web Vitals */}
      {audit && (audit.lcp || audit.fcp || audit.cls) && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <p className="text-sm font-semibold text-slate-700 mb-3">Core Web Vitals {audit.pagespeed ? '(PageSpeed real)' : '(estimat)'}</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'LCP', val: audit.lcp },
              { label: 'FCP', val: audit.fcp },
              { label: 'CLS', val: audit.cls },
              { label: 'TBT', val: audit.tbt },
              { label: 'TTI', val: audit.tti },
            ].filter(v => v.val).map(v => (
              <div key={v.label} className="text-center">
                <p className="text-xs text-slate-400">{v.label}</p>
                <p className="text-sm font-bold text-slate-800">{v.val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opportunities */}
      {audit?.opportunities && audit.opportunities.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-amber-700 mb-2">⚠️ Probleme detectate</p>
          <ul className="space-y-1">
            {audit.opportunities.map((o, i) => (
              <li key={i} className="text-sm text-amber-800">▸ {o}</li>
            ))}
          </ul>
        </div>
      )}

      {/* No website */}
      {placesData && !placesData.website && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-red-700">❌ Website lipsă</p>
          <p className="text-sm text-red-600 mt-1">Restaurantul nu are website propriu — impact negativ major asupra credibilității și SEO local.</p>
        </div>
      )}

      {/* Social only */}
      {isSocialOnly && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-amber-700">⚠️ Social Media detectat ca website</p>
          <p className="text-sm text-amber-600 mt-1">{placesData?.website} — Nu este un website propriu.</p>
        </div>
      )}

      {/* AI Generator */}
      {placesData && !placesLoading && !auditLoading && (
        <LiveModuleGenerator
          title="Website Audit"
          prompt={buildWebsitePrompt({ ...placesData, audit, isSocialOnly, hasWebsite })}
          restaurantData={{ ...placesData, audit, isSocialOnly, hasWebsite }}
          location={selectedLocation}
        />
      )}
    </div>
  );
}
