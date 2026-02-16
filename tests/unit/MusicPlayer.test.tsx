import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import MusicPlayer from "@/components/music/MusicPlayer";

type Snapshot = {
  isPlaying: boolean;
  isBuffering: boolean;
  isGloballyMuted: boolean;
  volume: number;
  currentTrack: { id: string; name: string; src: string };
};

let snapshot: Snapshot = {
  isPlaying: false,
  isBuffering: false,
  isGloballyMuted: false,
  volume: 0.5,
  currentTrack: {
    id: "house_0",
    name: "House Vibes",
    src: "/sounds/song_house_0.mp3",
  },
};

let listeners: Array<(state: Snapshot) => void> = [];

const emitSnapshot = (next: Partial<Snapshot>) => {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((listener) => listener(snapshot));
};

vi.mock("@/services/music", () => ({
  musicService: {
    isPlaying: vi.fn(() => snapshot.isPlaying),
    isBuffering: vi.fn(() => snapshot.isBuffering),
    isGloballyMuted: vi.fn(() => snapshot.isGloballyMuted),
    getCurrentTrack: vi.fn(() => snapshot.currentTrack),
    getVolume: vi.fn(() => snapshot.volume),
    getAllTracks: vi.fn(() => [snapshot.currentTrack]),
    toggle: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    setVolume: vi.fn(),
    selectTrack: vi.fn(),
    subscribe: vi.fn((listener: (state: Snapshot) => void) => {
      listeners.push(listener);
      listener(snapshot);
      return () => {
        listeners = listeners.filter((entry) => entry !== listener);
      };
    }),
  },
}));

describe("MusicPlayer", () => {
  beforeEach(() => {
    snapshot = {
      isPlaying: false,
      isBuffering: false,
      isGloballyMuted: false,
      volume: 0.5,
      currentTrack: {
        id: "house_0",
        name: "House Vibes",
        src: "/sounds/song_house_0.mp3",
      },
    };
    listeners = [];
  });

  it("does not render when closed", () => {
    render(() => <MusicPlayer isOpen={false} onClose={() => undefined} />);
    expect(screen.queryByText("Music")).not.toBeInTheDocument();
  });

  it("shows paused status by default", () => {
    render(() => <MusicPlayer isOpen={true} onClose={() => undefined} />);
    expect(screen.getByText("Paused")).toBeInTheDocument();
  });

  it("updates status chips from music subscription state", async () => {
    render(() => <MusicPlayer isOpen={true} onClose={() => undefined} />);

    emitSnapshot({ isBuffering: true, isPlaying: true });
    expect(await screen.findByText("Buffering")).toBeInTheDocument();

    emitSnapshot({
      isBuffering: false,
      isPlaying: true,
      isGloballyMuted: true,
    });
    expect(await screen.findByText("Playing")).toBeInTheDocument();
    expect(await screen.findByText("Muted")).toBeInTheDocument();
  });
});
