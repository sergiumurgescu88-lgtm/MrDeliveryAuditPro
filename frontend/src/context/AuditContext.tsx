import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type ModuleStatus = 'idle' | 'generating' | 'completed' | 'error';
export interface ModuleResult { status: ModuleStatus; content: string; error?: string; timestamp?: number; }

export interface RestaurantData {
  name: string;
  address: string;
  website: string | null;
  phone: string | null;
  rating: number | null;
  reviewCount: number | null;
  types: string[];
  placeId: string | null;
  photos: string[];
  city: string;
}

interface AuditContextType {
  results: Record<string, ModuleResult>;
  updateResult: (moduleId: string, data: Partial<ModuleResult>) => void;
  resetAudit: () => void;
  isGenerating: boolean;
  completedCount: number;
  restaurantData: RestaurantData | null;
  restaurantLoading: boolean;
  fetchRestaurantData: (query: string) => Promise<RestaurantData | null>;
}

const AuditContext = createContext<AuditContextType | null>(null);

export function AuditProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<Record<string, ModuleResult>>({});
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null);
  const [restaurantLoading, setRestaurantLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>('');

  const updateResult = (moduleId: string, data: Partial<ModuleResult>) => {
    setResults(prev => {
      const existing = prev[moduleId] || { status: 'idle' as ModuleStatus, content: '' };
      return { ...prev, [moduleId]: { ...existing, ...data } };
    });
  };

  const resetAudit = () => setResults({});

  const fetchRestaurantData = useCallback(async (query: string): Promise<RestaurantData | null> => {
    if (!query) return null;
    // Returnam cache daca e acelasi restaurant
    if (query === lastQuery && restaurantData) return restaurantData;
    setRestaurantLoading(true);
    try {
      const res = await fetch(`/api/places/details?query=${encodeURIComponent(query)}`);
      const d = await res.json();
      const parts = query.split(',');
      const data: RestaurantData = {
        name: d.name || parts[0]?.trim() || query,
        address: d.address || parts.slice(1).join(',').trim() || '',
        website: d.website || null,
        phone: d.phone || null,
        rating: d.rating || null,
        reviewCount: d.user_ratings_total || d.reviewCount || null,
        types: d.types || [],
        placeId: d.place_id || null,
        photos: d.photos || [],
        city: parts[1]?.trim() || '',
      };
      setRestaurantData(data);
      setLastQuery(query);
      return data;
    } catch (e) {
      console.error('fetchRestaurantData error:', e);
      return null;
    } finally {
      setRestaurantLoading(false);
    }
  }, [lastQuery, restaurantData]);

  const isGenerating = Object.values(results).some(r => r.status === 'generating');
  const completedCount = Object.values(results).filter(r => r.status === 'completed').length;

  return (
    <AuditContext.Provider value={{ results, updateResult, resetAudit, isGenerating, completedCount, restaurantData, restaurantLoading, fetchRestaurantData }}>
      {children}
    </AuditContext.Provider>
  );
}

export const useAudit = () => {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error('useAudit must be used within AuditProvider');
  return ctx;
};
