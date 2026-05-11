import { useAudit } from '../context/AuditContext';
const MODULES = [
  { id: '01_SEO', prompt: 'Audit SEO complet. Structură: cuvinte cheie, competiție locală, on-page/off-page, GBP, plan 30 zile.' },
  { id: '02_Maps', prompt: 'Audit vizual Google Maps. Structură: stare actuală, concept premium, shot list 5 cadre, calendar vizual, recomandări.' },
  { id: '03_Delivery', prompt: 'Analiză delivery. Structură: comisioane Glovo/Bolt/Tazz, AOV, conversie, ROI, strategie creștere.' },
  { id: '04_Website', prompt: 'Audit tehnic & UX website. Structură: viteză, Core Web Vitals, funnel conversie, SEO tehnic, optimizare comenzi.' },
  { id: '05_Menu', prompt: 'Redesign meniu & neuromarketing. Structură: analiză psihologică, descrieri before/after, matrice profit, prețuri, layout.' },
  { id: '06_Social', prompt: 'Strategie social media. Structură: audit prezență, UGC loops, calendar 4 săptămâni, creștere organică, KPIs.' },
  { id: '07_Reviews', prompt: 'Optimizare recenzii. Structură: sentiment analysis, framework răspuns, sistem generare recenzii, reputation rescue, metrici.' },
  { id: '08_LocalSEO', prompt: 'SEO Local & GBP. Structură: optimizare profil, citări NAP, Local Pack, strategie vizibilitate, checklist KPIs.' },
  { id: '09_Photo', prompt: 'Identitate vizuală & foto. Structură: paletă cromatică, shot list 8 cadre, reguli consistență, strategie conținut, impact conversie.' },
  { id: '10_Growth', prompt: 'Plan creștere 90 zile. Structură: roadmap sprint-uri, matrice prioritizare, KPI dashboard, scalare, moonshot idea.' }
];
export function useFullAudit() {
  const { updateResult, isGenerating } = useAudit();
  const runFullAudit = async (restaurantData: any) => {
    if (isGenerating || !restaurantData?.name) return;
    for (const mod of MODULES) {
      updateResult(mod.id, { status: 'generating', content: '' });
      try {
        const res = await fetch('/api/audit/stream', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: mod.prompt, restaurantData })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const reader = res.body?.getReader(); const decoder = new TextDecoder();
        let fullText = '', buffer = '';
        while (true) {
          const { done, value } = await reader!.read(); if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n'); buffer = lines.pop() || '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const payload = line.slice(6).trim(); if (payload === '[DONE]') continue;
              try { fullText += JSON.parse(payload).choices?.[0]?.delta?.content || ''; } catch {}
            }
          }
        }
        updateResult(mod.id, { status: 'completed', content: fullText, timestamp: Date.now() });
      } catch (err: any) {
        updateResult(mod.id, { status: 'error', error: err.message, content: '' });
      }
      await new Promise(r => setTimeout(r, 600));
    }
  };
  return { runFullAudit, isGenerating };
}
