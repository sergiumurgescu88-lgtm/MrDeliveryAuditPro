import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import { getUser, createUser, deductCredits, addCredits } from './db';

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'mrdelivery_jwt_fallback_2026';

let stripeInstance: Stripe | null = null;
const getStripe = () => {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || !key.startsWith('sk_')) throw new Error('STRIPE_SECRET_KEY missing or invalid');
    stripeInstance = new Stripe(key, { apiVersion: '2023-10-16' });
  }
  return stripeInstance;
};

router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ error: 'Invalid token' });
    const user = getUser(payload.sub) || createUser(payload.sub, payload.email!, payload.name!);
    const jwtToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token: jwtToken, user: { id: user.id, name: user.name, email: user.email, credits: user.credits } });
  } catch (err: any) { res.status(401).json({ error: err.message }); }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = getUser(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, credits: user.credits } });
  } catch (err: any) { res.status(401).json({ error: 'Invalid token' }); }
});

router.post('/credits/spend', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const success = deductCredits(decoded.id, 10);
    if (!success) return res.status(402).json({ error: 'Credite insuficiente' });
    const user = getUser(decoded.id);
    res.json({ success: true, credits: user.credits });
  } catch (err: any) { res.status(401).json({ error: 'Invalid token' }); }
});

router.post('/stripe/checkout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}`,
      metadata: { userId: decoded.id, credits: '100' }
    });
    res.json({ url: session.url });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/stripe/verify', async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: 'Missing session_id' });
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id as string);
    if (session.payment_status !== 'paid') return res.status(400).json({ error: 'Neplătit' });
    const userId = session.metadata?.userId;
    if (!userId) return res.status(400).json({ error: 'Missing user' });
    addCredits(userId, 100);
    res.json({ success: true, credits: getUser(userId).credits });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
