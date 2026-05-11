import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { getUser, createUser, deductCredits } from './db';

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'mrdelivery_jwt_fallback_2026';

router.post('/api/auth/google', async (req, res) => {
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

router.get('/api/auth/me', async (req, res) => {
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

router.post('/api/credits/spend', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const success = deductCredits(decoded.id, 5);
    if (!success) return res.status(402).json({ error: 'Credite insuficiente' });
    const user = getUser(decoded.id);
    res.json({ success: true, credits: user.credits });
  } catch (err: any) { res.status(401).json({ error: 'Invalid token' }); }
});

export default router;
