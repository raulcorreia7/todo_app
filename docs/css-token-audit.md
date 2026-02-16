# CSS Token Alignment Audit

## Summary

- Total original tokens: ~120
- Total SolidJS tokens: ~140
- Matching: 85
- Missing in SolidJS: 15
- Different values: 20

## Default Theme Differences

**Critical Finding**: The original app defaults to **Midnight** theme (dark pink/red), while SolidJS defaults to **Emerald** theme (green).

| Token             | Original (Midnight Default) | SolidJS (Emerald Default) | Status    |
| ----------------- | --------------------------- | ------------------------- | --------- |
| --color-primary   | #1a1a2e                     | #0c4a3e                   | DIFFERENT |
| --color-secondary | #16213e                     | #134e4a                   | DIFFERENT |
| --color-accent    | #0f3460                     | #2ecc71                   | DIFFERENT |
| --color-text      | #e94560                     | #e8f8f5                   | DIFFERENT |
| --color-glow      | #e94560                     | #2ecc71                   | DIFFERENT |
| --color-shadow    | rgba(233, 69, 96, 0.3)      | rgba(46, 204, 113, 0.3)   | DIFFERENT |
| --color-glass     | rgba(26, 26, 46, 0.8)       | rgba(12, 74, 62, 0.8)     | DIFFERENT |
| --color-border    | rgba(233, 69, 96, 0.2)      | rgba(46, 204, 113, 0.2)   | DIFFERENT |
| --danger-text     | #dc143c                     | #e74c3c                   | DIFFERENT |

## Token Comparison Table

### Color Tokens

| Token               | Original Value                                            | SolidJS Value                                             | Status         |
| ------------------- | --------------------------------------------------------- | --------------------------------------------------------- | -------------- |
| --color-primary     | #1a1a2e                                                   | #0c4a3e                                                   | DIFFERENT      |
| --color-secondary   | #16213e                                                   | #134e4a                                                   | DIFFERENT      |
| --color-accent      | #0f3460                                                   | #2ecc71                                                   | DIFFERENT      |
| --color-text        | #e94560                                                   | #e8f8f5                                                   | DIFFERENT      |
| --color-glow        | #e94560                                                   | #2ecc71                                                   | DIFFERENT      |
| --color-shadow      | rgba(233, 69, 96, 0.3)                                    | rgba(46, 204, 113, 0.3)                                   | DIFFERENT      |
| --color-glass       | rgba(26, 26, 46, 0.8)                                     | rgba(12, 74, 62, 0.8)                                     | DIFFERENT      |
| --color-border      | rgba(233, 69, 96, 0.2)                                    | rgba(46, 204, 113, 0.2)                                   | DIFFERENT      |
| --color-border-soft | color-mix(in oklab, var(--color-border) 50%, transparent) | color-mix(in oklab, var(--color-border) 50%, transparent) | MATCH          |
| --color-warning     | #ff9800                                                   | #ff9800                                                   | MATCH          |
| --color-error       | #f44336                                                   | #f44336                                                   | MATCH          |
| --color-success     | #4caf50                                                   | #4caf50                                                   | MATCH          |
| --color-info        | #2196f3                                                   | #2196f3                                                   | MATCH          |
| --color-text-muted  | (none)                                                    | rgba(255, 255, 255, 0.6)                                  | NEW IN SOLIDJS |

### Glass Effect Tokens

| Token                 | Original Value                   | SolidJS Value                     | Status    |
| --------------------- | -------------------------------- | --------------------------------- | --------- |
| --glass-primary       | rgba(255, 255, 255, 0.12)        | rgba(255, 255, 255, 0.12)         | MATCH     |
| --glass-primary-hover | rgba(255, 255, 255, 0.18)        | rgba(255, 255, 255, 0.18)         | MATCH     |
| --glass-highlight     | rgba(255, 255, 255, 0.4)         | rgba(255, 255, 255, 0.4)          | MATCH     |
| --glass-bg            | rgba(26, 26, 46, 0.8)            | rgba(12, 74, 62, 0.8)             | DIFFERENT |
| --glass-border        | 1px solid rgba(233, 69, 96, 0.2) | 1px solid rgba(46, 204, 113, 0.2) | DIFFERENT |
| --glass-blur          | blur(20px)                       | blur(20px)                        | MATCH     |
| --glass-radius        | var(--radius-lg)                 | var(--radius-lg)                  | MATCH     |

### Danger/Destructive Tokens

| Token                       | Original Value          | SolidJS Value           | Status    |
| --------------------------- | ----------------------- | ----------------------- | --------- |
| --danger-glass              | rgba(220, 20, 60, 0.12) | rgba(231, 76, 60, 0.12) | DIFFERENT |
| --danger-glass-hover        | rgba(220, 20, 60, 0.2)  | rgba(231, 76, 60, 0.2)  | DIFFERENT |
| --danger-glass-ghost        | rgba(220, 20, 60, 0.08) | rgba(231, 76, 60, 0.08) | DIFFERENT |
| --danger-glass-ghost-hover  | rgba(220, 20, 60, 0.15) | rgba(231, 76, 60, 0.15) | DIFFERENT |
| --danger-border             | rgba(220, 20, 60, 0.3)  | rgba(231, 76, 60, 0.3)  | DIFFERENT |
| --danger-border-hover       | rgba(220, 20, 60, 0.5)  | rgba(231, 76, 60, 0.5)  | DIFFERENT |
| --danger-border-ghost       | rgba(220, 20, 60, 0.25) | rgba(231, 76, 60, 0.25) | DIFFERENT |
| --danger-border-ghost-hover | rgba(220, 20, 60, 0.4)  | rgba(231, 76, 60, 0.4)  | DIFFERENT |
| --danger-text               | #dc143c                 | #e74c3c                 | DIFFERENT |
| --danger-shadow             | rgba(220, 20, 60, 0.2)  | rgba(231, 76, 60, 0.2)  | DIFFERENT |
| --danger-shadow-hover       | rgba(220, 20, 60, 0.3)  | rgba(231, 76, 60, 0.3)  | DIFFERENT |
| --danger-shadow-ghost       | rgba(220, 20, 60, 0.15) | rgba(231, 76, 60, 0.15) | DIFFERENT |
| --danger-shadow-ghost-hover | rgba(220, 20, 60, 0.25) | rgba(231, 76, 60, 0.25) | DIFFERENT |
| --danger-highlight          | rgba(220, 20, 60, 0.4)  | rgba(231, 76, 60, 0.4)  | DIFFERENT |

### Typography Tokens

| Token               | Original Value                                                  | SolidJS Value                                                   | Status         |
| ------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- | -------------- |
| --font-inter        | 'Inter', -apple-system, BlinkMacSystemFont, sans-serif          | 'Inter', -apple-system, BlinkMacSystemFont, sans-serif          | MATCH          |
| --font-playfair     | 'Playfair Display', serif                                       | 'Playfair Display', serif                                       | MATCH          |
| --font-sf           | 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif | 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif | MATCH          |
| --font-family-base  | (none)                                                          | var(--font-inter)                                               | NEW IN SOLIDJS |
| --font-family-inter | (alias)                                                         | var(--font-inter)                                               | ALIAS          |
| --font-size-xs      | 0.75rem                                                         | 0.75rem                                                         | MATCH          |
| --font-size-sm      | 0.875rem                                                        | 0.875rem                                                        | MATCH          |
| --font-size-base/md | 1rem                                                            | 1rem                                                            | MATCH          |
| --font-size-lg      | 1.125rem                                                        | 1.125rem                                                        | MATCH          |
| --font-size-xl      | 1.25rem                                                         | 1.25rem                                                         | MATCH          |
| --font-size-2xl     | 1.5rem                                                          | 1.5rem                                                          | MATCH          |
| --font-size-3xl     | 1.875rem                                                        | 2rem                                                            | DIFFERENT      |
| --font-size-4xl     | 2.25rem                                                         | 2.5rem                                                          | DIFFERENT      |
| --font-size-5xl     | (none)                                                          | 3.5rem                                                          | NEW IN SOLIDJS |

### Spacing Tokens

| Token             | Original Value | SolidJS Value | Status         |
| ----------------- | -------------- | ------------- | -------------- |
| --space-xs        | 0.25rem        | 0.25rem       | MATCH          |
| --space-sm        | 0.5rem         | 0.5rem        | MATCH          |
| --space-md        | 1rem           | 1rem          | MATCH          |
| --space-lg        | 1.5rem         | 1.5rem        | MATCH          |
| --space-xl        | 2rem           | 2rem          | MATCH          |
| --space-2xl       | 3rem           | 3rem          | MATCH          |
| --space-3xl       | 4rem           | 4rem          | MATCH          |
| --space-4xl       | 5rem           | 5rem          | MATCH          |
| --space-5xl       | 6rem           | 6rem          | MATCH          |
| --space-0         | (none)         | 0             | NEW IN SOLIDJS |
| --space-golden-xs | 0.1618rem      | 0.1618rem     | MATCH          |
| --space-golden-sm | 0.382rem       | 0.382rem      | MATCH          |
| --space-golden-md | 0.618rem       | 0.618rem      | MATCH          |
| --space-golden-lg | 1rem           | 1rem          | MATCH          |
| --space-golden-xl | 1.618rem       | 1.618rem      | MATCH          |

### Border Radius Tokens

| Token         | Original Value | SolidJS Value | Status         |
| ------------- | -------------- | ------------- | -------------- |
| --radius-sm   | 0.375rem       | 0.375rem      | MATCH          |
| --radius-md   | 0.5rem         | 0.5rem        | MATCH          |
| --radius-lg   | 0.75rem        | 0.75rem       | MATCH          |
| --radius-xl   | 1rem           | 1rem          | MATCH          |
| --radius-2xl  | 1.5rem         | 1.5rem        | MATCH          |
| --radius-full | 9999px         | 9999px        | MATCH          |
| --radius-none | (none)         | 0             | NEW IN SOLIDJS |

### Shadow Tokens

| Token         | Original Value                                                            | SolidJS Value                                                             | Status         |
| ------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------- |
| --shadow-sm   | 0 1px 2px 0 rgba(0, 0, 0, 0.05)                                           | 0 1px 2px 0 rgba(0, 0, 0, 0.05)                                           | MATCH          |
| --shadow-md   | 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)     | 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)     | MATCH          |
| --shadow-lg   | 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)   | 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)   | MATCH          |
| --shadow-xl   | 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) | 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) | MATCH          |
| --shadow-2xl  | 0 25px 50px -12px rgba(0, 0, 0, 0.25)                                     | 0 25px 50px -12px rgba(0, 0, 0, 0.25)                                     | MATCH          |
| --shadow-none | (none)                                                                    | none                                                                      | NEW IN SOLIDJS |
| --shadow-glow | (none)                                                                    | 0 0 20px var(--color-shadow)                                              | NEW IN SOLIDJS |

### Z-Index Tokens

| Token                 | Original Value | SolidJS Value | Status                             |
| --------------------- | -------------- | ------------- | ---------------------------------- |
| --z-base              | 0              | 0             | MATCH                              |
| --z-content           | 10             | 10            | MATCH                              |
| --z-floating-actions  | 900            | 900           | MATCH                              |
| --z-floating-settings | 920            | MISSING       | MISSING                            |
| --z-achievements      | 1000           | MISSING       | MISSING                            |
| --z-panel-backdrop    | (none)         | 1000          | NEW IN SOLIDJS                     |
| --z-popover           | 1060 / 1100    | 1100          | DIFFERENT (duplicated in original) |
| --z-panel             | 1200           | 1010          | DIFFERENT                          |
| --z-modal-backdrop    | 1040           | 1040          | MATCH                              |
| --z-modal             | 1050           | 1050          | MATCH                              |
| --z-tooltip           | 1070           | 1200          | DIFFERENT                          |
| --z-dropdown          | 1000           | (none)        | MISSING IN SOLIDJS                 |
| --z-sticky            | 1020           | (none)        | MISSING IN SOLIDJS                 |
| --z-fixed             | 1030           | (none)        | MISSING IN SOLIDJS                 |
| --z-footer            | (none)         | 100           | NEW IN SOLIDJS                     |
| --z-toast             | (none)         | 1400          | NEW IN SOLIDJS                     |

### Transition/Animation Tokens

| Token                     | Original Value                     | SolidJS Value                      | Status         |
| ------------------------- | ---------------------------------- | ---------------------------------- | -------------- |
| --transition-fast         | (none)                             | 150ms ease                         | NEW IN SOLIDJS |
| --transition-normal       | 300ms cubic-bezier(0.4, 0, 0.2, 1) | 300ms cubic-bezier(0.4, 0, 0.2, 1) | MATCH          |
| --transition-slow         | (none)                             | 400ms ease                         | NEW IN SOLIDJS |
| --effect-transition       | 300ms ease                         | 300ms ease                         | MATCH          |
| --effect-hover            | translateY(-2px)                   | translateY(-2px)                   | MATCH          |
| --effect-glow             | 0 0 20px var(--color-shadow)       | 0 0 20px var(--color-shadow)       | MATCH          |
| --ease-silk               | cubic-bezier(0.34, 1.56, 0.64, 1)  | cubic-bezier(0.34, 1.56, 0.64, 1)  | MATCH          |
| --ease-velvet             | cubic-bezier(0.22, 0.61, 0.36, 1)  | cubic-bezier(0.22, 0.61, 0.36, 1)  | MATCH          |
| --ease-organic            | cubic-bezier(0.34, 1.56, 0.64, 1)  | cubic-bezier(0.34, 1.56, 0.64, 1)  | MATCH          |
| --ease-subtle             | cubic-bezier(0.16, 1, 0.3, 1)      | cubic-bezier(0.16, 1, 0.3, 1)      | MATCH          |
| --ease-linear             | (none)                             | linear                             | NEW IN SOLIDJS |
| --ease-in                 | (none)                             | cubic-bezier(0.4, 0, 1, 1)         | NEW IN SOLIDJS |
| --ease-out                | (none)                             | cubic-bezier(0, 0, 0.2, 1)         | NEW IN SOLIDJS |
| --ease-in-out             | (none)                             | cubic-bezier(0.4, 0, 0.2, 1)       | NEW IN SOLIDJS |
| --animation-duration      | 300ms                              | 2.6s                               | DIFFERENT      |
| --animation-easing        | cubic-bezier(0.4, 0, 0.2, 1)       | cubic-bezier(0.4, 0, 0.2, 1)       | MATCH          |
| --animation-timing-fast   | (none)                             | 150ms                              | NEW IN SOLIDJS |
| --animation-timing-normal | (none)                             | 300ms                              | NEW IN SOLIDJS |
| --animation-timing-slow   | (none)                             | 500ms                              | NEW IN SOLIDJS |
| --motion-fast             | 160ms                              | 160ms                              | MATCH          |
| --motion-normal           | 240ms                              | 240ms                              | MATCH          |
| --motion-slow             | 700ms                              | 700ms                              | MATCH          |
| --ease-smooth             | cubic-bezier(0.2, 0.8, 0.2, 1)     | cubic-bezier(0.2, 0.8, 0.2, 1)     | MATCH          |

### Component Sizing Tokens

| Token                 | Original Value | SolidJS Value | Status         |
| --------------------- | -------------- | ------------- | -------------- |
| --icon-size-xs        | (none)         | 14px          | NEW IN SOLIDJS |
| --icon-size-sm        | (none)         | 16px          | NEW IN SOLIDJS |
| --icon-size-md        | (none)         | 18px          | NEW IN SOLIDJS |
| --icon-size-lg        | (none)         | 20px          | NEW IN SOLIDJS |
| --icon-size-xl        | (none)         | 24px          | NEW IN SOLIDJS |
| --icon-size-floating  | 24px           | 24px          | MATCH          |
| --icon-size-primary   | 20px           | 20px          | MATCH          |
| --icon-size-secondary | 18px           | 18px          | MATCH          |
| --btn-size-sm         | (none)         | 32px          | NEW IN SOLIDJS |
| --btn-size-md         | (none)         | 36px          | NEW IN SOLIDJS |
| --btn-size-lg         | (none)         | 44px          | NEW IN SOLIDJS |
| --btn-size-xl         | (none)         | 48px          | NEW IN SOLIDJS |
| --btn-size-floating   | 48px           | 48px          | MATCH          |
| --btn-size-primary    | 44px           | 44px          | MATCH          |
| --btn-size-secondary  | 36px           | 36px          | MATCH          |

### Stat Card Tokens

| Token                           | Original Value                                                                                    | SolidJS Value                                                                                     | Status                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------- |
| --stat-card-bg                  | rgba(255, 255, 255, 0.03)                                                                         | rgba(255, 255, 255, 0.03)                                                                         | MATCH                  |
| --stat-card-border-color        | rgba(255, 255, 255, 0.08)                                                                         | rgba(255, 255, 255, 0.08)                                                                         | MATCH                  |
| --stat-card-hover-bg            | rgba(255, 255, 255, 0.06)                                                                         | rgba(255, 255, 255, 0.06)                                                                         | MATCH                  |
| --stat-card-hover-border-color  | color-mix(in oklab, var(--accent-color) 30%, var(--color-border))                                 | color-mix(in oklab, var(--color-accent) 30%, var(--color-border))                                 | DIFFERENT (token name) |
| --stat-card-hover-shadow        | 0 12px 28px var(--shadow-color), 0 0 25px color-mix(in oklab, var(--glow-color) 25%, transparent) | 0 12px 28px var(--color-shadow), 0 0 25px color-mix(in oklab, var(--color-glow) 25%, transparent) | DIFFERENT (token name) |
| --stat-icon-bg-start            | color-mix(in oklab, var(--accent-color) 15%, transparent)                                         | color-mix(in oklab, var(--color-accent) 15%, transparent)                                         | DIFFERENT (token name) |
| --stat-icon-bg-end              | color-mix(in oklab, var(--accent-color) 8%, transparent)                                          | color-mix(in oklab, var(--color-accent) 8%, transparent)                                          | DIFFERENT (token name) |
| --stat-icon-glow-color          | color-mix(in oklab, var(--glow-color) 40%, transparent)                                           | color-mix(in oklab, var(--color-glow) 40%, transparent)                                           | DIFFERENT (token name) |
| --stat-icon-hover-glow-color    | color-mix(in oklab, var(--glow-color) 60%, transparent)                                           | color-mix(in oklab, var(--color-glow) 60%, transparent)                                           | DIFFERENT (token name) |
| --stat-icon-border-glow-opacity | 0.2                                                                                               | 0.2                                                                                               | MATCH                  |
| --stat-label-color              | rgba(255, 255, 255, 0.6)                                                                          | rgba(255, 255, 255, 0.6)                                                                          | MATCH                  |
| --stat-value-color              | var(--color-text)                                                                                 | var(--color-text)                                                                                 | MATCH                  |
| --stat-label-hover-opacity      | 1                                                                                                 | 1                                                                                                 | MATCH                  |
| --stat-label-color-light        | rgba(0, 0, 0, 0.7)                                                                                | rgba(0, 0, 0, 0.7)                                                                                | MATCH                  |
| --stat-value-color-light        | var(--color-text)                                                                                 | var(--color-text)                                                                                 | MATCH                  |
| --stat-value-hover-opacity      | 1                                                                                                 | 1                                                                                                 | MATCH                  |
| --stat-progress-ring-bg-color   | color-mix(in oklab, var(--color-border) 60%, transparent)                                         | color-mix(in oklab, var(--color-border) 60%, transparent)                                         | MATCH                  |
| --stat-progress-ring-fill-color | var(--accent-color)                                                                               | var(--color-accent)                                                                               | DIFFERENT (token name) |
| --stat-progress-ring-glow-color | color-mix(in oklab, var(--glow-color) 50%, transparent)                                           | color-mix(in oklab, var(--color-glow) 50%, transparent)                                           | DIFFERENT (token name) |

### New SolidJS Tokens

| Token                    | Value                                   | Category |
| ------------------------ | --------------------------------------- | -------- |
| --color-text-muted       | rgba(255, 255, 255, 0.6)                | Color    |
| --shimmer-light          | rgba(255, 255, 255, 0.1)                | Effect   |
| --shimmer-medium         | rgba(255, 255, 255, 0.2)                | Effect   |
| --shimmer-subtle         | rgba(255, 255, 255, 0.05)               | Effect   |
| --color-text-on-accent   | white                                   | Color    |
| --overlay-backdrop       | rgba(0, 0, 0, 0.6)                      | Overlay  |
| --overlay-backdrop-light | rgba(0, 0, 0, 0.5)                      | Overlay  |
| --ai-accent              | #6366f1                                 | Color    |
| --ai-accent-glow         | rgba(99, 102, 241, 0.3)                 | Color    |
| --success-accent         | #10b981                                 | Color    |
| --success-accent-glow    | rgba(16, 185, 129, 0.3)                 | Color    |
| --warning-text           | #f59e0b                                 | Color    |
| --error-text             | #ef4444                                 | Color    |
| --delete-hover-bg        | rgba(255, 71, 87, 0.15)                 | Color    |
| --delete-hover-border    | #ff4757                                 | Color    |
| --inset-shadow-light     | inset 0 1px 0 rgba(255, 255, 255, 0.08) | Shadow   |
| --inset-shadow-dark      | inset 0 1px 0 rgba(0, 0, 0, 0.08)       | Shadow   |
| --focus-ring-glow        | rgba(233, 69, 96, 0.15)                 | Effect   |
| --text-shadow-glow       | rgba(0, 0, 0, 0.08)                     | Effect   |
| --glass-border-color     | (theme-dependent)                       | Border   |

## Missing Tokens (High Priority)

### Missing in SolidJS

| Token                 | Original Value  | Description                                        |
| --------------------- | --------------- | -------------------------------------------------- |
| --z-floating-settings | 920             | Z-index for floating settings (below achievements) |
| --z-achievements      | 1000            | Z-index for achievement notifications              |
| --z-dropdown          | 1000            | Z-index for dropdown menus                         |
| --z-sticky            | 1020            | Z-index for sticky elements                        |
| --z-fixed             | 1030            | Z-index for fixed elements                         |
| --primary-color-rgb   | 26, 26, 46      | RGB values for color manipulation                  |
| --glow-color          | (used as alias) | Direct glow color (SolidJS uses --color-glow)      |
| --shadow-color        | (used as alias) | Direct shadow color (SolidJS uses --color-shadow)  |
| --accent-color        | (used as alias) | Direct accent color (SolidJS uses --color-accent)  |

### Missing in Original

| Token                | SolidJS Value     | Description                       |
| -------------------- | ----------------- | --------------------------------- |
| --z-footer           | 100               | Z-index for footer                |
| --z-toast            | 1400              | Z-index for toast notifications   |
| --glass-border-color | (theme-dependent) | Explicit glass border color token |
| --shimmer-\* tokens  | various           | Shimmer effect tokens             |

## Value Mismatches

### Critical Mismatches (Affect Visual Appearance)

1. **Default Theme**: Original uses Midnight (dark pink/red), SolidJS uses Emerald (green)
2. **--danger-text**: #dc143c vs #e74c3c (slightly different reds)
3. **--danger-\* colors**: Crimson-based vs. Alizarin-based color schemes
4. **--z-tooltip**: 1070 vs 1200 (different z-index layering)
5. **--z-panel**: 1200 vs 1010 (different z-index layering)
6. **--animation-duration**: 300ms vs 2.6s (significant timing difference)

### Token Naming Inconsistencies

The original uses shorthand aliases (--glow-color, --shadow-color, --accent-color) while SolidJS uses prefixed versions (--color-glow, --color-shadow, --color-accent). SolidJS provides legacy aliases for backward compatibility:

```css
/* Legacy Aliases in SolidJS */
--primary-color: var(--color-primary);
--secondary-color: var(--color-secondary);
--accent-color: var(--color-accent);
--glow-color: var(--color-glow);
--shadow-color: var(--color-shadow);
```

## Recommendations

### High Priority

1. **Default Theme Alignment**: Decide whether SolidJS should default to Midnight theme to match original behavior, or document the intentional change.

2. **Z-Index Consolidation**: Add missing z-index tokens to SolidJS:

   ```css
   --z-floating-settings: 920;
   --z-achievements: 1000;
   --z-dropdown: 1000;
   --z-sticky: 1020;
   --z-fixed: 1030;
   ```

3. **Danger Color Consistency**: Align --danger-text values:
   - Original: #dc143c (Crimson)
   - SolidJS: #e74c3c (Alizarin)
   - Recommendation: Use #dc143c for consistency

4. **Animation Duration**: Review --animation-duration:
   - Original: 300ms
   - SolidJS: 2.6s
   - This is a significant difference that may affect perceived performance

### Medium Priority

1. **Add Shimmer Tokens to Original**: Consider adding --shimmer-light, --shimmer-medium, --shimmer-subtle to original for consistency.

2. **Z-Index Standardization**: Consider aligning z-index values:
   - Tooltip should probably be highest: both should use 1200
   - Panel z-index should be reconciled

3. **Font Size Consistency**: Review --font-size-3xl and --font-size-4xl differences.

### Low Priority

1. **Documentation**: Document the intentional naming convention change from shorthand to prefixed tokens.

2. **Component Sizing**: The new component sizing tokens in SolidJS (--btn-size-_, --icon-size-_) are valuable additions. Consider backporting to original.

3. **Utility Classes**: SolidJS has comprehensive utility classes in utilities.css. Consider whether original needs similar.

## Theme Coverage

### Both Implementations Support

- midnight
- ivory
- champagne
- graphite
- aurora
- sakura
- arcticSky

### SolidJS Only (Additional)

- emerald (default)
- pearl
- mint
- coral
- frost
- lavender
- amethyst
- burgundy

### Original Only

- pearl (referenced but not fully defined)
- coral (referenced but not fully defined)
- frost (referenced but not fully defined)
- lavender (referenced but not fully defined)
- mint (referenced but not fully defined)
- amethyst (defined in base.css)
- burgundy (defined in base.css)

## Conclusion

The SolidJS port has a more structured token system with better organization, but differs significantly in default theme choice and some token values. The z-index system needs alignment, and the danger color scheme uses slightly different red tones. Overall, the SolidJS implementation is more comprehensive with better utility support, but should align with original for visual consistency.

**Action Items:**

1. Add missing z-index tokens to SolidJS
2. Align danger color values
3. Decide on default theme (document if intentional change)
4. Review animation duration discrepancy
5. Consider adding SolidJS improvements back to original
