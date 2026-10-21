import { Router } from 'express';
import type { Request, Response } from 'express';
import { MAX_MESSAGE_LENGTH, MAX_PRIORITIES } from '../config';
import {
  CHAT_SYSTEM_INSTRUCTION,
  IDEAS_RESPONSE_SCHEMA,
  IDEAS_SYSTEM_INSTRUCTION,
  generateWithFallback,
  getGenAI,
} from '../gemini';
import { clip, clipList } from '../utils';

export const aiRouter = Router();

/** Signals the frontend to use its curated offline content. */
const FALLBACK_IDEAS = { source: 'fallback', themeIdeas: [] };
const FALLBACK_CHAT = { source: 'fallback', text: '' };

/** Builds the ideas prompt from untrusted input, bounding every field. */
function buildIdeasPrompt(input: Record<string, unknown>): string {
  const priorities = clipList(input.priorities, 'None specified', MAX_PRIORITIES);
  return `Generate unique, stylish, actionable event planning concepts for:
Event Type: ${clip(input.eventType, 30)}
Event Name: ${clip(input.eventName, 100)}
Budget: ${clip(input.currency || 'INR', 5)} ${clip(input.budget, 15)}
Guest Count: ${clip(input.guestCount, 6)}
Venue Setting: ${clip(input.venueType, 20)}
Priorities: ${priorities}
Organizer Notes: ${clip(input.notes || 'None', 300)}

Provide 3 theme concepts with hex color palettes, 3 engaging activities, and 2 curated menu concepts.`;
}

/** Builds the chat prompt from the user's question and current plan context. */
function buildChatPrompt(message: string, plan: Record<string, unknown> | undefined): string {
  const priorities = clipList(plan?.priorities, 'none', MAX_PRIORITIES);
  return `Current Event Context:
- Type: ${clip(plan?.eventType || 'Celebration', 30)}
- Name: ${clip(plan?.eventName || 'Special Event', 100)}
- Budget: ${clip(plan?.currency || 'INR', 5)} ${clip(plan?.budget || 0, 15)}
- Guests: ${clip(plan?.guestCount || 0, 6)}
- Venue: ${clip(plan?.venueType || 'indoor', 20)}
- Priorities: ${priorities}

User Question: "${message.slice(0, MAX_MESSAGE_LENGTH)}"

Provide a concise, practical, highly encouraging answer (under 120 words) focused strictly on event coordination, budget etiquette, or guest experience.`;
}

/** POST /api/ai/ideas: themes, activities and menus from Gemini. */
aiRouter.post('/ideas', async (req: Request, res: Response) => {
  const { input } = req.body ?? {};
  if (!input || typeof input !== 'object') {
    res.status(400).json({ error: 'Missing or invalid input payload' });
    return;
  }

  const ai = getGenAI();
  if (!ai) {
    res.json(FALLBACK_IDEAS);
    return;
  }

  try {
    const response = await generateWithFallback(ai, buildIdeasPrompt(input), {
      systemInstruction: IDEAS_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: IDEAS_RESPONSE_SCHEMA,
    });
    if (!response.text) {
      res.json(FALLBACK_IDEAS);
      return;
    }
    res.json({ ...JSON.parse(response.text), source: 'ai' });
  } catch {
    res.json(FALLBACK_IDEAS);
  }
});

/** POST /api/ai/chat: concise planning advice using the current plan as context. */
aiRouter.post('/chat', async (req: Request, res: Response) => {
  const { message, currentPlan } = req.body ?? {};
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const ai = getGenAI();
  if (!ai) {
    res.json(FALLBACK_CHAT);
    return;
  }

  try {
    const response = await generateWithFallback(ai, buildChatPrompt(message, currentPlan), {
      systemInstruction: CHAT_SYSTEM_INSTRUCTION,
    });
    res.json({ text: response.text?.trim() || '', source: 'ai' });
  } catch {
    res.json(FALLBACK_CHAT);
  }
});
