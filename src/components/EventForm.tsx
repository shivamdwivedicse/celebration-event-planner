/**
 * Accessible Event Configuration Form.
 * Features visible labels, aria-describedby for errors, keyboard operability,
 * currency selection (INR default), Indian wedding ceremony presets, and quick templates.
 */

import React from 'react';
import { Calendar, DollarSign, Globe, MapPin, Sparkles, Users } from 'lucide-react';
import { useEventForm } from '../hooks/useEventForm.ts';
import { CurrencyCode, EventPlanInput } from '../types.ts';
import { FormField, controlProps } from './form/FormField.tsx';
import { IndianFunctionChips } from './form/IndianFunctionChips.tsx';
import { PresetBar } from './form/PresetBar.tsx';
import { PriorityChips } from './form/PriorityChips.tsx';

interface EventFormProps {
  currentPlan: EventPlanInput;
  onSubmitPlan: (newPlan: EventPlanInput) => void;
  isSubmitting?: boolean;
}

export const EventForm: React.FC<EventFormProps> = ({
  currentPlan,
  onSubmitPlan,
  isSubmitting = false,
}) => {
  const form = useEventForm(currentPlan, onSubmitPlan);
  const { formData, errors } = form;
  const currency = formData.currency || 'INR';

  return (
    <section className="card form-card" aria-labelledby="form-heading">
      <div className="card-header">
        <div>
          <h2 id="form-heading" className="card-title">
            Configure Your Celebration
          </h2>
          <p className="card-subtitle">
            Input core specifications. Our deterministic planner will calculate your budget
            allocations, weekly milestones, and vendor checklists.
          </p>
        </div>
        <PresetBar onApply={form.applyPreset} />
      </div>

      <form onSubmit={form.handleSubmit} noValidate className="planner-form">
        <div className="form-grid">
          <FormField name="eventType" label="Event Category" required error={errors.eventType}>
            <select
              {...controlProps('eventType', 'form-select', errors.eventType)}
              value={formData.eventType}
              onChange={form.handleChange}
              required
            >
              <option value="wedding">💍 Wedding & Reception</option>
              <option value="birthday">🎂 Birthday Celebration</option>
              <option value="community">🌳 Community Gathering / Festival</option>
            </select>
          </FormField>

          <FormField name="eventName" label="Event Title / Name" required error={errors.eventName}>
            <input
              type="text"
              {...controlProps('eventName', 'form-input', errors.eventName)}
              value={formData.eventName}
              onChange={form.handleChange}
              placeholder="e.g. Maya's 30th Birthday or Oakwood Summer Gala"
              maxLength={120}
              required
            />
          </FormField>

          <FormField
            name="currency"
            label={
              <>
                <Globe size={15} aria-hidden="true" className="label-icon" />
                Currency
              </>
            }
          >
            <select
              id="field-currency"
              name="currency"
              value={currency}
              onChange={(e) => form.handleCurrencyChange(e.target.value as CurrencyCode)}
              className="form-select"
              aria-label="Currency standard"
            >
              <option value="INR">🇮🇳 INR (₹) - Indian Rupee (Default)</option>
              <option value="USD">🇺🇸 USD ($) - US Dollar</option>
              <option value="EUR">🇪🇺 EUR (€) - Euro</option>
            </select>
          </FormField>

          <FormField
            name="eventDate"
            label={
              <>
                <Calendar size={15} aria-hidden="true" className="label-icon" />
                Event Date
              </>
            }
            required
            error={errors.eventDate}
          >
            <input
              type="date"
              {...controlProps('eventDate', 'form-input', errors.eventDate)}
              value={formData.eventDate}
              min={form.minDate}
              onChange={form.handleChange}
              required
            />
          </FormField>

          <FormField
            name="guestCount"
            label={
              <>
                <Users size={15} aria-hidden="true" className="label-icon" />
                Expected Guests
              </>
            }
            required
            error={errors.guestCount}
          >
            <input
              type="number"
              {...controlProps('guestCount', 'form-input', errors.guestCount)}
              value={formData.guestCount}
              min={1}
              max={10000}
              onChange={form.handleChange}
              required
            />
          </FormField>

          <FormField
            name="budget"
            label={
              <>
                <DollarSign size={15} aria-hidden="true" className="label-icon" />
                Total Budget ({currency})
              </>
            }
            required
            error={errors.budget}
          >
            <input
              type="number"
              {...controlProps('budget', 'form-input', errors.budget)}
              value={formData.budget}
              min={50}
              max={100000000}
              step={formData.currency === 'INR' ? 5000 : 50}
              onChange={form.handleChange}
              required
            />
          </FormField>

          <FormField
            name="venueType"
            label={
              <>
                <MapPin size={15} aria-hidden="true" className="label-icon" />
                Venue Setting
              </>
            }
            required
            error={errors.venueType}
          >
            <select
              {...controlProps('venueType', 'form-select', errors.venueType)}
              value={formData.venueType}
              onChange={form.handleChange}
              required
            >
              <option value="indoor">🏢 Indoor Hall / Banquet Venue</option>
              <option value="outdoor">🌳 Outdoor Park / Lawn / Ground</option>
              <option value="home">🏡 Private Home / Backyard / Terrace</option>
            </select>
          </FormField>
        </div>

        {formData.eventType === 'wedding' && (
          <IndianFunctionChips
            selected={formData.selectedFunctions}
            onToggle={form.toggleIndianFunction}
          />
        )}

        <PriorityChips selected={formData.priorities} onToggle={form.togglePriority} />

        <div className="form-group mt-3">
          <label htmlFor="field-notes" className="form-label">
            Aesthetic Notes or Special Requirements (Optional)
          </label>
          <textarea
            id="field-notes"
            name="notes"
            value={formData.notes || ''}
            onChange={form.handleChange}
            rows={2}
            maxLength={500}
            placeholder="e.g. Traditional marigold floral canopy, live dhol players, pure vegetarian royal thali feast..."
            className="form-textarea"
          />
        </div>

        <div className="form-actions mt-4">
          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg">
            <Sparkles size={18} aria-hidden="true" />
            <span>{isSubmitting ? 'Updating Plan...' : 'Generate & Update Master Plan'}</span>
          </button>
        </div>
      </form>
    </section>
  );
};