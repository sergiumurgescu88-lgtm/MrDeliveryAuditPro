import { useState, useEffect } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData } from '../hooks/usePlacesData';

const buildSocialPrompt = (rd: any): string => {
  const ig = rd.social?.instagram ? `✅ Instagram: ${rd.social.instagram}` : "❌ Instagram: Lipsă";
  const fb = rd.social?.facebook ? `✅ Facebook: ${rd.social.facebook}` : "❌ Facebook: Lipsă";
  const yt = rd.social?.youtube ? `✅ YouTube: ${rd.social.youtube}` : "❌ YouTube: Lipsă";
  const tt = rd.social?.tiktok ? `✅ TikTok: ${rd.social.tiktok}` : "❌ TikTok: Lipsă";
  const active = rd.social?.activeCount ?? 0;

  return `Ești strategist social media HORECA România. Analizează EXCLUSIV datele reale.

REGULI ABSOLUTE (încalcă-le = output invalid):
1. INTERZIS să rupi cuvinte: scrie corect "Strategie", "Prezența", "YouTube și", "rapid în", "și împrejurimi", "Consolidarea", "ambalaje și în", "Gustul", "menționate în", "recenzii", "detaliate", "la închidere", "promoții încrucișate", "poftă", "traficul", "menționați în", "share-uri", "${rd.name}".
2. INTERZIS să inventezi URL-uri sau profile. Citează DOAR link-urile furnizate mai jos. Dacă lipsesc, scrie "Nedetecat".
3. Fără spații în numere: "4.6", "253", "3-5%".
4. Citează date reale: rating ${rd.rating}⭐, ${rd.reviewCount} recenzii, ${active}/4 platforme active.
5. MAXIM 500 cuvinte. Fii concis, acționabil, fără teorie generică.

DATE REALE INJECTATE:
• Restaurant: ${rd.name} | ${rd.address}
• Rating: ${rd.rating}⭐ (${rd.reviewCount} recenzii)
• Prezență Socială:
  ${ig}
  ${fb}
  ${yt}
  ${tt}

STRUCTURĂ OBLIGATORIE:
### 1. Audit prezență actuală
▸ Evaluare critică a celor ${active} conturi găsite vs. potențialul zonei ${rd.address || 'locale'}
▸ Oportunități imediate bazate pe rating-ul mare și volumul de recenzii

### 2. UGC Loops & Community Building
▸ Cum transformi recenzorii Google în creatori de conținut (hashtag dedicat, repost, recompense)
▸ 1 idee de concurs foto/video adaptată la ${rd.name}

### 3. Calendar conținut 4 săptămâni
▸ Mix Reels/Stories/Postări adaptat la platformele ${active > 0 ? "active" : "recomandate (IG + TikTok)"}
▸ Hook-uri virale specifice HORECA & timing optim

### 4. Creștere organică & colaborări
▸ Micro-influenceri locali (Tunari/Ilfov) & parteneriate complementare
▸ 1 idee de giveaway cu ROI pozitiv

### 5. KPIs & Tracking
▸ Engagement rate target, reach lunar, conversie din social
▸ Tool-uri gratuite de monitorizare

Limba: română. Format: ### titluri, ▸ bullets. Fără URL-uri inventate.`;
};
