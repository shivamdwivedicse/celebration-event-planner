import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { getDefaultFutureDate } from '../defaultPlan.ts';
import { validateEventPlanInput } from '../planner/validation.ts';
import { CurrencyCode, EventPlanInput, IndianWeddingFunction, Priority } from '../types.ts';

type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

const NUMERIC_FIELDS = new Set(['guestCount', 'budget']);
const PRESET_LEAD_DAYS = 90;

/** Adds the value to the list if missing, removes it if present. */
function toggleInList<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/**
 * State and handlers for the event form: field edits, chip toggles, presets,
 * and validated submission. Keeps EventForm itself purely presentational.
 */
export function useEventForm(
  currentPlan: EventPlanInput,
  onSubmitPlan: (plan: EventPlanInput) => void,
) {
  const [formData, setFormData] = useState<EventPlanInput>(currentPlan);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync with outside changes (preset, chat command, scenario budget)
  useEffect(() => {
    setFormData(currentPlan);
  }, [currentPlan]);

  // Earliest selectable date (tomorrow) in YYYY-MM-DD
  const minDate = useMemo(() => getDefaultFutureDate(1), []);

  const handleChange = (e: FieldChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: NUMERIC_FIELDS.has(name) ? Number(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleCurrencyChange = (currency: CurrencyCode) => {
    setFormData((prev) => ({ ...prev, currency }));
  };

  const togglePriority = (priority: Priority) => {
    setFormData((prev) => ({ ...prev, priorities: toggleInList(prev.priorities, priority) }));
  };

  const toggleIndianFunction = (fn: IndianWeddingFunction) => {
    setFormData((prev) => ({
      ...prev,
      selectedFunctions: toggleInList(prev.selectedFunctions || [], fn),
    }));
  };

  const applyPreset = (preset: EventPlanInput) => {
    // Keep the preset date safely in the future
    const updated: EventPlanInput = {
      ...preset,
      eventDate: getDefaultFutureDate(PRESET_LEAD_DAYS),
    };
    setFormData(updated);
    setErrors({});
    onSubmitPlan(updated);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = validateEventPlanInput(formData);

    if (!result.isValid) {
      setErrors(result.errors);
      // Focus the first invalid field for keyboard and screen reader users
      const firstErrorKey = Object.keys(result.errors)[0];
      document.getElementById(`field-${firstErrorKey}`)?.focus();
      return;
    }

    if (result.sanitizedInput) {
      setErrors({});
      onSubmitPlan(result.sanitizedInput);
    }
  };

  return {
    formData,
    errors,
    minDate,
    handleChange,
    handleCurrencyChange,
    togglePriority,
    toggleIndianFunction,
    applyPreset,
    handleSubmit,
  };
}
