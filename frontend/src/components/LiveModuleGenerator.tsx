import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { logAudit } from '../lib/dataLogger';

interface Props { title: string; prompt: string; restaurantData: any; }

export default function LiveModuleGenerator({ title, prompt, restaurantData }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const queueRef = useRef<{ text: string; delay: number }[]>([]);
  const isProcessingRef = useRef(false);
  const totalItemsRef = useRef(0);
  const processedItemsRef = useRef(0);
  const streamDoneRef = useRef(false);

  const splitAndQueue = useCallback((rawText: string) => {
    if (typeof rawText !== 'string' || rawText.trim().length === 0) return;
    const paragraphs = rawText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const newQueue: { text: string; delay: number }[] = [];
    paragraphs.forEach((para, pIndex) => {
      const sentences = para.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [para];
      sentences.forEach((sent) => { const c = sent.trim(); if (c) newQueue.push({ text: c + ' ', delay: 4000 }); });
      if (pIndex < paragraphs.length - 1) newQueue.push({ text: '\n\n', delay: 8000 });
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
      await new Promise(r => setTimeout(r, item.delay));
      setDisplayedText(prev => prev + item.text);
      processedItemsRef.current++;
      const pct = Math.min((processedItemsRef.current / Math.max(totalItemsRef.current, 1)) * 100, 98);
      setProgress(pct);
    }
    isProcessingRef.current = false;
    // Dacă stream-ul s-a terminat și coada e goală, marcăm finalizarea
    if (streamDoneRef.current) {
      setProgress(100);
      setIsGenerating(false);
    }
  }, []);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true); setDisplayedText(''); setProgress(0); setError(null);
    queueRef.current = []; totalItemsRef.current = 0; processedItemsRef.current = 0;
    streamDoneRef.current = false;
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch('/api/audit/stream', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, restaurantData }), signal: abortControllerRef.current.signal
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim().startsWith('data:')) {
            const dataStr = line.replace(/^\s*data:\s*/, '').trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (typeof content === 'string' && content.length > 0) splitAndQueue(content);
            } catch {}
          }
        }
      }
      streamDoneRef.current = true;
      // Dacă coada era deja goală, finalizăm imediat
      if (queueRef.current.length === 0 && !isProcessingRef.current) {
        setProgress(100);
        setIsGenerating(false);
      }
      logAudit(restaurantData?.name || 'Necunoscut', title, 'success');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Eroare la generare');
        setIsGenerating(false);
        logAudit(restaurantData?.name || 'Necunoscut', title, 'error');
      }
    }
  };

  const handleDownload = () => {
    const blob = new Blob([displayedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_${restaurantData?.name || 'Restaurant'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <button onClick={() => isGenerating ? abortControllerRef.current?.abort() : handleGenerate()}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${isGenerating ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-amber-500 text-white hover:bg-amber-400 shadow-md shadow-amber-500/20'}`}>
          {isGenerating ? '⏹ Oprește' : '✨ Generează Live'}
        </button>
      </div>
      
      {isGenerating && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4 overflow-hidden">
          <motion.div className="bg-amber-500 h-1.5 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
      )}

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm border border-red-100">{error}</div>}

      <div className="min-h-[160px] bg-slate-50/60 rounded-xl p-4 text-slate-700 leading-relaxed whitespace-pre-wrap text-sm border border-slate-100">
        {displayedText || (isGenerating ? '⏳ Se preiau datele de la AI...' : 'Apasă "Generează Live" pentru a porni analiza în timp real.')}
        {isGenerating && <span className="inline-block w-2 h-4 bg-amber-500 ml-1 animate-pulse align-middle" />}
      </div>

      {/* 📥 Buton Download (apare doar la finalizare) */}
      {progress === 100 && displayedText.length > 0 && !isGenerating && !error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex justify-end">
          <button onClick={handleDownload} className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20 flex items-center gap-2">
            📥 Descarcă Analiza (.txt)
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
