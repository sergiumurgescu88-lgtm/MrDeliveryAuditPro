import { useState, useEffect } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData } from '../hooks/usePlacesData';

const buildLocalSeoPrompt = (rd: any): string => {
  const seo = rd.seo || {};
  const pos = seo.position ? `#${seo.position}` : "Necunoscut";
  const competitors = seo.competitors?.length
    ? seo.competitors.map((c: string, i: number) => `#${i+1} ${c}`).join(", ")
    : "Necunoscuți";
  const checklistStatus = [
    seo.hasWebsite ? "✅ Website conectat" : "❌ Website lipsă",
    seo.hasPhone ? "✅ Telefon verificat" : "❌ Telefon nelistat",
    seo.hasHours ? "✅ Program complet" : "❌ Program incomplet",
    seo.hasPhotos ? "✅ Fotografii prezente" : "❌ Fără fotografii",
  ].join(" | ");

  return `Ești expert SEO local HORECA România. Realizează un audit complet pentru restaurantul **${rd.name}** (rating: ${rd.rating || "N/A"}/5, ${rd.reviewCount || "?"} recenzii, adresă: ${rd.address || "N/A"}).

DATE REALE GBP:
- Poziție în Local Pack: ${pos}
- Competitori detectați: ${competitors}
- Website: ${rd.website || "Lipsă"}
- Telefon: ${rd.phone || "Nelistat"}
- Status GBP: ${checklistStatus}

STRUCTURĂ OBLIGATORIE:

### 1. Optimizare GBP
Bazat pe statusul actual (${checklistStatus}), acțiuni concrete: categorie primară/secundare, descriere cu cuvinte cheie locale, atribute relevante, Q&A predefinit, postări săptămânale cu CTA.

### 2. Citări locale & NAP
Consistență Name/Address/Phone pe directoarele românești (Pagini Aurii, Romanian Business Register, TripAdvisor, Zomato). Detectează discrepanțe față de adresa reală: **${rd.address}**.

### 3. Dominanță Local Pack
Față de competitorii detectați (${competitors}): factori de ranking — proximitate, review velocity, backlinks locali. Cum urcă ${rd.name} de la ${pos} la Top 3.

### 4. Strategie vizibilitate
Google Posts săptămânale (format + CTA), foto recurente (frecvență, categorii), UTM tracking pentru calls/directions, review velocity target bazat pe ${rd.reviewCount || "?"} recenzii actuale.

### 5. KPIs lunari
Impressions, Direction Requests, Phone Calls, Website Clicks — valori target realiste pentru ${rd.name}.

REGULI OBLIGATORII:
- Citează ÎNTOTDEAUNA datele reale (rating ${rd.rating}, adresa exactă, poziția ${pos}, competitorii găsiți)
- Nu rupe cuvintele în mijloc
- Maxim 600 cuvinte total
- Limba: română`;
};

interface SeoRank { position: number | null; query: string; competitors: string[]; }

export default function Module08_LocalMapsSEO({ selectedLocation }: { selectedLocation?: string }) {
  const { data: placesData, loading: placesLoading } = usePlacesData(selectedLocation);
  const [seoRank, setSeoRank] = useState<SeoRank>({ position: null, query: '', competitors: [] });
  const [seoLoading, setSeoLoading] = useState(true);

  useEffect(() => {
    if (!selectedLocation) { setSeoLoading(false); return; }
    const parts = selectedLocation.split(',');
    const name = parts[0]?.trim();
    const city = parts[1]?.trim() || '';
    setSeoLoading(true);
    fetch(`/api/localseo/rank?name=${encodeURIComponent(name)}&type=restaurant&city=${encodeURIComponent(city)}`)
      .then(r => r.json())
      .then(d => { setSeoRank(d); setSeoLoading(false); })
      .catch(() => setSeoLoading(false));
  }, [selectedLocation]);

  const loading = placesLoading || seoLoading;
  const reviews = placesData?.reviewCount || 0;
  const hasWebsite = !!placesData?.website;
  const hasPhone = !!placesData?.phone;
  const hasHours = (placesData?.openingHours?.length || 0) > 0;
  const hasPhotos = (placesData as any)?.photos?.length > 0;
  const imp = Math.round(reviews * 2.2);

  const checklist = [
    hasWebsite ? '✅ Website conectat la GBP' : '❌ Website lipsă din GBP',
    hasPhone ? '✅ Telefon verificat' : '❌ Telefon nelista',
    hasHours ? '✅ Program complet configurat' : '❌ Program incomplet',
    hasPhotos ? '✅ Fotografii încărcate' : '❌ Fără fotografii',
    '⚠️ Descriere cu 3 cuvinte cheie locale',
    '❌ Google Posts săptămânale cu CTA',
  ];

  const positionLabel = () => {
    if (seoLoading) return '🔄...';
    if (!seoRank.position) return 'Necunoscut';
    if (seoRank.position <= 3) return `#${seoRank.position} 🏆`;
    if (seoRank.position <= 10) return `#${seoRank.position} ✅`;
    return `#${seoRank.position} ⚠️`;
  };

  const cards = [
    { label: 'Poziție SERP Local', value: loading ? '🔄...' : positionLabel(), sub: seoRank.query || 'Google Maps ranking', color: seoRank.position && seoRank.position <= 3 ? 'bg-emerald-50 border-emerald-200' : 'bg-indigo-50 border-indigo-200' },
    { label: 'GBP Impressions Est.', value: loading ? '🔄...' : `${(imp/1000).toFixed(1)}k/lună`, sub: 'Bazat pe recenzii', color: 'bg-blue-50 border-blue-200' },
    { label: 'Direction Requests', value: loading ? '🔄...' : `${Math.round(imp * 0.08)}/lună`, sub: 'Trafic fizic estimat', color: 'bg-amber-50 border-amber-200' },
    { label: 'Phone Calls Est.', value: loading ? '🔄...' : `${Math.round(imp * 0.05)}/lună`, sub: 'Direct din Maps', color: 'bg-violet-50 border-violet-200' },
  ];

  const parts = (selectedLocation || '').split(',');
  const restaurantData = {
    name: placesData?.name || parts[0]?.trim() || 'Restaurant',
    address: placesData?.address || parts.slice(1).join(',').trim() || '',
    rating: placesData?.rating || null,
    reviewCount: placesData?.reviewCount || null,
    website: placesData?.website || null,
    phone: placesData?.phone || null,
    openingHours: placesData?.openingHours || [],
    seo: {
      position: seoRank.position,
      query: seoRank.query,
      competitors: seoRank.competitors,
      hasWebsite,
      hasPhone,
      hasHours,
      hasPhotos,
    },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">08 Local Maps SEO</h1>
      <p className="text-slate-400 mb-6">Optimizare Google Business Profile, citări locale și dominanță în căutările de proximitate</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <div key={i} className={`p-4 rounded-xl border ${c.color}`}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-slate-800">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {seoRank.competitors.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">🏆 Competitori în Local Pack</h3>
          <ul className="space-y-1">
            {seoRank.competitors.map((c, i) => (
              <li key={i} className="text-sm text-slate-600">#{i + 1} {c}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">✅ GBP Optimization Checklist</h3>
        <ul className="space-y-2">
          {loading ? <li className="text-sm text-slate-400">🔄 Se încarcă datele...</li> : checklist.map((item, i) => (
            <li key={i} className="text-sm text-slate-600">{item}</li>
          ))}
        </ul>
      </div>

      <LiveModuleGenerator location={selectedLocation} title="Audit Local Maps SEO & GBP" prompt={buildLocalSeoPrompt(restaurantData)} restaurantData={restaurantData} />
    </div>
  );
}
