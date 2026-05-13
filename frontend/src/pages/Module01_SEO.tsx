import { motion } from 'framer-motion';
import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData, getReviewVelocity } from '../hooks/usePlacesData';

const SEO_PROMPT = `Ești un consultant SEO local senior specializat în HORECA România. Analizează EXCLUSIV datele reale din JSON și generează un audit structurat.

REGULI OBLIGATORII:
- Citează întotdeauna datele reale (rating exact, număr recenzii, adresă, website)
- Dacă isSocialOnlyWebsite=true: tratează lipsa website-ului propriu ca problemă CRITICĂ prioritară
- Nu rupe cuvintele în mijloc, nu adăuga spații în URL-uri sau cuvinte
- Format clar: titluri cu ###, bullet points cu ▸, fără text înghesuit

STRUCTURĂ OBLIGATORIE:

### 1. Audit GBP
Scor: [gbpScore]/100. Câmpuri lipsă și impactul lor asupra ranking-ului. Dacă website-ul e Facebook/Instagram, menționează explicit că acesta nu înlocuiește un website propriu și afectează credibilitatea SEO.

### 2. Cuvinte Cheie High-Intent
Minim 10 cuvinte cheie specifice locației și tipului de cuisine din recenzii. Grupate pe: generale, produs-specifice, livrare/takeaway, micro-moment ("lângă mine").

### 3. Competiție Locală
Estimare competitori direcți bazată pe tipul de business și cartier. Gap-uri de oportunitate concrete.

### 4. Strategie de Diferențiere
Bazată pe rating-ul real și volumul de recenzii din JSON (câmpurile rating și reviewCount) și punctele forte/slabe din recenzii.

### 5. Recomandări Prioritizate
🔴 Critice (impact mare, urgent) | 🟡 Mediu termen | 🟢 Long-term

### 6. Plan 30 Zile
Săptămâna 1-2: Quick Wins | Săptămâna 3-4: Fundație | KPIs măsurabili

Limba: română. Fii specific, nu generic.`;

export default function Module01_SEO({ selectedLocation }: { selectedLocation?: string }) {
  const { data: placesData, loading } = usePlacesData(selectedLocation);

  const rating = placesData?.rating || null;
  const reviews = placesData?.reviewCount || 0;
  const hasWebsite = !!placesData?.website;
  const hasPhone = !!placesData?.phone;
  const hasHours = (placesData?.openingHours?.length || 0) > 0;
  const SOCIAL_DOMAINS = ['facebook.com', 'instagram.com', 'tiktok.com', 'twitter.com', 'x.com'];
  const isSocialOnlyWebsite = hasWebsite && SOCIAL_DOMAINS.some(d => placesData?.website?.includes(d));
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
      value: loading ? '🔄...' : !hasWebsite ? '❌ Fără website' : isSocialOnlyWebsite ? '⚠️ Doar social media' : '✅ Website propriu',
      sub: hasPhone ? '✅ Telefon listat' : '⚠️ Telefon lipsă',
      color: !hasWebsite ? 'bg-red-50 border-red-200' : isSocialOnlyWebsite ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200',
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
    isSocialOnlyWebsite,
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
            <li>{!hasWebsite ? '❌ Website lipsă din GBP' : isSocialOnlyWebsite ? `⚠️ Doar pagină social media: ${placesData.website} (nu înlocuiește un website real)` : `✅ Website propriu: ${placesData.website}`}</li>
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
