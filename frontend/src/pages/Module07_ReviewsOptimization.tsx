import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData, getRatingTarget, getReviewVelocity, getSentimentScore, extractKeywords } from '../hooks/usePlacesData';

const REVIEWS_PROMPT = `Generează o strategie completă de optimizare a recenziilor și gestionare a reputației online pentru un restaurant. Structură obligatorie:
1. Analiză Sentiment & Cuvinte Cheie (identifică top 5 termeni pozitivi și top 5 puncte de durere din recenzii, scor sentiment estimat, trend lunar)
2. Framework de Răspuns (3 template-uri profesionale: recenzie pozitivă, neutră, negativă severă, cu ton empatic, soluții concrete și call-to-action de retenție)
3. Sistem Proactiv de Generare Recenzii (SMS/email automat post-comandă, timing optim 2-4h, incentive-uri etice, link direct Google Maps, QR pe bon/packaging)
4. Reputation Rescue Protocol (pași de urmat când rating-ul scade sub 4.2 sau apar recenzii negative virale, escaladare internă, monitorizare zilnică, recovery offers)
5. Metrici de Urmărit & Benchmark (review velocity, response rate <24h, sentiment trend, impact asupra SEO local și conversie)
6. Checklist Acționabil (Quick Wins / Medium / Long-term)
Ton: expert în reputation management & customer experience HORECA. Limba: română. Format: clar, cu bullet points, exemple practice și secțiuni distincte.`;

const RESPONSE_TEMPLATES = [
  { type: 'Pozitivă', color: 'bg-green-50 border-green-200 text-green-800', text: 'Vă mulțumim din suflet pentru apreciere! Ne bucurăm că ați savurat preparatele noastre. Vă așteptăm cu drag și data viitoare!' },
  { type: 'Neutră', color: 'bg-amber-50 border-amber-200 text-amber-800', text: 'Mulțumim pentru feedback! Ne pare rău că experiența nu a fost la nivelul așteptărilor. Lucrăm constant la îmbunătățire și vă invităm să ne contactați direct pentru o soluție personalizată.' },
  { type: 'Negativă', color: 'bg-red-50 border-red-200 text-red-800', text: 'Ne cerem scuze sincer pentru experiența neplăcută. Am discutat deja cu echipa și am luat măsuri imediate. Vă rugăm să ne scrieți pentru a remedia situația.' }
];

export default function Module07_ReviewsOptimization({ selectedLocation }: { selectedLocation?: string }) {
  const { data: places, loading } = usePlacesData(selectedLocation);
  const parts = (selectedLocation || '').split(',');
  const restaurantData = { name: parts[0]?.trim() || 'Restaurant', address: parts.slice(1).join(',').trim() || selectedLocation || '', rating: places?.rating || 4.5 };

  const sentimentScore = getSentimentScore(places?.rating ?? null);
  const ratingTarget = getRatingTarget(places?.rating ?? null);
  const reviewVelocity = places ? getReviewVelocity(places.reviewCount) : '8/lună';
  const keywords = places?.recentReviews?.length ? extractKeywords(places.recentReviews) : [
    { word: 'gustos', sentiment: 'positive', count: 12 },
    { word: 'proaspat', sentiment: 'positive', count: 9 },
    { word: 'atmosfera', sentiment: 'positive', count: 7 },
    { word: 'asteptare', sentiment: 'negative', count: 4 },
    { word: 'pret', sentiment: 'neutral', count: 3 },
  ];

  const metrics = [
    { label: 'Rating Mediu', value: loading ? '...' : places?.rating ? `${places.rating} ⭐` : 'N/A', sub: `Target: ${ratingTarget}` },
    { label: 'Total Recenzii', value: loading ? '...' : places?.reviewCount ? `${places.reviewCount}` : 'N/A', sub: 'Google Maps (real)' },
    { label: 'Review Velocity', value: loading ? '...' : reviewVelocity, sub: 'Industry avg: 5/lună' },
    { label: 'Sentiment Score', value: loading ? '...' : `${sentimentScore}/100`, sub: 'Target: 85+' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">07 Reviews Optimization</h1>
      <p className="text-slate-400 mb-6">Sentiment analysis, response frameworks și strategie de creștere a rating-ului</p>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">📊 Sentiment Score</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold text-amber-600">{loading ? '...' : sentimentScore}</span>
            <span className="text-sm text-slate-400 mb-1">/ 100</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div className="bg-amber-500 h-3 rounded-full transition-all duration-700" style={{ width: `${sentimentScore}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">Target: 85+ | Bazat pe rating real Google Maps</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">🔑 Cuvinte Cheie din Recenzii</h3>
          {loading ? <p className="text-xs text-slate-400">⏳ Se analizează recenziile reale...</p> : (
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw, i) => (
                <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  kw.sentiment === 'positive' ? 'bg-green-50 border-green-200 text-green-700' :
                  kw.sentiment === 'negative' ? 'bg-red-50 border-red-200 text-red-700' :
                  'bg-slate-50 border-slate-300 text-slate-700'
                }`}>{kw.word} ({kw.count})</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">💬 Framework de Răspuns</h3>
        <div className="space-y-3">
          {RESPONSE_TEMPLATES.map((tpl, i) => (
            <div key={i} className={`p-4 rounded-lg border text-sm ${tpl.color}`}>
              <p className="font-semibold mb-1">{tpl.type}</p>
              <p className="opacity-90">{tpl.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-400 uppercase tracking-wide">{m.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{m.value}</p>
            <p className="text-xs text-amber-600 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      <LiveModuleGenerator location={selectedLocation} title="Audit Recenzii & Reputație" prompt={REVIEWS_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
