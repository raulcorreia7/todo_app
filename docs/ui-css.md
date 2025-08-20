# UI & CSS

## Tokens
- Single source: `styles/theme-system.css` defines color, spacing, and typography variables.
- Use variables in components; avoid hardcoded colors.

## Structure
- Entry: `styles/main.css` imports layers in order: tokens → base → components → animations → responsive → modals → interactions.
- Large legacy bundles (e.g., `components.css`) can be split gradually per component.

## Patterns
- Prefer `transform` and `opacity` for animations; keep motions subtle.
- Reduce selector specificity; use class-based targeting and `:where()` where safe.
- Co-locate small component styles in future React migration as CSS Modules.

## Modals
- Use ModalManager; avoid `window.confirm`.
- Danger modals should reference theme variables (e.g., `--danger-glow-color`) for consistent glow.
- Ensure ARIA (`role="dialog"`, `aria-modal`, labeled/ described), focus trap, ESC to close.

## Accessibility
- Honor `prefers-reduced-motion`.
- Maintain AA contrast or better.
- Provide visible focus styles and keyboard reachability.
