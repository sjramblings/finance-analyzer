import { Router } from 'express';
import { ChatService } from '../services/ChatService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateBody } from '../middleware/validation.js';

const router = Router();
const chatService = new ChatService();

// POST /api/chat/sessions - Create new session
router.post(
  '/sessions',
  asyncHandler(async (req, res) => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const session = {
      id: sessionId,
      title: 'New conversation',
      createdAt: new Date().toISOString(),
    };
    res.json(session);
  })
);

// POST /api/chat - Send message
router.post(
  '/',
  validateBody(['message']),
  asyncHandler(async (req, res) => {
    const { message, sessionId } = req.body;

    // Save user message
    const userMessage = {
      id: Date.now(),
      sessionId: sessionId,
      role: 'user' as const,
      content: message,
      createdAt: new Date().toISOString(),
    };

    // Get AI response
    const result = await chatService.chat(message, sessionId);

    // Create assistant message
    const assistantMessage = {
      id: Date.now() + 1,
      sessionId: sessionId,
      role: 'assistant' as const,
      content: result.response,
      createdAt: new Date().toISOString(),
    };

    res.json({ userMessage, assistantMessage });
  })
);

// GET /api/chat/sessions
router.get(
  '/sessions',
  asyncHandler(async (req, res) => {
    const sessions = await chatService.getSessions();
    res.json(sessions);
  })
);

// GET /api/chat/sessions/:sessionId
router.get(
  '/sessions/:sessionId',
  asyncHandler(async (req, res) => {
    const messages = await chatService.getSession(req.params.sessionId);
    res.json(messages);
  })
);

// DELETE /api/chat/sessions/:sessionId
router.delete(
  '/sessions/:sessionId',
  asyncHandler(async (req, res) => {
    const result = await chatService.deleteSession(req.params.sessionId);
    res.json(result);
  })
);

export default router;
