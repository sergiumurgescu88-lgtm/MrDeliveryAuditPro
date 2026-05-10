import { useState } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';

const SOCIAL_PROMPT = `Generează o strategie completă de social media pentru un restaurant, adaptată pe platforme și orientată spre creșterea organică și conversia în comenzi. Structură obligatorie:
1. Platform-Specific Strategy (Instagram: aesthetic + stories + reels; TikTok: viral hooks + UGC + behind-the-scenes; Facebook: community + events + local targeting)
2. Content Pillars Matrix (4 categorii cu exemple concrete: Behind-the-scenes, User-Generated Content, Educational/Culinary Tips, Community/Local Partnerships)
3. Viral Loop & UGC Mechanism (challenge lunar, hashtag dedicat, incentive pentru clienți, cum să transformi vizitatorii în creatori de conținut)
4. Calendar Editorial & Frecvență (postări/săptămână per platformă, ore optimale, teme sezoniere, integrare cu evenimente locale)
5. Engagement & Community Management (tonul brandului, răspuns la comentarii/DM-uri, gestionarea crizelor, colaborări cu micro-influenceri locali)
6. Checklist Acționabil (Quick Wins / Medium / Long-term)
Ton: strategist social media HORECA, orientat spre engagement quality, reach organic și conversie în rezervări/comenzi. Limba: română. Format: clar, cu bullet points, exemple practice și secțiuni distincte.`;

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-500', icon: '📸' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-black', icon: '🎵' },
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-600', icon: '👥' },
  { id: 'general', name: 'Strategie Integrată', color: 'bg-amber-500', icon: '🚀' }
];

const CONTENT_PILLARS = [
  { title: 'Behind the Scenes', desc: 'Procesul de gătire, echipa, secrete din bucătărie', icon: '🔪' },
  { title: 'User Generated', desc: 'Repost clienți, recenzii vizuale, hashtag dedicat', icon: '📱' },
  { title: 'Educational', desc: 'Tips & tricks, pairing vinuri, secrete ingrediente', icon: '📚' },
  { title: 'Community & Local', desc: 'Evenimente zonă, parteneriate locale, caritate', icon: '🤝' }
];

export default function Module06_SocialMedia() {
  const [activePlatform, setActivePlatform] = useState('instagram');
  const restaurantData = { name: 'Dum-Dum Food', address: 'Calea Giulești 123, București', rating: 4.1 };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">06 Social Media</h1>
      <p className="text-slate-400 mb-6">Strategie de conținut, UGC loops și creștere organică pe Instagram, TikTok & Facebook</p>

      {/* Platform Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {PLATFORMS.map(p => (
          <button key={p.id} onClick={() => setActivePlatform(p.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activePlatform === p.id ? `${p.color} text-white shadow-md` : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            <span>{p.icon}</span> {p.name}
          </button>
        ))}
      </div>

      {/* Content Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {CONTENT_PILLARS.map((pillar, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
            <div className="text-2xl">{pillar.icon}</div>
            <div>
              <h4 className="font-semibold text-slate-800 text-sm">{pillar.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{pillar.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Engagement Rate', value: '4.2%', sub: 'Target: >5%' },
          { label: 'Postări / Săptămână', value: '5-7', sub: 'Mix Reels + Stories' },
          { label: 'UGC Volume', value: '12/lună', sub: 'Clienți activi' },
          { label: 'Viral Potential', value: 'High', sub: 'Hook-uri optimizate' }
        ].map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-400 uppercase tracking-wide">{m.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{m.value}</p>
            <p className="text-xs text-amber-600 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      <LiveModuleGenerator
        title={`Strategie Social Media: ${PLATFORMS.find(p => p.id === activePlatform)?.name}`}
        prompt={`${SOCIAL_PROMPT}\n\nFocus specific: ${activePlatform === 'general' ? 'Strategie integrată cross-platform cu calendar unificat' : `Tactici avansate și format optimizat pentru ${PLATFORMS.find(p => p.id === activePlatform)?.name}`}`}
        restaurantData={restaurantData}
      />
    </div>
  );
}
