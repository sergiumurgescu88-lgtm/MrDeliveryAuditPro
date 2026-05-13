import { useState, useEffect } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData } from '../hooks/usePlacesData';

const SOCIAL_PROMPT = `Strategie completă de social media pentru restaurant. Structură obligatorie:
1. Audit prezență actuală (Instagram, TikTok, Facebook, YouTube - conturi găsite, stare actuală)
2. UGC Loops & Community Building (cum transformi clienții în creatori de conținut, hashtag dedicat, repost strategy)
3. Calendar de conținut pe 4 săptămâni (mix Reels/Stories/Postări, hook-uri virale, timing optim)
4. Creștere organică & colaborări (micro-influenceri locali, parteneriate, giveaway-uri inteligente)
5. KPIs & Tracking (engagement rate, reach, conversie din social, tool-uri de monitorizare)
Ton: strategist social media HORECA România, focus pe viralitate locală și conversie în comenzi/rezervări. Limba: română.`;

interface SocialLinks {
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  tiktok: string | null;
}

export default function Module06_SocialMedia({ selectedLocation }: { selectedLocation?: string }) {
  const { data: placesData, loading: placesLoading } = usePlacesData(selectedLocation);
  const [social, setSocial] = useState<SocialLinks>({ instagram: null, facebook: null, youtube: null, tiktok: null });
  const [socialLoading, setSocialLoading] = useState(true);

  useEffect(() => {
    if (!selectedLocation) { setSocialLoading(false); return; }
    const parts = selectedLocation.split(',');
    const name = parts[0]?.trim();
    const city = parts[1]?.trim() || '';
    setSocialLoading(true);
    fetch(`/api/social/find?name=${encodeURIComponent(name)}&city=${encodeURIComponent(city)}`)
      .then(r => r.json())
      .then(d => { setSocial(d); setSocialLoading(false); })
      .catch(() => setSocialLoading(false));
  }, [selectedLocation]);

  const loading = placesLoading || socialLoading;
  const rating = placesData?.rating || 3.5;
  const reviews = placesData?.reviewCount || 0;
  const engagement = loading ? '...' : Math.min(8, Math.max(2, 2.5 + (rating - 3.5) * 1.2)).toFixed(1) + '%';
  const ugc = loading ? '...' : reviews > 500 ? '15-20/lună' : reviews > 200 ? '8-12/lună' : '3-5/lună';

  const platformCard = (label: string, url: string | null, _icon: string, color: string) => ({
    label,
    value: loading ? '🔄...' : url ? '✅ Activ' : '❌ Lipsă',
    sub: url ? url.replace('https://www.', '').replace('https://', '').split('/')[0] : 'Cont negăsit',
    color: url ? color : 'bg-slate-50 border-slate-200',
    url,
  });

  const cards = [
    platformCard('Instagram', social.instagram, '📸', 'bg-pink-50 border-pink-200'),
    platformCard('Facebook', social.facebook, '📘', 'bg-blue-50 border-blue-200'),
    platformCard('YouTube', social.youtube, '▶️', 'bg-red-50 border-red-200'),
    platformCard('TikTok', social.tiktok, '🎵', 'bg-violet-50 border-violet-200'),
  ];

  const statsCards = [
    { label: 'Engagement Rate', value: loading ? '🔄...' : engagement, sub: 'Target: >5%', color: 'bg-pink-50 border-pink-200' },
    { label: 'UGC Estimat', value: loading ? '🔄...' : ugc, sub: 'Conținut generat de clienți', color: 'bg-amber-50 border-amber-200' },
    { label: 'Rating Google', value: loading ? '🔄...' : rating ? `${rating}/5` : 'N/A', sub: `${reviews} recenzii`, color: 'bg-emerald-50 border-emerald-200' },
    { label: 'Viral Potential', value: loading ? '🔄...' : rating >= 4.2 ? 'High 🔥' : 'Medium', sub: 'Bazat pe rating + UGC', color: 'bg-orange-50 border-orange-200' },
  ];

  const parts = (selectedLocation || '').split(',');
  const restaurantData = {
    name: placesData?.name || parts[0]?.trim() || 'Restaurant',
    address: placesData?.address || parts.slice(1).join(',').trim() || '',
    rating: placesData?.rating || null,
    reviewCount: placesData?.reviewCount || null,
    website: placesData?.website || null,
    social: {
      instagram: social.instagram,
      facebook: social.facebook,
      youtube: social.youtube,
      tiktok: social.tiktok,
      activeCount: [social.instagram, social.facebook, social.youtube, social.tiktok].filter(Boolean).length,
    },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">06 Social Media</h1>
      <p className="text-slate-400 mb-6">Prezență reală pe rețele sociale, strategie conținut și creștere organică</p>

      <div className="mb-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Conturi găsite</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((c, i) => (
            <div key={i} className={`p-4 rounded-xl border ${c.color}`}>
              <p className="text-xs text-slate-500 mb-1">{c.label}</p>
              <p className="text-lg font-bold text-slate-800">{c.value}</p>
              {c.url
                ? <a href={c.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate block mt-1">{c.sub}</a>
                : <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
              }
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Metrici estimative</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statsCards.map((c, i) => (
            <div key={i} className={`p-4 rounded-xl border ${c.color}`}>
              <p className="text-xs text-slate-500 mb-1">{c.label}</p>
              <p className="text-lg font-bold text-slate-800">{c.value}</p>
              <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <LiveModuleGenerator location={selectedLocation} title="Strategie Social Media" prompt={SOCIAL_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
