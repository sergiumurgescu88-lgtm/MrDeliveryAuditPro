import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { ModuleResult } from '../context/AuditContext';

Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' });
Font.register({ family: 'RobotoBold', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf' });

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Roboto', fontSize: 10, color: '#1e293b', lineHeight: 1.7 },
  cover: { padding: 80, fontFamily: 'Roboto', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', backgroundColor: '#f8fafc' },
  title: { fontSize: 28, fontFamily: 'RobotoBold', marginBottom: 12, color: '#0f172a' },
  subtitle: { fontSize: 16, color: '#475569', marginBottom: 20 },
  meta: { fontSize: 11, color: '#64748b', marginBottom: 8 },
  tocTitle: { fontSize: 18, fontFamily: 'RobotoBold', marginBottom: 20, color: '#0f172a', borderBottom: '2px solid #3b82f6', paddingBottom: 8 },
  tocItem: { fontSize: 12, marginBottom: 8, color: '#334155', paddingLeft: 10 },
  modTitle: { fontSize: 18, fontFamily: 'RobotoBold', marginBottom: 15, color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: 6, marginTop: 10 },
  h2: { fontSize: 14, fontFamily: 'RobotoBold', marginTop: 20, marginBottom: 10, color: '#1e3a8a' },
  h3: { fontSize: 12, fontFamily: 'RobotoBold', marginTop: 16, marginBottom: 8, color: '#1e40af' },
  bullet: { fontSize: 10, marginLeft: 20, marginBottom: 6, color: '#334155', lineHeight: 1.6 },
  paragraph: { fontSize: 10, marginBottom: 10, color: '#334155', lineHeight: 1.7, textAlign: 'justify' },
  divider: { marginVertical: 15, borderBottom: '1px dashed #cbd5e1' },
  alert: { padding: 12, backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b', marginVertical: 10, fontSize: 10, borderRadius: 4 },
  alertCritical: { padding: 12, backgroundColor: '#fee2e2', borderLeft: '4px solid #ef4444', marginVertical: 10, fontSize: 10, borderRadius: 4 },
  alertSuccess: { padding: 12, backgroundColor: '#d1fae5', borderLeft: '4px solid #10b981', marginVertical: 10, fontSize: 10, borderRadius: 4 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: 8 },
  pageNr: { position: 'absolute', bottom: 30, right: 40, fontSize: 8, color: '#94a3b8' },
  section: { marginBottom: 25 }
});

const MODULE_NAMES: Record<string, string> = {
  '01_SEO': '01 SEO Analysis', '02_Maps': '02 Google Maps Images', '03_Delivery': '03 Delivery Platforms',
  '04_Website': '04 Website & Ordering', '05_Menu': '05 Menu Redesign', '06_Social': '06 Social Media',
  '07_Reviews': '07 Reviews Optimization', '08_LocalSEO': '08 Local Maps SEO', '09_Photo': '09 Photo Redesign',
  '10_Growth': '10 Growth Plan'
};

// Curăță textul de caractere corupte și normalizează spațiile
const cleanText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '')  // Control chars
    .replace(/\u001B\[[0-9;]*m/g, '')  // ANSI escape codes
    .replace(/\u200B/g, '')  // Zero-width space
    .replace(/\uFEFF/g, '')  // BOM
    .replace(/-\n/g, '')  // Hyphenated line breaks
    .replace(/\n\s*\n/g, '\n\n')  // Normalize paragraph breaks
    .replace(/([a-zăâîșț])\s+([a-zăâîșț])/gi, '$1$2')  // Remove spaces inside Romanian words
    .replace(/\s+/g, ' ')  // Normalize remaining whitespace
    .trim();
};

// Parsează conținutul AI în elemente React-PDF structurate
const renderContent = (text: string) => {
  const cleanedText = cleanText(text);
  if (!cleanedText) return <Text style={styles.paragraph}>—</Text>;
  
  // Împărțim în paragrafe pe baza newline-urilor
  const paragraphs = cleanedText.split('\n').filter(p => p.trim());
  const elements: JSX.Element[] = [];
  
  paragraphs.forEach((para, idx) => {
    const trimmed = para.trim();
    if (!trimmed) return;
    
    // ## Titlu principal
    if (trimmed.startsWith('## ')) {
      elements.push(<Text key={`h2-${idx}`} style={styles.h2}>{trimmed.replace('## ', '')}</Text>);
    }
    // ### Sub-titlu
    else if (trimmed.startsWith('### ')) {
      elements.push(<Text key={`h3-${idx}`} style={styles.h3}>{trimmed.replace('### ', '')}</Text>);
    }
    // ▸ Bullet point
    else if (trimmed.startsWith('▸ ') || trimmed.startsWith('• ') || trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      elements.push(<Text key={`bl-${idx}`} style={styles.bullet}>{trimmed.replace(/^[▸•*\-]\s*/, '')}</Text>);
    }
    // 🔴/⚠️/✅ alert box
    else if (trimmed.includes('🔴 CRITIC') || trimmed.includes('❌') || trimmed.includes('CRITIC') || trimmed.includes('LIPSĂ')) {
      elements.push(<View key={`ac-${idx}`} style={styles.alertCritical}><Text>{trimmed}</Text></View>);
    }
    else if (trimmed.includes('⚠️') || trimmed.includes('Oportunitate') || trimmed.includes('WARN') || trimmed.includes('Atenție')) {
      elements.push(<View key={`aw-${idx}`} style={styles.alert}><Text>{trimmed}</Text></View>);
    }
    else if (trimmed.includes('✅') || trimmed.includes('SUCCESS') || trimmed.includes('Recomandat') || trimmed.includes('Punct forte')) {
      elements.push(<View key={`as-${idx}`} style={styles.alertSuccess}><Text>{trimmed}</Text></View>);
    }
    // Separator ---
    else if (trimmed === '---' || trimmed.startsWith('━━') || trimmed.startsWith('──')) {
      elements.push(<View key={`dv-${idx}`} style={styles.divider} />);
    }
    // Paragraf normal
    else {
      elements.push(<Text key={`p-${idx}`} style={styles.paragraph}>{trimmed}</Text>);
    }
  });
  
  return elements;
};

interface Props { 
  results: Record<string, ModuleResult>; 
  restaurantData: any; 
}

export default function AuditPDF({ results, restaurantData }: Props) {
  const modules = Object.entries(MODULE_NAMES).filter(([id]) => results[id]?.status === 'completed');
  const date = new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Document>
      {/* Cover Page */}
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

      {/* Table of Contents */}
      <Page style={styles.page}>
        <Text style={styles.tocTitle}>Cuprins</Text>
        {modules.map(([id, name], i) => (
          <Text key={id} style={styles.tocItem}>{i + 1}. {name}</Text>
        ))}
        <View style={{marginTop: 30, padding: 15, backgroundColor: '#f1f5f9', borderRadius: 8}}>
          <Text style={{fontSize: 10, color: '#475569'}}>Acest raport conține {modules.length} module de audit complet pentru optimizarea prezenței online a restaurantului dumneavoastră.</Text>
        </View>
        <Text style={styles.footer}>MrDelivery Audit Pro • Powered by OpenRouter AI</Text>
      </Page>

      {/* Module Pages */}
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
