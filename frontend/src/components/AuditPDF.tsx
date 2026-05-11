import { Document, Page, Text, StyleSheet, Font } from '@react-pdf/renderer';
import type { ModuleResult } from '../context/AuditContext';

Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' });
Font.register({ family: 'RobotoBold', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf' });

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Roboto', fontSize: 10, color: '#1e293b', lineHeight: 1.5 },
  cover: { padding: 60, fontFamily: 'Roboto', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' },
  title: { fontSize: 26, fontFamily: 'RobotoBold', marginBottom: 8, color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#475569', marginBottom: 30 },
  meta: { fontSize: 10, color: '#64748b', marginBottom: 6 },
  tocTitle: { fontSize: 16, fontFamily: 'RobotoBold', marginBottom: 16, color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: 6 },
  tocItem: { fontSize: 11, marginBottom: 6, color: '#334155' },
  modTitle: { fontSize: 15, fontFamily: 'RobotoBold', marginBottom: 10, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 4 },
  modContent: { fontSize: 9.5, whiteSpace: 'pre-wrap', color: '#334155' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: 6 },
  pageNr: { position: 'absolute', bottom: 30, right: 40, fontSize: 8, color: '#94a3b8' }
});

const MODULE_NAMES: Record<string, string> = {
  '01_SEO': '01 SEO Analysis', '02_Maps': '02 Google Maps Images', '03_Delivery': '03 Delivery Platforms',
  '04_Website': '04 Website & Ordering', '05_Menu': '05 Menu Redesign', '06_Social': '06 Social Media',
  '07_Reviews': '07 Reviews Optimization', '08_LocalSEO': '08 Local Maps SEO', '09_Photo': '09 Photo Redesign',
  '10_Growth': '10 Growth Plan'
};

interface Props { results: Record<string, ModuleResult>; restaurantData: any; }

export default function AuditPDF({ results, restaurantData }: Props) {
  const modules = Object.entries(MODULE_NAMES).filter(([id]) => results[id]?.status === 'completed');
  const date = new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Document>
      <Page style={styles.cover}>
        <Text style={styles.title}>Raport Audit Digital Complet</Text>
        <Text style={styles.subtitle}>{restaurantData?.name || 'Restaurant'}</Text>
        <Text style={styles.meta}>{restaurantData?.address || ''}</Text>
        <Text style={styles.meta}>Generat: {date}</Text>
        <Text style={styles.meta}>Platformă: MrDelivery Audit Pro</Text>
      </Page>

      <Page style={styles.page}>
        <Text style={styles.tocTitle}>Cuprins</Text>
        {modules.map(([id, name], i) => (
          <Text key={id} style={styles.tocItem}>{i + 1}. {name}</Text>
        ))}
        <Text style={styles.footer}>MrDelivery Audit Pro • Powered by OpenRouter AI</Text>
      </Page>

      {modules.map(([id, name]) => (
        <Page key={id} style={styles.page}>
          <Text style={styles.modTitle}>{name}</Text>
          <Text style={styles.modContent}>{results[id].content.replace(/\s+/g, ' ').trim()}</Text>
          <Text style={styles.footer}>MrDelivery Audit Pro • {restaurantData?.name}</Text>
          <Text style={styles.pageNr} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      ))}
    </Document>
  );
}
