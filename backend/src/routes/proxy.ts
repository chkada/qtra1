
import express from 'express';
import supabase from '../supabaseClient';
import { authenticate } from '../middleware/auth.middleware';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/proxy/:proxyId
router.get('/:proxyId', authenticate, async (req, res) => {
  const proxyId = req.params.proxyId;
  
  const { data: session, error } = await supabase
    .from('proxy_sessions')
    .select('*')
    .eq('id', proxyId)
    .single();
  
  if (error || !session) {
    return res.status(404).json({ error: 'Proxy session not found' });
  }
  
  return res.json(session);
});

// POST /api/proxy/:proxyId/messages
router.post('/:proxyId/messages', authenticate, async (req, res) => {
  const proxyId = req.params.proxyId;
  const { senderType, senderId, body } = req.body;
  
  if (!senderType || !body) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  
  // Verify proxy session exists
  const { data: session, error: sessionError } = await supabase
    .from('proxy_sessions')
    .select('id')
    .eq('id', proxyId)
    .single();
  
  if (sessionError || !session) {
    return res.status(404).json({ error: 'Proxy session not found' });
  }
  
  // Create message
  const messageId = uuidv4();
  const now = new Date().toISOString();
  
  const { data: msg, error: msgError } = await supabase
    .from('messages')
    .insert({
      id: messageId,
      proxy_session_id: proxyId,
      sender_type: senderType,
      sender_id: senderId || null,
      body,
      created_at: now
    })
    .select()
    .single();
  
  if (msgError) {
    console.error('Error creating message:', msgError);
    return res.status(500).json({ error: 'Failed to create message' });
  }
  
  return res.status(201).json(msg);
});

// GET messages
router.get('/:proxyId/messages', authenticate, async (req, res) => {
  const proxyId = req.params.proxyId;
  const since = req.query.since ? new Date(String(req.query.since)) : new Date(0);
  
  const { data: msgs, error } = await supabase
    .from('messages')
    .select('*')
    .eq('proxy_session_id', proxyId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })
    .limit(100);
  
  if (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
  
  return res.json(msgs);
});

export default router;
