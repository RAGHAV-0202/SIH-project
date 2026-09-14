const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'wandr-sih-2026-secret-key';

// Middleware to optionally extract user from token
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
  } catch (err) {
    // Ignore invalid token, treat as guest
  }
  next();
}

/**
 * GET /api/user/memory
 * Fetch current user's memory or default preferences
 */
router.get('/memory', authMiddleware, async (req, res) => {
  if (req.user) {
    return res.json({
      success: true,
      memory: req.user.memory || {
        wakeUpTime: '08:00',
        sleepTime: '23:00',
        pace: 'moderate',
        dietary: ['any'],
        notes: [],
      },
    });
  }

  // Guest default
  return res.json({
    success: true,
    memory: {
      wakeUpTime: '08:00',
      sleepTime: '23:00',
      pace: 'moderate',
      dietary: ['any'],
      notes: [],
    },
    isGuest: true,
  });
});

/**
 * POST /api/user/memory
 * Update user memory (wakeUpTime, dietary, pace, notes)
 */
router.post('/memory', authMiddleware, async (req, res) => {
  const { wakeUpTime, sleepTime, pace, dietary, notes } = req.body;

  if (req.user) {
    if (wakeUpTime) req.user.memory.wakeUpTime = wakeUpTime;
    if (sleepTime) req.user.memory.sleepTime = sleepTime;
    if (pace) req.user.memory.pace = pace;
    if (Array.isArray(dietary)) req.user.memory.dietary = dietary;
    if (Array.isArray(notes)) req.user.memory.notes = notes;

    await req.user.save();

    return res.json({
      success: true,
      memory: req.user.memory,
    });
  }

  // Echo updated object back for guest client to store in localStorage
  return res.json({
    success: true,
    memory: {
      wakeUpTime: wakeUpTime || '08:00',
      sleepTime: sleepTime || '23:00',
      pace: pace || 'moderate',
      dietary: dietary || ['any'],
      notes: notes || [],
    },
    isGuest: true,
  });
});

/**
 * POST /api/user/memory/note
 * Append a specific habit note (e.g. "Mai subah 8 bje uthta hu")
 */
router.post('/memory/note', authMiddleware, async (req, res) => {
  const { text, category } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text note is required' });
  }

  const newNote = {
    id: `MEM-${Date.now()}`,
    text: text.trim(),
    category: category || 'routine',
    createdAt: new Date(),
  };

  if (req.user) {
    if (!req.user.memory) {
      req.user.memory = { wakeUpTime: '08:00', sleepTime: '23:00', pace: 'moderate', dietary: ['any'], notes: [] };
    }
    req.user.memory.notes.push(newNote);
    await req.user.save();
    return res.json({ success: true, note: newNote, memory: req.user.memory });
  }

  return res.json({ success: true, note: newNote, isGuest: true });
});

/**
 * DELETE /api/user/memory/note/:id
 */
router.delete('/memory/note/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  if (req.user && req.user.memory) {
    req.user.memory.notes = req.user.memory.notes.filter((n) => n.id !== id);
    await req.user.save();
    return res.json({ success: true, memory: req.user.memory });
  }

  return res.json({ success: true, deletedId: id, isGuest: true });
});

module.exports = router;
