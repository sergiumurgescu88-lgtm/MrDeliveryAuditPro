export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="space-y-10 py-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Restaurant Audit Pro</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Platformă AI de audit digital pentru restaurante. Analizăm SEO, prezența pe Maps, delivery, meniu, social media și generăm un plan de creștere pe 90 de zile.</p>
        <button onClick={onEnter} className="mt-6 px-8 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-semibold text-lg shadow-lg shadow-amber-500/20 hover:from-amber-500 hover:to-orange-600 transition">🚀 Intră în Dashboard</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-xl border border-white/20 shadow-sm">
          <h3 className="text-xl font-bold mb-2 text-slate-800">🤖 Agentul 1: Audit & Strategie</h3>
          <p className="text-slate-600">Analizează datele reale din Google Places, calculează metrici de performanță, identifică punctele slabe și generează rapoarte detaliate pe 10 module esențiale.</p>
        </div>
        <div className="glass-card p-6 rounded-xl border border-white/20 shadow-sm">
          <h3 className="text-xl font-bold mb-2 text-slate-800">📊 Agentul 2: Growth & Execuție</h3>
          <p className="text-slate-600">Transformă auditul în planuri acționabile: roadmap 90 zile, strategii de preț, optimizare delivery, UGC loops și KPIs clari pentru scalare.</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center text-slate-900">📁 Cele 9 Fișiere de Audit Generate</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['SEO Local & Keywords', 'Google Maps & Foto', 'Delivery & Comisioane', 'Website & UX', 'Meniu & Neuromarketing', 'Social Media & UGC', 'Recenzii & Reputație', 'Local SEO & GBP', 'Plan Creștere 90 Zile'].map((f, i) => (
            <div key={i} className="glass-card p-4 rounded-lg border border-white/20 text-center">
              <div className="text-2xl mb-2">📄</div>
              <p className="font-medium text-sm text-slate-700">{f}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
