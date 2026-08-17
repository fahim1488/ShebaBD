import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

/**
 * TODO (next module): implement with Vercel AI SDK.
 *
 *   import { streamText, tool } from 'ai';
 *   import { openai } from '@ai-sdk/openai';
 *
 *   router.post('/stream', protect, asyncHandler(async (req, res) => {
 *     const result = streamText({
 *       model: openai(env.AI_MODEL),
 *       system: SHEBABD_SYSTEM_PROMPT,
 *       messages: req.body.messages,
 *       tools: { getNgoInfo, matchBloodDonors, prioritizeEmergency, detectFakeNgo },
 *       onFinish: async ({ text }) => persistChatMessage(req.user!.sub, req.body.messages, text),
 *     });
 *     result.pipeDataStreamToResponse(res);
 *   }));
 *
 * Stubbed here only so this router mounts cleanly in app.ts. Full tool
 * definitions (Zod schemas) and DB-backed chat memory are the next module.
 */
router.get('/health', protect, (_req, res) => {
  res.status(200).json({ success: true, message: 'Chat module scaffold — implementation pending.' });
});

export default router;
