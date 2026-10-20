import { describe, it, expect } from 'vitest';
import { generateVendorChecklist } from '../src/planner/vendors.ts';
import { EventPlanInput } from '../src/types.ts';

describe('Vendor Checklist Generator', () => {
  const refDate = new Date('2027-01-01T00:00:00Z');

  it('generates tailored vendor list for weddings with lead times and interview questions', () => {
    // Event is 20 weeks away (140 days)
    const input: EventPlanInput = {
      eventType: 'wedding',
      eventName: 'Grand Wedding',
      eventDate: '2027-05-21',
      guestCount: 120,
      budget: 35000,
      venueType: 'indoor',
      priorities: ['food', 'photography'],
    };

    const checklist = generateVendorChecklist(input, refDate);
    expect(checklist.length).toBeGreaterThanOrEqual(5);

    const venueVendor = checklist.find((v) => v.id === 'vendor-wedding-venue')!;
    expect(venueVendor).toBeDefined();
    expect(venueVendor.leadTimeWeeks).toBe(16);
    expect(venueVendor.suggestedQuestions.length).toBeGreaterThanOrEqual(2);
    // At 20 weeks remaining, 16-week lead time is NOT overdue
    expect(venueVendor.isOverdue).toBe(false);
  });

  it('flags vendors as overdue when planning weeks are shorter than lead time', () => {
    // Event is only 6 weeks away (42 days)
    const input: EventPlanInput = {
      eventType: 'wedding',
      eventName: 'Late Planned Wedding',
      eventDate: '2027-02-12',
      guestCount: 90,
      budget: 20000,
      venueType: 'indoor',
      priorities: [],
    };

    const checklist = generateVendorChecklist(input, refDate);

    // Venue needs 16 weeks, so at 6 weeks remaining it must be overdue
    const venueVendor = checklist.find((v) => v.id === 'vendor-wedding-venue')!;
    expect(venueVendor.isOverdue).toBe(true);

    // Caterer needs 14 weeks -> overdue
    const caterer = checklist.find((v) => v.id === 'vendor-wedding-caterer')!;
    expect(caterer.isOverdue).toBe(true);
  });

  it('includes outdoor-specific infrastructure (tents & portable washrooms) when venue is outdoor', () => {
    const outdoorInput: EventPlanInput = {
      eventType: 'community',
      eventName: 'Park Festival',
      eventDate: '2027-06-01',
      guestCount: 300,
      budget: 10000,
      venueType: 'outdoor',
      priorities: [],
    };

    const checklist = generateVendorChecklist(outdoorInput, refDate);
    const hasSanitation = checklist.some((v) => v.id === 'vendor-sanitation-waste');
    const hasTents = checklist.some((v) => v.id === 'vendor-tent-rentals');

    expect(hasSanitation).toBe(true);
    expect(hasTents).toBe(true);
  });

  it('excludes outdoor infrastructure when venue is an indoor banquet hall', () => {
    const indoorInput: EventPlanInput = {
      eventType: 'wedding',
      eventName: 'Indoor Ballroom Wedding',
      eventDate: '2027-07-01',
      guestCount: 150,
      budget: 40000,
      venueType: 'indoor',
      priorities: [],
    };

    const checklist = generateVendorChecklist(indoorInput, refDate);
    const hasTents = checklist.some((v) => v.id === 'vendor-tent-rentals');
    expect(hasTents).toBe(false);
  });
});
