# Events Catalog

Central reference for application events. Prefer constants from `js/constants.js` when dispatching or subscribing.

## Bus Events (CustomEvent)
- `app:ready`: App finished init. detail: `{}`
- `componentReady`: A component announced readiness. detail: `{ component: string }`
- `settingsChanged`: Settings updated. detail: `{ key?: string, value?: unknown, settings?: Settings }`
- `tasksUpdated`: Task list changed. detail: `{ source?: string }`
- `resetToDefaults`: Trigger full reset. detail: `{}`
- `autoSaved`: Background save completed. detail: `{}`

### Center Bar
- `centerbar:ready`: Center bar UI initialized. detail: `{}`
- `centerbar:music`: Toggle/open music UI. detail: `{}`
- `centerbar:test`: Trigger debug/test action. detail: `{}`
- `centerbar:clear`: Clear completed tasks. detail: `{}`
- `centerbar:sound`: Toggle sound. detail: `{}`
- `centerbar:delete`: Delete all tasks. detail: `{}`

### Music
- `music:started` | `music:playing` | `music:paused` | `music:buffering`
- `music:silenceStart` | `music:silenceEnd` | `music:hintStart`
- `music:prev` | `music:next` | `music:toggle`
- `music:setVolume`: detail: `{ volume: number }`

## DOM Events
- `themeReady`: Theme system is ready (document-level event).

## Usage
```js
// Dispatch
bus.dispatchEvent(new CustomEvent('tasksUpdated', { detail: { source: 'app' } }));

// Subscribe
bus.addEventListener('settingsChanged', (e) => {
  const { key, value } = e.detail || {};
});
```
