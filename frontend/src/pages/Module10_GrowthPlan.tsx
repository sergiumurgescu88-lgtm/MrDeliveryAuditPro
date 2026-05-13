import { useEffect, useState } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData } from '../hooks/usePlacesData';

const GROWTH_PROMPT = `Plan complet de creștere pe 90 de zile pentru restaurant. Folosește TOATE datele agregate din JSON (SEO, social, delivery, website, meniu, recenzii, foto). Structură obligatorie:
1. Diagnostic Rapid (scor per modul: ce e bun, ce e critic, quick wins imediate)
2. Roadmap 90 Zile (Sprint-uri: Săptămânile 1-2 Quick Wins, 3-6 Core Improvements, 7-12 Growth Levers) — bazat pe gap-urile reale din date
3. Matrice de Prioritizare (Impact vs Efort) — cu acțiuni specifice din datele primite
4. KPI Dashboard (Baseline actual vs Target 90 zile: rating, review velocity, social followers, AOV, conversie website)
5. Moonshot Idea — o strategie neconvențională cu potențial viral local, specifică acestui restaurant
Ton: growth strategist HORECA România, focus pe ROI, execuție rapidă, metrici clare. Limba: română.`;

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
        prompt={GROWTH_PROMPT}
        restaurantData={restaurantData}
      />
    </div>
  );
}
