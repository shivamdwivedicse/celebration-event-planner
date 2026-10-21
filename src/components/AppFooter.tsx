/** Page footer with the app description and the budget/lead-time guarantees. */
export function AppFooter() {
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="footer-container">
        <p>
          Celebration & Event Planner &bull; Deterministic Rules Engine + Gemini Flash Intelligence
          &bull; Built with accessibility & privacy in mind.
        </p>
        <p className="text-sm text-muted mt-3">
          All budget allocations sum to 100% exactly. Vendor lead times are calculated relative to
          event date.
        </p>
      </div>
    </footer>
  );
}
