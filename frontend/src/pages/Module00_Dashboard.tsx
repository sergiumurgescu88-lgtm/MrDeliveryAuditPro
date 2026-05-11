import { useAudit } from '../context/AuditContext';
import { useFullAudit } from '../hooks/useFullAudit';
import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import AuditPDF from '../components/AuditPDF';

const MODULE_NAMES: Record<string, string> = {
  '01_SEO': '01 SEO', '02_Maps': '02 Maps', '03_Delivery': '03 Delivery',
  '04_Website': '04 Website', '05_Menu': '05 Menu', '06_Social': '06 Social',
  '07_Reviews': '07 Reviews', '08_LocalSEO': '08 Local SEO', '09_Photo': '09 Photo',
  '10_Growth': '10 Growth'
};

export default function Module00_Dashboard({ selectedLocation, restaurantData }: { selectedLocation?: string; restaurantData?: any }) {
  const { results, completedCount, resetAudit } = useAudit();
  const { runFullAudit, isGenerating } = useFullAudit();
  const [expanded, setExpanded] = useState<string | null>(null);
  const handleStart = () => { if (!restaurantData?.name) return alert('Selectează un restaurant.'); resetAudit(); runFullAudit(restaurantData); };
  const statusStyle = (s: string) => s === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : s === 'generating' ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse' : s === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-500';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-slate-900">Dashboard Audit Complet</h1><p className="text-slate-500 mt-1">{selectedLocation || 'Niciun restaurant selectat'}</p></div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={handleStart} disabled={isGenerating || !restaurantData?.name} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg font-medium shadow hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition">{isGenerating ? '⏳ Se generează...' : '🚀 Generează Audit Complet'}</button>
          {completedCount === 10 && restaurantData?.name && (
            <PDFDownloadLink document={<AuditPDF results={results} restaurantData={restaurantData} />} fileName={`Audit_${restaurantData.name.replace(/\s+/g,'_')}.pdf`} className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition">📥 Descarcă Raport PDF</PDFDownloadLink>
          )}
          {completedCount > 0 && <button onClick={resetAudit} className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition">🔄 Reset</button>}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-slate-700">Progres General</span><span className="text-sm font-bold text-indigo-600">{completedCount}/10 module</span></div>
        <div className="w-full bg-slate-200 rounded-full h-2.5"><div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(completedCount/10)*100}%` }}></div></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(MODULE_NAMES).map(([id, name]) => {
          const mod = results[id]; const status = mod?.status || 'idle';
          return (
            <div key={id} className={`rounded-xl border p-4 transition ${statusStyle(status)}`}>
              <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">{name}</h3><span className="text-xs px-2 py-0.5 rounded-full border capitalize bg-white/60">{status}</span></div>
              {status === 'completed' && mod.content && (<>
                <p className="text-sm text-slate-600 line-clamp-3 mb-3">{mod.content.slice(0,180).replace(/\s+/g,' ')}...</p>
                <button onClick={() => setExpanded(expanded===id?null:id)} className="text-xs font-medium underline hover:text-indigo-700">{expanded===id?'▲ Închide':'▼ Vezi complet'}</button>
                {expanded===id && <pre className="mt-3 bg-white/70 p-3 rounded text-xs whitespace-pre-wrap border border-slate-200 max-h-60 overflow-y-auto">{mod.content.replace(/\s+/g,' ')}</pre>}
              </>)}
              {status==='error' && <p className="text-xs text-red-600 mt-1">⚠️ {mod.error}</p>}
              {status==='idle' && <p className="text-xs text-slate-400 mt-1">Așteaptă generarea...</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
