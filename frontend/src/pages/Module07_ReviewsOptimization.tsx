import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData, getRatingTarget, getReviewVelocity, getSentimentScore, extractKeywords } from '../hooks/usePlacesData';

const buildReviewsPrompt = (rd: any): string => {
  const reviewsList = rd.recentReviews?.length
    ? rd.recentReviews.slice(0, 5).map((r: any) => `- ${r.rating}⭐: "${r.text?.slice(0, 120) || ''}"`).join("\n")
    : "Recenzii reale indisponibile";
  const kwPositive = rd.keywords?.filter((k: any) => k.sentiment === 'positive').map((k: any) => k.word).join(", ") || "N/A";
  const kwNegative = rd.keywords?.filter((k: any) => k.sentiment === 'negative').map((k: any) => k.word).join(", ") || "N/A";

  return `Ești expert în reputation management & customer experience HORECA România. Analizează EXCLUSIV datele reale.

REGULI ABSOLUTE (încalcă-le = output invalid):
1. INTERZIS să rupi cuvinte: scrie corect "reputației și", "4.6/5", "este în", "la înălțimea", "fi îmbunătățite", "aplicabil și", "noi și", "detaliu și", "recâștigăm încrederea și", "recenziile în", "meniul și", "${rd.name}".
2. INTERZIS să folosești meta-comentarii precum "conform datelor furnizate", "nu există în date", "este un scenariu general". Livrează DIRECT strategia, fără să explici ce faci.
3. Fără spații în numere: "4.6", "253", "14/lună".
4. Citează date reale: rating ${rd.rating}⭐, ${rd.reviewCount} recenzii, sentiment ${rd.sentimentScore}/100, velocity ${rd.reviewVelocity}.
5. MAXIM 500 cuvinte. Fii concis, acționabil, fără teorie generică.

DATE REALE INJECTATE:
• Restaurant: ${rd.name} | ${rd.address}
• Rating: ${rd.rating}⭐ (${rd.reviewCount} recenzii) | Target: ${rd.ratingTarget}
• Sentiment: ${rd.sentimentScore}/100 | Velocity: ${rd.reviewVelocity}
• Cuvinte cheie pozitive: ${kwPositive}
• Cuvinte cheie negative: ${kwNegative}
• Recenzii recente:
${reviewsList}

STRUCTURĂ OBLIGATORIE:
### 1. Analiză Sentiment & Cuvinte Cheie
▸ Top 3 termeni pozitivi & top 2 puncte de durere (bazat strict pe lista de mai sus)
▸ Trend sentiment & impact asupra conversiei locale

### 2. Framework de Răspuns (Personalizat pentru ${rd.name})
▸ Template Pozitiv (5⭐): [folosește 1 cuvânt cheie pozitiv real]
▸ Template Neutru (3⭐): [adresare punct durere + invitație dialog]
▸ Template Negativ (1-2⭐): [scuze sincere + recovery offer concret + contact direct]

### 3. Sistem Proactiv de Generare Recenzii
▸ 2 tactici rapide (SMS/email post-comandă, QR pe bon/packaging)
▸ 1 incentive etic adaptat la ${rd.name}

### 4. Reputation Rescue Protocol
▸ Pași concreți dacă rating scade sub 4.2 (actual: ${rd.rating})
▸ Monitorizare & escaladare internă

### 5. Checklist Acționabil
🔴 Săptămâna 1: [2 quick wins cu owner]
🟡 30 Zile: [1 sistem automatizat + 1 KPI]
🟢 90 Zile: [analiză impact + ajustare meniu/servicii]

Limba: română. Format: ### titluri, ▸ bullets. Fără meta-comentarii.`;
};
