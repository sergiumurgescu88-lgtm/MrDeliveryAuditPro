import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { ModuleResult } from '../context/AuditContext';

Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' });
Font.register({ family: 'RobotoBold', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf' });

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Roboto', fontSize: 10, color: '#1e293b', lineHeight: 1.6 },
  cover: { padding: 80, fontFamily: 'Roboto', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', backgroundColor: '#f8fafc' },
  title: { fontSize: 28, fontFamily: 'RobotoBold', marginBottom: 12, color: '#0f172a' },
  subtitle: { fontSize: 16, color: '#475569', marginBottom: 20 },
  meta: { fontSize: 11, color: '#64748b', marginBottom: 8 },
  tocTitle: { fontSize: 18, fontFamily: 'RobotoBold', marginBottom: 20, color: '#0f172a', borderBottom: '2px solid #3b82f6', paddingBottom: 8 },
  tocItem: { fontSize: 12, marginBottom: 8, color: '#334155', paddingLeft: 10 },
  modTitle: { fontSize: 18, fontFamily: 'RobotoBold', marginBottom: 15, color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: 6, marginTop: 10 },
  h3: { fontSize: 12, fontFamily: 'RobotoBold', marginTop: 16, marginBottom: 8, color: '#1e40af' },
  bullet: { fontSize: 10, marginLeft: 15, marginBottom: 6, color: '#334155', lineHeight: 1.5 },
  paragraph: { fontSize: 10, marginBottom: 8, color: '#334155', lineHeight: 1.6, textAlign: 'justify' },
  divider: { marginVertical: 12, borderBottom: '1px dashed #cbd5e1' },
  alert: { padding: 10, backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b', marginVertical: 8, fontSize: 10, borderRadius: 4 },
  alertCritical: { padding: 10, backgroundColor: '#fee2e2', borderLeft: '4px solid #ef4444', marginVertical: 8, fontSize: 10, borderRadius: 4 },
  alertSuccess: { padding: 10, backgroundColor: '#d1fae5', borderLeft: '4px solid #10b981', marginVertical: 8, fontSize: 10, borderRadius: 4 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: 8 },
  pageNr: { position: 'absolute', bottom: 30, right: 40, fontSize: 8, color: '#94a3b8' },
  section: { marginBottom: 20 }
});

const MODULE_NAMES: Record<string, string> = {
  '01_SEO': '01 SEO Analysis', '02_Maps': '02 Google Maps Images', '03_Delivery': '03 Delivery Platforms',
  '04_Website': '04 Website & Ordering', '05_Menu': '05 Menu Redesign', '06_Social': '06 Social Media',
  '07_Reviews': '07 Reviews Optimization', '08_LocalSEO': '08 Local Maps SEO', '09_Photo': '09 Photo Redesign',
  '10_Growth': '10 Growth Plan'
};

const cleanText = (text: string): string => {
  if (!text) return '';
  return text.replace(/[\s\r\t]+/g, ' ') // Normalize whitespace
             .replace(/  +/g, ' ');          // Remove double spaces
};

const renderContent = (text: string) => {
  const cleanedText = cleanText(text);
  if (!cleanedText) return <Text style={styles.paragraph}>—</Text>;
  
  const lines = cleanedText.split('.').filter(l => l.trim());
  const elements: JSX.Element[] = [];
  
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    if (trimmed.startsWith('### ')) {
      elements.push(<Text key={`h3-${idx}`} style={styles.h3}>{trimmed.replace('### ', '')}</Text>);
    }
    else if (trimmed.startsWith('## ')) {
      elements.push(<Text key={`h2-${idx}`} style={{...styles.h3, fontSize: 14, color: '#1e3a8a'}}>{trimmed.replace('## ', '')}</Text>);
    }
    else if (trimmed.startsWith('▸ ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      elements.push(<Text key={`bl-${idx}`} style={styles.bullet}>{trimmed.replace(/^[▸•*]\s*/, '')}</Text>);
    }
    else if (trimmed.includes('🔴 CRITIC') || trimmed.includes('❌') || trimmed.includes('CRITIC')) {
      elements.push(<View key={`ac-${idx}`} style={styles.alertCritical}><Text>{trimmed}</Text></View>);
    }
    else if (trimmed.includes('⚠️') || trimmed.includes('Oportunitate') || trimmed.includes('WARN')) {
      elements.push(<View key={`aw-${idx}`} style={styles.alert}><Text>{trimmed}</Text></View>);
    }
    else if (trimmed.includes('✅') || trimmed.includes('SUCCESS') || trimmed.includes('Recomandat')) {
      elements.push(<View key={`as-${idx}`} style={styles.alertSuccess}><Text>{trimmed}</Text></View>);
    }
    else if (trimmed === '---' || trimmed.startsWith('━━')) {
      elements.push(<View key={`dv-${idx}`} style={styles.divider} />);
    }
    else {
      elements.push(<Text key={`p-${idx}`} style={styles.paragraph}>{trimmed}</Text>);
    }
  });
  
  return elements;
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
        <View style={{marginTop: 30, padding: 15, backgroundColor: '#e0f2fe', borderRadius: 8}}>
          <Text style={{fontSize: 12, color: '#0369a1', fontFamily: 'RobotoBold'}}>Audit realizat cu tehnologie AI avansată</Text>
        </View>
      </Page>

      <Page style={styles.page}>
        <Text style={styles.tocTitle}>Cuprins</Text>
        {modules.map(([id, name], i) => (
          <Text key={id} style={styles.tocItem}>{i + 1}. {name}</Text>
        ))}
        <View style={{marginTop: 30, padding: 15, backgroundColor: '#f1f5f9', borderRadius: 8}}>
          <Text style={{fontSize: 10, color: '#475569'}}>Acest raport conține {modules.length} module de audit complet.</Text>
        </View>
        <Text style={styles.footer}>MrDelivery Audit Pro • Powered by OpenRouter AI</Text>
      </Page>

      {modules.map(([id, name], index) => (
        <Page key={id} style={styles.page} break={index > 0}>
          <Text style={styles.modTitle}>{name}</Text>
          <View style={styles.section}>
            {renderContent(results[id].content)}
          </View>
          <Text style={styles.footer}>MrDelivery Audit Pro • {restaurantData?.name}</Text>
          <Text style={styles.pageNr} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      ))}
    </Document>
  );
}
