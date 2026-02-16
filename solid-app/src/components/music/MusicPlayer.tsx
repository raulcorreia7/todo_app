import { createSignal, onCleanup, onMount, For, Show } from "solid-js";
import { musicService, type Track } from "@/services/music";

interface MusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

function MusicPlayer(props: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = createSignal(musicService.isPlaying());
  const [currentTrack, setCurrentTrack] = createSignal(
    musicService.getCurrentTrack()
  );
  const [volume, setVolume] = createSignal(musicService.getVolume());

  function handleToggle() {
    musicService.toggle();
    setIsPlaying(musicService.isPlaying());
  }

  function handleNext() {
    musicService.next();
    setCurrentTrack(musicService.getCurrentTrack());
  }

  function handlePrevious() {
    musicService.previous();
    setCurrentTrack(musicService.getCurrentTrack());
  }

  function handleVolumeChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const newVolume = parseFloat(target.value);
    musicService.setVolume(newVolume);
    setVolume(newVolume);
  }

  function handleTrackSelect(index: number) {
    musicService.selectTrack(index);
    setCurrentTrack(musicService.getCurrentTrack());
    setIsPlaying(musicService.isPlaying());
  }

  onMount(() => {
    const unsubscribe = musicService.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setCurrentTrack(state.currentTrack);
      setVolume(state.volume);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && props.isOpen) {
        props.onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    onCleanup(() => {
      document.removeEventListener("keydown", handleKeyDown);
      unsubscribe();
    });
  });

  return (
    <Show when={props.isOpen}>
      <div class="music-player-backdrop" onClick={props.onClose} />
      <div class="music-player music-player--open">
        <div class="music-player__header">
          <h2 class="music-player__title">Music</h2>
          <button
            class="music-player__close"
            onClick={props.onClose}
            aria-label="Close music player"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="music-player__body">
          <div class="music-player__current-track">
            <span class="music-player__track-name">{currentTrack().name}</span>
          </div>
          <div class="music-player__controls">
            <button
              class="music-player__button music-player__button--prev"
              onClick={handlePrevious}
              aria-label="Previous track"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="19,20 9,12 19,4" />
                <rect x="5" y="4" width="2" height="16" />
              </svg>
            </button>
            <button
              class="music-player__button music-player__button--play"
              onClick={handleToggle}
              aria-label={isPlaying() ? "Pause" : "Play"}
            >
              <Show
                when={isPlaying()}
                fallback={
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                }
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              </Show>
            </button>
            <button
              class="music-player__button music-player__button--next"
              onClick={handleNext}
              aria-label="Next track"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="5,4 15,12 5,20" />
                <rect x="17" y="4" width="2" height="16" />
              </svg>
            </button>
          </div>
          <div class="music-player__volume">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,9H7L12,4V20L7,15H3V9M16,15A3,3 0 0,0 16,9V15M19,12A6,6 0 0,0 13,6V8A4,4 0 0,1 17,12A4,4 0 0,1 13,16V18A6,6 0 0,0 19,12Z" />
            </svg>
            <input
              type="range"
              class="music-player__volume-slider"
              min="0"
              max="1"
              step="0.01"
              value={volume()}
              onInput={handleVolumeChange}
              aria-label="Volume"
            />
          </div>
          <div class="music-player__track-list">
            <For each={musicService.getAllTracks()}>
              {(track: Track, index) => (
                <button
                  class={`music-player__track-item ${currentTrack().id === track.id ? "music-player__track-item--active" : ""}`}
                  onClick={() => handleTrackSelect(index())}
                >
                  <span class="music-player__track-item-name">
                    {track.name}
                  </span>
                </button>
              )}
            </For>
          </div>
        </div>
      </div>
    </Show>
  );
}

export default MusicPlayer;
