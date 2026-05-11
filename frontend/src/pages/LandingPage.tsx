export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Restaurant Audit Pro</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Platformă AI de audit digital pentru restaurante. Analizăm SEO, prezența pe Maps, delivery, meniu, social media și generăm un plan de creștere pe 90 de zile.</p>
          <button onClick={onEnter} className="mt-6 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:from-indigo-700 hover:to-violet-700 transition">🚀 Intră în Dashboard</button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold mb-2">🤖 Agentul 1: Audit & Strategie</h3>
            <p className="text-slate-600">Analizează datele reale din Google Places, calculează metrici de performanță, identifică punctele slabe și generează rapoarte detaliate pe 10 module esențiale.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold mb-2">📊 Agentul 2: Growth & Execuție</h3>
            <p className="text-slate-600">Transformă auditul în planuri acționabile: roadmap 90 zile, strategii de preț, optimizare delivery, UGC loops și KPIs clari pentru scalare.</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">📁 Cele 9 Fișiere de Audit Generate</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['SEO Local & Keywords', 'Google Maps & Foto', 'Delivery & Comisioane', 'Website & UX', 'Meniu & Neuromarketing', 'Social Media & UGC', 'Recenzii & Reputație', 'Local SEO & GBP', 'Plan Creștere 90 Zile'].map((f, i) => (
              <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                <div className="text-2xl mb-2">📄</div>
                <p className="font-medium text-sm">{f}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Restaurant Audit Pro • Powered by MrDelivery.ro • AI: OpenRouter</p>
        </div>
      </div>
    </div>
  );
}
