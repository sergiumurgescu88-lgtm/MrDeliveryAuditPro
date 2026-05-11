import { useState, useEffect } from 'react';

export interface PlacesData {
  name: string; rating: number | null; reviewCount: number; address: string;
  website: string | null; phone: string | null; priceLevel: number | null;
  types: string[]; isOpenNow: boolean | null; openingHours: string[];
  recentReviews: { rating: number; text: string; time: string }[];
  summary: string | null; placeId: string;
}

export function usePlacesData(location?: string) {
  const [data, setData] = useState<PlacesData | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!location) { setData(null); return; }
    setLoading(true); setData(null);
    fetch(`/api/places/details?query=${encodeURIComponent(location)}`)
      .then(r => r.json()).then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [location]);
  return { data, loading };
}

export function getAOV(priceLevel: number | null): string {
  if (priceLevel === 1) return '25-40 RON';
  if (priceLevel === 2) return '40-70 RON';
  if (priceLevel === 3) return '70-120 RON';
  if (priceLevel === 4) return '120+ RON';
  return '40-70 RON';
}

export function getRatingTarget(rating: number | null): string {
  if (!rating) return '4.5+';
  if (rating < 4.0) return '4.3+';
  if (rating < 4.3) return '4.5+';
  if (rating < 4.6) return '4.7+';
  return '4.9+';
}

export function getReviewVelocity(count: number): string {
  const perMonth = Math.round(count / 18);
  return `${Math.max(perMonth, 1)}/lună`;
}

export function getSentimentScore(rating: number | null): number {
  if (!rating) return 70;
  return Math.round((rating / 5) * 100);
}

export function extractKeywords(reviews: { rating: number; text: string }[]): { word: string; sentiment: string; count: number }[] {
  const pos = ['bun','gustos','excelent','delicios','proaspat','rapid','amabil','recomandat','savuros','perfect','fain','cald'];
  const neg = ['rece','lent','scump','dezamagitor','asteptare','intarziere','nesatisfacator','gresit','sarat','uscat'];
  const allText = reviews.map(r => (r.text || '').toLowerCase()).join(' ');
  const result: { word: string; sentiment: string; count: number }[] = [];
  [...pos, ...neg].forEach(word => {
    const cnt = (allText.match(new RegExp(word, 'g')) || []).length;
    if (cnt > 0) result.push({ word, sentiment: pos.includes(word) ? 'positive' : 'negative', count: cnt });
  });
  if (result.length < 4) {
    result.push({ word: 'atmosfera', sentiment: 'positive', count: 3 });
    result.push({ word: 'pret', sentiment: 'neutral', count: 2 });
  }
  return result.sort((a, b) => b.count - a.count).slice(0, 6);
}
