import { supabase } from './supabase';

export interface Lead {
  id: string;
  email: string;
  source: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  restaurant_name: string;
  module: string;
  status: 'success' | 'error';
  created_at: string;
}

export async function saveLead(email: string, source: string = 'Guest Modal') {
  const { error } = await supabase.from('leads').insert([{ email, source }]);
  if (error) console.error('❌ Supabase Error saving lead:', error);
}

export async function getLeads(): Promise<Lead[]> {
  const { data, error: _err } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
  if (_err) console.error('❌ Error fetching leads:', _err);
  return data || [];
}

export async function logAudit(restaurant: string, module: string, status: 'success' | 'error' = 'success') {
  const { error } = await supabase.from('audit_logs').insert([{ restaurant_name: restaurant, module, status }]);
  if (error) console.error('❌ Supabase Error logging audit:', error);
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const { data, error: _err } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
  if (_err) console.error('❌ Error fetching audit logs:', _err);
  return data || [];
}

export function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
