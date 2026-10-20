/**
 * Accessible Event Configuration Form.
 * Features visible labels, aria-describedby for errors, keyboard operability,
 * currency selection (INR default), Indian wedding ceremony presets, and quick templates.
 */

import React, { useState } from 'react';
import { Calendar, DollarSign, Sparkles, Users, MapPin, Tag, Globe, Flower2 } from 'lucide-react';
import { DEFAULT_PRESETS, INDIAN_WEDDING_FUNCTIONS } from '../config.ts';
import { CurrencyCode, EventPlanInput, EventType, IndianWeddingFunction, Priority, VenueType } from '../types.ts';
import { validateEventPlanInput } from '../planner/validation.ts';

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
  const [formData, setFormData] = useState<EventPlanInput>(currentPlan);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync formData when currentPlan changes from outside (e.g. preset or chat)
  React.useEffect(() => {
    setFormData(currentPlan);
  }, [currentPlan]);

  // Compute tomorrow's date in YYYY-MM-DD for min date attribute
  const tomorrowStr = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'guestCount' || name === 'budget' ? Number(value) : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setFormData((prev) => ({ ...prev, currency: newCurrency }));
  };

  const togglePriority = (priority: Priority) => {
    setFormData((prev) => {
      const exists = prev.priorities.includes(priority);
      const updated = exists
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority];
      return { ...prev, priorities: updated };
    });
  };

  const toggleIndianFunction = (func: IndianWeddingFunction) => {
    setFormData((prev) => {
      const currentList = prev.selectedFunctions || [];
      const exists = currentList.includes(func);
      const updated = exists
        ? currentList.filter((f) => f !== func)
        : [...currentList, func];
      return { ...prev, selectedFunctions: updated };
    });
  };

  const handleApplyPreset = (presetInput: EventPlanInput) => {
    // Ensure preset date is safely in the future (e.g. 90 days out)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90);
    const dateStr = futureDate.toISOString().split('T')[0];

    const updated: EventPlanInput = {
      ...presetInput,
      eventDate: dateStr,
    };
    setFormData(updated);
    setErrors({});
    onSubmitPlan(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateEventPlanInput(formData);
    if (!result.isValid) {
      setErrors(result.errors);
      // Focus first error field for screen readers
      const firstErrorKey = Object.keys(result.errors)[0];
      const el = document.getElementById(`field-${firstErrorKey}`);
      if (el) el.focus();
      return;
    }

    if (result.sanitizedInput) {
      setErrors({});
      onSubmitPlan(result.sanitizedInput);
    }
  };

  const priorityOptions: { id: Priority; label: string }[] = [
    { id: 'food', label: '🍽️ Food & Catering' },
    { id: 'venue', label: '🏛️ Venue & Atmosphere' },
    { id: 'photography', label: '📸 Photography & Video' },
    { id: 'entertainment', label: '🎵 Music & Entertainment' },
    { id: 'decor', label: '💐 Decor & Styling' },
    { id: 'invitations', label: '💌 Invitations & Stationery' },
  ];

  return (
    <section className="card form-card" aria-labelledby="form-heading">
      <div className="card-header">
        <div>
          <h2 id="form-heading" className="card-title">
            Configure Your Celebration
          </h2>
          <p className="card-subtitle">
            Input core specifications. Our deterministic planner will calculate your budget allocations, weekly milestones, and vendor checklists.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="preset-bar" role="group" aria-label="Quick Start Templates">
          <span className="preset-label">Templates:</span>
          <div className="preset-buttons">
            {DEFAULT_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => handleApplyPreset(p.input as EventPlanInput)}
                aria-label={`Load preset ${p.label}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="planner-form">
        <div className="form-grid">
          {/* Event Category */}
          <div className="form-group">
            <label htmlFor="field-eventType" className="form-label">
              Event Category <span className="required" aria-hidden="true">*</span>
            </label>
            <select
              id="field-eventType"
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className={`form-select ${errors.eventType ? 'is-invalid' : ''}`}
              aria-describedby={errors.eventType ? 'error-eventType' : undefined}
              aria-invalid={Boolean(errors.eventType)}
              required
            >
              <option value="wedding">💍 Wedding & Reception</option>
              <option value="birthday">🎂 Birthday Celebration</option>
              <option value="community">🌳 Community Gathering / Festival</option>
            </select>
            {errors.eventType && (
              <p id="error-eventType" role="alert" className="form-error">
                {errors.eventType}
              </p>
            )}
          </div>

          {/* Event Name */}
          <div className="form-group">
            <label htmlFor="field-eventName" className="form-label">
              Event Title / Name <span className="required" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="field-eventName"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              placeholder="e.g. Maya's 30th Birthday or Oakwood Summer Gala"
              className={`form-input ${errors.eventName ? 'is-invalid' : ''}`}
              aria-describedby={errors.eventName ? 'error-eventName' : undefined}
              aria-invalid={Boolean(errors.eventName)}
              maxLength={120}
              required
            />
            {errors.eventName && (
              <p id="error-eventName" role="alert" className="form-error">
                {errors.eventName}
              </p>
            )}
          </div>

          {/* Currency Selector */}
          <div className="form-group">
            <label htmlFor="field-currency" className="form-label">
              <Globe size={15} aria-hidden="true" className="label-icon" />
              Currency
            </label>
            <select
              id="field-currency"
              name="currency"
              value={formData.currency || 'INR'}
              onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
              className="form-select"
              aria-label="Currency standard"
            >
              <option value="INR">🇮🇳 INR (₹) - Indian Rupee (Default)</option>
              <option value="USD">🇺🇸 USD ($) - US Dollar</option>
              <option value="EUR">🇪🇺 EUR (€) - Euro</option>
            </select>
          </div>

          {/* Event Date */}
          <div className="form-group">
            <label htmlFor="field-eventDate" className="form-label">
              <Calendar size={15} aria-hidden="true" className="label-icon" />
              Event Date <span className="required" aria-hidden="true">*</span>
            </label>
            <input
              type="date"
              id="field-eventDate"
              name="eventDate"
              value={formData.eventDate}
              min={tomorrowStr}
              onChange={handleChange}
              className={`form-input ${errors.eventDate ? 'is-invalid' : ''}`}
              aria-describedby={errors.eventDate ? 'error-eventDate' : undefined}
              aria-invalid={Boolean(errors.eventDate)}
              required
            />
            {errors.eventDate && (
              <p id="error-eventDate" role="alert" className="form-error">
                {errors.eventDate}
              </p>
            )}
          </div>

          {/* Guest Count */}
          <div className="form-group">
            <label htmlFor="field-guestCount" className="form-label">
              <Users size={15} aria-hidden="true" className="label-icon" />
              Expected Guests <span className="required" aria-hidden="true">*</span>
            </label>
            <input
              type="number"
              id="field-guestCount"
              name="guestCount"
              value={formData.guestCount}
              min={1}
              max={10000}
              onChange={handleChange}
              className={`form-input ${errors.guestCount ? 'is-invalid' : ''}`}
              aria-describedby={errors.guestCount ? 'error-guestCount' : undefined}
              aria-invalid={Boolean(errors.guestCount)}
              required
            />
            {errors.guestCount && (
              <p id="error-guestCount" role="alert" className="form-error">
                {errors.guestCount}
              </p>
            )}
          </div>

          {/* Budget */}
          <div className="form-group">
            <label htmlFor="field-budget" className="form-label">
              <DollarSign size={15} aria-hidden="true" className="label-icon" />
              Total Budget ({formData.currency || 'INR'}) <span className="required" aria-hidden="true">*</span>
            </label>
            <input
              type="number"
              id="field-budget"
              name="budget"
              value={formData.budget}
              min={50}
              max={100000000}
              step={formData.currency === 'INR' ? 5000 : 50}
              onChange={handleChange}
              className={`form-input ${errors.budget ? 'is-invalid' : ''}`}
              aria-describedby={errors.budget ? 'error-budget' : undefined}
              aria-invalid={Boolean(errors.budget)}
              required
            />
            {errors.budget && (
              <p id="error-budget" role="alert" className="form-error">
                {errors.budget}
              </p>
            )}
          </div>

          {/* Venue Type */}
          <div className="form-group">
            <label htmlFor="field-venueType" className="form-label">
              <MapPin size={15} aria-hidden="true" className="label-icon" />
              Venue Setting <span className="required" aria-hidden="true">*</span>
            </label>
            <select
              id="field-venueType"
              name="venueType"
              value={formData.venueType}
              onChange={handleChange}
              className={`form-select ${errors.venueType ? 'is-invalid' : ''}`}
              aria-describedby={errors.venueType ? 'error-venueType' : undefined}
              aria-invalid={Boolean(errors.venueType)}
              required
            >
              <option value="indoor">🏢 Indoor Hall / Banquet Venue</option>
              <option value="outdoor">🌳 Outdoor Park / Lawn / Ground</option>
              <option value="home">🏡 Private Home / Backyard / Terrace</option>
            </select>
            {errors.venueType && (
              <p id="error-venueType" role="alert" className="form-error">
                {errors.venueType}
              </p>
            )}
          </div>
        </div>

        {/* Indian Wedding Functions (Visible when eventType is wedding) */}
        {formData.eventType === 'wedding' && (
          <div className="form-group mt-3 indian-functions-group">
            <label className="form-label" id="indian-functions-label">
              <Flower2 size={15} aria-hidden="true" className="label-icon text-amber" />
              Indian Wedding Ceremonies & Multi-Day Functions (Optional)
            </label>
            <div
              className="indian-functions-grid"
              role="group"
              aria-labelledby="indian-functions-label"
            >
              {INDIAN_WEDDING_FUNCTIONS.map((fn) => {
                const isSelected = Boolean(formData.selectedFunctions?.includes(fn.id));
                return (
                  <button
                    type="button"
                    key={fn.id}
                    onClick={() => toggleIndianFunction(fn.id)}
                    className={`function-chip ${isSelected ? 'function-chip-active' : ''}`}
                    aria-pressed={isSelected}
                  >
                    <div className="function-chip-top">
                      <span className="function-name">{fn.name}</span>
                      {isSelected && <span className="function-check" aria-hidden="true">✓</span>}
                    </div>
                    <span className="function-tagline">{fn.tagline}</span>
                    <span className="function-time text-xs">{fn.recommendedTimeframe}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Priority Highlights */}
        <div className="form-group mt-3">
          <label className="form-label" id="priorities-group-label">
            <Tag size={15} aria-hidden="true" className="label-icon" />
            Top Priorities (Allocates extra budget share)
          </label>
          <div
            className="chip-group"
            role="group"
            aria-labelledby="priorities-group-label"
          >
            {priorityOptions.map((opt) => {
              const selected = formData.priorities.includes(opt.id);
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => togglePriority(opt.id)}
                  className={`chip ${selected ? 'chip-active' : ''}`}
                  aria-pressed={selected}
                >
                  {opt.label}
                  {selected && <span className="chip-check" aria-hidden="true"> ✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="form-group mt-3">
          <label htmlFor="field-notes" className="form-label">
            Aesthetic Notes or Special Requirements (Optional)
          </label>
          <textarea
            id="field-notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={2}
            maxLength={500}
            placeholder="e.g. Traditional marigold floral canopy, live dhol players, pure vegetarian royal thali feast..."
            className="form-textarea"
          />
        </div>

        {/* Submit Action */}
        <div className="form-actions mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-lg"
          >
            <Sparkles size={18} aria-hidden="true" />
            <span>{isSubmitting ? 'Updating Plan...' : 'Generate & Update Master Plan'}</span>
          </button>
        </div>
      </form>
    </section>
  );
};
