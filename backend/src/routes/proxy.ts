
import express from 'express';
import prisma from '../prismaClient';

const router = express.Router();

// GET /api/proxy/:proxyId
router.get('/:proxyId', async (req, res) => {
  const proxyId = req.params.proxyId;
  const session = await prisma.proxySession.findUnique({ where: { id: proxyId } });
  if (!session) return res.status(404).json({ error: 'Proxy session not found' });
  return res.json(session);
});

// POST /api/proxy/:proxyId/messages
router.post('/:proxyId/messages', async (req, res) => {
  const proxyId = req.params.proxyId;
  const { senderType, senderId, body } = req.body;
  if (!senderType || !body) return res.status(400).json({ error: 'Missing fields' });
  const session = await prisma.proxySession.findUnique({ where: { id: proxyId } });
  if (!session) return res.status(404).json({ error: 'Proxy session not found' });
  const msg = await prisma.message.create({
    data: {
      proxySessionId: proxyId,
      senderType,
      senderId: senderId || null,
      body
    }
  });
  return res.status(201).json(msg);
});

// GET messages
router.get('/:proxyId/messages', async (req, res) => {
  const proxyId = req.params.proxyId;
  const since = req.query.since ? new Date(String(req.query.since)) : new Date(0);
  const msgs = await prisma.message.findMany({
    where: { proxySessionId: proxyId, createdAt: { gte: since } },
    orderBy: { createdAt: 'asc' },
    take: 100
  });
  return res.json(msgs);
});

export default router;
