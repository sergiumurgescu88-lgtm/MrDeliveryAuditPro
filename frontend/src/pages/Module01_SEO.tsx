import { motion } from 'framer-motion';
import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData, getReviewVelocity } from '../hooks/usePlacesData';

const SEO_PROMPT = `Analiză SEO locală detaliată pentru restaurantul furnizat. Folosind EXCLUSIV datele reale din JSON (rating, recenzii, website, tipuri, ore, telefon, GBP score), generează:
1. Audit GBP (Google Business Profile) — completitudine, câmpuri lipsă, scor estimat și impact asupra ranking-ului
2. Cuvinte cheie cu intenție ridicată (high-intent) specifice tipului de cuisine și locației din date
3. Analiza competiției locale — pe baza tipului de business și locației, estimează competitori direcți și gap-uri de oportunitate
4. Strategie de diferențiere — bazată pe punctele forte reale (rating exact, volum recenzii, unicitate din tipuri)
5. Recomandări on-page & off-page — concrete, prioritizate
6. Plan de acțiune 30 de zile (Quick Wins / Medium / Long-term) cu KPIs măsurabili
IMPORTANT: Citează mereu datele reale (ex: "cu rating-ul tău de X și Y recenzii..."). Nu inventa statistici. Limba: română.`;

export default function Module01_SEO({ selectedLocation }: { selectedLocation?: string }) {
  const { data: placesData, loading } = usePlacesData(selectedLocation);

  const rating = placesData?.rating || null;
  const reviews = placesData?.reviewCount || 0;
  const hasWebsite = !!placesData?.website;
  const hasPhone = !!placesData?.phone;
  const hasHours = (placesData?.openingHours?.length || 0) > 0;
  const reviewVelocity = reviews ? getReviewVelocity(reviews) : 'N/A';

  const gbpScore = Math.round(
    (rating ? 20 : 0) +
    (reviews > 50 ? 20 : reviews > 10 ? 10 : 0) +
    (hasWebsite ? 20 : 0) +
    (hasPhone ? 20 : 0) +
    (hasHours ? 20 : 0)
  );

  const cards = [
    {
      label: 'GBP Completeness',
      value: loading ? '🔄...' : `${gbpScore}/100`,
      sub: gbpScore >= 80 ? '✅ Profil complet' : gbpScore >= 60 ? '⚠️ Câmpuri lipsă' : '❌ Profil incomplet',
      color: gbpScore >= 80 ? 'bg-emerald-50 border-emerald-200' : gbpScore >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200',
    },
    {
      label: 'Rating Google',
      value: loading ? '🔄...' : rating ? `${rating} ⭐` : 'N/A',
      sub: `${reviews.toLocaleString()} recenzii totale`,
      color: rating && rating >= 4.3 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200',
    },
    {
      label: 'Review Velocity',
      value: loading ? '🔄...' : reviewVelocity,
      sub: 'Industry avg: 5/lună',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      label: 'Prezență Web',
      value: loading ? '🔄...' : hasWebsite ? '✅ Website activ' : '❌ Fără website',
      sub: hasPhone ? '✅ Telefon listat' : '⚠️ Telefon lipsă',
      color: hasWebsite ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200',
    },
  ];

  const parts = (selectedLocation || '').split(',');
  const restaurantData = {
    name: placesData?.name || parts[0]?.trim() || 'Restaurant',
    address: placesData?.address || parts.slice(1).join(',').trim() || '',
    rating,
    reviewCount: reviews,
    website: placesData?.website || null,
    phone: placesData?.phone || null,
    types: placesData?.types || [],
    openingHours: placesData?.openingHours || [],
    isOpenNow: placesData?.isOpenNow ?? null,
    recentReviews: placesData?.recentReviews || [],
    summary: placesData?.summary || null,
    gbpScore,
    hasWebsite,
    hasPhone,
    hasHours,
    reviewVelocity,
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">01 SEO Analysis</h1>
      <p className="text-slate-400 mb-6">Audit GBP, cuvinte cheie cu intenție ridicată și strategie de vizibilitate locală</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <div key={i} className={`p-4 rounded-xl border ${c.color}`}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-slate-800">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {!loading && placesData && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">✅ GBP Checklist</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>{rating ? `✅ Rating ${rating}⭐ (${reviews} recenzii)` : '❌ Fără rating sau recenzii'}</li>
            <li>{hasWebsite ? `✅ Website conectat: ${placesData.website}` : '❌ Website lipsă din GBP'}</li>
            <li>{hasPhone ? `✅ Telefon verificat: ${placesData.phone}` : '❌ Telefon nelistat'}</li>
            <li>{hasHours ? '✅ Program complet configurat' : '❌ Ore de funcționare lipsă'}</li>
            <li>{(placesData.photos?.length || 0) > 0 ? `✅ ${placesData.photos?.length || 0} fotografii încărcate` : '❌ Fără fotografii'}</li>
            <li>⚠️ Verifică descriere cu 3 cuvinte cheie locale</li>
            <li>⚠️ Google Posts săptămânale cu CTA</li>
          </ul>
        </div>
      )}

      <LiveModuleGenerator
        location={selectedLocation}
        title="Analiză SEO Locală"
        prompt={SEO_PROMPT}
        restaurantData={restaurantData}
      />
    </motion.div>
  );
}
