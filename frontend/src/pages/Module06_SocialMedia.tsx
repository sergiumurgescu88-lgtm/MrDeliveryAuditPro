import { useState, useEffect } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';

const SOCIAL_PROMPT = `Strategie completă de social media pentru restaurant. Structură obligatorie:
1. Audit prezență actuală (Instagram, TikTok, Facebook, consistență vizuală, tonalitate)
2. UGC Loops & Community Building (cum transformi clienții în creatori de conținut, hashtag dedicat, repost strategy)
3. Calendar de conținut pe 4 săptămâni (mix Reels/Stories/Postări, hook-uri virale, timing optim)
4. Creștere organică & colaborări (micro-influenceri locali, parteneriate, giveaway-uri inteligente)
5. KPIs & Tracking (engagement rate, reach, conversie din social, tool-uri de monitorizare)
Ton: strategist social media HORECA România, focus pe viralitate locală și conversie în comenzi/rezervări. Limba: română.`;

export default function Module06_SocialMedia({ selectedLocation }: { selectedLocation?: string }) {
  const [metrics, setMetrics] = useState({ engagement: '...', posts: '...', ugc: '...', viral: '...' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSocialData() {
      if (!selectedLocation) { setLoading(false); return; }
      try {
        const res = await fetch(`/api/places/details?query=${encodeURIComponent(selectedLocation)}`);
        const d = await res.json();
        const rating = d.rating || 3.5;
        const reviews = d.reviewCount || 0;
        const engagement = Math.min(8, Math.max(2, 2.5 + (rating - 3.5) * 1.2)).toFixed(1) + '%';
        const posts = rating >= 4.0 ? '5-7/săpt' : '3-5/săpt';
        const ugc = reviews > 500 ? '15-20/lună' : reviews > 200 ? '8-12/lună' : '3-5/lună';
        const viral = rating >= 4.2 ? 'High' : 'Medium';
        setMetrics({ engagement, posts, ugc, viral });
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchSocialData();
  }, [selectedLocation]);

  const parts = (selectedLocation || '').split(',');
  const restaurantData = { name: parts[0]?.trim() || 'Restaurant', address: parts.slice(1).join(',').trim() || '', rating: 4.0 };

  const cards = [
    { label: 'Engagement Rate', value: loading ? '🔄...' : metrics.engagement, sub: 'Target: >5%', color: 'bg-pink-50 border-pink-200' },
    { label: 'Postări / Săptămână', value: loading ? '🔄...' : metrics.posts, sub: 'Mix Reels + Stories', color: 'bg-violet-50 border-violet-200' },
    { label: 'UGC Volume', value: loading ? '🔄...' : metrics.ugc, sub: 'Clienți activi', color: 'bg-blue-50 border-blue-200' },
    { label: 'Viral Potential', value: loading ? '🔄...' : metrics.viral, sub: 'Hook-uri optimizate', color: 'bg-amber-50 border-amber-200' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">06 Social Media</h1>
      <p className="text-slate-400 mb-6">Strategie de conținut, UGC loops și creștere organică pe Instagram, TikTok & Facebook</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <div key={i} className={`p-4 rounded-xl border ${c.color}`}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-slate-800">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>
      <LiveModuleGenerator location={selectedLocation} title="Strategie Social Media: Instagram" prompt={SOCIAL_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
