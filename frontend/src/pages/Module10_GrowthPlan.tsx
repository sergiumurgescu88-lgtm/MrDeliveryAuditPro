import { useEffect, useState } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData } from '../hooks/usePlacesData';

const buildGrowthPrompt = (rd: any): string => {
  const scores = rd.scores || {};
  const scoreLines = [
    `SEO Local: ${Math.round(scores.seo || 0)}/10`,
    `Social Media: ${Math.round(scores.social || 0)}/10`,
    `Website: ${Math.round(scores.website || 0)}/10`,
    `Delivery: ${Math.round(scores.delivery || 0)}/10`,
    `Recenzii: ${Math.round(scores.reviews || 0)}/10`,
    `Meniu: ${Math.round(scores.menu || 0)}/10`,
  ].join(" | ");

  const socialStatus = rd.social
    ? [
        rd.social.instagram ? `Instagram ✅` : `Instagram ❌`,
        rd.social.facebook  ? `Facebook ✅`  : `Facebook ❌`,
        rd.social.youtube   ? `YouTube ✅`   : `YouTube ❌`,
        rd.social.tiktok    ? `TikTok ✅`    : `TikTok ❌`,
      ].join(", ")
    : "Date social indisponibile";

  const deliveryStatus = rd.delivery
    ? [
        rd.delivery.glovo ? `Glovo ✅` : `Glovo ❌`,
        rd.delivery.bolt  ? `Bolt ✅`  : `Bolt ❌`,
        rd.delivery.tazz  ? `Tazz ✅`  : `Tazz ❌`,
      ].join(", ")
    : "Date delivery indisponibile";

  const seoStatus = rd.seo?.position
    ? `Poziție #${rd.seo.position}, competitori: ${rd.seo.competitors?.slice(0,2).join(", ") || "necunoscuți"}`
    : "Poziție necunoscută";

  const websiteStatus = rd.websiteAudit
    ? `Score ${rd.websiteAudit.score || "N/A"}/100, SSL: ${rd.websiteAudit.hasSSL ? "✅" : "❌"}, Mobile: ${rd.websiteAudit.isMobile ? "✅" : "❌"}`
    : rd.website ? "Website prezent, audit indisponibil" : "Fără website";

  const menuStatus = rd.menuDishes?.length
    ? `${rd.menuDishes.length} preparate identificate, star: ${rd.topDish || "N/A"}`
    : "Preparate neidentificate";

  const weakModules = Object.entries(scores)
    .filter(([, v]) => (v as number) < 5)
    .map(([k]) => k)
    .join(", ") || "niciun modul critic";

  const strongModules = Object.entries(scores)
    .filter(([, v]) => (v as number) >= 7)
    .map(([k]) => k)
    .join(", ") || "niciun modul performant";

  return `Ești growth strategist HORECA România. Creează un plan de creștere pe 90 de zile pentru restaurantul **${rd.name}** (rating: ${rd.rating || "N/A"}/5, ${rd.reviewCount || "?"} recenzii).

SCORURI ACTUALE PER MODUL (0-10):
${scoreLines}
Scor global: **${rd.globalScore}/10**

DATE REALE AGREGATE:
- Social Media: ${socialStatus}
- Delivery: ${deliveryStatus}
- SEO Local: ${seoStatus}
- Website: ${websiteStatus}
- Meniu: ${menuStatus}
- Recenzii recente: ${rd.recentReviews?.length || 0} disponibile

DIAGNOSTIC:
- Module slabe (sub 5): ${weakModules}
- Module performante (7+): ${strongModules}

STRUCTURĂ OBLIGATORIE:

### 1. Diagnostic Rapid
Bazat pe scorurile reale de mai sus: ce funcționează (${strongModules}), ce e critic (${weakModules}), 3 quick wins care pot fi implementate azi.

### 2. Roadmap 90 Zile
▸ **Săptămânile 1-2 — Quick Wins**: acțiuni cu efort mic și impact imediat, specific pentru ${rd.name}
▸ **Săptămânile 3-6 — Core Improvements**: fix-uri pentru modulele slabe (${weakModules})
▸ **Săptămânile 7-12 — Growth Levers**: strategii de creștere bazate pe modulele performante (${strongModules})

### 3. Matrice Prioritizare (Impact vs Efort)
Top 6 acțiuni concrete din datele reale, clasificate: Impact Mare/Efort Mic → Impact Mare/Efort Mare.

### 4. KPI Dashboard
Baseline actual vs Target 90 zile pentru: rating (${rd.rating} → ?), review velocity, platforme social active (${Object.values(rd.social || {}).filter(Boolean).length}/4 → 4/4), delivery (${[rd.delivery?.glovo, rd.delivery?.bolt, rd.delivery?.tazz].filter(Boolean).length}/3 → 3/3).

### 5. Moonshot Idea
O strategie neconvențională cu potențial viral local, specifică pentru **${rd.name}** și publicul său.

REGULI OBLIGATORII:
- Citează ÎNTOTDEAUNA scorurile reale, modulele slabe și datele agregate
- Nu rupe cuvintele în mijloc
- Maxim 700 cuvinte total
- Limba: română`;
};

interface AggregatedData {
  social: { instagram: string | null; facebook: string | null; youtube: string | null; tiktok: string | null } | null;
  seo: { position: number | null; query: string; competitors: string[]; confidence: string } | null;
  website: { score: number | null; lcp: number | null; cls: number | null; fid: number | null; hasSSL: boolean; isMobile: boolean } | null;
  delivery: { glovo: boolean; bolt: boolean; tazz: boolean } | null;
  dishes: { dishes: any[]; topDish: string | null; summary: string | null; reviewsAnalyzed: number } | null;
}

function ScoreBar({ label, score, max = 10, color }: { label: string; score: number; max?: number; color: string }) {
  const pct = Math.min(100, (score / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">{score}/{max}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Module10_GrowthPlan({ selectedLocation }: { selectedLocation?: string }) {
  const { data: placesData, loading } = usePlacesData(selectedLocation);
  const [aggData, setAggData] = useState<AggregatedData>({ social: null, seo: null, website: null, delivery: null, dishes: null });
  const [aggLoading, setAggLoading] = useState(false);
  const [aggDone, setAggDone] = useState(false);

  const rating = placesData?.rating || 0;
  const reviews = placesData?.reviewCount || 0;

  useEffect(() => {
    if (!placesData?.placeId || aggDone) return;
    setAggLoading(true);

    const name = encodeURIComponent(placesData.name || '');
    const city = encodeURIComponent((placesData.address || '').split(',').pop()?.trim() || 'Bucuresti');
    const placeId = placesData.placeId;
    const website = encodeURIComponent(placesData.website || '');
    const type = encodeURIComponent((placesData.types?.[0] || 'restaurant').replace('_', ' '));

    Promise.allSettled([
      fetch(`/api/social/find?name=${name}&city=${city}&website=${website}`).then(r => r.json()),
      fetch(`/api/localseo/rank?name=${name}&type=${type}&city=${city}&rating=${rating}&reviewCount=${reviews}&placeId=${placeId}`).then(r => r.json()),
      placesData.website ? fetch(`/api/website/audit?url=${encodeURIComponent(placesData.website)}`).then(r => r.json()) : Promise.resolve(null),
      fetch(`/api/delivery/check?name=${name}&city=${city}`).then(r => r.json()),
      fetch(`/api/menu/dishes?placeId=${placeId}&restaurantName=${name}`).then(r => r.json()),
    ]).then(([social, seo, website, delivery, dishes]) => {
      setAggData({
        social:   social.status   === 'fulfilled' ? social.value   : null,
        seo:      seo.status      === 'fulfilled' ? seo.value      : null,
        website:  website.status  === 'fulfilled' ? website.value  : null,
        delivery: delivery.status === 'fulfilled' ? delivery.value : null,
        dishes:   dishes.status   === 'fulfilled' ? dishes.value   : null,
      });
      setAggDone(true);
      setAggLoading(false);
    });
  }, [placesData?.placeId]);

  // Calculăm scoruri per modul (0-10)
  const scores = {
    seo:      aggData.seo?.position ? Math.max(1, 10 - (aggData.seo.position - 1)) : (rating >= 4.3 ? 6 : 4),
    social:   [aggData.social?.instagram, aggData.social?.facebook, aggData.social?.youtube, aggData.social?.tiktok].filter(Boolean).length * 2.5,
    website:  aggData.website?.score ? Math.round(aggData.website.score / 10) : (placesData?.website ? 5 : 1),
    delivery: aggData.delivery ? ([aggData.delivery.glovo, aggData.delivery.bolt, aggData.delivery.tazz].filter(Boolean).length / 3) * 10 : 0,
    reviews:  rating ? Math.round(((rating - 1) / 4) * 10) : 5,
    menu:     aggData.dishes?.dishes?.length ? Math.min(10, aggData.dishes.dishes.length) : 3,
  };
  const globalScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);

  const socialCount = aggData.social ? [aggData.social.instagram, aggData.social.facebook, aggData.social.youtube, aggData.social.tiktok].filter(Boolean).length : 0;
  const deliveryCount = aggData.delivery ? [aggData.delivery.glovo, aggData.delivery.bolt, aggData.delivery.tazz].filter(Boolean).length : 0;

  const restaurantData = {
    // Date de bază
    name: placesData?.name || selectedLocation?.split(',')[0]?.trim() || 'Restaurant',
    address: placesData?.address || '',
    rating, reviewCount: reviews,
    website: placesData?.website || null,
    phone: placesData?.phone || null,
    priceLevel: placesData?.priceLevel || null,
    types: placesData?.types || [],
    openingHours: placesData?.openingHours || [],
    recentReviews: placesData?.recentReviews || [],
    // Date agregate din toate modulele
    social: aggData.social,
    seo: aggData.seo,
    websiteAudit: aggData.website,
    delivery: aggData.delivery,
    menuDishes: aggData.dishes?.dishes || [],
    topDish: aggData.dishes?.topDish || null,
    // Scoruri calculate
    scores,
    globalScore,
  };

  const statusColor = (v: boolean | null | undefined) => v ? 'text-emerald-600' : 'text-red-400';
  const statusIcon  = (v: boolean | null | undefined) => v ? '✅' : '❌';

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">10 Growth Plan</h1>
      <p className="text-slate-400">Roadmap 90 zile bazat pe date reale din toate modulele</p>

      {/* Global Score */}
      <div className="bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Scor Global Restaurant</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black text-slate-800">{loading || aggLoading ? '—' : globalScore}</span>
              <span className="text-slate-400 text-lg mb-1">/10</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">Status</p>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              globalScore >= 7 ? 'bg-emerald-100 text-emerald-700' :
              globalScore >= 5 ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-600'
            }`}>
              {globalScore >= 7 ? '🚀 Performant' : globalScore >= 5 ? '⚠️ Are Potențial' : '🔴 Necesită Atenție'}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ScoreBar label="SEO Local" score={Math.round(scores.seo)} color="bg-blue-400" />
          <ScoreBar label="Social Media" score={Math.round(scores.social)} color="bg-pink-400" />
          <ScoreBar label="Website" score={Math.round(scores.website)} color="bg-purple-400" />
          <ScoreBar label="Delivery" score={Math.round(scores.delivery)} color="bg-orange-400" />
          <ScoreBar label="Recenzii" score={Math.round(scores.reviews)} color="bg-emerald-400" />
          <ScoreBar label="Meniu" score={Math.round(scores.menu)} color="bg-amber-400" />
        </div>
      </div>

      {/* Status snapshot */}
      {aggLoading && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-3 text-slate-400 text-sm">
          <div className="w-5 h-5 border-2 border-slate-200 border-t-violet-500 rounded-full animate-spin" />
          Agreghez date din toate modulele...
        </div>
      )}

      {aggDone && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Social */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">📱 Social Media ({socialCount}/4 platforme)</h3>
            <div className="space-y-1.5">
              {[
                { label: 'Instagram', val: aggData.social?.instagram },
                { label: 'Facebook',  val: aggData.social?.facebook },
                { label: 'YouTube',   val: aggData.social?.youtube },
                { label: 'TikTok',    val: aggData.social?.tiktok },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{label}</span>
                  {val
                    ? <a href={val} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate max-w-[200px]">{val.replace('https://', '')}</a>
                    : <span className="text-red-400">Negăsit</span>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">🛵 Delivery ({deliveryCount}/3 platforme)</h3>
            <div className="space-y-1.5">
              {[
                { label: 'Glovo', val: aggData.delivery?.glovo },
                { label: 'Bolt Food', val: aggData.delivery?.bolt },
                { label: 'Tazz', val: aggData.delivery?.tazz },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{label}</span>
                  <span className={statusColor(val)}>{statusIcon(val)} {val ? 'Prezent' : 'Lipsă'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">📍 SEO Local</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Poziție estimată</span>
                <span className="font-medium">{aggData.seo?.position ? `#${aggData.seo.position}` : 'Necunoscut'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Query</span>
                <span className="text-slate-700">{aggData.seo?.query || '—'}</span>
              </div>
              {aggData.seo?.competitors?.length ? (
                <div>
                  <span className="text-slate-500">Competitori: </span>
                  <span className="text-slate-700">{aggData.seo.competitors.slice(0, 2).join(', ')}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Meniu */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">🍽️ Meniu din Recenzii</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Preparate identificate</span>
                <span className="font-medium">{aggData.dishes?.dishes?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Preparat star</span>
                <span className="font-medium text-amber-600">{aggData.dishes?.topDish || '—'}</span>
              </div>
              {aggData.dishes?.summary && (
                <p className="text-slate-500 italic mt-1">{aggData.dishes.summary}</p>
              )}
            </div>
          </div>

        </div>
      )}

      <LiveModuleGenerator
        location={selectedLocation}
        title="Plan de Creștere 90 Zile"
        prompt={buildGrowthPrompt(restaurantData)}
        restaurantData={restaurantData}
      />
    </div>
  );
}
