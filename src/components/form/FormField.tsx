import type { ReactNode } from 'react';

interface FormFieldProps {
  /** Field name; the control id is `field-<name>` and the error id `error-<name>`. */
  name: string;
  label: ReactNode;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

/** Labeled form group with an accessible, announced error message. */
export function FormField({ name, label, required = false, error, children }: FormFieldProps) {
  return (
    <div className="form-group">
      <label htmlFor={`field-${name}`} className="form-label">
        {label}
        {required && (
          <>
            {' '}
            <span className="required" aria-hidden="true">
              *
            </span>
          </>
        )}
      </label>
      {children}
      {error && (
        <p id={`error-${name}`} role="alert" className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Shared attributes for a validated control: id, name, invalid styling, and
 * aria links to the error message.
 */
export function controlProps(name: string, baseClass: string, error?: string) {
  return {
    id: `field-${name}`,
    name,
    className: `${baseClass} ${error ? 'is-invalid' : ''}`,
    'aria-describedby': error ? `error-${name}` : undefined,
    'aria-invalid': Boolean(error),
  };
}