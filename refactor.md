# Luxury Todo App Refactoring Plan

## Overview
This document outlines the refactoring and enhancement of the Luxury Todo application with a focus on improved organization, Chart.js integration for statistics, and removing the "premium" terminology from the codebase.

## Phase 1: File Organization and Renaming

### 1.1 Create New Folder Structure
```
styles/
├── main.css              (New - imports all other CSS files)
├── base/
│   ├── reset.css
│   ├── typography.css
│   └── variables.css
├── components/
│   ├── buttons.css
│   ├── cards.css
│   ├── forms.css
│   └── layout.css
├── themes/
│   ├── theme-system.css    (renamed from design-system.css)
│   ├── midnight.css
│   ├── ivory.css
│   ├── champagne.css
│   ├── graphite.css
│   ├── aurora.css
│   └── sakura.css
├── utils/
│   ├── animations.css
│   ├── responsive.css
│   └── mixins.css
└── achievements.css        (renamed from zen-achievements.css)

js/
├── core/
│   ├── app.js             (renamed from app.js)
│   └── state.js           (extracted state management)
├── components/
│   ├── task-item.js
│   ├── achievement-card.js
│   ├── modal.js
│   └── notification.js
├── services/
│   ├── storage.js
│   ├── audio.js
│   ├── themes.js
│   └── settings.js
├── features/
│   ├── gamification.js
│   ├── achievements.js    (merged from achievements-ui.js and achievement-definitions.js)
│   ├── daily-summary.js
│   ├── affirmations.js
│   └── statistics/
│       ├── statistics-v1.js
│       └── statistics-v2.js
└── utils/
    ├── dom-utils.js
    ├── formatters.js
    ├── validators.js
    └── animations.js
```

### 1.2 File Renaming and Moving
- CSS Files:
  - `styles/design-system.css` → `styles/themes/theme-system.css`
  - `styles/zen-achievements.css` → `styles/achievements.css`
  - `styles/luxury-responsive.css` → `styles/utils/responsive.css`
  - `styles/animations.css` → `styles/utils/animations.css`

- JavaScript Files:
  - `js/app.js` → `js/core/app.js`
  - `js/gamification.js` → `js/features/gamification.js`
  - `js/achievements-ui.js` + `js/achievement-definitions.js` → `js/features/achievements.js`
  - `js/zen-particles.js` → `js/utils/effects.js`
  - `js/statistics.js` → `js/features/statistics/statistics-v1.js`

### 1.3 Create main.css
Create a new `styles/main.css` file that imports all other CSS files in the correct order:
```css
@import 'base/reset.css';
@import 'base/typography.css';
@import 'base/variables.css';
@import 'components/buttons.css';
@import 'components/cards.css';
@import 'components/forms.css';
@import 'components/layout.css';
@import 'themes/theme-system.css';
@import 'themes/midnight.css';
@import 'themes/ivory.css';
@import 'themes/champagne.css';
@import 'themes/graphite.css';
@import 'themes/aurora.css';
@import 'themes/sakura.css';
@import 'utils/animations.css';
@import 'utils/responsive.css';
@import 'utils/mixins.css';
@import 'achievements.css';
```

## Phase 2: Remove "Premium" Terminology

### 2.1 Update CSS Comments and Class Names
- Remove all instances of "premium" from CSS comments
- Update class names that include "premium" to more generic terms
- Replace "premium" with "enhanced", "special", or remove entirely

### 2.2 Update JavaScript Comments and Variables
- Remove all instances of "premium" from JavaScript comments
- Update variable names that include "premium"
- Replace "premium" with more descriptive terms

### 2.3 Update HTML Comments
- Remove all instances of "premium" from HTML comments
- Replace with more descriptive terms if needed

## Phase 3: Chart.js Integration

### 3.1 Add Chart.js to index.html
Add Chart.js CDN to the index.html file before other scripts:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

### 3.2 Create statistics-v2.js
Create a new file `js/features/statistics/statistics-v2.js` with Chart.js implementation:
- Implement line chart for task completion trends
- Implement bar chart for daily productivity
- Implement doughnut chart for task categories
- Ensure responsive design for all charts
- Add methods to update chart data

### 3.3 Update Statistics Panel HTML
Modify the statistics panel in index.html to include:
- Version toggle buttons (v1/v2)
- Container for v1 statistics (existing)
- Container for v2 statistics with chart canvases

### 3.4 Add Version Toggle Logic
Implement version toggle functionality:
- Create StatisticsManager class to handle version switching
- Store user preference in localStorage
- Show/hide appropriate statistics view based on selected version
- Initialize StatisticsV2 when v2 is first selected

## Phase 4: Update index.html

### 4.1 Update CSS Import
Replace all individual CSS imports with:
```html
<link rel="stylesheet" href="styles/main.css">
```

### 4.2 Update Script Imports
Update script imports to follow the new file structure:
- Import utility files first
- Import service files
- Import component files
- Import feature files
- Import core files last
- Include Chart.js CDN

## Phase 5: Add CSS for Charts

### 5.1 Update luxury-components.css
Add styles for:
- Charts container layout
- Chart wrapper styling
- Version toggle buttons
- Responsive chart sizing

## Phase 6: Remove "Premium" References

### 6.1 Update CSS Files
Systematically remove all instances of "premium" from:
- CSS comments
- Class names
- Property names

### 6.2 Update JavaScript Files
Systematically remove all instances of "premium" from:
- JavaScript comments
- Variable names
- Function names
- Object properties

### 6.3 Update HTML Files
Systematically remove all instances of "premium" from:
- HTML comments
- Class attributes
- Data attributes

## Implementation Timeline

1. **Phase 1 (File Organization)**: 1-2 days
2. **Phase 2 (Remove "Premium" Terminology)**: 0.5 days
3. **Phase 3 (Chart.js Integration)**: 1 day
4. **Phase 4 (Update index.html)**: 0.5 days
5. **Phase 5 (CSS Updates)**: 0.5 days
6. **Phase 6 (Remove "Premium" References)**: 0.5 days
7. **Phase 7 (Testing)**: 1 day

**Total Estimated Time**: 5-6 days

## Success Criteria

- All files are properly organized in the new folder structure
- CSS is consolidated into main.css with proper imports
- Chart.js integration works with v1/v2 toggle
- All "premium" terminology has been removed from the codebase
- All existing functionality remains intact
- Statistics visualizations display correctly
- Responsive design works on all screen sizes
- Performance is not negatively impacted

## Testing Strategy

1. **Functionality Testing**
   - Verify all existing features work after reorganization
   - Test statistics v1/v2 toggle functionality
   - Ensure Chart.js renders correctly
   - Check responsive design on different screen sizes

2. **Performance Testing**
   - Check page load times
   - Verify Chart.js doesn't impact performance significantly
   - Test on different devices and browsers

3. **User Experience Testing**
   - Ensure smooth transitions between statistics versions
   - Verify charts are interactive and responsive
   - Check that all icons and styling remain consistent

## Notes

- Maintain the existing "Luxury Todo" branding in the UI
- Keep the glassmorphism design aesthetic
- Ensure all existing features continue to work as expected
- Use only Chart.js as an external dependency
- Keep the implementation simple and maintainable
