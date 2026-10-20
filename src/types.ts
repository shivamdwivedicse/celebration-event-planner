/**
 * Core type definitions for Celebration & Event Planner.
 * All domain types for deterministic budgeting, timelines, vendor management,
 * validation, health score, spend tracking, scenarios, and AI contextual assistance.
 */

export type EventType = 'wedding' | 'birthday' | 'community';

export type VenueType = 'indoor' | 'outdoor' | 'home';

export type Priority =
  | 'food'
  | 'venue'
  | 'photography'
  | 'entertainment'
  | 'decor'
  | 'invitations';

export type CurrencyCode = 'INR' | 'USD' | 'EUR';

export type IndianWeddingFunction = 'Haldi' | 'Mehendi' | 'Sangeet' | 'Wedding' | 'Reception';

export interface EventPlanInput {
  eventType: EventType;
  eventName: string;
  eventDate: string; // ISO YYYY-MM-DD format
  guestCount: number;
  budget: number;
  venueType: VenueType;
  priorities: Priority[];
  notes?: string;
  currency?: CurrencyCode; // Default is 'INR'
  selectedFunctions?: IndianWeddingFunction[]; // Optional multi-day Indian wedding sub-functions
}

export interface BudgetCategory {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  description: string;
  color: string;
}

export interface BudgetWarning {
  id: string;
  severity: 'warning' | 'critical' | 'info';
  message: string;
  suggestion: string;
}

export interface BudgetBreakdown {
  totalBudget: number;
  perGuestCost: number;
  contingencyReserve: number;
  contingencyPercentage: number;
  categories: BudgetCategory[];
  warnings: BudgetWarning[];
}

export interface TimelineTask {
  id: string;
  title: string;
  description: string;
  category: string;
  timeframe: string;
  weekOffset: number; // e.g. -16 (16 weeks before), 0 (day of), 1 (post event)
  isPriority: boolean;
  completed?: boolean;
}

export interface TimelinePhase {
  phaseName: string;
  timeframe: string;
  tasks: TimelineTask[];
}

export interface DayOfScheduleItem {
  time: string;
  activity: string;
  details: string;
  assignedRole: string;
}

export interface TimelinePlan {
  isRushPlan: boolean;
  totalWeeks: number;
  rushNotice?: string;
  phases: TimelinePhase[];
  dayOfSchedule: DayOfScheduleItem[];
  postEventTasks: TimelineTask[];
}

export interface VendorItem {
  id: string;
  category: string;
  title: string;
  leadTimeWeeks: number;
  priority: 'high' | 'medium' | 'low';
  budgetSharePercent: number;
  isOverdue: boolean;
  suggestedQuestions: string[];
}

export interface ThemeIdea {
  title: string;
  description: string;
  decorNotes: string;
  colorPalette: string[];
}

export interface ActivityIdea {
  title: string;
  description: string;
  targetGroup: string;
  durationMinutes: number;
}

export interface MenuSuggestion {
  style: string;
  items: string[];
  notes: string;
}

export interface IdeasResult {
  themeIdeas: ThemeIdea[];
  activities: ActivityIdea[];
  menuSuggestions: MenuSuggestion[];
  source: 'ai' | 'fallback';
  cached?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  appliedIntent?: string;
  source?: 'rule-engine' | 'ai' | 'fallback';
}

export interface ChatIntentResult {
  matched: boolean;
  type:
    | 'modify_budget_percentage'
    | 'modify_budget_absolute'
    | 'modify_budget_delta'
    | 'modify_guests_absolute'
    | 'modify_guests_delta'
    | 'modify_venue'
    | 'add_priority'
    | 'unknown';
  newBudget?: number;
  newGuestCount?: number;
  newVenueType?: VenueType;
  addedPriority?: Priority;
  summary: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedInput?: EventPlanInput;
}

/* --- Plan Health Score --- */
export interface HealthCategoryScores {
  budgetBalance: number; // 0 - 25
  perGuestAdequacy: number; // 0 - 30
  vendorStatus: number; // 0 - 25
  timelineReadiness: number; // 0 - 20
}

export interface HealthScoreResult {
  score: number; // 0 - 100
  status: 'critical' | 'fair' | 'good' | 'excellent';
  reasons: string[];
  fixes: string[];
  categoryScores: HealthCategoryScores;
}

/* --- Spend Tracker --- */
export interface CategorySpend {
  categoryId: string;
  categoryName: string;
  plannedAmount: number;
  actualAmount: number;
  variance: number; // planned - actual (negative means over budget)
  percentSpent: number; // (actual / planned) * 100
  isOverBudget: boolean;
}

export interface SpendTrackerSummary {
  totalPlanned: number;
  totalActual: number;
  totalRemaining: number;
  totalPercentSpent: number;
  isOverallOverBudget: boolean;
  categorySpends: CategorySpend[];
  overBudgetCategories: CategorySpend[];
}

/* --- Scenarios & Weather Backup Plan --- */
export interface PlanScenario {
  tier: 'lean' | 'standard' | 'premium';
  name: string;
  description: string;
  totalBudget: number;
  perGuestCost: number;
  cateringStyle: string;
  venueTier: string;
  photographyCoverage: string;
  entertainmentType: string;
  contingencyBuffer: number;
  tradeoffs: string[];
}

export interface WeatherBackupItem {
  id: string;
  title: string;
  action: string;
  urgency: 'high' | 'medium';
  estimatedCostPct: number;
}

export interface WeatherBackupPlan {
  venueType: VenueType;
  requiresRainPlan: boolean;
  checklist: WeatherBackupItem[];
}
