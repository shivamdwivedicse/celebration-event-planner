/**
 * Deterministic intent parser for follow-up conversational messages.
 * Parses and executes changes to numbers (budget, guests, venue, priorities)
 * without relying on external LLM inference, ensuring instant and reliable updates.
 */

import { SYSTEM_LIMITS } from '../config.ts';
import { ChatIntentResult, EventPlanInput, Priority } from '../types.ts';

/**
 * Parses a user's natural language message against the current active EventPlanInput.
 */
export function parseChatIntent(message: string, currentPlan: EventPlanInput): ChatIntentResult {
  const text = message.trim().toLowerCase();

  // 1. Percentage budget adjustment: "cut budget 20%", "reduce budget by 15%", "increase budget 10%"
  const pctRegex =
    /(?:reduce|cut|decrease|lower|drop|trim)\s+(?:the\s+)?budget\s+(?:by\s+)?(\d+(?:\.\d+)?)\s*%/i;
  const pctMatch = text.match(pctRegex);
  if (pctMatch) {
    const pct = parseFloat(pctMatch[1]);
    if (pct > 0 && pct < 100) {
      const reduction = (currentPlan.budget * pct) / 100;
      const newBudget = Math.max(
        SYSTEM_LIMITS.MIN_BUDGET,
        Math.round(currentPlan.budget - reduction),
      );
      return {
        matched: true,
        type: 'modify_budget_percentage',
        newBudget,
        summary: `Decreased budget by ${pct}% from $${currentPlan.budget.toLocaleString()} to $${newBudget.toLocaleString()}.`,
      };
    }
  }

  const pctIncreaseRegex =
    /(?:increase|raise|boost|expand|add\s+to)\s+(?:the\s+)?budget\s+(?:by\s+)?(\d+(?:\.\d+)?)\s*%/i;
  const pctIncMatch = text.match(pctIncreaseRegex);
  if (pctIncMatch) {
    const pct = parseFloat(pctIncMatch[1]);
    if (pct > 0 && pct <= 200) {
      const increase = (currentPlan.budget * pct) / 100;
      const newBudget = Math.min(
        SYSTEM_LIMITS.MAX_BUDGET,
        Math.round(currentPlan.budget + increase),
      );
      return {
        matched: true,
        type: 'modify_budget_percentage',
        newBudget,
        summary: `Increased budget by ${pct}% from $${currentPlan.budget.toLocaleString()} to $${newBudget.toLocaleString()}.`,
      };
    }
  }

  // 2. Delta budget adjustment: "cut budget by $1,000", "add $500 to budget", "reduce budget by 2000"
  const deltaBudgetCutRegex =
    /(?:cut|reduce|decrease|lower|drop)\s+(?:the\s+)?budget\s+by\s+\$?([0-9,]+)(?:\s*dollars)?/i;
  const deltaCutMatch = text.match(deltaBudgetCutRegex);
  if (deltaCutMatch) {
    const cutAmount = parseFloat(deltaCutMatch[1].replace(/,/g, ''));
    if (!isNaN(cutAmount) && cutAmount > 0) {
      const newBudget = Math.max(
        SYSTEM_LIMITS.MIN_BUDGET,
        Math.round(currentPlan.budget - cutAmount),
      );
      return {
        matched: true,
        type: 'modify_budget_delta',
        newBudget,
        summary: `Reduced budget by $${cutAmount.toLocaleString()} to $${newBudget.toLocaleString()}.`,
      };
    }
  }

  const deltaBudgetAddRegex =
    /(?:add|increase|raise|boost)\s+\$?([0-9,]+)(?:\s*(?:dollars|more))?\s+(?:to\s+(?:the\s+)?budget|budget)/i;
  const deltaAddMatch = text.match(deltaBudgetAddRegex);
  if (deltaAddMatch) {
    const addAmount = parseFloat(deltaAddMatch[1].replace(/,/g, ''));
    if (!isNaN(addAmount) && addAmount > 0) {
      const newBudget = Math.min(
        SYSTEM_LIMITS.MAX_BUDGET,
        Math.round(currentPlan.budget + addAmount),
      );
      return {
        matched: true,
        type: 'modify_budget_delta',
        newBudget,
        summary: `Added $${addAmount.toLocaleString()} to budget (new total: $${newBudget.toLocaleString()}).`,
      };
    }
  }

  // 3. Absolute budget set: "set budget to $5,000", "budget is 8000", "change budget to 15000"
  const absBudgetRegex =
    /(?:set|change|make|update)\s+(?:the\s+)?budget\s+(?:to|is)\s+\$?([0-9,]+)/i;
  const absBudgetMatch = text.match(absBudgetRegex);
  if (absBudgetMatch) {
    const amount = parseFloat(absBudgetMatch[1].replace(/,/g, ''));
    if (
      !isNaN(amount) &&
      amount >= SYSTEM_LIMITS.MIN_BUDGET &&
      amount <= SYSTEM_LIMITS.MAX_BUDGET
    ) {
      return {
        matched: true,
        type: 'modify_budget_absolute',
        newBudget: Math.round(amount),
        summary: `Updated total budget to $${Math.round(amount).toLocaleString()}.`,
      };
    }
  }

  // 4. Absolute guest count: "increase guests to 150", "set guest count to 80", "we have 120 guests now", "change guests to 75"
  const absGuestRegex =
    /(?:set|change|make|increase|reduce|update)?\s*(?:guest\s*count|guests?|attendees?)\s*(?:to|is|now|at)\s*(\d+)/i;
  const absGuestMatch = text.match(absGuestRegex);
  if (absGuestMatch) {
    const guests = parseInt(absGuestMatch[1], 10);
    if (guests >= SYSTEM_LIMITS.MIN_GUESTS && guests <= SYSTEM_LIMITS.MAX_GUESTS) {
      return {
        matched: true,
        type: 'modify_guests_absolute',
        newGuestCount: guests,
        summary: `Updated guest count from ${currentPlan.guestCount} to ${guests} attendees.`,
      };
    }
  }

  // 5. Delta guests: "add 20 guests", "remove 10 guests", "cut 15 guests"
  const deltaAddGuestRegex = /(?:add|invite)\s+(\d+)\s+(?:more\s+)?(?:guests?|people|attendees?)/i;
  const deltaAddGuestMatch = text.match(deltaAddGuestRegex);
  if (deltaAddGuestMatch) {
    const delta = parseInt(deltaAddGuestMatch[1], 10);
    const newCount = Math.min(SYSTEM_LIMITS.MAX_GUESTS, currentPlan.guestCount + delta);
    return {
      matched: true,
      type: 'modify_guests_delta',
      newGuestCount: newCount,
      summary: `Added ${delta} attendees (total: ${newCount} guests).`,
    };
  }

  const deltaCutGuestRegex = /(?:cut|remove|drop)\s+(\d+)\s+(?:guests?|people|attendees?)/i;
  const deltaCutGuestMatch = text.match(deltaCutGuestRegex);
  if (deltaCutGuestMatch) {
    const delta = parseInt(deltaCutGuestMatch[1], 10);
    const newCount = Math.max(SYSTEM_LIMITS.MIN_GUESTS, currentPlan.guestCount - delta);
    return {
      matched: true,
      type: 'modify_guests_delta',
      newGuestCount: newCount,
      summary: `Reduced guest count by ${delta} to ${newCount} attendees.`,
    };
  }

  // 6. Venue location switch: "switch to outdoor venue", "change venue to home", "make venue indoor"
  if (
    text.includes('outdoor') &&
    (text.includes('venue') ||
      text.includes('switch') ||
      text.includes('change') ||
      text.includes('move'))
  ) {
    return {
      matched: true,
      type: 'modify_venue',
      newVenueType: 'outdoor',
      summary: 'Switched venue setting to Outdoor (budget updated with tent & weather logistics).',
    };
  }
  if (
    (text.includes('home') || text.includes('backyard') || text.includes('house')) &&
    (text.includes('venue') ||
      text.includes('switch') ||
      text.includes('change') ||
      text.includes('move'))
  ) {
    return {
      matched: true,
      type: 'modify_venue',
      newVenueType: 'home',
      summary:
        'Switched venue setting to Home / Backyard (rental fees lowered; catering & decor boosted).',
    };
  }
  if (
    text.includes('indoor') &&
    (text.includes('venue') ||
      text.includes('switch') ||
      text.includes('change') ||
      text.includes('move'))
  ) {
    return {
      matched: true,
      type: 'modify_venue',
      newVenueType: 'indoor',
      summary: 'Switched venue setting to Indoor banquet / event hall.',
    };
  }

  // 7. Add Priority: "prioritize food", "make photography high priority", "focus on decor"
  const priorityKeywords: Record<string, Priority> = {
    food: 'food',
    catering: 'food',
    dining: 'food',
    photo: 'photography',
    photography: 'photography',
    video: 'photography',
    decor: 'decor',
    floral: 'decor',
    flower: 'decor',
    flowers: 'decor',
    entertainment: 'entertainment',
    music: 'entertainment',
    dj: 'entertainment',
    band: 'entertainment',
    venue: 'venue',
    invitation: 'invitations',
    invitations: 'invitations',
  };

  if (text.includes('priorit') || text.includes('focus') || text.includes('highlight')) {
    for (const [kw, prio] of Object.entries(priorityKeywords)) {
      if (text.includes(kw)) {
        return {
          matched: true,
          type: 'add_priority',
          addedPriority: prio,
          summary: `Prioritized ${prio.toUpperCase()} in the budget model (allocated extra percentage weighting).`,
        };
      }
    }
  }

  return {
    matched: false,
    type: 'unknown',
    summary: 'No quantitative event plan modification detected.',
  };
}
