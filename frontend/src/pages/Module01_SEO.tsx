import LiveModuleGenerator from '../components/LiveModuleGenerator';

const SEO_PROMPT = `Generează o analiză SEO locală detaliată pentru un restaurant. Structură obligatorie:
1. Analiza SEO Locală (paragraf strategic)
2. Cuvinte Cheie cu Potențial (High-Intent) - listă cu 5 termeni
3. Analiza Competiției - compară cu 3 competitori locali (Forte/Slab)
4. Strategie de Diferențiere MrDelivery
5. Recomandări On-Page (bullet points)
6. Puncte Forte & Oportunități
Ton: profesionist, orientat spre conversie, specific pieței din România.`;

export default function Module01_SEO() {
  const restaurantData = { name: 'Dum-Dum Food', address: 'Calea Giulești 123, București', rating: 4.1 };
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">01 SEO Analysis</h1>
      <p className="text-slate-400 mb-6">Optimizare vizibilitate locală și poziționare în căutări</p>
      <LiveModuleGenerator title="Analiză SEO Locală" prompt={SEO_PROMPT} restaurantData={restaurantData} />
    </div>
  );
}
