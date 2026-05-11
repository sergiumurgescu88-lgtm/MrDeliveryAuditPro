import { createContext, useContext, useState, type ReactNode } from 'react';
export type ModuleStatus = 'idle' | 'generating' | 'completed' | 'error';
export interface ModuleResult { status: ModuleStatus; content: string; error?: string; timestamp?: number; }
interface AuditContextType {
  results: Record<string, ModuleResult>;
  updateResult: (moduleId: string, data: Partial<ModuleResult>) => void;
  resetAudit: () => void;
  isGenerating: boolean;
  completedCount: number;
}
const AuditContext = createContext<AuditContextType | null>(null);
export function AuditProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<Record<string, ModuleResult>>({});
  const updateResult = (moduleId: string, data: Partial<ModuleResult>) => {
    setResults(prev => {
      const existing = prev[moduleId] || { status: 'idle' as ModuleStatus, content: '' };
      return { ...prev, [moduleId]: { ...existing, ...data } };
    });
  };
  const resetAudit = () => setResults({});
  const isGenerating = Object.values(results).some(r => r.status === 'generating');
  const completedCount = Object.values(results).filter(r => r.status === 'completed').length;
  return <AuditContext.Provider value={{ results, updateResult, resetAudit, isGenerating, completedCount }}>{children}</AuditContext.Provider>;
}
export const useAudit = () => { const ctx = useContext(AuditContext); if (!ctx) throw new Error('useAudit must be used within AuditProvider'); return ctx; };
