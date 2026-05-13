import { useEffect, useState } from 'react';

const buildGrowthPrompt = (rd: any): string => {
  const scores = rd.scores || {};
  const scoreLines = [
    `SEO Local: ${Math.round(scores.seo || 0)}/10`,
    `Social Media: ${Math.round(scores.social || 0)}/10`,
    `Website: ${Math.round(scores.website || 0)}/10`,
    `Delivery: ${Math.round(scores.delivery || 0)}/10`,
    `Recenzii: ${Math.round(scores.reviews || 0)}/10`,
    `Meniu: ${Math.round(scores.menu || 0)}/10`,
  ].join(" | ");

  const socialStatus = rd.social
    ? [rd.social.instagram ? `Instagram ✅` : `Instagram ❌`, rd.social.facebook ? `Facebook ✅` : `Facebook ❌`, rd.social.youtube ? `YouTube ✅` : `YouTube ❌`, rd.social.tiktok ? `TikTok ✅` : `TikTok ❌`].join(", ")
    : "Date social indisponibile";

  const deliveryStatus = rd.delivery
    ? [rd.delivery.glovo ? `Glovo ✅` : `Glovo ❌`, rd.delivery.bolt ? `Bolt ✅` : `Bolt ❌`, rd.delivery.tazz ? `Tazz ✅` : `Tazz ❌`].join(", ")
    : "Date delivery indisponibile";

  const seoStatus = rd.seo?.position
    ? `Poziție #${rd.seo.position}, competitori: ${rd.seo.competitors?.slice(0,2).join(", ") || "necunoscuți"}`
    : "Poziție necunoscută";

  const websiteStatus = rd.websiteAudit
    ? `Score ${rd.websiteAudit.score || "N/A"}/100, SSL: ${rd.websiteAudit.hasSSL ? "✅" : "❌"}, Mobile: ${rd.websiteAudit.isMobile ? "✅" : "❌"}`
    : rd.website ? "Website prezent, audit indisponibil" : "Fără website";

  const menuStatus = rd.menuDishes?.length
    ? `${rd.menuDishes.length} preparate identificate, star: ${rd.topDish || "N/A"}`
    : "Preparate neidentificate";

  const weakModules = Object.entries(scores).filter(([, v]) => (v as number) < 5).map(([k]) => k).join(", ") || "niciunul";
  const strongModules = Object.entries(scores).filter(([, v]) => (v as number) >= 7).map(([k]) => k).join(", ") || "niciunul";

  return `Ești growth strategist HORECA România. Analizează EXCLUSIV datele reale.

REGULI ABSOLUTE (încalcă-le = output invalid):
1. INTERZIS să rupi cuvinte: scrie corect "4.6/5", "lipia", "online și", "comenzi", "Tunari și", "Răspunde", "feedback și", "corecte și", "Instagram și", "zonele învecinate", "gratuite în", "link în", "livrare", "de înaltă", "adresa și", "a îmbunătăți", "bazându-te", "având în", "280", "o țintă", "${rd.name}".
2. INTERZIS să folosești intro-uri de tip "În calitate de consultant...", "am analizat datele...", "Conform datelor...". Începe DIRECT cu secțiunea 1.
3. Fără spații în numere/zecimale: "4.6", "253", "90 zile".
4. Citează date reale: scoruri per modul, ${rd.globalScore}/10 global, ${rd.reviewCount} recenzii, status platforme.
5. MAXIM 500 cuvinte. Fii concis, acționabil, fără teorie generică. Output-ul NU trebuie să se taie.

DATE REALE INJECTATE:
• Restaurant: ${rd.name} | ${rd.address}
• Rating: ${rd.rating}⭐ (${rd.reviewCount} recenzii) | Scor Global: ${rd.globalScore}/10
• Scoruri Module: ${scoreLines}
• Social: ${socialStatus}
• Delivery: ${deliveryStatus}
• SEO Local: ${seoStatus}
• Website: ${websiteStatus}
• Meniu: ${menuStatus}
• Module slabe (<5): ${weakModules} | Module forte (7+): ${strongModules}

STRUCTURĂ OBLIGATORIE:
### 1. Diagnostic Rapid
▸ Ce funcționează (${strongModules}) vs. ce e critic (${weakModules})
▸ 3 quick wins implementabile AZI (efort minim, impact imediat)

### 2. Roadmap 90 Zile
▸ Săpt 1-2 (Quick Wins): [2 acțiuni concrete]
▸ Săpt 3-6 (Core Fixes): [1 fix per modul slab: ${weakModules}]
▸ Săpt 7-12 (Growth): [1 strategie de scalare bazată pe ${strongModules}]

### 3. Matrice Prioritizare (Impact vs Efort)
▸ Impact Mare / Efort Mic: [2 acțiuni]
▸ Impact Mare / Efort Mediu: [2 acțiuni]
▸ Impact Mare / Efort Mare: [1 acțiune]

### 4. KPI Dashboard (Baseline → Target 90 zile)
▸ Rating: ${rd.rating} → [target realist]
▸ Review Velocity: [actual] → [target]
▸ Social Active: ${Object.values(rd.social || {}).filter(Boolean).length}/4 → 4/4
▸ Delivery: ${[rd.delivery?.glovo, rd.delivery?.bolt, rd.delivery?.tazz].filter(Boolean).length}/3 → 3/3

### 5. Moonshot Idea
▸ 1 strategie neconvențională cu potențial viral local, specifică pentru ${rd.name}

Limba: română. Format: ### titluri, ▸ bullets. Fără intro-uri.`;
};
