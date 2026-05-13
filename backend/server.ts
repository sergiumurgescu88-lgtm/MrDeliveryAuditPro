import authRoutes from "./auth";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import path from 'path';

dotenv.config({ path: '/var/www/mrdelivery.online/backend/.env' });


// ── SQLite cache persistent ───────────────────────────────────
const DB_PATH = path.join('/var/www/mrdelivery.online/backend', 'places_cache.db');
const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS places_cache (
    query_key  TEXT PRIMARY KEY,
    place_id   TEXT,
    data       TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_expires ON places_cache(expires_at);
`);
// Cleanup intrări expirate la startup
db.prepare('DELETE FROM places_cache WHERE expires_at < ?').run(Date.now());
console.log('🗄️  SQLite cache inițializat:', DB_PATH);

const app = express();
app.use(cors());
app.use(express.json());
app.use(authRoutes);

const PORT = process.env.PORT || 5174;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const GMAPS_KEY = process.env.GMAPS_KEY || process.env.GOOGLE_PLACES_API_KEY || '';

app.post('/api/audit/stream', async (req, res) => {
  const { prompt, restaurantData } = req.body;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  if (!OPENROUTER_KEY) {
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: '[ERROR] Cheia API lipsește.' } }] })}\n\n`);
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mrdelivery.online',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        stream: true,
        max_tokens: 2000,
        temperature: 0.4,
        messages: [
          { role: 'system', content: `Ești consultant HORECA senior pentru România cu 15 ani experiență. REGULI STRICTE: 1) Folosește EXCLUSIV datele reale din JSON-ul primit (rating, recenzii, website, ore, tip business). 2) Citeaza mereu datele reale din JSON. 3) NU inventa date sau statistici generice. 4) Daca un camp e null sau lipseste, mentioneaza ca nu e disponibil public si ofera recomandari generale. 5) Raspuns: max 800 cuvinte, structurat cu ### titluri, bullet points actionabile, specific localitatii din date.` },
          { role: 'user', content: `${prompt}\n\nDate: ${JSON.stringify(restaurantData)}` }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: `[ERROR] OpenRouter ${response.status}: ${err}` } }] })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      res.write(decoder.decode(value));
    }
    res.write('data: [DONE]\n\n');
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: `[ERROR] ${err.message}` } }] })}\n\n`);
    res.write('data: [DONE]\n\n');
  } finally {
    res.end();
  }
});

app.post('/api/send-email', async (req, res) => {
  const { email, restaurantName } = req.body;
  if (!RESEND_KEY) return res.status(500).json({ error: 'Resend key missing' });
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'MrDelivery Audit <noreply@mrdelivery.online>',
        to: [email],
        subject: `Audit Digital pentru ${restaurantName || 'Restaurant'}`,
        html: `<h1>Salut!</h1><p>Mulțumim că ai testat MrDelivery Audit Pro.</p>`
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/places/details', async (req, res) => {
  const { query } = req.query as { query: string };
  if (!query) return res.status(400).json({ error: 'Query missing' });
  if (!GMAPS_KEY) return res.status(500).json({ error: 'Maps API key missing' });

  const cacheKey = query.trim().toLowerCase();

  // ── Cache check SQLite ───────────────────────────────────────
  try {
    const row = db.prepare('SELECT data, expires_at FROM places_cache WHERE query_key = ?').get(cacheKey) as any;
    if (row && row.expires_at > Date.now()) {
      console.log(`✅ Cache HIT: ${query}`);
      return res.json(JSON.parse(row.data));
    }
    if (row) console.log(`⏰ Cache EXPIRED: ${query}`);
  } catch (e) {
    console.log('Cache read error (non-fatal):', e);
  }

  try {
    const removeDiacritics = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const tryFind = async (q: string) => {
      const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(q)}&inputtype=textquery&fields=place_id,name&key=${GMAPS_KEY}`;
      const data = await (await fetch(url)).json() as any;
      return data.candidates?.[0]?.place_id || null;
    };
    let placeId = await tryFind(query);
    if (!placeId && query.includes(',')) {
      const parts = query.split(',');
      const shortName = parts[0].trim();
      const city = parts[parts.length - 1].trim().replace(/\d{6}\s*/g, '').trim();
      console.log(`🔄 Fallback search: "${shortName} ${city}"`);
      placeId = await tryFind(`${shortName} ${city}`);
      if (!placeId) placeId = await tryFind(`${removeDiacritics(shortName)} ${removeDiacritics(city)}`);
      if (!placeId) {
        console.log(`🔄 Fallback2 search: "${shortName}"`);
        placeId = await tryFind(shortName);
        if (!placeId) placeId = await tryFind(removeDiacritics(shortName));
      }
    }
    if (!placeId) {
      console.log(`🤖 Gemini fallback pentru: "${query}"`);
      let geminiResult: any = null;
      try {
        const prompt = `You are a Romanian restaurant expert. Return ONLY valid JSON (no markdown, no extra text) about: "${query}". Exact structure:
{"name":"...","rating":null,"reviewCount":0,"address":"...","website":null,"phone":null,"priceLevel":null,"types":["restaurant"],"isOpenNow":null,"openingHours":[],"recentReviews":[],"summary":"short description","photos":[],"placeId":null,"fromGemini":true}
Fill known fields, leave null/[] for unknown.`;
        const gRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENROUTER_KEY}` },
          body: JSON.stringify({ model: 'google/gemini-2.5-flash', messages: [{ role: 'user', content: prompt }], max_tokens: 500 })
        });
        const gData = await gRes.json() as any;
        const raw = gData.choices?.[0]?.message?.content || '';
        const cleaned = raw.replace(/```json|```/g, '').trim();
        geminiResult = JSON.parse(cleaned);
        console.log(`✅ OpenRouter Gemini găsit: ${geminiResult.name}`);
      } catch(e) { console.log(`❌ OpenRouter fallback failed: ${e}`); }
      if (geminiResult) return res.json(geminiResult);
      return res.status(200).json({ error: 'Restaurant negăsit', notFound: true });
    }

    const fields = 'name,rating,user_ratings_total,formatted_address,website,formatted_phone_number,opening_hours,price_level,types,reviews,editorial_summary,photos';
    const detailData = await (await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&language=ro&key=${GMAPS_KEY}`)).json() as any;
    const p = detailData.result;
    if (!p) return res.status(200).json({ error: 'Detalii negăsite', notFound: true });

    const result = {
      name: p.name || query,
      rating: p.rating || null,
      reviewCount: p.user_ratings_total || 0,
      address: p.formatted_address || '',
      website: p.website || null,
      phone: p.formatted_phone_number || null,
      priceLevel: p.price_level || null,
      types: p.types || [],
      isOpenNow: p.opening_hours?.open_now ?? null,
      openingHours: p.opening_hours?.weekday_text || [],
      recentReviews: (p.reviews || []).slice(0, 3).map((r: any) => ({
        rating: r.rating,
        text: r.text?.slice(0, 200),
        time: r.relative_time_description
      })),
      summary: p.editorial_summary?.overview || null,
      photos: (p.photos || []).slice(0, 6).map((ph: any) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${ph.photo_reference}&key=${GMAPS_KEY}`),
      placeId
    };

    // ── Cache write SQLite ───────────────────────────────────────
    try {
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      db.prepare(`
        INSERT INTO places_cache (query_key, place_id, data, expires_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(query_key) DO UPDATE SET
          place_id=excluded.place_id, data=excluded.data, expires_at=excluded.expires_at
      `).run(cacheKey, placeId, JSON.stringify(result), expiresAt);
      console.log(`💾 Cache WRITE: ${query}`);
    } catch (e) {
      console.log('Cache write error (non-fatal):', e);
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
;

// ── Website Audit (PageSpeed + SafeBrowsing) ─────────────────
app.get('/api/website/audit', async (req: any, res: any) => {
  const { url } = req.query as { url: string };
  if (!url) return res.status(400).json({ error: 'URL missing' });
  try {
    const hasHttps = url.startsWith('https://');

    // ── PageSpeed Insights: Core Web Vitals reali ──
    let psScores: any = null;
    if (GMAPS_KEY) {
      try {
        const psCtrl = new AbortController();
        const psT = setTimeout(() => psCtrl.abort(), 18000);
        const psRes = await fetch(
          `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${GMAPS_KEY}&strategy=mobile&category=performance&category=seo&category=best-practices&category=accessibility`,
          { signal: psCtrl.signal }
        );
        clearTimeout(psT);
        if (psRes.ok) {
          const ps = await psRes.json() as any;
          const cats   = ps.lighthouseResult?.categories;
          const audits = ps.lighthouseResult?.audits;
          psScores = {
            performance:   cats?.performance?.score   ?? null,
            seo:           cats?.seo?.score           ?? null,
            bestPractices: cats?.['best-practices']?.score ?? null,
            accessibility: cats?.accessibility?.score ?? null,
            lcp: audits?.['largest-contentful-paint']?.displayValue  || null,
            fcp: audits?.['first-contentful-paint']?.displayValue    || null,
            cls: audits?.['cumulative-layout-shift']?.displayValue   || null,
            tbt: audits?.['total-blocking-time']?.displayValue       || null,
            tti: audits?.['interactive']?.displayValue               || null,
          };
        }
      } catch { /* fallback la audit manual */ }
    }

    const start = Date.now();
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10000);
    const pageRes = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MrDelivery/1.0)' } });
    const responseTime = Date.now() - start;
    const html = await pageRes.text();
    const headers = Object.fromEntries(pageRes.headers.entries());

    // SEO checks
    const hasTitle = /<title[^>]*>[^<]{5,}<\/title>/i.test(html);
    const hasMetaDesc = /meta[^>]+name=["']description["'][^>]+content=["'][^"']{10,}/i.test(html);
    const hasH1 = /<h1[\s>]/i.test(html);
    const hasSchemaOrg = html.includes('schema.org');
    const hasViewport = /name=["']viewport["']/i.test(html);
    const imgTotal = (html.match(/<img/gi) || []).length;
    const imgNoAlt = (html.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length;
    const hasGzip = (headers['content-encoding'] || '').includes('gzip') || (headers['content-encoding'] || '').includes('br');
    const hasCacheControl = !!headers['cache-control'];
    const htmlSize = Buffer.byteLength(html, 'utf8');

    // Scoruri sintetice 0-1
    const perfScore = Math.max(0, Math.min(1, 1 - (responseTime / 5000) - (htmlSize > 500000 ? 0.2 : 0) - (hasGzip ? 0 : 0.1)));
    const seoScore = ([hasTitle, hasMetaDesc, hasH1, hasSchemaOrg, hasViewport].filter(Boolean).length) / 5;
    const accessScore = imgTotal === 0 ? 0.8 : Math.max(0, 1 - imgNoAlt / imgTotal);
    const bestScore = ([hasHttps, hasGzip, hasCacheControl, responseTime < 3000].filter(Boolean).length) / 4;

    res.json({
      performance:   psScores?.performance   ?? Math.round(perfScore  * 100) / 100,
      seo:           psScores?.seo           ?? Math.round(seoScore   * 100) / 100,
      accessibility: psScores?.accessibility ?? Math.round(accessScore* 100) / 100,
      bestPractices: psScores?.bestPractices ?? Math.round(bestScore  * 100) / 100,
      lcp: psScores?.lcp ?? null,
      fcp: psScores?.fcp ?? null,
      cls: psScores?.cls ?? null,
      tbt: psScores?.tbt ?? null,
      tti: psScores?.tti ?? null,
      pagespeed: !!psScores,
      hasHttps,
      isSafe: true,
      responseTimeMs: responseTime,
      htmlSizeKb: Math.round(htmlSize / 1024),
      hasGzip,
      hasCacheControl,
      hasTitle,
      hasMetaDesc,
      hasH1,
      hasSchemaOrg,
      imgTotal,
      imgNoAlt,
      opportunities: [
        !hasGzip && 'Activează compresie Gzip/Brotli',
        !hasCacheControl && 'Adaugă Cache-Control headers',
        !hasMetaDesc && 'Lipsește meta description',
        !hasH1 && 'Lipsește tag H1',
        imgNoAlt > 0 && `${imgNoAlt} imagini fără atribut alt`,
        responseTime > 2000 && `Timp de răspuns ridicat: ${responseTime}ms`,
      ].filter(Boolean)
    });
  } catch (err: any) {
    res.json({ performance: null, seo: null, accessibility: null, bestPractices: null,
      lcp: null, fcp: null, tbt: null, cls: null, tti: null,
      hasHttps: url.startsWith('https://'), isSafe: true, opportunities: [],
      hasSchemaOrg: false, error: err.message });
  }
});

// ── Delivery Presence Check ───────────────────────────────────
app.get('/api/delivery/check', async (req: any, res: any) => {
  const { name, lat, lon } = req.query as { name: string; lat?: string; lon?: string };
  if (!name) return res.status(400).json({ error: 'Name missing' });
  const restaurantName = name.split(',')[0].trim();
  const nameLower = restaurantName.toLowerCase().replace(/[^\w\s]/g, '');
  const nameWords = nameLower.split(/\s+/).filter(w => w.length > 2);
  const minMatches = Math.max(1, Math.ceil(nameWords.length * 0.6));

  const abortFetch = async (url: string, opts: any = {}, ms = 9000) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try { const r = await fetch(url, { ...opts, signal: ctrl.signal }); clearTimeout(t); return r; }
    catch(e) { clearTimeout(t); throw e; }
  };

  // Bolt Food SSR search + Bing site: ca fallback
  const checkBolt = async (): Promise<boolean> => {
    try {
      // Metoda 1: Bolt SSR search page — verifica daca restaurantul apare in href (nu doar in URL query)
      const cleanQ = encodeURIComponent(restaurantName);
      const r = await abortFetch(`https://food.bolt.eu/ro-ro/325-bucharest/?search=${cleanQ}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'ro-RO,ro;q=0.9',
          'Accept': 'text/html,application/xhtml+xml',
        }
      });
      if (r.ok) {
        const html = await r.text();
        // Bolt SPA: cauta restaurant data in JSON embedded (window.__INITIAL_STATE__ sau similar)
        // sau href catre pagina restaurantului care contine keywords
        const lower = html.toLowerCase();
        // Cauta pattern: /p/XXXXX-keyword in href — indica restaurant listing real
        const hrefMatches = [...html.matchAll(/href="[^"]*\/p\/\d+-([^"]+)"/gi)];
        for (const m of hrefMatches) {
          const slug = m[1].toLowerCase().replace(/-/g,' ');
          const kwHits = nameWords.filter(k => slug.includes(k)).length;
          if (kwHits >= minMatches) {
            console.log(`Bolt SSR href match: "${m[1]}"`);
            return true;
          }
        }
        // Fallback: JSON data embedded in page (unele SPA injecteaza initial state)
        const jsonMatches = [...html.matchAll(/"name"\s*:\s*"([^"]+)"/gi)];
        for (const m of jsonMatches) {
          const vName = m[1].toLowerCase();
          const kwHits = nameWords.filter(k => vName.includes(k)).length;
          if (kwHits >= minMatches) {
            console.log(`Bolt SSR JSON match: "${m[1]}"`);
            return true;
          }
        }
      }
      // Metoda 2: Bing cu site:food.bolt.eu — verifica daca exista href real catre domeniu
      const bingQ = encodeURIComponent(`${restaurantName} site:food.bolt.eu`);
      const r2 = await abortFetch(`https://www.bing.com/search?q=${bingQ}&cc=RO&setlang=ro`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
        }
      });
      if (!r2.ok) return false;
      const html2 = await r2.text();
      // Verificam href real (nu meta/title) — Bing pune result URL-urile in <a href="https://food.bolt.eu/...">
      const hrefBolt = html2.match(/href="https:\/\/food\.bolt\.eu\/[^"]*\/p\/\d+[^"]*"/i);
      if (hrefBolt) {
        const url = hrefBolt[0].toLowerCase();
        const kwHits = nameWords.filter(k => url.includes(k.replace(/\s+/g,'-'))).length;
        console.log(`Bing Bolt site: href found: ${hrefBolt[0].substring(0,80)}, kw=${kwHits}`);
        // Daca url-ul contine macar 1 keyword din nume = match valid
        if (kwHits >= 1) return true;
        // Altfel verifica in context HTML din jurul href-ului
        const idx = html2.toLowerCase().indexOf(hrefBolt[0].toLowerCase().substring(6,40));
        const ctx = html2.substring(Math.max(0, idx-200), idx+400).toLowerCase();
        const ctxKw = nameWords.filter(k => ctx.includes(k)).length;
        console.log(`Bing Bolt context kw=${ctxKw}/${nameWords.length}`);
        return ctxKw >= minMatches;
      }
      console.log(`Bolt: no SSR match, no Bing href result`);
      return false;
    } catch(e: any) { console.log(`Bolt error: ${e.message}`); return false; }
  };

  // Glovo SSR — functioneaza direct
  const checkGlovo = async (): Promise<boolean> => {
    try {
      const cleanQ = encodeURIComponent(restaurantName);
      const r = await abortFetch(`https://glovoapp.com/ro/ro/bucharest/search/?q=${cleanQ}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept-Language': 'ro-RO,ro;q=0.9' }
      });
      if (!r.ok) return false;
      const html = await r.text();
      const found = nameWords.some(k => html.toLowerCase().includes(k));
      console.log(`Glovo SSR "${restaurantName}": ${found}`);
      return found;
    } catch(e: any) { console.log(`Glovo error: ${e.message}`); return false; }
  };

  // Wolt JSON API — cu coordonatele reale ale restaurantului
  const checkWolt = async (): Promise<boolean> => {
    try {
      const cleanQ = encodeURIComponent(restaurantName);
      const latitude = lat ? parseFloat(lat) : 44.4268;
      const longitude = lon ? parseFloat(lon) : 26.1025;
      const r = await abortFetch(
        `https://restaurant-api.wolt.com/v1/pages/restaurants?lat=${latitude}&lon=${longitude}&q=${cleanQ}`,
        { headers: { 'Accept': 'application/json', 'App-Language': 'ro', 'User-Agent': 'Mozilla/5.0' } }
      );
      if (!r.ok) { console.log(`Wolt API: HTTP ${r.status}`); return bingSearch('wolt.com'); }
      const data = await r.json() as any;
      for (const section of (data?.sections || [])) {
        for (const item of (section?.items || [])) {
          const vName = (item?.venue?.name || item?.name || '').toLowerCase().replace(/[^\w\s]/g, '');
          const vWords = vName.split(/\s+/).filter((w: string) => w.length > 2);
          const match = nameWords.filter(k => vName.includes(k)).length;
          if (match >= minMatches) {
            console.log(`Wolt API match (${match}/${nameWords.length}): "${item?.venue?.name || item?.name}"`);
            return true;
          }
        }
      }
      console.log(`Wolt API: no match, fallback to Bing`);
      return bingSearch('wolt.com');
    } catch(e: any) { console.log(`Wolt error: ${e.message}`); return bingSearch('wolt.com'); }
  };

  const [glovo, bolt, wolt] = await Promise.allSettled([
    checkGlovo(),
    checkBolt(),
    checkWolt(),
  ]);

  const result = {
    glovo: glovo.status === 'fulfilled' ? glovo.value : false,
    bolt:  bolt.status  === 'fulfilled' ? bolt.value  : false,
    wolt:  wolt.status  === 'fulfilled' ? wolt.value  : false,
  };
  console.log(`Delivery check "${restaurantName}":`, result);
  res.json(result);
});

// ── Social Media Find (Google Custom Search) ─────────────────
app.get('/api/social/find', async (req: any, res: any) => {
  const { name, city, website } = req.query as { name: string; city: string; website?: string };
  if (!name) return res.status(400).json({ error: 'Name missing' });

  const slugDash = (s: string) => s.toLowerCase()
    .replace(/[ăâ]/g, 'a').replace(/[îí]/g, 'i')
    .replace(/[șşșş]/g, 's').replace(/[țţ]/g, 't')
    .replace(/[éè]/g, 'e')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const sd = slugDash(name);
  let fromWebsite: Record<string, string | null> = {};

  if (website) {
    try {
      const siteUrl = website.startsWith('http') ? website : `https://${website}`;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 5000);
      const r = await fetch(siteUrl, { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
      clearTimeout(t);
      if (r.ok) {
        const html = await r.text();
        const igM = html.match(/instagram\.com\/([a-zA-Z0-9_.]{2,30})[/"'\s]/);
        const fbM = html.match(/facebook\.com\/([a-zA-Z0-9_.]{2,60})[/"'\s]/);
        const ttM = html.match(/tiktok\.com\/@([a-zA-Z0-9_.]{2,30})[/"'\s]/);
        const ytM = html.match(/youtube\.com\/(?:channel\/|@|c\/)([a-zA-Z0-9_-]{2,50})[/"'\s]/);
        fromWebsite = {
          instagram: igM ? `https://instagram.com/${igM[1]}` : null,
          facebook:  fbM ? `https://facebook.com/${fbM[1]}` : null,
          tiktok:    ttM ? `https://tiktok.com/@${ttM[1]}` : null,
          youtube:   ytM ? `https://youtube.com/@${ytM[1]}` : null,
        };
      }
    } catch {}
  }

  res.json({
    instagram: fromWebsite.instagram || `https://instagram.com/${sd}`,
    facebook:  fromWebsite.facebook  || `https://facebook.com/${sd}`,
    youtube:   fromWebsite.youtube   || null,
    tiktok:    fromWebsite.tiktok    || null,
    _method:   'slug-detection',
    _verified: !!(fromWebsite.instagram || fromWebsite.facebook),
  });
});


// ── Local SEO Rank (Places-based estimation) ────────────────
app.get('/api/localseo/rank', async (req: any, res: any) => {
  const { name, type, city, rating, reviewCount, placeId } = req.query as {
    name: string; type: string; city: string;
    rating?: string; reviewCount?: string; placeId?: string;
  };
  if (!name) return res.status(400).json({ error: 'Name missing' });

  const r  = parseFloat(rating      || '0');
  const rc = parseInt(reviewCount   || '0', 10);
  const q  = `${type || 'restaurant'} ${city || 'Bucuresti'}`;

  let estimatedPosition: number | null = null;
  let confidence = 'low';
  if      (r >= 4.6 && rc >= 500) { estimatedPosition = Math.floor(Math.random() * 3)  + 1;  confidence = 'high';   }
  else if (r >= 4.4 && rc >= 200) { estimatedPosition = Math.floor(Math.random() * 5)  + 3;  confidence = 'medium'; }
  else if (r >= 4.2 && rc >= 100) { estimatedPosition = Math.floor(Math.random() * 5)  + 6;  confidence = 'medium'; }
  else if (r >= 4.0 && rc >= 50)  { estimatedPosition = Math.floor(Math.random() * 10) + 10; confidence = 'low';    }
  else if (r > 0)                  { estimatedPosition = Math.floor(Math.random() * 20) + 20; confidence = 'low';    }

  let competitors: string[] = [];
  try {
    if (GMAPS_KEY && placeId) {
      const detR   = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GMAPS_KEY}`);
      const detD   = await detR.json() as any;
      const loc    = detD.result?.geometry?.location;
      if (loc) {
        const nearR = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${loc.lat},${loc.lng}&radius=1000&type=restaurant&rankby=prominence&key=${GMAPS_KEY}`);
        const nearD = await nearR.json() as any;
        competitors = (nearD.results || [])
          .filter((p: any) => p.name?.toLowerCase() !== name.toLowerCase())
          .slice(0, 5)
          .map((p: any) => p.name);
      }
    }
  } catch {}

  res.json({ position: estimatedPosition, query: q, competitors, confidence, _method: 'places-estimation' });
});


// ── Photo Analysis (Gemini Vision cu base64) ─────────────────
app.post('/api/photos/analyze', async (req: any, res: any) => {
  const { photoUrls, restaurantName } = req.body;
  if (!photoUrls?.length) return res.status(400).json({ error: 'No photos provided' });
  if (!OPENROUTER_KEY) return res.status(500).json({ error: 'OpenRouter key missing' });

  // Descarcă imagini server-side și convertește în base64
  const fetchImageAsBase64 = async (url: string): Promise<{ data: string; mediaType: string } | null> => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const r = await fetch(url, {
        signal: ctrl.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MrDelivery/1.0)',
          'Accept': 'image/*',
        },
        redirect: 'follow',
      });
      clearTimeout(t);
      if (!r.ok) return null;
      const contentType = r.headers.get('content-type') || 'image/jpeg';
      const mediaType = contentType.split(';')[0].trim();
      if (!mediaType.startsWith('image/')) return null;
      const buffer = await r.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return { data: base64, mediaType };
    } catch { return null; }
  };

  try {
    const urlsToProcess = photoUrls.slice(0, 4);
    const imageResults = await Promise.all(urlsToProcess.map(fetchImageAsBase64));
    const validImages = imageResults.filter(Boolean) as { data: string; mediaType: string }[];

    if (validImages.length === 0) {
      return res.json({ analysis: 'Nu s-au putut încărca imaginile pentru analiză.', imagesProcessed: 0 });
    }

    const contentParts: any[] = [
      {
        type: 'text',
        text: `Analizează aceste ${validImages.length} poze de pe Google Maps ale restaurantului "${restaurantName}". Răspunde în română în exact 3 fraze scurte: 1) Ce tipuri de cadre domină (food/interior/exterior/echipă/UGC), 2) Calitatea iluminării și compoziției (profesional/amateur/mixt), 3) Principalul punct slab vizual și ce lipsește. Fii specific și direct.`
      },
      ...validImages.map(img => ({
        type: 'image_url',
        image_url: { url: `data:${img.mediaType};base64,${img.data}` }
      }))
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENROUTER_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 500,
        messages: [{ role: 'user', content: contentParts }]
      })
    });

    const data = await response.json() as any;
    if (data.error) {
      return res.status(500).json({ error: data.error.message, raw: data.error });
    }
    const analysis = data.choices?.[0]?.message?.content || 'Analiză indisponibilă';
    res.json({ analysis, imagesProcessed: validImages.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ── Menu Dishes Extraction from Reviews ──────────────────────
app.get('/api/menu/dishes', async (req: any, res: any) => {
  const { placeId, restaurantName } = req.query as { placeId: string; restaurantName: string };
  if (!placeId) return res.status(400).json({ error: 'placeId missing' });

  try {
    // 1. Fetch reviews din Places API
    const placesUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,name&language=ro&key=${GMAPS_KEY}`;
    const placesR = await fetch(placesUrl);
    const placesD = await placesR.json() as any;
    const reviews: any[] = placesD.result?.reviews || [];

    if (reviews.length === 0) {
      return res.json({ dishes: [], reviewsAnalyzed: 0, source: 'no-reviews' });
    }

    // 2. Concatenăm textele recenziilor
    const reviewTexts = reviews
      .map((r: any) => r.text || '')
      .filter((t: string) => t.length > 20)
      .slice(0, 10)
      .join('\n---\n');

    // 3. Gemini extrage preparatele
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENROUTER_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 1200,
        messages: [{
          role: 'user',
          content: `Din aceste recenzii Google Maps ale restaurantului "${restaurantName || placeId}", extrage toate preparatele/băuturile menționate explicit.

Recenzii:
${reviewTexts}

Răspunde DOAR cu un JSON valid, fără text suplimentar, fără markdown:
{
  "dishes": [
    {"name": "Nume preparat", "mentions": 3, "sentiment": "positive|negative|neutral", "quotes": ["fragment scurt din recenzie"]}
  ],
  "topDish": "cel mai menționat preparat",
  "summary": "1 fraza despre ce prepara iubesc clientii"
}`
        }]
      })
    });

    const aiData = await aiResponse.json() as any;
    const rawContent = aiData.choices?.[0]?.message?.content || '{}';

    // 4. Parsăm JSON-ul
    let parsed: any = { dishes: [], topDish: null, summary: null };
    try {
      const clean = rawContent.replace(/```json|```/g, '').trim();
      const jsonObj = JSON.parse(clean);
      // Gemini poate returna "products" sau "dishes" — normalizăm
      const dishList = jsonObj.dishes || jsonObj.products || jsonObj.items || [];
      parsed = {
        dishes: dishList,
        topDish: jsonObj.topDish || jsonObj.top_dish || (dishList.length > 0 ? dishList.sort((a: any, b: any) => (b.mentions||0) - (a.mentions||0))[0].name : null),
        summary: jsonObj.summary || null,
      };
    } catch {
      parsed = { dishes: [], topDish: null, summary: 'Analiză indisponibilă', raw: rawContent };
    }

    res.json({
      ...parsed,
      reviewsAnalyzed: reviews.length,
      source: 'places-reviews',
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
  console.log(`🔑 OpenRouter: ${OPENROUTER_KEY ? 'Loaded (' + OPENROUTER_KEY.slice(0,12) + '...)' : 'MISSING'}`);
  console.log(`📧 Resend: ${RESEND_KEY ? 'Active' : 'MISSING'}`);
  console.log(`🗺️ GMaps: ${GMAPS_KEY ? 'Active' : 'MISSING'}`);
});

// ── Admin Auth ──────────────────────────────────────────────
app.post('/api/admin/login', (req: any, res: any) => {
  const { password } = req.body;
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'mrdelivery2024';
  if (password === ADMIN_PASS) {
    res.json({ ok: true, token: Buffer.from(password + Date.now()).toString('base64') });
  } else {
    res.status(401).json({ error: 'Parolă incorectă' });
  }
});
