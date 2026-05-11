import { motion } from 'framer-motion';
import LiveModuleGenerator from '../components/LiveModuleGenerator';

export default function Module01_SEO({ selectedLocation }: { selectedLocation?: string }) {
  const prompt = selectedLocation
    ? `Realizează o analiză SEO locală detaliată și acționabilă pentru locația: "${selectedLocation}". Include: cuvinte cheie cu intenție ridicată (high-intent), analiza competiției locale, strategie de diferențiere, recomandări on-page & off-page, optimizare Google Business Profile, și un plan de acțiune pe 30 de zile. Focus specific pe piața din România și pe tipul de business identificat.`
    : '';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">01 SEO Analysis</h2>
        <p className="text-sm text-slate-500 mb-4">Optimizare vizibilitate locală și poziționare în căutări</p>
        <p className="text-xs text-slate-400">Folosește selectorul global de locație din partea de sus pentru a genera analiza.</p>
      </div>
      {selectedLocation && (
        <LiveModuleGenerator
          location={selectedLocation}
          title="Analiză SEO Locală"
          prompt={prompt}
          restaurantData={{ name: selectedLocation, location: selectedLocation }}
        />
      )}
    </motion.div>
  );
}
