import { useAuth } from "../context/AuthContext";
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { logAudit } from '../lib/dataLogger';

const cleanText = (text: string) => {
  return text
    .replace(/\s+([.,;:!?\)\]}])/g, '$1')
    .replace(/([\(\[{])\s+/g, '$1')
    .replace(/([a-zA-Z])\s+([ăâîșțĂÂÎȘȚ])/g, '$1$2')
    .replace(/(\d)\s+(\d)/g, '$1$2')
    .replace(/\s{2,}/g, ' ');
};


interface PlacesData {
  name: string; rating: number | null; reviewCount: number; address: string;
  website: string | null; phone: string | null; priceLevel: number | null;
  types: string[]; isOpenNow: boolean | null; openingHours: string[];
  recentReviews: { rating: number; text: string; time: string }[];
  summary: string | null; placeId: string;
}

interface Props { title: string; prompt: string; restaurantData: any; location?: string; }

export default function LiveModuleGenerator({ title, prompt, restaurantData, location }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user, refreshUser } = useAuth();
  const [displayedText, setDisplayedText] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [placesData, setPlacesData] = useState<PlacesData | null>(null);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  useEffect(() => {
    setDisplayedText(''); setProgress(0); setError(null);
    setIsComplete(false); setPlacesData(null);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setIsGenerating(false);
    queueRef.current = [];
  }, [location]);

  // Fetch date reale Google Places
  useEffect(() => {
    if (!location) return;
    setLoadingPlaces(true);
    fetch(`/api/places/details?query=${encodeURIComponent(location)}`)
      .then(r => r.json())
      .then(data => { setPlacesData(data); setLoadingPlaces(false); })
      .catch(() => setLoadingPlaces(false));
  }, [location]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const queueRef = useRef<{ text: string; delay: number }[]>([]);
  const isProcessingRef = useRef(false);
  const totalItemsRef = useRef(0);
  const processedItemsRef = useRef(0);
  const streamEndedRef = useRef(false);

  const splitAndQueue = useCallback((rawText: string) => {
    if (typeof rawText !== 'string' || rawText.trim().length === 0) return;
    const paragraphs = rawText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const newQueue: { text: string; delay: number }[] = [];
    paragraphs.forEach((para, pIndex) => {
      const sentences = para.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [para];
      sentences.forEach((sent) => { const c = sent.trim(); if (c) newQueue.push({ text: c + ' ', delay: 2000 }); });
      if (pIndex < paragraphs.length - 1) newQueue.push({ text: '\n\n', delay: 4000 });
    });
    queueRef.current = [...queueRef.current, ...newQueue];
    totalItemsRef.current += newQueue.length;
    processQueue();
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || queueRef.current.length === 0) return;
    isProcessingRef.current = true;
    while (queueRef.current.length > 0) {
      const item = queueRef.current.shift()!;
      const delay = streamEndedRef.current ? 300 : item.delay;
      await new Promise(r => setTimeout(r, delay));
      setDisplayedText(prev => cleanText(prev + item.text));
      processedItemsRef.current++;
      setProgress(Math.min((processedItemsRef.current / Math.max(totalItemsRef.current, 1)) * 95, 95));
    }
    isProcessingRef.current = false;
    if (streamEndedRef.current) { setProgress(100); setIsGenerating(false); setIsComplete(true); }
  }, []);

  const handleGenerate = async () => {
    if (isGenerating || !location) return;
    setIsGenerating(true); setDisplayedText(''); setProgress(0); setError(null); setIsComplete(false);
    queueRef.current = []; totalItemsRef.current = 0; processedItemsRef.current = 0;
    streamEndedRef.current = false; abortControllerRef.current = new AbortController();

    // Construim restaurantData îmbogățit cu date reale
    const enrichedData = placesData ? {
      name: placesData.name,
      address: placesData.address,
      rating: placesData.rating,
      reviewCount: placesData.reviewCount,
      website: placesData.website,
      phone: placesData.phone,
      priceLevel: placesData.priceLevel,
      cuisine: placesData.types.filter(t => !['establishment','food','point_of_interest'].includes(t)).join(', '),
      isOpenNow: placesData.isOpenNow,
      openingHours: placesData.openingHours,
      recentReviews: placesData.recentReviews,
      summary: placesData.summary,
    } : { ...restaurantData, name: location?.split(',')[0]?.trim() || restaurantData?.name };

    try {
      
    // 🔒 Verificare Credite
    if (!user) { alert('🔑 Trebuie să te autentifici pentru a genera un audit.'); return; }
    if (user.credits < 10) { alert('💎 Credite insuficiente. Ai nevoie de 10 credite pentru o generare.'); return; }
    try {
      const spendRes = await fetch('/api/credits/spend', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('mrdelivery_token')}` }
      });
      if (!spendRes.ok) { alert('❌ Eroare la deducerea creditelor sau credite insuficiente.'); return; }
      await refreshUser();
    } catch (e) { alert('❌ Eroare de rețea la verificare credite.'); return; }
    // ✅ Credite deduse, pornim generarea
    const res = await fetch('/api/audit/stream', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, restaurantData: enrichedData }),
        signal: abortControllerRef.current.signal
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const reader = res.body?.getReader(); const decoder = new TextDecoder(); let buffer = '';
      while (true) {
        const { done, value } = await reader!.read(); if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n'); buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.slice(5).trim();
            if (dataStr === '[DONE]') break;
            try { const p = JSON.parse(dataStr); const c = p.choices?.[0]?.delta?.content; if (typeof c === 'string' && c) splitAndQueue(c); } catch {}
          }
        }
      }
      streamEndedRef.current = true;
      if (queueRef.current.length === 0 && !isProcessingRef.current) { setProgress(100); setIsGenerating(false); setIsComplete(true); }
      logAudit(location || 'Necunoscut', title, 'success');
    } catch (err: any) {
      if (err.name !== 'AbortError') { setError(err.message || 'Eroare la generare'); setIsGenerating(false); logAudit(location || 'Necunoscut', title, 'error'); }
    }
  };

  const handleDownload = () => {
    const blob = new Blob([displayedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `${title.replace(/\s+/g, '_')}_${location || 'Restaurant'}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          {placesData && (
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">⭐ {placesData.rating} ({placesData.reviewCount} recenzii)</span>
              {placesData.website && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">🌐 Website activ</span>}
              {placesData.isOpenNow !== null && <span className={`text-xs px-2 py-0.5 rounded-full border ${placesData.isOpenNow ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{placesData.isOpenNow ? '🟢 Deschis acum' : '🔴 Închis acum'}</span>}
              {loadingPlaces && <span className="text-xs text-slate-400">⏳ Se încarcă date reale...</span>}
            </div>
          )}
          {loadingPlaces && !placesData && <p className="text-xs text-amber-600 mt-1">⏳ Se preiau date reale Google...</p>}
        </div>
        <button onClick={() => isGenerating ? abortControllerRef.current?.abort() : handleGenerate()} disabled={!location}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!location ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : isGenerating ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-amber-500 text-white hover:bg-amber-400 shadow-md shadow-amber-500/20'}`}>
          {isGenerating ? '⏹ Oprește' : '✨ Generează Live'}
        </button>
      </div>
      {!location && <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 mb-4">📍 Selectează o locație reală din sugestii pentru a activa generarea.</p>}
      {isGenerating && <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4 overflow-hidden"><motion.div className="bg-amber-500 h-1.5 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} /></div>}
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm border border-red-100">{error}</div>}
      <div className="min-h-[160px] bg-slate-50/60 rounded-xl p-4 text-slate-700 leading-relaxed whitespace-pre-wrap text-sm border border-slate-100">
        {displayedText || (isGenerating ? '⏳ Se preiau datele de la AI...' : 'Apasă "Generează Live" pentru a porni analiza în timp real.')}
        {isGenerating && <span className="inline-block w-2 h-4 bg-amber-500 ml-1 animate-pulse align-middle" />}
      </div>
      {isComplete && displayedText.length > 0 && !error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex justify-end">
          <button onClick={handleDownload} className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20 flex items-center gap-2">📥 Descarcă Analiza (.txt)</button>
        </motion.div>
      )}
    </motion.div>
  );
}
