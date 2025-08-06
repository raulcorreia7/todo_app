# Center Bar Wiring and Tooltip Implementation Plan

## Background
Implement event handling for center bar buttons and create reusable tooltip system. Requirements:
- Settings: Open settings panel
- Sound: Toggle global sound
- Music: Open music player (desktop: above center bar, mobile: below)
- Test: Trigger test data generation
- Clear: Clear completed tasks
- Delete: Delete all tasks
- Generic tooltip system for text/button previews

## Implementation Steps

### 1. Create Center Bar Controller (`js/center-bar.js`)
```javascript
App.CenterBar = (function() {
  const actions = {
    settings: () => ModalManager.open('settings-panel'),
    sound: () => Audio.toggleGlobalSound(),
    music: () => MusicPlayer.open(),
    test: () => TestData.generate(),
    clear: () => TodoList.clearCompleted(),
    delete: () => TodoList.deleteAll()
  };

  function init() {
    document.getElementById('center-bar').addEventListener('click', function(e) {
      const action = e.target.dataset.action;
      if (action && actions[action]) actions[action]();
    });
  }

  return { init };
})();
```

### 2. Create Tooltip Service (`js/tooltip-service.js`)
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
    tooltip.style.left = `${rect.left + rect.width/2}px`;
    tooltip.style.top = `${window.innerWidth > 768 ? rect.top - 40 : rect.bottom + 10}px`;
    
    tooltip.classList.add('visible');
  }

  function hide() {
    tooltip?.classList.remove('visible');
  }

  return { show, hide };
})();
```

### 3. Modify `index.html`
- Add data attributes to buttons:
```html
<button data-action="settings" data-tooltip="Open settings">⚙️</button>
<button data-action="sound" data-tooltip="Toggle sound">🔊</button>
<!-- Other buttons -->
```
- Include new scripts after `app.js`:
```html
<script src="js/app.js"></script>
<script src="js/center-bar.js"></script>
<script src="js/tooltip-service.js"></script>
```

### 4. Initialize in `js/app.js`
Add to initialization section:
```javascript
import CenterBar from './center-bar.js';
import Tooltip from './tooltip-service.js';

CenterBar.init();

document.querySelectorAll('[data-tooltip]').forEach(el => {
  el.addEventListener('mouseenter', () => Tooltip.show(el, el.dataset.tooltip));
  el.addEventListener('mouseleave', Tooltip.hide);
});
```

### 5. Add Tooltip Styles to `styles/design-system.css`
```css
.tooltip {
  position: fixed;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transform: translateY(5px);
  transition: opacity 0.2s, transform 0.2s;
}

.tooltip.visible {
  opacity: 1;
  transform: translateY(0);
}
```

## Testing Plan
1. Verify all center bar buttons trigger correct actions
2. Test tooltip positioning on:
   - Desktop (above element)
   - Mobile (below element)
   - Different screen sizes
3. Validate tooltip shows/hides on hover
4. Test with multiple tooltips simultaneously
5. Verify no conflicts with existing modals

## Edge Cases
- Buttons without data attributes
- Empty tooltip content
- Elements near viewport edges
- Rapid mouse movements
- Touch devices (hover simulation)

## Dependencies
- `js/modal-manager.js` (settings panel)
- `js/audio.js` (sound toggle)
- `js/music.js` (player)
- `js/app.js` (initialization)

## Integration Points
1. Ensure tooltip styles match design system
2. Coordinate with existing event listeners
3. Verify mobile responsiveness
4. Update documentation in `docs/architecture.md`
