/**
 * Deterministic Planning Scenarios & Weather Contingency Engine.
 * Formulates Lean, Standard, and Premium comparison profiles,
 * and generates actionable rain/weather backup checklists for outdoor gatherings.
 */

import { EventPlanInput, PlanScenario, WeatherBackupPlan } from '../types.ts';

/**
 * Computes Lean, Standard, and Premium budget scenarios deterministically.
 */
export function calculatePlanScenarios(input: EventPlanInput): PlanScenario[] {
  const currentBudget = Math.round(input.budget);
  const guestCount = Math.max(1, input.guestCount);

  // 1. Lean Scenario: ~75% of current budget
  const leanBudget = Math.max(50, Math.round(currentBudget * 0.75));
  const leanPerGuest = Math.round((leanBudget / guestCount) * 100) / 100;
  const leanContingency = Math.round(leanBudget * 0.10);

  const leanScenario: PlanScenario = {
    tier: 'lean',
    name: 'Lean & Smart Budget',
    description: 'Cost-conscious blueprint prioritizing essentials with self-managed touches and informal dining.',
    totalBudget: leanBudget,
    perGuestCost: leanPerGuest,
    cateringStyle: 'Casual buffet / street-food counters with seasonal specialties',
    venueTier: input.venueType === 'home' ? 'Residential backyard / terrace' : 'Public hall or municipal park pavilion',
    photographyCoverage: 'Single solo photographer, digital cloud gallery download',
    entertainmentType: 'Curated high-res streaming playlist & portable Bluetooth PA sound',
    contingencyBuffer: leanContingency,
    tradeoffs: [
      'Self-serve dining stations reduce labor overhead',
      'Digital invitations via messaging apps and web RSVPs',
      'DIY photo corner with instant cameras instead of commercial photo booth',
    ],
  };

  // 2. Standard Scenario: 100% current plan
  const standardPerGuest = Math.round((currentBudget / guestCount) * 100) / 100;
  const standardContingency = Math.round(currentBudget * 0.08);

  const standardScenario: PlanScenario = {
    tier: 'standard',
    name: 'Balanced Standard Plan',
    description: 'Equilibrium of professional vendor contracts, high hospitality, and structured timelines.',
    totalBudget: currentBudget,
    perGuestCost: standardPerGuest,
    cateringStyle: 'Full-service multi-cuisine buffet or family-style dinner with passed hors d’oeuvres',
    venueTier: input.venueType === 'home' ? 'Decorated private grounds with canopy' : 'Dedicated banquet hall / private hotel ballroom',
    photographyCoverage: 'Lead photographer + second shooter with high-res edited album',
    entertainmentType: 'Professional live DJ, master of ceremonies (MC), and sound technician',
    contingencyBuffer: standardContingency,
    tradeoffs: [
      'Dedicated vendor staff handle setup and cleanup',
      'Printed stationery and digital RSVP tracking',
      'Professional sound engineering with wireless microphones',
    ],
  };

  // 3. Premium Scenario: ~135% of current budget
  const premiumBudget = Math.round(currentBudget * 1.35);
  const premiumPerGuest = Math.round((premiumBudget / guestCount) * 100) / 100;
  const premiumContingency = Math.round(premiumBudget * 0.08);

  const premiumScenario: PlanScenario = {
    tier: 'premium',
    name: 'Luxury & Elevated Experience',
    description: 'Bespoke high-end celebration featuring live artist performances, custom staging, and fine dining.',
    totalBudget: premiumBudget,
    perGuestCost: premiumPerGuest,
    cateringStyle: 'Multi-course plated dinner, live chef theater, and artisanal craft bar',
    venueTier: 'Heritage palace, luxury 5-star estate, or botanical resort ballroom',
    photographyCoverage: 'Full media team: dual candid shooters, drone footage, and luxury leather album',
    entertainmentType: 'Live 5-piece fusion band, celebrity guest DJ, and synchronized lighting show',
    contingencyBuffer: premiumContingency,
    tradeoffs: [
      'Turnkey luxury execution with zero organizer labor',
      'Artisan custom-crafted guest gift hampers',
      'Enhanced floor coordinator-to-guest ratio',
    ],
  };

  return [leanScenario, standardScenario, premiumScenario];
}

/**
 * Generates an outdoor weather & rain mitigation checklist.
 */
export function generateWeatherBackupPlan(input: EventPlanInput): WeatherBackupPlan {
  const isOutdoor = input.venueType === 'outdoor';

  return {
    venueType: input.venueType,
    requiresRainPlan: isOutdoor,
    checklist: [
      {
        id: 'weather-tenting',
        title: 'High-Peak Canopy Tent with Drop-Down Sidewalls',
        action: 'Confirm weather tent rental contract with guaranteed 48-hour deployment trigger and clear window walls.',
        urgency: 'high',
        estimatedCostPct: 6,
      },
      {
        id: 'weather-flooring',
        title: 'Elevated Subflooring & Non-Slip Walkway Runners',
        action: 'Lay moisture-barrier turf covers and rubber ramps over turf walkways to keep guest footwear and attire dry.',
        urgency: 'high',
        estimatedCostPct: 4,
      },
      {
        id: 'weather-power',
        title: 'Weather-Protected Generator & GFCI Circuit Breakers',
        action: 'Elevate all power distribution boxes off ground level and wrap outdoor junction cables in waterproof casing.',
        urgency: 'high',
        estimatedCostPct: 3,
      },
      {
        id: 'weather-indoor-hall',
        title: 'Backup Indoor Pavilion / Hall Confirmation',
        action: 'Designate secondary covered hall or covered veranda on contract in case of localized thunderstorm or monsoon.',
        urgency: isOutdoor ? 'high' : 'medium',
        estimatedCostPct: 2,
      },
      {
        id: 'weather-umbrellas',
        title: 'Guest Hospitality Umbrella & Valet Station',
        action: 'Stock 30-50 uniform clear umbrellas and arrange covered curbside golf-cart / valet drop-off.',
        urgency: 'medium',
        estimatedCostPct: 1,
      },
    ],
  };
}
