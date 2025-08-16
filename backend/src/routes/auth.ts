import express from 'express';
import { signUp, signIn, signOut, resetPassword } from '../services/auth.service';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const data = await signUp(email, password);
    return res.status(201).json({ message: 'User created successfully', data });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const data = await signIn(email, password);
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Signin error:', error);
    return res.status(401).json({ error: error.message || 'Authentication failed' });
  }
});

// POST /api/auth/signout
router.post('/signout', authenticate, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || '';
    await signOut(token);
    return res.status(200).json({ message: 'Signed out successfully' });
  } catch (error: any) {
    console.error('Signout error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    await resetPassword(email);
    return res.status(200).json({ message: 'Password reset email sent' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;