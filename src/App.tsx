import { createSignal, onMount, lazy, Suspense } from "solid-js";
import { AppContainer, Footer, Header } from "@/components/layout";
import { TaskForm } from "@/components/tasks";
import { TaskList } from "@/components/tasks";
import { TaskFilters } from "@/components/tasks";
import {
  CenterActionBar,
  type CenterActionBarEvent,
} from "@/components/center-bar";
import { AchievementNotification } from "@/components/gamification";
import { ConfirmModal, showConfirmModal } from "@/components/base";
import { StatsDisplay, DailySummary } from "@/components/statistics";
import {
  taskActions,
  taskStore,
  uiStore,
  uiActions,
  settingsStore,
} from "@/stores";
import { audioService } from "@/services/audio";
import { musicService } from "@/services/music";
import { initDailySummary } from "@/services/dailySummary";
import { initAnimations } from "@/utils/particles";
import { useKeyboardShortcuts } from "@/hooks";
import "@/styles/index.css";

const SettingsPanel = lazy(() => import("@/components/settings/SettingsPanel"));
const MusicPlayer = lazy(() => import("@/components/music/MusicPlayer"));
const AchievementsList = lazy(
  () => import("@/components/gamification/AchievementsList")
);

const sampleTasks = [
  {
    title: "Complete project proposal",
    description: "Write and submit the Q1 project proposal",
  },
  {
    title: "Review code changes",
    description: "Review pull requests from the team",
  },
  {
    title: "Schedule team meeting",
    description: "Set up weekly sync with the development team",
  },
  {
    title: "Update documentation",
    description: "Add new API endpoints to the docs",
  },
  {
    title: "Fix navigation bug",
    description: "Mobile menu not closing on route change",
  },
  {
    title: "Prepare presentation",
    description: "Slides for the stakeholder demo",
  },
  {
    title: "Refactor auth module",
    description: "Improve error handling and add rate limiting",
  },
  {
    title: "Write unit tests",
    description: "Increase coverage for payment service",
  },
];

async function handleCenterAction(action: CenterActionBarEvent) {
  switch (action) {
    case "settings":
      uiActions.openSettingsPanel();
      break;
    case "test":
      sampleTasks.forEach((task) => {
        taskActions.addTask(task);
      });
      break;
    case "clear": {
      const counts = taskStore.taskCounts();
      if (counts.completed === 0) return;
      const confirmed = await showConfirmModal({
        title: "Confirm Deletion",
        message: `Are you sure you want to clear ${counts.completed} completed task${counts.completed !== 1 ? "s" : ""}? This cannot be undone.`,
        confirmText: "Clear",
        cancelText: "Cancel",
        confirmStyle: "danger",
      });
      if (confirmed) {
        taskActions.clearCompleted();
      }
      break;
    }
    case "delete": {
      const counts = taskStore.taskCounts();
      if (counts.total === 0) return;
      const confirmed = await showConfirmModal({
        title: "Confirm Deletion",
        message: `Are you sure you want to delete all ${counts.total} task${counts.total !== 1 ? "s" : ""}? This cannot be undone.`,
        confirmText: "Delete All",
        cancelText: "Cancel",
        confirmStyle: "danger",
      });
      if (confirmed) {
        taskActions.clearAll();
      }
      break;
    }
    case "music":
      uiActions.openMusicPlayer();
      break;
    case "sound":
      break;
  }
}

function App() {
  const [audioInitialized, setAudioInitialized] = createSignal(false);
  const [isMusicPlaying, setIsMusicPlaying] = createSignal(
    musicService.isPlaying()
  );
  const [isMusicBuffering, setIsMusicBuffering] = createSignal(
    musicService.isBuffering()
  );
  const [musicHintPulse, setMusicHintPulse] = createSignal(0);

  function initializeAudio() {
    if (!audioInitialized()) {
      audioService.init();
      setAudioInitialized(true);
    }
  }

  function focusNewTaskInput() {
    const input = document.querySelector<HTMLElement>(
      ".task-form__title-input"
    );
    input?.focus();
  }

  function closeAllModals() {
    if (uiStore.settingsPanelOpen) uiActions.closeSettingsPanel();
    if (uiStore.achievementsListOpen) uiActions.closeAchievementsList();
    if (uiStore.musicPlayerOpen) uiActions.closeMusicPlayer();
  }

  useKeyboardShortcuts([
    {
      key: "n",
      ctrl: true,
      action: focusNewTaskInput,
      description: "Focus new task input",
    },
    {
      key: "a",
      ctrl: true,
      action: () => taskActions.setFilter("all"),
      description: "Show all tasks",
    },
    { key: "Escape", action: closeAllModals, description: "Close modals" },
  ]);

  onMount(() => {
    document.addEventListener("click", initializeAudio, { once: true });
    document.addEventListener("keydown", initializeAudio, { once: true });
    musicService.setGlobalMute(!settingsStore.soundEnabled);

    const unsubscribeMusic = musicService.subscribe((state) => {
      setIsMusicPlaying(state.isPlaying);
      setIsMusicBuffering(state.isBuffering);
    });

    const unsubscribeHint = musicService.subscribeHint(() => {
      setMusicHintPulse((previous) => previous + 1);
    });

    document.body.classList.remove("loading-theme");
    initAnimations();
    initDailySummary();

    return () => {
      unsubscribeMusic();
      unsubscribeHint();
    };
  });

  return (
    <>
      <div class="background-container">
        <div class="nebula-bg" />
        <div class="grain-overlay" />
      </div>
      <div onClick={initializeAudio}>
        <Header />
        <AppContainer>
          <section class="add-task-section">
            <TaskForm />
          </section>
          <StatsDisplay />
          <TaskFilters />
          <TaskList />
        </AppContainer>
        <CenterActionBar
          onAction={handleCenterAction}
          isMusicPlaying={isMusicPlaying()}
          isMusicBuffering={isMusicBuffering()}
          musicHintPulse={musicHintPulse()}
        />
      </div>
      <Suspense>
        <SettingsPanel
          isOpen={uiStore.settingsPanelOpen}
          onClose={uiActions.closeSettingsPanel}
        />
      </Suspense>
      <Suspense>
        <AchievementsList
          isOpen={uiStore.achievementsListOpen}
          onClose={uiActions.closeAchievementsList}
        />
      </Suspense>
      <Suspense>
        <MusicPlayer
          isOpen={uiStore.musicPlayerOpen}
          onClose={uiActions.closeMusicPlayer}
        />
      </Suspense>
      <AchievementNotification />
      <DailySummary />
      <Footer />
      <ConfirmModal />
    </>
  );
}

export default App;
