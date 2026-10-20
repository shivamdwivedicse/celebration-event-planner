import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom does not implement scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();
Element.prototype.scrollIntoView = vi.fn();
