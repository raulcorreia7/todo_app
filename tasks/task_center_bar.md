# CenterActionBar Implementation Plan

## Status Update
- **Phase 1: Foundation** (Completed)
- **Phase 2: Visibility Behavior** (Completed)
- **Phase 3: Visual Design & Glow** (In Progress)
- **Phase 4: Micro-Interactions** (Planned)
- **Phase 5: Wiring & Fallbacks** (Updated Implementation)
- **Phase 6: QA & Polish** (Planned)
- **Tooltip System** (New Implementation)

## Revised Phase 5: Wiring & Fallbacks

### Implementation Details
1. **HTML Modifications (index.html)**
```html
<!-- Add data attributes to buttons -->
<div id="center-bar">
  <button data-action="settings" data-tooltip="Open settings">⚙️</button>
  <button data-action="sound" data-tooltip="Toggle sound">🔊</button>
  <button data-action="music" data-tooltip="Music player">🎵</button>
  <button data-action="test" data-tooltip="Add test data">🧪</button>
  <button data-action="clear" data-tooltip="Clear completed">🧹</button>
  <button data-action="delete" data-tooltip="Delete all">🗑️</button>
</div>

<!-- Load new scripts AFTER app.js -->
<script src="js/app.js"></script>
<script src="js/center-bar.js"></script>
<script src="js/tooltip-service.js"></script>
```

2. **Center Bar Controller (js/center-bar.js)**
```javascript
App.CenterBar = (function() {
  const actions = {
    settings: function() { ModalManager.open('settings-panel'); },
    sound: function() { Audio.toggleGlobalSound(); },
    music: function() { MusicPlayer.open(); },
    test: function() { TestData.generate(); },
    clear: function() { TodoList.clearCompleted(); },
    delete: function() { TodoList.deleteAll(); }
  };

  function handleClick(e) {
    const action = e.target.dataset.action;
    if (action && actions[action]) actions[action]();
  }

  function init() {
    document.getElementById('center-bar').addEventListener('click', handleClick);
  }

  return { init };
})();
```

3. **App Initialization (js/app.js)**
```javascript
// Initialize center bar controller
App.CenterBar.init();
```

## Tooltip System Implementation

### Implementation Steps
1. **Create Tooltip Service (js/tooltip-service.js)**
```javascript
App.TooltipService = (function() {
  let tooltip = null;

  function create() {
    tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);
  }

  function show(target, text) {
    if (!tooltip) create();
    tooltip.textContent = text;
    
    const rect = target.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width/2 - tooltip.offsetWidth/2}px`;
    
    if (window.innerWidth > 768) {
      tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
    } else {
      tooltip.style.top = `${rect.bottom + 10}px`;
    }
    
    tooltip.classList.add('visible');
  }

  function hide() {
    if (tooltip) tooltip.classList.remove('visible');
  }

  return { show, hide };
})();
```

2. **Add Tooltip Wiring (js/app.js)**
```javascript
// Apply tooltips to all interactive elements
document.querySelectorAll('[data-tooltip]').forEach(el => {
  el.addEventListener('mouseenter', function() {
    App.TooltipService.show(this, this.dataset.tooltip);
  });
  el.addEventListener('mouseleave', App.TooltipService.hide);
});
```

3. **Tooltip Styles (styles/design-system.css)**
```css
.tooltip {
  position: fixed;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
  z-index: 1000;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s, transform 0.3s;
  pointer-events: none;
  max-width: 200px;
  text-align: center;
}

.tooltip.visible {
  opacity: 1;
  transform: translateY(0);
}
```

## Updated Task Status

### Phase 3: Visual Design & Glow (Additions)
- [ ] Implement tooltip styles (part of visual system)

### Phase 5: Wiring & Fallbacks (Revised)
- [x] HTML structure (completed in Phase 1)
- [ ] Center bar controller implementation
- [ ] Tooltip service implementation
- [ ] App.js initialization updates

### Testing Updates
- [x] Button layout and visibility (Phase 1)
- [ ] Tooltip positioning on desktop/mobile
- [ ] Tooltip text matches data attributes
- [ ] All button actions trigger correctly

## Next Steps
1. Implement center-bar.js
2. Create tooltip-service.js
3. Update app.js initialization
4. Add tooltip styles
5. Test tooltip system across viewports

<!-- Original content preserved below -->
## Goals
[Original goals content remains unchanged]

## Architecture Overview
[Original architecture content remains unchanged]

## Button Map and Grouping
[Original button mapping content remains unchanged]

## Phases and Subtasks
### Phase 1: Foundation
[Original foundation content remains unchanged]

### Phase 2: Visibility Behavior
[Original visibility behavior content remains unchanged]

### Phase 3: Visual Design & Glow
[Original visual design content remains unchanged]

### Phase 4: Micro-Interactions
[Original micro-interactions content remains unchanged]

### Phase 6: QA & Polish
[Original QA content remains unchanged]

## Implementation Details (Code Snippets)
[Original code snippets remain unchanged]

## Risks & Mitigations
[Original risks content remains unchanged]

## Testing Matrix
[Original testing content remains unchanged]

## Rollback Plan
[Original rollback content remains unchanged]

## Change Log Hooks
[Original changelog content remains unchanged]

## Acceptance Criteria
[Original acceptance criteria remain unchanged]
