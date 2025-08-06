## Bugs

# Central Action Bar Event Handling

- **FIXED**: The cabSettings, cabMusic, and cabSound buttons in the central action bar were not triggering the right events to the bus and processing the settings/music/sound actions through events. They were opening through direct clicks instead of the event system.

**Root Cause**: The event listeners for centerbar events were being set up in the components (settings.js, music.js) before the center-bar.js component had a chance to dispatch those events, creating a race condition.

**Solution**: 
1. Modified center-bar.js to dispatch a `centerbar:ready` event after initialization
2. Updated settings.js and music.js to listen for the `centerbar:ready` event before setting up their specific event listeners
3. Created separate `setupCenterBarEventListeners` methods in both components to ensure proper initialization order

# Music Player

- Next track display of duration is not being displayed with the amount of pause time between tracks. There should be a way to read or request what is the pause time between tracks
- the layout of the text is next to the volume slider, doesnt look good, needs revision.
- The sound button should act as a: global mute. it should mute everything, including music playback. it shouldnt pause it though. enable sound -> enables all sounds/music. disable sound -> dsiables allsounds/music.

- Save/Cancel buttons inside task item, after pressing edit are not working.
