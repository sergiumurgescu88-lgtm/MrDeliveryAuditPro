import { useState, useEffect, useRef } from 'react';

interface Props { onSelect: (location: string) => void; }
declare global { interface Window { google: any; } }

export default function LocationSearch({ onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapsError, setMapsError] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [confirmed, setConfirmed] = useState('');
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!API_KEY || API_KEY.includes('YOUR_GOOGLE')) {
      setMapsError(true); setIsLoading(false); return;
    }

    const initAutocomplete = () => {
      try {
        const ac = new window.google.maps.places.Autocomplete(inputRef.current!, {
          types: ['establishment'],
          componentRestrictions: { country: 'ro' },
          fields: ['name', 'formatted_address']
        });
        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          const val = [place.name, place.formatted_address].filter(Boolean).join(", ");
          if (val) { onSelect(val); setConfirmed(val); }
        });
        setIsLoading(false);
      } catch (err) {
        console.warn('[MrDelivery] Autocomplete error:', err);
        setMapsError(true); setIsLoading(false);
      }
    };

    if (window.google?.maps?.places) {
      initAutocomplete(); return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&language=ro&region=RO`;
    script.async = true;
    script.defer = true;
    script.onload = initAutocomplete;
    script.onerror = () => { setMapsError(true); setIsLoading(false); };
    document.head.appendChild(script);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputRef.current?.value?.trim();
      if (val && val.length > 2) { onSelect(val); setConfirmed(val); }
    }
  };

  const handleManualSubmit = () => {
    if (!manualName.trim() || !manualCity.trim()) return;
    const val = `${manualName.trim()}, ${manualCity.trim()}, România`;
    onSelect(val); setConfirmed(val); setManualMode(false);
  };

  return (
    <div className="space-y-3 mb-5">
      {!mapsError && (
        <input ref={inputRef} onKeyDown={handleKeyDown} type="text"
          placeholder={isLoading ? '⏳ Se încarcă sugestiile Google...' : '📍 Caută restaurantul (ex: Dum-Dum Food București)'}
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/90 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition disabled:opacity-60" />
      )}

      {!mapsError && !manualMode && !confirmed && !isLoading && (
        <button onClick={() => setManualMode(true)}
          className="text-xs text-slate-400 hover:text-amber-500 transition-colors">
          ✏️ Nu găsești locația? Introdu manual
        </button>
      )}

      {(mapsError || manualMode) && !confirmed && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <p className="text-xs text-amber-700">
            {mapsError ? '⚠️ Google Maps indisponibil. Introdu manual:' : '📝 Introdu manual locația:'}
          </p>
          <div className="flex gap-2">
            <input value={manualName} onChange={e => setManualName(e.target.value)}
              placeholder="Numele restaurantului"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            <input value={manualCity} onChange={e => setManualCity(e.target.value)}
              placeholder="Oraș"
              className="w-28 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            <button onClick={handleManualSubmit}
              disabled={!manualName.trim() || !manualCity.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors">
              OK
            </button>
          </div>
        </div>
      )}

      {confirmed && (
        <div className="flex items-center justify-between text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-3 py-2">
          <span>📍 <strong>{confirmed}</strong></span>
          <button onClick={() => { setConfirmed(''); setManualMode(false); setManualName(''); setManualCity(''); onSelect(''); }}
            className="text-slate-400 hover:text-slate-600 ml-4">✕ Schimbă</button>
        </div>
      )}
    </div>
  );
}
