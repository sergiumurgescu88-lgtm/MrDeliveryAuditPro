import { useEffect, useState } from 'react';
import LiveModuleGenerator from '../components/LiveModuleGenerator';
import { usePlacesData } from '../hooks/usePlacesData';

const buildMenuPrompt = (rd: any): string => {
  const dishesList = rd.menuDishes && rd.menuDishes.length > 0
    ? rd.menuDishes.slice(0, 10).map((d: any) => `- ${d.name} (menționat de ${d.mentions} ori, sentiment: ${d.sentiment})`).join("\n")
    : "Nicio preparare specifică extrasă încă.";
  
  const topDishLine = rd.topDish ? `Preparatul star: ${rd.topDish}` : "Niciun preparat star identificat.";
  const summaryLine = rd.dishesSummary ? `Rezumat recenzii: "${rd.dishesSummary}"` : "";
  const priceLine = rd.priceLevel ? `Nivel de prețuri: ${"$".repeat(rd.priceLevel)} (${rd.priceLevel}/4)` : "Nivel prețuri: N/A";

  return `Ești expert în menu engineering & neuromarketing HORECA România. Analizează EXCLUSIV datele reale.

REGULI ABSOLUTE (încalcă-le = output invalid):
1. INTERZIS să rupi cuvinte: scrie corect "exclusiv", "clasificat", "menționate în", "aceasta împiedică", "modul în", "descoperă", "învelite într-o", "calitatea", "simplifica", "de înaltă", "${rd.name}".
2. INTERZIS să folosești sintaxă JSON, acolade {}, sau chei tehnice ("menuDishes", "topDish"). Folosește DOAR limbaj natural.
3. Fără spații în numere: "4.6", "253", "30-45 RON".
4. Citează date reale: rating ${rd.rating}⭐, ${rd.reviewCount} recenzii, ${rd.menuDishes?.length || 0} preparate identificate.
5. MAXIM 500 cuvinte. Fii concis, acționabil, fără teorie generică.
6. Dacă lista de preparate este goală, oferă strategii de colectare date, NU inventa preparate.

DATE REALE INJECTATE:
• Restaurant: ${rd.name} | ${rd.address}
• Rating: ${rd.rating}⭐ (${rd.reviewCount} recenzii)
• ${priceLine}
• ${topDishLine}
• ${summaryLine}
• Lista preparate din recenzii:
${dishesList}

STRUCTURĂ OBLIGATORIE:
### 1. Analiza structurii actuale
▸ Evaluare bazată pe rating ${rd.rating} și preț ${rd.priceLevel}/4
▸ ${rd.menuDishes?.length > 0 ? "Analiza aglomerării și ierarhiei pe baza preparatelor listate" : "Impactul lipsei datelor despre meniu asupra conversiei"}

### 2. Transformare descrieri (Before → After)
▸ Alege 3 preparate DIN LISTA DE MAI SUS (prioritizează ${rd.topDish || "cele mai menționate"})
▸ Format: **[Preparat]** — Before: descriere plată → After: descriere senzorială & storytelling

### 3. Matrice Profitabilitate (Estimare)
▸ Clasificare preparate reale în: Stars ⭐, Puzzles ❓, Plowhorses 🐎, Dogs 🐕
▸ 1 recomandare concretă de repoziționare per categorie

### 4. Psihologia prețurilor
▸ 2 strategii specifice (ancorare, decoy, bundle) adaptate la ${rd.name}
▸ Exemplu de bundle cu preparate din listă

### 5. Layout & UX Meniu
▸ Regula triunghiului de aur aplicată pe structura actuală
▸ 1 recomandare de highlight pentru preparatul star

Limba: română. Format: ### titluri, ▸ bullets. Fără JSON.`;
};
