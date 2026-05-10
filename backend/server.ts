import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 🔒 CRITIC: Forțăm calea absolută pentru a ocoli problema PM2 cwd
dotenv.config({ path: '/var/www/mrdelivery.online/backend/.env' });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5174;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';
const RESEND_KEY = process.env.RESEND_API_KEY || '';

app.post('/api/audit/stream', async (req, res) => {
  const { prompt, restaurantData } = req.body;
  console.log(`📥 Request received: ${restaurantData?.name || 'Unknown'}`);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  if (!OPENROUTER_KEY) {
    console.error('❌ OpenRouter Key Missing!');
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: '[ERROR] Cheia API lipsește. Verifică backend/.env' } }] })}\n\n`);
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
        model: 'google/gemini-2.0-flash-001',
        stream: true,
        max_tokens: 1500,
        temperature: 0.4,
        messages: [
          { role: 'system', content: 'Consultant HORECA senior. Răspuns concis, acționabil, specific România. Max 600 cuvinte. Structură: Analiză, Recomandări, KPIs, Quick Wins.' },
          { role: 'user', content: `${prompt}\n\nDate: ${JSON.stringify(restaurantData)}` }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('❌ OpenRouter Error:', response.status, err);
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: `[ERROR] OpenRouter ${response.status}: ${err}` } }] })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      const chunk = decoder.decode(value);
      res.write(chunk); // Forwardăm exact ce trimite OpenRouter (format standard data: {...})
    }
    res.write('data: [DONE]\n\n');
  } catch (err: any) {
    console.error('❌ Stream Error:', err.message);
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
        from: 'MrDelivery Audit <onboarding@resend.dev>',
        to: [email],
        subject: `📊 Audit Digital pentru ${restaurantName || 'Restaurant'}`,
        html: `<h1>Salut!</h1><p>Mulțumim că ai testat MrDelivery Audit Pro.</p>`
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    console.log(`✅ Email sent to ${email}`);
    res.json({ success: true });
  } catch (err: any) {
    console.error('❌ Email failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
  console.log(`🔑 OpenRouter: ${OPENROUTER_KEY ? 'Loaded (' + OPENROUTER_KEY.slice(0,12) + '...)' : 'MISSING'}`);
  console.log(`📧 Resend: ${RESEND_KEY ? 'Active' : 'MISSING'}`);
});
