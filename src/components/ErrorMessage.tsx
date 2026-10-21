/**
 * Accessible error notification banner.
 * Uses role="alert" and aria-live="assertive" for immediate assistive tech announcement.
 */

import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface ErrorMessageProps {
  id?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  id = 'global-error-alert',
  message,
  onRetry,
  onDismiss,
}) => {
  if (!message) return null;

  return (
    <div id={id} role="alert" aria-live="assertive" className="error-banner">
      <div className="error-banner-content">
        <AlertCircle className="error-icon" aria-hidden="true" size={20} />
        <div className="error-text">
          <strong className="error-title">Attention needed:</strong> {message}
        </div>
      </div>
      <div className="error-actions">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn btn-sm btn-outline-danger"
            aria-label="Retry previous operation"
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span>Retry</span>
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="btn-icon"
            aria-label="Dismiss error notification"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};
