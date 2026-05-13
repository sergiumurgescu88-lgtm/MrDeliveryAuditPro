import { useRef } from 'react';
import html2pdf from 'html2pdf.js';

interface PDFReportProps {
  restaurantName: string;
  address: string;
  globalScore: number;
  modules: { title: string; content: string }[];
}

export default function PDFReport({ restaurantName, address, globalScore, modules }: PDFReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const exportPDF = () => {
    if (!reportRef.current) return;
    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     `Audit_${restaurantName.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };
    html2pdf().set(opt).from(reportRef.current).save();
  };

  const statusBadge = globalScore >= 7 ? '🟢 Performant' : globalScore >= 5 ? '🟡 Are Potențial' : '🔴 Necesită Atenție';

  return (
    <div className="space-y-4">
      <button
        onClick={exportPDF}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
      >
        📥 Descarcă Raport PDF
      </button>

      {/* Container ascuns vizual, folosit doar pentru export */}
      <div ref={reportRef} className="hidden bg-white text-slate-800 font-sans leading-relaxed p-8 max-w-[210mm] mx-auto">
        {/* Header */}
        <div className="border-b-2 border-blue-600 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Raport Audit Digital Complet</h1>
          <p className="text-lg text-slate-600 mt-1">{restaurantName}</p>
          <p className="text-sm text-slate-500">{address} • Generat: {new Date().toLocaleDateString('ro-RO')}</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-sm font-semibold">
            Scor Global: {globalScore}/10 {statusBadge}
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-bold text-blue-800 mb-2">📊 Rezumat Executiv</h2>
          <ul className="space-y-1 text-sm">
            <li>✅ Module completate: {modules.length}/10</li>
            <li>⚠️ Probleme critice detectate: {modules.filter(m => m.content.includes('❌') || m.content.includes('CRITIC')).length}</li>
            <li>💡 Quick wins identificate: {modules.filter(m => m.content.includes('quick win') || m.content.includes('immediat')).length}</li>
          </ul>
        </div>

        {/* Modules */}
        {modules.map((mod, i) => (
          <div key={i} className="mb-6 page-break-inside-avoid">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">
              {mod.title}
            </h2>
            {/* Render content with proper line breaks & bullets */}
            <div className="text-sm whitespace-pre-wrap space-y-2">
              {mod.content.split('\n').map((line, idx) => (
                <p key={idx} className={line.startsWith('###') ? 'font-bold mt-3 mb-1' : ''}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-300 text-center text-xs text-slate-500">
          MrDelivery Audit Pro • Powered by OpenRouter AI • {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
