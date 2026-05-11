import { useState, Suspense, lazy, useEffect } from 'react';
import LoadingSkeleton from './components/LoadingSkeleton';
import SEO from './components/SEO';
import LocationSearch from './components/LocationSearch';
import SparkEffect from './components/SparkEffect';
import { trackPageView, trackEvent } from './lib/analytics';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';

const Module00_Dashboard = lazy(() => import('./pages/Module00_Dashboard'));
const Module01_SEO = lazy(() => import('./pages/Module01_SEO'));
const Module02_GoogleMapsImages = lazy(() => import('./pages/Module02_GoogleMapsImages'));
const Module03_DeliveryPlatforms = lazy(() => import('./pages/Module03_DeliveryPlatforms'));
const Module04_WebsiteOrdering = lazy(() => import('./pages/Module04_WebsiteOrdering'));
const Module05_MenuRedesign = lazy(() => import('./pages/Module05_MenuRedesign'));
const Module06_SocialMedia = lazy(() => import('./pages/Module06_SocialMedia'));
const Module07_ReviewsOptimization = lazy(() => import('./pages/Module07_ReviewsOptimization'));
const Module08_LocalMapsSEO = lazy(() => import('./pages/Module08_LocalMapsSEO'));
const Module09_PhotoRedesign = lazy(() => import('./pages/Module09_PhotoRedesign'));
const Module10_GrowthPlan = lazy(() => import('./pages/Module10_GrowthPlan'));
const ModuleAdmin_Dashboard = lazy(() => import('./pages/ModuleAdmin_Dashboard'));

const MODULES = [
  { id: 0, label: 'Dashboard', title: 'Dashboard', desc: 'Prezentare generală a sistemului de audit AI.' },
  { id: 1, label: '01 SEO', title: 'SEO Analysis', desc: 'Optimizare vizibilitate locală și poziționare în căutări.' },
  { id: 2, label: '02 Maps', title: 'Google Maps Images', desc: 'Audit vizual și strategie foto premium.' },
  { id: 3, label: '03 Delivery', title: 'Delivery Platforms', desc: 'Optimizare Glovo, Bolt Food & Tazz.' },
  { id: 4, label: '04 Website', title: 'Website & Ordering', desc: 'Audit UX, conversie și comenzi online.' },
  { id: 5, label: '05 Menu', title: 'Menu Redesign', desc: 'Neuromarketing și profit engineering.' },
  { id: 6, label: '06 Social', title: 'Social Media', desc: 'Strategie de conținut și creștere organică.' },
  { id: 7, label: '07 Reviews', title: 'Reviews Optimization', desc: 'Sentiment analysis și gestionare reputație.' },
  { id: 8, label: '08 Local SEO', title: 'Local Maps SEO', desc: 'Google Business Profile și dominanță locală.' },
  { id: 9, label: '09 Photo', title: 'Photo Redesign', desc: 'Identitate vizuală și consistență foto.' },
  { id: 10, label: '10 Growth', title: 'Growth Plan', desc: 'Roadmap 90 zile și strategii de scalare.' },
  { id: 99, label: '🔒 Admin', title: 'Admin Dashboard', desc: 'Panou de control intern și metrici.' }
];

function AuthButton() {
  const { user, login, logout, loading } = useAuth();
  if (loading) return <span className="text-xs text-slate-400">⏳</span>;
  if (user) return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md border border-emerald-200">💎 {user.credits} credite</span>
      <button onClick={logout} className="text-xs text-slate-500 hover:text-red-500 transition">Deconectare</button>
    </div>
  );
  return <button onClick={login} className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition">🔑 Login Google</button>;
}

function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [active, setActive] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(() => localStorage.getItem('mrdelivery_loc') || '');

  useEffect(() => { if (selectedLocation) localStorage.setItem('mrdelivery_loc', selectedLocation); }, [selectedLocation]);
  useEffect(() => { if (view === 'app') trackPageView(`/#module-${active}`); }, [active, view]);

  const handleNav = (id: number) => {
    setView('app');
    setActive(id);
    trackEvent('nav_click', { module: MODULES.find(m => m.id === id)?.label });
  };

  const currentModule = MODULES.find(m => m.id === active) || MODULES[0];

  return (
    <div className="min-h-screen bg-white text-slate-900 relative">
      <SEO title={view === 'landing' ? 'Restaurant Audit Pro' : currentModule.title} description={currentModule.desc} url={`https://mrdelivery.online/#module-${active}`} />
      <div className="bg-mesh" />
      <SparkEffect />
      <div className="bg-grid" />

      <header className="sticky top-4 z-50 mx-4 md:mx-8 mt-4">
        <div className="glass-card px-5 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-white shadow-lg shadow-amber-500/20">M</div>
            <h1 className="text-base font-semibold tracking-tight">MrDelivery <span className="text-amber-500">Audit Pro</span></h1>
          <div className="flex items-center gap-2 ml-auto">
            <AuthButton />
          </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {MODULES.map(m => (
              <button key={m.id} onClick={() => handleNav(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  view === 'app' && active === m.id ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                }`}>
                {m.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 relative z-10">
        {view === 'landing' ? (
          <LandingPage onEnter={() => handleNav(0)} />
        ) : (
          <>
            <div className="mb-5">
              <LocationSearch onSelect={setSelectedLocation} />
            </div>
            <Suspense fallback={<LoadingSkeleton />}>
              {active === 0 && <Module00_Dashboard key={selectedLocation} selectedLocation={selectedLocation} />}
              {active === 1 && <Module01_SEO key={selectedLocation} selectedLocation={selectedLocation} />}
              {active === 2 && <Module02_GoogleMapsImages key={selectedLocation} selectedLocation={selectedLocation} />}
              {active === 3 && <Module03_DeliveryPlatforms key={selectedLocation} selectedLocation={selectedLocation} />}
              {active === 4 && <Module04_WebsiteOrdering key={selectedLocation} selectedLocation={selectedLocation} />}
              {active === 5 && <Module05_MenuRedesign key={selectedLocation} selectedLocation={selectedLocation} />}
              {active === 6 && <Module06_SocialMedia key={selectedLocation} selectedLocation={selectedLocation} />}
              {active === 7 && <Module07_ReviewsOptimization key={selectedLocation} selectedLocation={selectedLocation} />}
              {active === 8 && <Module08_LocalMapsSEO key={selectedLocation} selectedLocation={selectedLocation} />}
              {active === 9 && <Module09_PhotoRedesign key={selectedLocation} selectedLocation={selectedLocation} />}
              {active === 10 && <Module10_GrowthPlan key={selectedLocation} selectedLocation={selectedLocation} />}
              {active === 99 && <ModuleAdmin_Dashboard />}
            </Suspense>
          </>
        )}
      </main>

      <footer className="relative z-10 border-t border-slate-100 py-6 text-center text-xs text-slate-400 mt-8">
        © {new Date().getFullYear()} Restaurant Audit Pro • Powered by MrDelivery.ro • AI: OpenRouter
      </footer>
    </div>
  );
}
export default App;
