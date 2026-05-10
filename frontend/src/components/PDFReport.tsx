import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer';

// 🔤 Fonturi locale (servite direct din public/fonts/, zero erori 404/CORS)
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf', fontWeight: 'normal', fontStyle: 'normal' },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 'bold', fontStyle: 'normal' },
    { src: '/fonts/Inter-Italic.ttf', fontWeight: 'normal', fontStyle: 'italic' },
    { src: '/fonts/Inter-BoldItalic.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Inter', fontSize: 10, color: '#111827', backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 10, borderBottom: '2px solid #f59e0b' },
  logo: { fontSize: 16, fontWeight: 'bold', color: '#d97706' },
  subtitle: { fontSize: 9, color: '#6b7280' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 6, color: '#0f172a' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 6, color: '#b45309', backgroundColor: '#fef3c7', padding: 4, borderRadius: 4 },
  text: { marginBottom: 4, lineHeight: 1.4 },
  bullet: { marginLeft: 10, marginBottom: 2 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#9ca3af', borderTop: '1px solid #e5e7eb', paddingTop: 8 },
  tocItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, fontSize: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  card: { width: '48%', padding: 8, backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 4, marginBottom: 6 },
  cardTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
  cardValue: { fontSize: 12, fontWeight: 'bold', color: '#d97706' }
});

const MODULES = [
  '01 SEO Analysis', '02 Google Maps Images', '03 Delivery Platforms', '04 Website & Ordering',
  '05 Menu Redesign', '06 Social Media', '07 Reviews Optimization', '08 Local Maps SEO',
  '09 Photo Redesign', '10 Growth Plan'
];

export default function PDFReport({ restaurantName = 'Restaurant Demo', address = 'Adresa Demo', rating = '4.2' }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>MrDelivery Audit Pro</Text>
            <Text style={styles.subtitle}>Raport Digital Complet • {new Date().toLocaleDateString('ro-RO')}</Text>
          </View>
          <Text style={{ fontSize: 9, color: '#6b7280' }}>Powered by OpenRouter AI</Text>
        </View>
        <Text style={styles.title}>Audit Digital: {restaurantName}</Text>
        <Text style={{ ...styles.text, color: '#4b5563' }}>{address} • Rating Google: ⭐ {rating}</Text>
        <View style={{ marginTop: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#0f172a' }}>Cuprins</Text>
          {MODULES.map((m, i) => (
            <View key={i} style={styles.tocItem}>
              <Text>{m}</Text>
              <Text style={{ color: '#9ca3af' }}>Pag. {i + 2}</Text>
            </View>
          ))}
        </View>
        <View style={styles.grid}>
          <View style={styles.card}><Text style={styles.cardTitle}>Scor General</Text><Text style={styles.cardValue}>68/100</Text></View>
          <View style={styles.card}><Text style={styles.cardTitle}>Vizibilitate Locală</Text><Text style={styles.cardValue}>Medie</Text></View>
          <View style={styles.card}><Text style={styles.cardTitle}>Potențial Creștere</Text><Text style={styles.cardValue}>+42%</Text></View>
          <View style={styles.card}><Text style={styles.cardTitle}>Termen Implementare</Text><Text style={styles.cardValue}>90 Zile</Text></View>
        </View>
        <Text style={{ marginTop: 20, fontSize: 9, color: '#6b7280', fontStyle: 'italic' }}>
          Notă: Acest raport conține recomandări generate de AI pe baza datelor publice și a bunelor practici din industria HORECA. 
          Pentru implementare completă, solicitați consultanță dedicată la contact@mrdelivery.ro
        </Text>
        <Text style={styles.footer}>© {new Date().getFullYear()} MrDelivery.ro • Restaurant Audit Pro • Confidențial</Text>
      </Page>

      {MODULES.map((mod, i) => (
        <Page key={i} size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{mod}</Text>
            <Text style={styles.text}>
              Această secțiune va fi populată dinamic cu datele generate live de AI. 
              Structura include: analiză detaliată, metrici cheie, recomandări prioritizate și checklist acționabil.
            </Text>
            <Text style={styles.bullet}>• Identificarea punctelor critice de optimizare</Text>
            <Text style={styles.bullet}>• Strategii specifice pieței din România</Text>
            <Text style={styles.bullet}>• Pași de implementare cu estimare de impact</Text>
            <Text style={styles.bullet}>• KPIs de urmărit post-implementare</Text>
          </View>
          <Text style={styles.footer}>© {new Date().getFullYear()} MrDelivery.ro • {mod}</Text>
        </Page>
      ))}
    </Document>
  );
}

export function PDFDownloadButton({ restaurantName, address, rating }: { restaurantName?: string, address?: string, rating?: string }) {
  return (
    <PDFDownloadLink
      document={<PDFReport restaurantName={restaurantName} address={address} rating={rating} />}
      fileName={`Audit_${restaurantName?.replace(/\s+/g, '_') || 'Restaurant'}_${new Date().toISOString().slice(0,10)}.pdf`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px',
        backgroundColor: '#f59e0b', color: '#000', fontWeight: 600, borderRadius: 8,
        textDecoration: 'none', fontSize: 14, border: 'none', cursor: 'pointer'
      }}
    >
      {({ loading }: { loading: boolean }) => loading ? '⏳ Se generează PDF...' : '📥 Descarcă Raport PDF'}
    </PDFDownloadLink>
  );
}
