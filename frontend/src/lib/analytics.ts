declare global {
  interface Window { gtag: any; }
}

// 🔑 Înlocuiește cu Measurement ID-ul tău real din GA4
const GA4_ID = 'G-XXXXXXXXXX';

export const trackPageView = (path: string) => {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA4_ID, { page_path: path });
  }
};

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};
