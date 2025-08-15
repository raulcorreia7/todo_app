/**
 * Main application controller
 * Coordinates all components and manages the todo list
 */

class TodoApp {
  constructor() {
    this.tasks = [];
    this.isInitialized = false;
    this.currentFilter = "all";
    this.editingTaskId = null;
    this.isDirty = false;
    this.renderTimeout = null;
    this.autoSaveTimeout = null;

    // Initialize CenterBar instance
    this.centerBar = null;

    this.CONFIG = {
      maxTitleLength: 100,
      maxDescriptionLength: 500,
      autoSaveDelay: 500,
      animationDuration: 300,
      debounceDelay: 50,
    };

    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    if (this.isInitialized) return;

    await this.waitForDependencies();
    this.setupEventListeners();
    // Subtle ready cue (if supported)
    this.vibrate?.("subtle");
    this.loadTasks();

    // Update statistics after loading tasks
    if (
      typeof statisticsManager !== "undefined" &&
      statisticsManager.isReady()
    ) {
      statisticsManager.updateStatistics();
    }

    this.render();
    this.setupFooterVisibility();

    // Initialize volume button state
    this.initializeVolumeButtonState();

    // Setup settings change listener for volume button
    this.setupSettingsChangeListener();

    // Initialize statistics manager

    // Initialize audio manager
    // Light haptic on app init completion
    this.vibrate?.("subtle");

    this.isInitialized = true;

    // Signal globally that the app is fully ready for dependent systems (e.g. music delayed start)
    try {
      if (
        typeof bus !== "undefined" &&
        typeof bus.dispatchEvent === "function"
      ) {
        bus.dispatchEvent(new CustomEvent("app:ready"));
      } else {
        // Fallback: also fire a DOM event so listeners without the bus can hook in
        document.dispatchEvent(new CustomEvent("app:ready"));
      }
    } catch (e) {
      console.warn("Failed to dispatch app:ready event", e);
    }
  }

  /**
   * Attempt a subtle haptic vibration if supported
   * Premium patterns, minimal and respectful of device settings.
   * @param {'subtle'|'add'|'complete'|'delete'} kind
   */
  vibrate(kind = "subtle") {
    try {
      if (!("vibrate" in navigator)) return;
      const patterns = {
        subtle: [15],
        add: [50],
        complete: [30, 50, 30],
        delete: [100],
      };
      navigator.vibrate(patterns[kind] || patterns.subtle);
    } catch (_) {
      // no-op
    }
  }

  /**
   * Wait for all dependencies to load, including settings and UI subsystems
   * Guarantees ordering: bus -> storage -> themes -> modal -> settings-loader -> settings -> audio -> music -> statistics
   * Falls back after a max wait to avoid hard-lock.
   */
  async waitForDependencies() {
    const ready = (obj, method) => {
      try {
        if (typeof obj === "undefined" || obj === null) return false;
        if (!method) return true;
        const m = obj[method];
        return typeof m === "function" ? !!m.call(obj) : !!m;
      } catch {
        return false;
      }
    };

    const checkDependencies = () => {
      // Event bus
      const busReady =
        typeof bus !== "undefined" &&
        typeof bus.addEventListener === "function" &&
        typeof bus.dispatchEvent === "function";

      // Core storage + theme
      const storageReady =
        typeof storageManager !== "undefined" &&
        ready(storageManager, "isReady");
      const themeReady =
        typeof themeManager !== "undefined" &&
        (typeof themeManager.isReady === "function"
          ? themeManager.isReady()
          : !!themeManager.isReady);

      // Modal should exist before settings so confirms work
      const modalReady =
        typeof modalManager !== "undefined" &&
        (typeof modalManager.show === "function" ||
          typeof modalManager.showDeleteConfirm === "function");

      // Settings loader then settings
      const settingsLoaderReady =
        typeof settingsLoader !== "undefined" &&
        ready(settingsLoader, "isReady");
      const settingsReady =
        typeof settingsManager !== "undefined" &&
        ready(settingsManager, "isReady");

      // Audio + Music (optional but preferred)
      const audioReady =
        typeof audioManager !== "undefined"
          ? audioManager.isInitialized === true ||
            typeof audioManager.play === "function"
          : true;
      const musicReady =
        typeof musicManager !== "undefined"
          ? typeof musicManager.togglePlay === "function" ||
            typeof musicManager.next === "function"
          : true;

      // Statistics (optional)
      const statsReady =
        typeof statisticsManager !== "undefined"
          ? typeof statisticsManager.isReady === "function"
            ? statisticsManager.isReady()
            : true
          : true;

      return {
        busReady,
        storageReady,
        themeReady,
        modalReady,
        settingsLoaderReady,
        settingsReady,
        audioReady,
        musicReady,
        statsReady,
        all:
          busReady &&
          storageReady &&
          themeReady &&
          modalReady &&
          settingsLoaderReady &&
          settingsReady &&
          audioReady &&
          musicReady &&
          statsReady,
      };
    };

    return new Promise((resolve) => {
      const maxWait = 12000; // 12 seconds max
      const startTime = Date.now();
      const warnAt = 4000; // surface intermediate readiness after 4s

      const tick = () => {
        const st = checkDependencies();
        if (st.all) {
          resolve();
          return;
        }
        const elapsed = Date.now() - startTime;
        if (elapsed > maxWait) {
          console.warn(
            "Dependency loading timeout, proceeding anyway with state:",
            st
          );
          resolve();
          return;
        }
        if (elapsed > warnAt && (elapsed - warnAt) % 1000 < 100) {
          // Periodic status log after warning threshold
        }
        setTimeout(tick, 100);
      };

      tick();
    });
  }

  // Removed legacy toolbar wiring helpers (now centralized in CenterBar class)

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Center bar wiring handled by App.CenterBar (class in js/center-bar.js)
    // Add task form
    const addTaskForm = document.getElementById("addTaskForm");
    if (addTaskForm) {
      addTaskForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Microinteraction: add confirmation pop on the submit button
        try {
          const submitBtn = addTaskForm.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.classList.remove("btn--add-confirm"); // allow re-trigger
            void submitBtn.offsetWidth; // reflow
            submitBtn.classList.add("btn--add-confirm");
            setTimeout(
              () => submitBtn && submitBtn.classList.remove("btn--add-confirm"),
              500
            );
          }
        } catch (_) {}

        this.addTask();
      });
    }

    // Filter buttons
    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", (e) => {
        this.setFilter(e.target.dataset.filter);
      });
    });

    // Legacy footer buttons have been removed from the UI
    // These checks are kept for safety but can be removed in future refactoring
    const clearCompletedBtn = document.getElementById("clearCompleted");
    const deleteAllBtn = document.getElementById("deleteAllBtn");
    const testDataBtn = document.getElementById("testDataBtn");

    if (clearCompletedBtn || deleteAllBtn || testDataBtn) {
      console.warn("Legacy footer buttons still present in DOM");
    }

    // CenterActionBar handles Test/Clear/Delete wiring now.

    // Music popover UI and transport are now owned by MusicPlayer (js/music-player.js).
    // The legacy creation and wiring in app.js has been removed to prevent duplication and conflicts.
    // MusicPlayer listens to 'centerbar:music' to toggle the popover near #cabMusic and keeps state synced.

    // Sound button: global mute/unmute for sound effects ONLY (does not affect music play/pause)
    // Ensure there is a visible SFX toggle button in DOM (fallback if theme omitted it)
    // Do NOT create a duplicate sound button; CenterBar is the single source of truth for sound button
    let volumeBtn = document.getElementById("volumeBtn");
    if (volumeBtn) {
      volumeBtn.setAttribute("title", "Mute/Unmute all sounds");
      volumeBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          // Route all toggles through settingsManager (which maps to global mute)
          if (
            typeof settingsManager !== "undefined" &&
            typeof settingsManager.toggleSoundEnabled === "function"
          ) {
            settingsManager.toggleSoundEnabled();
          } else if (
            typeof audioManager !== "undefined" &&
            typeof audioManager.setGlobalMute === "function"
          ) {
            const nextMuted =
              !audioManager.getGlobalMute?.() && audioManager.enabled
                ? true
                : !audioManager.enabled;
            audioManager.setGlobalMute(nextMuted);
            audioManager.setEnabled(!nextMuted);
          }

          // Subtle UI feedback only when output becomes enabled
          if (
            typeof audioManager !== "undefined" &&
            audioManager.enabled &&
            !audioManager.getGlobalMute?.()
          ) {
            audioManager.play("toggle");
          }

          // Icon micro-interaction
          const volumeIcon = document.getElementById("volumeIcon");
          if (volumeIcon) {
            volumeIcon.classList.add("toggling");
            setTimeout(() => volumeIcon.classList.remove("toggling"), 300);
          }
        } catch (e) {
          console.warn("Sound mute toggle failed:", e);
        }
        // Do not emit settingsChanged here; the settings/audio managers emit standardized events.
      });
    }

    // Event delegation for task interactions
    document.addEventListener("change", (e) => {
      // Handle checkbox changes
      if (e.target.matches('.task-checkbox input[type="checkbox"]')) {
        e.preventDefault();
        const taskId = e.target.dataset.taskId;
        if (taskId) {
          this.toggleTask(taskId);
        } else {
        }
      }
    });

    document.addEventListener("click", (e) => {
      const target = e.target;

      // Subtle haptic for general button interactions
      if (target.closest('button,.btn,[role="button"]')) {
        this.vibrate("subtle");
      }

      // Handle clear completed via data-action attribute
      if (target.matches('[data-action="clear"]')) {
        e.preventDefault();
        this.clearCompleted();
      }

      // Handle delete all via data-action attribute
      if (target.matches('[data-action="delete"]')) {
        e.preventDefault();
        this.deleteAll();
      }

      // Handle test data via data-action attribute
      if (target.matches('[data-action="test"]')) {
        e.preventDefault();
        this.addTestData();
      }

      // Handle task edit buttons
      if (target.closest(".task-edit-btn")) {
        e.preventDefault();
        const taskId = target.closest(".task-edit-btn").dataset.taskId;
        if (taskId) {
          this.startEdit(taskId);
        }
      }

      // Handle per-task AI refactor buttons
      if (target.closest(".task-ai-refactor-btn")) {
        e.preventDefault();
        const btnEl = target.closest(".task-ai-refactor-btn");
        const taskId = btnEl && btnEl.dataset.taskId;
        if (taskId) {
          // Mirror the header button provider-based flow for consistency
          (async () => {
            const debugId = Date.now();
            try {
              btnEl.disabled = true;
              btnEl.classList.add("loading");
              // Resolve active task by id
              const todo = this.tasks.find(
                (t) => String(t.id) === String(taskId)
              );
              if (!todo) {
                console.error("[AI] Task not found for refactor", {
                  taskId,
                  debugId,
                });
                return;
              }
              // Feature detect provider
              if (
                !(
                  typeof window !== "undefined" &&
                  window.AIProviders &&
                  typeof window.AIProviders.refactorTodo === "function"
                )
              ) {
                console.error(
                  "[AI] Provider not available for per-task button",
                  {
                    hasWindow: typeof window !== "undefined",
                    hasProviders:
                      typeof window !== "undefined" && !!window.AIProviders,
                    hasRefactor:
                      typeof window !== "undefined" && window.AIProviders
                        ? typeof window.AIProviders.refactorTodo
                        : "undefined",
                    debugId,
                  }
                );
                return;
              }
              // Call provider
              const result = await window.AIProviders.refactorTodo({
                id: todo.id,
                title: todo.text || todo.title || "",
                description: todo.description || "",
                __debugId: debugId,
              });
              // Validate
              const valid =
                result &&
                String(result.id) === String(todo.id) &&
                typeof result.title === "string" &&
                result.title.trim().length > 0 &&
                typeof result.description === "string";

              if (!valid) {
                console.error(
                  "[AI] Invalid AI refactor result from per-task button; unchanged",
                  { result, debugId }
                );
                return;
              }

              // Check if AI returned empty description and preserve original if so
              const aiDescription = result.description.trim();
              const originalDescription = todo.description || "";
              const finalDescription =
                aiDescription.length > 0 ? aiDescription : originalDescription;

              if (
                aiDescription.length === 0 &&
                originalDescription.length > 0
              ) {
              }
              // Use description directly as string with fallback (variables already declared above)
              // Create modified result with fallback description
              const resultWithFallback = {
                ...result,
                description: finalDescription,
              };

              // Process the AI refactor response with all side effects
              await this.processAIRefactorResponse(
                resultWithFallback,
                todo,
                debugId
              );
            } catch (err) {
              console.error("[AI] Per-task refactor failed", err);
            } finally {
              btnEl.classList.remove("loading");
              btnEl.disabled = false;
            }
          })();
        }
      }

      // Handle task delete buttons
      if (target.closest(".task-delete-btn")) {
        e.preventDefault();
        const taskId = target.closest(".task-delete-btn").dataset.taskId;
        if (taskId) {
          this.deleteTask(taskId);
        }
      }

      // Handle task save buttons
      if (target.closest(".task-save")) {
        e.preventDefault();
        const taskId = target.closest(".task-save").dataset.taskId;
        if (taskId) {
          this.saveEdit(taskId);
        }
      }

      // Handle task cancel buttons
      if (target.closest(".task-cancel")) {
        e.preventDefault();
        this.cancelEdit();
      }
    });

    // Event bus listeners
    if (typeof bus !== "undefined") {
      // Center bar events wiring (idempotent)
      try {
        // Settings button is handled by modal-manager.js

        // Open/toggle music UI popover (not playback) — handle via explicit toggle to avoid styles issues
        bus.addEventListener("centerbar:music", () => {
          try {
            const pop = document.getElementById("musicPopover");
            if (!pop) return;
            // Reuse the same positioning/toggle logic as button click
            const btn = document.getElementById("musicBtn");
            if (!btn) return;
            const isOpen =
              pop.classList.contains("open") || pop.style.display === "block";
            if (isOpen) {
              pop.classList.remove("open");
              pop.style.display = "none";
            } else {
              // Position above and center on the button
              const rect = btn.getBoundingClientRect();
              const prect = pop.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const left = Math.max(
                8,
                Math.min(
                  window.innerWidth - prect.width - 8,
                  centerX - prect.width / 2
                )
              );
              const bottom = Math.max(8, window.innerHeight - rect.top + 10);
              pop.style.left = `${left + prect.width / 2}px`;
              pop.style.bottom = `${bottom}px`;
              pop.style.display = "block";
              requestAnimationFrame(() => pop.classList.add("open"));
            }
          } catch (err) {
            console.warn("[bus] centerbar:music failed", err);
          }
        });

        // Add test data
        bus.addEventListener("centerbar:test", () => {
          try {
            if (typeof this.addTestData === "function") {
              this.addTestData();
              return;
            }
            if (
              window.todoApp &&
              typeof window.todoApp.addTestData === "function"
            ) {
              window.todoApp.addTestData();
              return;
            }
            document.querySelector('[data-action="test"]')?.click();
          } catch (err) {
            console.warn("[bus] centerbar:test failed", err);
          }
        });

        // Clear completed
        bus.addEventListener("centerbar:clear", () => {
          try {
            if (typeof this.clearCompleted === "function") {
              this.clearCompleted();
              return;
            }
            if (
              window.todoApp &&
              typeof window.todoApp.clearCompleted === "function"
            ) {
              window.todoApp.clearCompleted();
              return;
            }
            document.querySelector('[data-action="clear"]')?.click();
          } catch (err) {
            console.warn("[bus] centerbar:clear failed", err);
          }
        });

        // Toggle global sound effects (does not affect music transport)
        bus.addEventListener("centerbar:sound", () => {
          try {
            if (
              typeof settingsManager !== "undefined" &&
              typeof settingsManager.toggleSoundEnabled === "function"
            ) {
              settingsManager.toggleSoundEnabled();
            } else if (
              typeof audioManager !== "undefined" &&
              typeof audioManager.setGlobalMute === "function"
            ) {
              const nextMuted =
                !audioManager.getGlobalMute?.() && audioManager.enabled
                  ? true
                  : !audioManager.enabled;
              audioManager.setGlobalMute(nextMuted);
              audioManager.setEnabled(!nextMuted);
            }
            // Subtle feedback when output is enabled
            if (
              typeof audioManager !== "undefined" &&
              audioManager.enabled &&
              !audioManager.getGlobalMute?.()
            ) {
              try {
                audioManager.play("toggle");
              } catch {}
            }
            // Do not emit settingsChanged here; let settings/audio managers emit standardized events.
          } catch (err) {
            console.warn("[bus] centerbar:sound failed", err);
          }
        });

        // Delete all
        bus.addEventListener("centerbar:delete", () => {
          try {
            if (typeof this.deleteAll === "function") {
              this.deleteAll();
              return;
            }
            if (
              window.todoApp &&
              typeof window.todoApp.deleteAll === "function"
            ) {
              window.todoApp.deleteAll();
              return;
            }
            document.querySelector('[data-action="delete"]')?.click();
          } catch (err) {
            console.warn("[bus] centerbar:delete failed", err);
          }
        });
      } catch (err) {
        console.warn("[bus] centerbar wiring failed", err);
      }

      bus.addEventListener("tasksUpdated", () => this.render());
      bus.addEventListener("settingsChanged", (e) => {
        const detail = e && e.detail ? e.detail : {};
        // prefer globalMute if present
        const isEnabled =
          typeof detail.globalMute === "boolean"
            ? !detail.globalMute
            : typeof detail.soundEnabled === "boolean"
              ? detail.soundEnabled
              : !!(settingsManager && settingsManager.soundEnabled);
        // keep the volume button visuals in sync
        this.updateVolumeButtonState(isEnabled);
        this.render();
      });

      // Keep music button state in sync with actual playback
      const syncMusicBtn = (playing) => {
        const btn = document.getElementById("volumeBtn");
        if (!btn) return;
        btn.classList.toggle("is-playing", !!playing);
        btn.classList.toggle("is-paused", !playing);
      };
      bus.addEventListener("music:started", () => syncMusicBtn(true));
      bus.addEventListener("music:playing", () => syncMusicBtn(true));
      bus.addEventListener("music:paused", () => syncMusicBtn(false));
      bus.addEventListener("music:silenceStart", () => syncMusicBtn(false));
      bus.addEventListener("music:buffering", (e) => {
        const btn = document.getElementById("volumeBtn");
        if (!btn) return;
        btn.classList.toggle("buffering", !!(e.detail && e.detail.buffering));
      });
      bus.addEventListener("music:hintStart", () => {
        const btn = document.getElementById("volumeBtn");
        if (!btn) return;
        btn.classList.add("hint");
        setTimeout(() => btn.classList.remove("hint"), 3000);
      });
    }

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // If user is typing inside an input/textarea/contenteditable, allow native shortcuts (like Cmd/Ctrl+A) to work
      const target = e.target;
      const isEditable =
        (target &&
          (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) ||
        (target && target.isContentEditable);

      if (isEditable) {
        // Make sure we never block select-all inside editable fields
        if ((e.ctrlKey || e.metaKey) && (e.key === "a" || e.key === "A")) {
          // Let the browser perform the native select all behavior
          return;
        }
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "n":
          case "N":
            e.preventDefault();
            document.getElementById("newTaskInput")?.focus();
            break;
          case "a":
          case "A":
            // Only override select-all when NOT focused on an editable element
            if (!isEditable) {
              e.preventDefault();
              this.setFilter("all");
            }
            break;
          case "Enter":
            if (this.editingTaskId) {
              e.preventDefault();
              // Only handle Enter here if we're not in the edit field itself
              // The edit field will handle its own Enter key via the dedicated listeners
              if (
                !isEditable ||
                (e.target.tagName !== "INPUT" &&
                  e.target.tagName !== "TEXTAREA")
              ) {
                this.saveEdit(this.editingTaskId);
              } else {
              }
            }
            break;
          case "Escape":
            if (this.editingTaskId) {
              e.preventDefault();
              this.cancelEdit();
            }
            break;
        }
      }
    });

    // Character counters
    this.setupCharacterCounters();

    // AI refactor button listeners
    this.setupAIRefactorListeners();
  }

  /**
   * Load tasks from storage
   */
  loadTasks() {
    const oldTaskCount = this.tasks.length;

    // Normalize any legacy/invalid shapes on load to ensure description is a string
    const raw = storageManager.getTasks();
    try {
      // Prefer global validator if present (defined in js/validation.js)
      if (
        typeof window !== "undefined" &&
        typeof window.validateTasks === "function"
      ) {
        this.tasks = window
          .validateTasks(raw)
          .map((t) => {
            // Keep internal fields the app uses for rendering/state by remapping:
            // - title -> text
            // Note: We intentionally keep other metadata untouched where present.
            return {
              id: t.id,
              text: t.title,
              description: t.description,
              completed: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              // Preserve any legacy fields if raw has them (completed/createdAt/updatedAt), but ensure description is string
              ...(Array.isArray(raw) ? {} : {}),
            };
          })
          .map((t, idx) => {
            // If raw has corresponding item, merge safe fields from it
            const r = Array.isArray(raw) ? raw[idx] : null;
            if (r && typeof r === "object") {
              return {
                ...t,
                completed: !!r.completed,
                createdAt: r.createdAt || t.createdAt,
                updatedAt: r.updatedAt || t.updatedAt,
              };
            }
            return t;
          });
      } else {
        // Fallback: minimal coercion without helper
        this.tasks = Array.isArray(raw)
          ? raw.map((r, index) => {
              const title =
                typeof r.title === "string"
                  ? r.title
                  : typeof r.text === "string"
                    ? r.text
                    : String(r.title ?? r.text ?? "");
              let desc = r && r.description != null ? r.description : "";
              if (typeof desc !== "string") {
                try {
                  desc = String(desc);
                } catch {
                  desc = "";
                }
              }
              const task = {
                id: r.id,
                text: String(title).trim(),
                description: String(desc).trim(),
                completed: !!r.completed,
                createdAt: r.createdAt || new Date().toISOString(),
                updatedAt: r.updatedAt || new Date().toISOString(),
                isDirty: false, // Initialize tasks as not dirty when loaded
              };
              return task;
            })
          : [];
      }
    } catch (e) {
      console.warn("Task normalization on load failed; using raw tasks", e);
      this.tasks = Array.isArray(raw) ? raw : [];
    }
    const newTaskCount = this.tasks.length;

    // Mark as dirty if task count changed during load
    if (oldTaskCount !== newTaskCount) {
      this.markDirty("load");
    }

    // Initialize button states for all loaded tasks - but only if DOM is ready
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      this.tasks.forEach((task) => {
        this.updateTaskButtonStates(task.id, task.completed);

        // Ensure delete button is always enabled for all loaded tasks
        const taskElement = document.querySelector(
          `[data-task-id="${task.id}"]`
        );
        if (taskElement) {
          const deleteBtn = taskElement.querySelector(".task-delete-btn");
          if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.removeAttribute("disabled");
            deleteBtn.classList.remove("disabled");
          }
        }
      });
    } else {
      // If DOM isn't ready, defer button state updates until render
    }
  }

  /**
   * Save tasks to storage
   */
  saveTasks() {
    this.markDirty("save");

    // Debug: Log storage manager methods
    console.log("[DEBUG] storageManager methods:", {
      exists: typeof storageManager !== "undefined",
      saveTasks: typeof storageManager.saveTasks === "function",
      setTasks: typeof storageManager.setTasks === "function",
    });

    // Actually save to storage
    if (
      typeof storageManager !== "undefined" &&
      typeof storageManager.setTasks === "function"
    ) {
      try {
        const result = storageManager.setTasks(this.tasks);
        if (!result) {
          console.error("[DEBUG] Failed to save tasks to storage");
        } else {
        }
      } catch (error) {
        console.error("[DEBUG] Error saving tasks:", error);
      }
    } else if (
      typeof storageManager !== "undefined" &&
      typeof storageManager.saveTasks === "function"
    ) {
      try {
        const result = storageManager.saveTasks(this.tasks);
        if (!result) {
          console.error(
            "[DEBUG] Failed to save tasks to storage (legacy method)"
          );
        } else {
        }
      } catch (error) {
        console.error("[DEBUG] Error saving tasks (legacy method):", error);
      }
    } else {
      console.error(
        "[DEBUG] storageManager or save/setTasks method not available"
      );
    }

    // Dispatch tasksUpdated event to notify other components
    if (typeof bus !== "undefined") {
      bus.dispatchEvent(new CustomEvent("tasksUpdated"));
    }

    // Schedule auto-save for any dirty tasks
    this.scheduleAutoSave();
  }

  /**
   * Mark the task list as dirty and trigger re-render
   * @param {string} source - Source of the change for debugging
   */
  markDirty(source = "unknown") {
    this.isDirty = true;
    this.scheduleRender();
  }

  /**
   * Schedule a debounced re-render
   */
  scheduleRender() {
    // Clear existing timeout
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout);
    }

    // Schedule new render with debounce
    this.renderTimeout = setTimeout(() => {
      this.forceRender();
    }, this.CONFIG.debounceDelay);
  }

  /**
   * Force a re-render of the task list
   */
  forceRender() {
    if (typeof this.render === "function") {
      this.render();
    } else {
      console.error("forceRender: render method is not a function");
    }
  }

  /**
   * Auto-save dirty tasks
   */
  autoSave() {
    // Clear existing auto-save timeout
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    // Find dirty tasks
    const dirtyTasks = this.tasks.filter((task) => task.isDirty);

    if (dirtyTasks.length > 0) {
      // Actually save to storage
      if (
        typeof storageManager !== "undefined" &&
        typeof storageManager.saveTasks === "function"
      ) {
        storageManager.saveTasks(this.tasks);
      }

      // Reset dirty flags after save
      dirtyTasks.forEach((task) => {
        task.isDirty = false;
      });

      // Dispatch event to notify UI of auto-save
      if (typeof bus !== "undefined") {
        bus.dispatchEvent(new CustomEvent("autoSaved"));
      }
    } else {
    }
  }

  /**
   * Schedule auto-save of dirty tasks
   */
  scheduleAutoSave() {
    // Clear existing timeout
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    // Schedule auto-save after delay
    this.autoSaveTimeout = setTimeout(() => {
      this.autoSave();
    }, this.CONFIG.autoSaveDelay);
  }

  /**
   * Attempt a subtle haptic vibration if supported
   * Uses minimal, premium patterns and respects user/device support.
   * @param {('subtle'|'add'|'complete'|'delete')} kind
   */
  vibrate(kind = "subtle") {
    try {
      if (!("vibrate" in navigator)) return;
      // Avoid overly aggressive patterns; keep it zen
      const patterns = {
        subtle: [15],
        add: [50],
        complete: [30, 50, 30],
        delete: [100],
      };
      const pattern = patterns[kind] || patterns.subtle;
      navigator.vibrate(pattern);
    } catch (_) {
      // no-op
    }
  }

  /**
   * Add a new task
   */
  addTask() {
    const input = document.getElementById("newTaskInput");
    const descriptionInput = document.getElementById("newTaskDescription");

    if (!input) return;

    const text = input.value.trim();
    const description = descriptionInput ? descriptionInput.value.trim() : "";

    if (!text) return;

    // Validate lengths
    if (text.length > this.CONFIG.maxTitleLength) {
      this.showValidationError(
        `Task title too long! Maximum ${this.CONFIG.maxTitleLength} characters.`
      );
      return;
    }

    if (description.length > this.CONFIG.maxDescriptionLength) {
      this.showValidationError(
        `Description too long! Maximum ${this.CONFIG.maxDescriptionLength} characters.`
      );
      return;
    }

    // Create raw task and normalize to ensure description is a string
    let task = {
      id: Date.now().toString(),
      title: text,
      description: description,
    };
    try {
      if (
        typeof window !== "undefined" &&
        typeof window.validateTask === "function"
      ) {
        const normalized = window.validateTask(task); // { id, title, description }
        // Remap to internal shape used by app.js renderer/state
        task = {
          id: normalized.id,
          text: normalized.title,
          description: normalized.description,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDirty: false, // Initialize new tasks as not dirty
        };
      } else {
        // Fallback coercion
        task = {
          id: task.id,
          text: String(task.title || "").trim(),
          description: String(task.description || "").trim(),
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDirty: false, // Initialize new tasks as not dirty
        };
      }
    } catch {
      // On any error, fallback to safe strings
      task = {
        id: String(Date.now()),
        text: String(text || "").trim(),
        description: String(description || "").trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDirty: false, // Initialize new tasks as not dirty
      };
    }

    this.tasks.unshift(task);
    this.saveTasks();

    input.value = "";

    // Play sound
    if (typeof audioManager !== "undefined") {
      audioManager.play("add");
    }
    // Haptic: add task confirmation
    this.vibrate("add");

    // Update gamification
    if (typeof gamificationManager !== "undefined") {
      gamificationManager.addTask();
    }

    // Add animation class to the newly added task
    setTimeout(() => {
      const newTaskElement = document.querySelector(
        `[data-task-id="${task.id}"]`
      );
      if (newTaskElement) {
        newTaskElement.classList.add("new");
      }
    }, 10);
  }

  /**
   * Toggle task completion
   */
  toggleTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      console.warn(`Task with ID ${id} not found`);
      return;
    }

    const wasCompleted = task.completed;
    task.completed = !task.completed;
    task.updatedAt = new Date().toISOString();

    // Update button states immediately - but only if DOM is ready
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      this.updateTaskButtonStates(id, task.completed);
    } else {
    }

    this.saveTasks();

    // Play sound
    if (typeof audioManager !== "undefined") {
      audioManager.play(task.completed ? "complete" : "edit");
    }
    // Haptic: completion gets a gentle triplet
    if (task.completed) this.vibrate("complete");

    // Update gamification
    if (typeof gamificationManager !== "undefined") {
      if (task.completed) {
        gamificationManager.completeTask();
      }
    }
  }

  /**
   * Update button states for a task based on completion status
   * @param {string} taskId - The ID of the task
   * @param {boolean} isCompleted - Whether the task is completed
   */
  updateTaskButtonStates(taskId, isCompleted) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!taskElement) {
      return;
    }

    const editBtn = taskElement.querySelector(".task-edit-btn");
    const aiBtn = taskElement.querySelector(".task-ai-refactor-btn");

    // Check if buttons already have the correct state to avoid unnecessary updates
    const editBtnNeedsUpdate =
      (editBtn && isCompleted && !editBtn.disabled) ||
      (!isCompleted && editBtn.disabled);
    const aiBtnNeedsUpdate =
      (aiBtn && isCompleted && !aiBtn.disabled) ||
      (!isCompleted && aiBtn.disabled);

    if (editBtnNeedsUpdate || aiBtnNeedsUpdate) {
      if (isCompleted) {
        // Disable buttons when task is completed
        if (editBtn) {
          editBtn.disabled = true;
          editBtn.classList.add("disabled");
        }
        if (aiBtn) {
          aiBtn.disabled = true;
          aiBtn.classList.add("disabled");
        }
        taskElement.classList.add("task-completed");
      } else {
        // Enable buttons when task is reopened
        if (editBtn) {
          editBtn.disabled = false;
          editBtn.classList.remove("disabled");
        }
        if (aiBtn) {
          aiBtn.disabled = false;
          aiBtn.classList.remove("disabled");
        }
        taskElement.classList.remove("task-completed");
      }
    } else {
    }

    // Ensure delete button is always enabled regardless of task state
    const deleteBtn = taskElement.querySelector(".task-delete-btn");
    if (deleteBtn) {
      deleteBtn.disabled = false;
      deleteBtn.removeAttribute("disabled");
      deleteBtn.classList.remove("disabled");

      // Force re-render of delete button
      deleteBtn.style.display = "inline-flex";
      deleteBtn.style.opacity = "1";
      deleteBtn.style.pointerEvents = "auto";
      deleteBtn.style.cursor = "pointer";
    }

    // Log final state
  }

  /**
   * Delete a task
   */
  async deleteTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;

    const confirmed = await modalManager.showDeleteConfirm(task.text);

    if (!confirmed) return;

    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.saveTasks();
    // Haptic: a single longer pulse for delete
    this.vibrate("delete");

    // Update gamification
    if (typeof gamificationManager !== "undefined") {
      gamificationManager.deleteTask();
    }
  }

  /**
   * Start editing a task
   */
  startEdit(id) {
    this.editingTaskId = id;

    // Add animation class to the task item
    const taskElement = document.querySelector(`[data-task-id="${id}"]`);
    if (taskElement) {
      taskElement.classList.add("edit-mode");
      taskElement.classList.remove("exit-edit-mode");
    }

    this.forceRender();

    const input = document.querySelector(`[data-edit-input="${id}"]`);
    if (input) {
      // Focus and select with a small delay to ensure the DOM is ready
      setTimeout(() => {
        input.focus();
        input.select();
      }, 100);
    }

    // Add keydown event listener for Enter key
    this.setupEditKeydownListeners(id);
  }

  /**
   * Save edited task
   */
  saveEdit(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      console.error(`[DEBUG] Task ${id} not found in saveEdit`);
      return;
    }

    const input = document.querySelector(`[data-edit-input="${id}"]`);
    const descriptionInput = document.querySelector(`[data-edit-desc="${id}"]`);
    if (!input) {
      console.error(`[DEBUG] Input element not found for task ${id}`);
      return;
    }

    const newText = String(input.value || "").trim();
    const newDescription = descriptionInput
      ? String(descriptionInput.value || "").trim()
      : "";

    if (!newText) {
      this.deleteTask(id);
      return;
    }

    if (newText.length > this.CONFIG.maxTitleLength) {
      alert(
        `Task title too long! Maximum ${this.CONFIG.maxTitleLength} characters.`
      );
      return;
    }

    if (newDescription.length > this.CONFIG.maxDescriptionLength) {
      alert(
        `Description too long! Maximum ${this.CONFIG.maxDescriptionLength} characters.`
      );
      return;
    }

    // Normalize via helper to ensure description remains a string and drop extras
    try {
      const normalized =
        typeof window !== "undefined" &&
        typeof window.validateTask === "function"
          ? window.validateTask({
              id: task.id,
              title: newText,
              description: newDescription,
            })
          : {
              id: task.id,
              title: newText,
              description: String(newDescription || ""),
            };

      task.text = String(normalized.title || "").trim();
      task.description = String(normalized.description || "").trim();
    } catch {
      task.text = newText;
      task.description = String(newDescription || "").trim();
    }
    task.updatedAt = new Date().toISOString();
    task.isDirty = true; // Mark task as dirty after manual edit

    // Clean up keydown event listeners
    this.cleanupEditKeydownListeners(id);

    // Add exit animation class to the task item
    const taskElement = document.querySelector(`[data-task-id="${id}"]`);
    if (taskElement) {
      taskElement.classList.add("exit-edit-mode");
      taskElement.classList.remove("edit-mode");
    }

    // Find and animate the save button
    const saveButton = document.querySelector(
      `.task-save[data-task-id="${id}"]`
    );
    if (saveButton) {
      saveButton.classList.add("success");

      // Remove the success class after the animation completes
      setTimeout(() => {
        saveButton.classList.remove("success");
      }, 600);
    }

    // Wait for the animation to complete before clearing the editing state
    setTimeout(() => {
      this.editingTaskId = null;
      this.saveTasks();

      // Play sound
      if (typeof audioManager !== "undefined") {
        audioManager.play("edit");
      }
      // Haptic: subtle feedback on save
      this.vibrate("subtle");

      // Update gamification
      if (typeof gamificationManager !== "undefined") {
        gamificationManager.editTask();
      }
    }, this.CONFIG.animationDuration);
  }

  /**
   * Cancel editing
   */
  cancelEdit() {
    // Clean up keydown event listeners
    if (this.editingTaskId) {
      this.cleanupEditKeydownListeners(this.editingTaskId);
    }

    // Add exit animation class to the task item
    const taskElement = document.querySelector(
      `[data-task-id="${this.editingTaskId}"]`
    );
    if (taskElement) {
      taskElement.classList.add("exit-edit-mode");
      taskElement.classList.remove("edit-mode");
    }

    // Wait for the animation to complete before clearing the editing state
    setTimeout(() => {
      this.editingTaskId = null;
      this.forceRender();
      // Haptic: subtle feedback on cancel
      this.vibrate("subtle");
    }, this.CONFIG.animationDuration);
  }

  /**
   * Setup keydown event listeners for edit fields
   * @param {string} taskId - The ID of the task being edited
   */
  setupEditKeydownListeners(taskId) {
    const input = document.querySelector(`[data-edit-input="${taskId}"]`);
    const textarea = document.querySelector(`[data-edit-desc="${taskId}"]`);

    const handleKeydown = (e) => {
      // Prevent Enter key from creating new lines in textarea
      if (e.target === textarea && e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.saveEdit(taskId);
      }
      // Handle Enter key in input field
      else if (e.target === input && e.key === "Enter") {
        e.preventDefault();
        this.saveEdit(taskId);
      }
      // Handle Escape key to cancel editing
      else if (e.key === "Escape") {
        e.preventDefault();
        this.cancelEdit();
      }
    };

    if (input) {
      input.addEventListener("keydown", handleKeydown);
    }
    if (textarea) {
      textarea.addEventListener("keydown", handleKeydown);
    }

    // Store the listeners for cleanup
    this.editKeydownListeners = this.editKeydownListeners || {};
    this.editKeydownListeners[taskId] = { input, textarea, handleKeydown };
  }

  /**
   * Cleanup keydown event listeners for edit fields
   * @param {string} taskId - The ID of the task being edited
   */
  cleanupEditKeydownListeners(taskId) {
    if (this.editKeydownListeners && this.editKeydownListeners[taskId]) {
      const { input, textarea, handleKeydown } =
        this.editKeydownListeners[taskId];

      if (input) {
        input.removeEventListener("keydown", handleKeydown);
      }
      if (textarea) {
        textarea.removeEventListener("keydown", handleKeydown);
      }
      delete this.editKeydownListeners[taskId];
    }
  }

  /**
   * Set filter
   */
  setFilter(filter) {
    this.currentFilter = filter;

    // Update active state
    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.classList.toggle("active", button.dataset.filter === filter);
    });

    // Play sound
    if (typeof audioManager !== "undefined") {
      audioManager.play("settings");
    }
    // Haptic: subtle cue when switching filters
    this.vibrate("subtle");

    this.forceRender();
  }

  /**
   * Clear completed tasks
   */
  async clearCompleted() {
    const completedCount = this.tasks.filter((t) => t.completed).length;
    if (completedCount === 0) return;

    const confirmed = await modalManager.show({
      title: "Confirm Deletion",
      message: `Are you sure you want to clear ${completedCount} completed task${
        completedCount !== 1 ? "s" : ""
      }? This cannot be undone.`,
      confirmText: "Clear",
      cancelText: "Cancel",
      confirmStyle: "danger",
    });

    if (!confirmed) return;

    this.tasks = this.tasks.filter((t) => !t.completed);
    this.saveTasks();
  }

  /**
   * Delete all tasks
   */
  async deleteAll() {
    if (this.tasks.length === 0) return;

    const confirmed = await modalManager.show({
      title: "Confirm Deletion",
      message: `Are you sure you want to delete all ${this.tasks.length} task${
        this.tasks.length !== 1 ? "s" : ""
      }? This cannot be undone.`,
      confirmText: "Delete All",
      cancelText: "Cancel",
      confirmStyle: "danger",
    });

    if (!confirmed) return;

    this.tasks = [];
    this.saveTasks();

    // Update gamification via event-driven approach
    if (typeof bus !== "undefined") {
      bus.dispatchEvent(new CustomEvent("resetToDefaults"));
    }
  }

  /**
   * Get filtered tasks
   */
  getFilteredTasks() {
    switch (this.currentFilter) {
      case "active":
        return this.tasks.filter((t) => !t.completed);
      case "completed":
        return this.tasks.filter((t) => t.completed);
      default:
        return this.tasks;
    }
  }

  /**
   * Render the todo list
   */
  render() {
    const taskList = document.getElementById("taskList");
    const emptyState = document.getElementById("emptyState");

    if (!taskList || !emptyState) {
      return;
    }

    const filteredTasks = this.getFilteredTasks();

    // Legacy task count element no longer present
    // Statistics are now handled by the header-stats component

    // Show/hide empty state
    if (filteredTasks.length === 0) {
      emptyState.style.display = "block";
      taskList.innerHTML = "";
      return;
    }

    emptyState.style.display = "none";

    // Render tasks
    const renderedHTML = filteredTasks
      .map((task) => this.renderTask(task))
      .join("");

    taskList.innerHTML = renderedHTML;

    // Setup task event listeners
    this.setupTaskEventListeners();

    // Hydrate Lucide icons for dynamically rendered task buttons
    try {
      if (window.lucide && typeof lucide.createIcons === "function") {
        lucide.createIcons();
      }
    } catch (_) {}

    // Update button states for all rendered tasks to ensure proper disabled/enabled state
    filteredTasks.forEach((task) => {
      this.updateTaskButtonStates(task.id, task.completed);

      // Ensure delete button is always enabled for all tasks
      const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
      if (taskElement) {
        const deleteBtn = taskElement.querySelector(".task-delete-btn");
        if (deleteBtn) {
          deleteBtn.disabled = false;
          deleteBtn.removeAttribute("disabled");
          deleteBtn.classList.remove("disabled");
        }
      }
    });
  }

  /**
   * Render individual task
   */
  renderTask(task) {
    const isEditing = this.editingTaskId === task.id;

    return `
      <div class="task-item ${task.completed ? "completed" : ""} ${isEditing ? "edit-mode" : ""} ${task.isDirty ? "dirty" : ""}" data-task-id="${task.id}">
        <div class="task-content">
          <label class="task-checkbox luxury-checkbox" data-task-id="${task.id}">
            <input type="checkbox" ${task.completed ? "checked" : ""}
                   data-task-id="${task.id}">
            <span class="checkmark"></span>
          </label>
          
          <div class="task-text-content">
            ${
              isEditing
                ? `
              <div class="task-edit">
                <div class="edit-input-group">
                  <div class="ai-refactor-container">
                    <input type="text"
                           class="task-edit-input luxury-input"
                           data-edit-input="${task.id}"
                           value="${this.escapeHtml(task.text)}"
                           maxlength="${this.CONFIG.maxTitleLength}"
                           placeholder="Task title">
                  </div>
                  <div class="char-counter">
                    <span class="char-count">${task.text.length}/${this.CONFIG.maxTitleLength}</span>
                  </div>
                </div>
                <div class="edit-input-group">
                  <div class="ai-refactor-container">
                    <textarea class="task-edit-description luxury-textarea"
                              data-edit-desc="${task.id}"
                              maxlength="500"
                              placeholder="Task description (optional)"
                              rows="2">${this.escapeHtml(task.description)}</textarea>
                  </div>
                  <div class="char-counter">
                    <span class="desc-count">${task.description.length}/500</span>
                  </div>
                </div>
                <div class="edit-actions">
                  <button class="task-save btn btn--primary" data-task-id="${task.id}">Save</button>
                  <button class="task-cancel btn btn--ghost" data-task-id="${task.id}">Cancel</button>
                </div>
              </div>
            `
                : `
              <div class="task-display" data-task-id="${task.id}">
                <div class="task-title">${this.escapeHtml(task.text)}</div>
                ${
                  task.description
                    ? `
                  <div class="task-description">${this.escapeHtml(task.description)}</div>
                `
                    : ""
                }
              </div>
            `
            }
          </div>
          
          <div class="task-actions">
            <button class="task-edit-btn" data-task-id="${task.id}" title="Edit">
              <i data-lucide="pencil" class="lucide-icon" aria-hidden="true"></i>
            </button>
            
            <button class="task-ai-refactor-btn" data-task-id="${task.id}" title="Refactor with AI">
              <i data-lucide="wand-2" class="lucide-icon" aria-hidden="true"></i>
            </button>
            
            <button class="task-delete-btn" data-task-id="${task.id}" title="Delete">
              <i data-lucide="trash-2" class="lucide-icon" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Setup task event listeners
   */
  setupTaskEventListeners() {
    // Task hover effects
    document.querySelectorAll(".task-item").forEach((taskEl) => {
      taskEl.addEventListener("mouseenter", () => {
        taskEl.classList.add("hover");
      });

      taskEl.addEventListener("mouseleave", () => {
        taskEl.classList.remove("hover");
      });
    });
  }

  /**
   * Setup AI refactor button listeners
   * Wire global "#task-ai-refactor-btn" to refactor the currently active/selected task via generic AIProviders.
   */
  setupAIRefactorListeners() {
    // DOM presence check for the header button
    try {
      const exists = !!document.getElementById("task-ai-refactor-btn");
    } catch (_) {}

    // Determine active/selected task: prefer currently editing, else first visible, else first in filtered list.
    var getActiveTodo = () => {
      const debugPick = {};
      if (this.editingTaskId) {
        var t = this.tasks.find((x) => x.id === this.editingTaskId);
        if (t) {
          debugPick.by = "editingTaskId";
          debugPick.id = t.id;
          return t;
        }
      }
      var el =
        document.querySelector(".task-item.edit-mode") ||
        document.querySelector(".task-item.hover") ||
        document.querySelector(".task-item");
      var id = el && el.getAttribute("data-task-id");
      if (id) {
        var tt = this.tasks.find((x) => String(x.id) === String(id));
        if (tt) {
          debugPick.by = "domSelection";
          debugPick.id = tt.id;
          return tt;
        }
      }
      var list = this.getFilteredTasks();
      const chosen = list && list.length ? list[0] : null;
      if (chosen) {
        debugPick.by = "filteredHead";
        debugPick.id = chosen.id;
      }
      return chosen;
    };

    var btn = document.getElementById("task-ai-refactor-btn");
    // Introspect the current onclick handler if any
    try {
      const onclickText =
        btn && btn.onclick
          ? btn.onclick.toString()
          : "onclick not set, using addEventListener";
    } catch (_) {}

    if (!btn) {
      console.warn(
        "[AI] Refactor button #task-ai-refactor-btn not found in DOM at listener setup"
      );
      return;
    }
    // Diagnostic: check computed pointer-events and visibility to detect overlay or CSS blocking clicks
    try {
      const cs = window.getComputedStyle(btn);
    } catch (_) {}
    // Capture-phase diagnostic to detect if clicks reach the element at all
    btn.addEventListener(
      "click",
      (ev) => {
        try {
        } catch (_) {}
      },
      true
    );
    btn.onclick = null;
    btn.addEventListener("click", async (e) => {
      console.time("RefactorFlow");
      e.preventDefault();
      const debugId = Date.now();

      // Feature detection logs (direct provider usage)
      const hasWindow = typeof window !== "undefined";
      const hasProviders = hasWindow && !!window.AIProviders;
      const hasRefactor =
        hasProviders && typeof window.AIProviders.refactorTodo === "function";

      try {
        // Wrap entire flow to capture crashes
        try {
          var todo = getActiveTodo();
          if (!todo) {
            console.error("[AI] No active todo to refactor");
            console.timeEnd("RefactorFlow");
            return;
          }

          // Log the outgoing payload shape/lengths
          const outTitle = todo.text || todo.title || "";
          const outDesc = todo.description || "";

          var prevLabel = btn.innerText;
          btn.disabled = true;
          btn.innerText = "Refactoring…";

          if (
            !(
              typeof window !== "undefined" &&
              window.AIProviders &&
              typeof window.AIProviders.refactorTodo === "function"
            )
          ) {
            console.error("[AI] Provider not available - aborting refactor", {
              hasWindow: typeof window !== "undefined",
              hasProviders:
                typeof window !== "undefined" && !!window.AIProviders,
              hasRefactor:
                typeof window !== "undefined" && window.AIProviders
                  ? typeof window.AIProviders.refactorTodo
                  : "undefined",
              debugId,
            });
            console.timeEnd("RefactorFlow");
            return;
          }
          var result = await window.AIProviders.refactorTodo({
            id: todo.id,
            title: outTitle,
            description: outDesc,
            __debugId: debugId, // transient debug flow id
          });

          var valid =
            result &&
            String(result.id) === String(todo.id) &&
            typeof result.title === "string" &&
            result.title.trim().length > 0 &&
            typeof result.description === "string";

          if (!valid) {
            console.error(
              "[AI] Invalid AI refactor result; leaving todo unchanged",
              { result, debugId }
            );
            console.timeEnd("RefactorFlow");
            return;
          }

          // Check if AI returned empty description and preserve original if so
          const aiDescription = result.description.trim();
          const originalDescription = todo.description || "";
          const finalDescription =
            aiDescription.length > 0 ? aiDescription : originalDescription;

          if (aiDescription.length === 0 && originalDescription.length > 0) {
          }

          var target = this.tasks.find((t) => String(t.id) === String(todo.id));
          if (!target) {
            console.error("[AI] Active todo disappeared before update", {
              debugId,
            });
            console.timeEnd("RefactorFlow");
            return;
          }

          // Use description directly as string with fallback (variables already declared above)
          const normalized =
            typeof window !== "undefined" &&
            typeof window.validateTask === "function"
              ? window.validateTask({
                  id: target.id,
                  title: result.title,
                  description: finalDescription,
                })
              : {
                  id: target.id,
                  title: String(result.title || ""),
                  description: String(finalDescription || ""),
                };

          // Create a new object reference to ensure re-render
          const updatedTask = {
            ...target,
            text: String(normalized.title || "").trim(),
            description: String(normalized.description || "").trim(),
            updatedAt: new Date().toISOString(),
          };

          // Replace the task in the array
          const taskIndex = this.tasks.findIndex(
            (t) => String(t.id) === String(target.id)
          );
          if (taskIndex !== -1) {
            this.tasks[taskIndex] = updatedTask;
          }

          // Process the AI refactor response with all side effects
        } catch (e) {
          console.error("[CRITICAL] Handler crash:", e);
        }
      } finally {
        btn.disabled = false;
        btn.innerText = prevLabel || "Refactor with AI";
      }
    });
  }

  /**
   * Refactor task text with AI
   */
  async refactorWithAI(taskId, type, button) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Show charging effect
    button.classList.add("charging");

    // Show loading state
    button.classList.add("loading");
    button.disabled = true;

    try {
      // Get the current text
      const currentText =
        type === "title"
          ? String(task.text || "")
          : String(task.description || "");

      // Use the refactorTextWithAI method which can be customized for different AI providers
      const refactoredText = String(
        (await this.refactorTextWithAI(currentText)) || ""
      );

      // Update the task with the refactored text
      if (type === "title") {
        task.text = String(refactoredText || "").trim();
      } else {
        task.description = String(refactoredText || "").trim();
      }

      task.updatedAt = new Date().toISOString();

      // Save and re-render
      this.saveTasks();
      this.forceRender();

      // Show success effect
      button.classList.remove("loading", "charging");
      button.classList.add("success");

      // Focus on the updated field
      setTimeout(() => {
        const input = document.querySelector(`[data-edit-input="${taskId}"]`);
        const textarea = document.querySelector(`[data-edit-desc="${taskId}"]`);

        if (type === "title" && input) {
          input.focus();
          input.select();
        } else if (type === "description" && textarea) {
          textarea.focus();
          textarea.select();
        }

        // Remove success effect after animation
        setTimeout(() => {
          button.classList.remove("success");
        }, 600);
      }, 100);
    } catch (error) {
      console.error("AI refactor error:", error);
      alert("Failed to refactor text with AI. Please try again later.");
    } finally {
      // Remove loading and charging states
      button.classList.remove("loading", "charging");
      button.disabled = false;
    }
  }

  /**
   * Refactor entire task with AI
   */
  async refactorEntireTaskWithAI(taskId, button) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Show loading state
    button.classList.add("loading");
    button.disabled = true;

    try {
      // Combine title and description for AI processing
      const fullText = `${String(task.text || "")}\n${String(task.description || "")}`;

      // Use the refactorTextWithAI method
      const refactoredText = await this.refactorTextWithAI(fullText, "full");

      // Split the refactored text back into title and description
      // Try to find a natural break point
      const lines = refactoredText.split("\n").filter((line) => line.trim());

      if (lines.length > 1) {
        // If there are multiple lines, use the first as title and the rest as description
        task.text = String(lines[0] || "").trim();
        task.description = String(lines.slice(1).join("\n") || "").trim();
      } else {
        // If only one line, use it as title and leave description empty
        task.text = String(lines[0] || "").trim();
        task.description = "";
      }

      task.updatedAt = new Date().toISOString();

      // Save and re-render
      this.saveTasks();
      this.forceRender();

      // Focus on the title field
      setTimeout(() => {
        const input = document.querySelector(`[data-edit-input="${taskId}"]`);
        if (input) {
          input.focus();
          input.select();
        }
      }, 100);
    } catch (error) {
      console.error("AI refactor error:", error);
      alert("Failed to refactor task with AI. Please try again later.");
    } finally {
      // Remove loading state
      button.classList.remove("loading");
      button.disabled = false;
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Lucide Broom Icon SVG
   */
  LUCIDE_BROOM_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-broom-icon lucide-broom"><path d="m13 11 9-9"/><path d="M14.6 12.6c.8.8.9 2.1.2 3L10 22l-8-8 6.4-4.8c.9-.7 2.2-.6 3 .2Z"/><path d="m6.8 10.4 6.8 6.8"/><path d="m5 17 1.4-1.4"/></svg>`;

  /**
   * Get task statistics
   */
  getStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.completed).length;
    const active = total - completed;

    return {
      total,
      completed,
      active,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  /**
   * Show validation error
   */
  showValidationError(message) {
    // Create elegant error notification
    const errorDiv = document.createElement("div");
    errorDiv.className = "validation-error";
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 71, 87, 0.9);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease;
      backdrop-filter: blur(10px);
      font-size: 0.9rem;
    `;
    errorDiv.textContent = message;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }

  /**
   * Add test data with lorem ipsum tasks
   */
  addTestData() {
    const loremTasks = [
      {
        text: "Lorem ipsum dolor sit amet consectetur",
        description:
          "Adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
      {
        text: "Ut enim ad minim veniam quis nostrud",
        description:
          "Exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      },
      {
        text: "Duis aute irure dolor in reprehenderit",
        description:
          "In voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      },
      {
        text: "Excepteur sint occaecat cupidatat non proident",
        description:
          "Sunt in culpa qui officia deserunt mollit anim id est laborum.",
      },
      {
        text: "Sed ut perspiciatis unde omnis iste natus",
        description:
          "Error sit voluptatem accusantium doloremque laudantium totam rem aperiam.",
      },
      {
        text: "Eaque ipsa quae ab illo inventore veritatis",
        description: "Et quasi architecto beatae vitae dicta sunt explicabo.",
      },
      {
        text: "Nemo enim ipsam voluptatem quia voluptas",
        description:
          "Sit aspernatur aut odit aut fugit sed quia consequuntur magni.",
      },
      {
        text: "Neque porro quisquam est qui dolorem ipsum",
        description:
          "Quia dolor sit amet consectetur adipisci velit sed quia non numquam.",
      },
      {
        text: "Ut enim ad minima veniam nostrum",
        description:
          "Exercitationem ullam corporis suscipit laboriosam nisi ut aliquid ex ea commodi.",
      },
      {
        text: "At vero eos et accusamus et iusto odio",
        description:
          "Dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.",
      },
    ];

    // Generate 10 test tasks with robust IDs
    const timestamp = Date.now();
    loremTasks.forEach((taskData, index) => {
      const task = {
        id: `test-${timestamp}-${index}-${Math.random()
          .toString(36)
          .substr(2, 4)}`,
        text: taskData.text,
        description: taskData.description,
        completed: Math.random() > 0.7, // 30% chance of being completed
        createdAt: new Date(timestamp - index * 60000).toISOString(), // Stagger creation times
        updatedAt: new Date().toISOString(),
      };

      this.tasks.unshift(task);
    });

    this.saveTasks();

    // Update gamification for each task added
    if (typeof gamificationManager !== "undefined") {
      loremTasks.forEach(() => {
        gamificationManager.addTask();
      });
    }

    // Play sound
    if (typeof audioManager !== "undefined") {
      audioManager.play("add");
    }
  }

  /**
   * Setup character counters for input fields
   */
  setupCharacterCounters() {
    const taskInput = document.getElementById("newTaskInput");
    const descInput = document.getElementById("newTaskDescription");
    const descCounter = document.getElementById("descCounter");

    if (taskInput) {
      taskInput.addEventListener("input", (e) => {
        const length = e.target.value.length;
        const maxLength = this.CONFIG.maxTitleLength;

        // Update any visible counter
        const counter = e.target.parentElement.querySelector(".char-counter");
        if (counter) {
          counter.textContent = `${length}/${maxLength}`;
          counter.className = "char-counter";

          if (length > maxLength * 0.9) {
            counter.classList.add("warning");
          } else if (length > maxLength * 0.7) {
            counter.classList.add("success");
          }
        }
      });
    }

    if (descInput && descCounter) {
      descInput.addEventListener("input", (e) => {
        const length = e.target.value.length;
        const maxLength = 500;
        descCounter.textContent = `${length}/${maxLength}`;
        descCounter.parentElement.className = "char-counter";

        if (length > maxLength * 0.9) {
          descCounter.parentElement.classList.add("error");
        } else if (length > maxLength * 0.7) {
          descCounter.parentElement.classList.add("warning");
        }
      });
    }
  }

  /**
   * Update volume button visual state based on sound enabled status
   * @param {boolean} isEnabled - Whether sound is enabled
   */
  updateVolumeButtonState(isEnabled) {
    const volumeBtn = document.getElementById("volumeBtn");
    const volumeIcon = document.getElementById("volumeIcon");

    if (volumeBtn) {
      // Add or remove disabled class based on sound state
      if (isEnabled) {
        volumeBtn.classList.remove("disabled");
        volumeBtn.classList.add("enabled");
        // Add a subtle pulse effect when sound is enabled
        volumeBtn.style.animation = "pulseGlow 2s ease-in-out infinite";
      } else {
        volumeBtn.classList.remove("enabled");
        volumeBtn.classList.add("disabled");
        // Remove animation when sound is disabled
        volumeBtn.style.animation = "none";
      }
    }

    // Update the icon to reflect the state
    if (volumeIcon && settingsManager) {
      settingsManager.updateVolumeIcon(volumeIcon, isEnabled);
    }

    // Update the settings panel's sound toggle to match
    const soundToggle = document.getElementById("soundToggle");
    if (soundToggle) {
      soundToggle.checked = isEnabled;
    }

    // Store the current state for comparison
    this.lastSoundEnabledState = isEnabled;
  }

  /**
   * Initialize volume button state based on current settings
   */
  initializeVolumeButtonState() {
    if (typeof settingsManager !== "undefined") {
      // Derive from global mute when available
      const initialEnabled =
        typeof audioManager !== "undefined" &&
        typeof audioManager.getGlobalMute === "function"
          ? !audioManager.getGlobalMute()
          : settingsManager.soundEnabled;
      this.updateVolumeButtonState(initialEnabled);
      this.lastSoundEnabledState = initialEnabled;
    }
  }

  /**
   * Listen for settings changes to update volume button state
   */
  setupSettingsChangeListener() {
    if (typeof settingsManager === "undefined") return;

    // Store the last known state
    this.lastSoundEnabledState = settingsManager.soundEnabled;

    // Listen for settings changes via the event bus
    if (typeof bus !== "undefined") {
      bus.addEventListener("settingsChanged", (e) => {
        const detail = e && e.detail ? e.detail : {};
        const isEnabled =
          typeof detail.globalMute === "boolean"
            ? !detail.globalMute
            : typeof detail.soundEnabled === "boolean"
              ? detail.soundEnabled
              : !!(settingsManager && settingsManager.soundEnabled);
        this.updateVolumeButtonState(isEnabled);
        this.lastSoundEnabledState = isEnabled;
      });
    }

    // Also listen for storage changes as a backup
    window.addEventListener("storage", (e) => {
      if (e.key === "luxury-todo-settings") {
        try {
          const settings = JSON.parse(e.newValue);
          const isEnabled =
            typeof settings.globalMute === "boolean"
              ? !settings.globalMute
              : !!settings.soundEnabled;
          // Update volume button state whenever settings change
          this.updateVolumeButtonState(isEnabled);
          this.lastSoundEnabledState = isEnabled;
        } catch (error) {
          console.warn("Failed to parse settings from storage:", error);
        }
      }
    });
  }

  /**
   * Setup footer visibility based on scroll
   */
  setupFooterVisibility() {
    const footer = document.querySelector(".app-footer");
    if (!footer) return;

    // Make footer initially visible
    footer.classList.add("visible");

    // Handle footer visibility based on scroll position
    const updateFooterVisibility = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage =
        (scrollTop / (documentHeight - windowHeight)) * 100;

      // Show footer when within 10% of the bottom
      if (scrollPercentage >= 90) {
        footer.classList.add("visible");
        footer.classList.remove("hidden");
      } else {
        footer.classList.remove("visible");
        footer.classList.add("hidden");
      }
    };

    // Call on scroll and resize
    window.addEventListener("scroll", updateFooterVisibility, {
      passive: true,
    });
    window.addEventListener("resize", updateFooterVisibility);

    // Initial check
    updateFooterVisibility();
  }

  /**
   * Process AI refactor response and handle all side effects
   * @param {Object} result - The AI refactor result
   * @param {Object} originalTask - The original task that was refactored
   * @param {string} debugId - Debug ID for tracking
   */
  async processAIRefactorResponse(result, originalTask, debugId) {
    // Validate the result
    const valid =
      result &&
      String(result.id) === String(originalTask.id) &&
      typeof result.title === "string" &&
      result.title.trim().length > 0 &&
      typeof result.description === "string";

    if (!valid) {
      console.error("[AI] Invalid AI refactor result; leaving task unchanged", {
        result,
        debugId,
      });
      return false;
    }

    // Check if AI returned empty description and preserve original if so
    const aiDescription = result.description.trim();
    const originalDescription = originalTask.description || "";
    const finalDescription =
      aiDescription.length > 0 ? aiDescription : originalDescription;

    if (aiDescription.length === 0 && originalDescription.length > 0) {
    }

    // Find the target task in our tasks array
    const target = this.tasks.find(
      (t) => String(t.id) === String(originalTask.id)
    );
    if (!target) {
      console.error("[AI] Original task disappeared before update", {
        debugId,
      });
      return false;
    }

    // Normalize the result using validation if available
    const normalized =
      typeof window !== "undefined" && typeof window.validateTask === "function"
        ? window.validateTask({
            id: target.id,
            title: result.title,
            description: result.description,
          })
        : {
            id: target.id,
            title: String(result.title || ""),
            description: String(result.description || ""),
          };

    // Create a new object reference to ensure re-render
    const updatedTask = {
      ...target,
      text: String(normalized.title || "").trim(),
      description: String(normalized.description || "").trim(),
      updatedAt: new Date().toISOString(),
      isDirty: true, // Mark task as dirty after AI edit
    };

    // Replace the task in the array
    const taskIndex = this.tasks.findIndex(
      (t) => String(t.id) === String(target.id)
    );
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = updatedTask;
    }

    // Save tasks and trigger re-render
    this.saveTasks();
    this.forceRender();

    // Trigger nebula pulse animation
    const applyNebulaEffect = (element) => {
      if (!element) return;

      // Remove any existing animation classes first
      element.classList.remove("ai-edit-nebula");

      // Force a reflow to ensure the animation starts fresh
      void element.offsetWidth;

      // Add the animation class
      element.classList.add("ai-edit-nebula");

      // Clean up after animation completes
      const onAnimationEnd = () => {
        element.classList.remove("ai-edit-nebula");
        element.removeEventListener("animationend", onAnimationEnd);
      };

      element.addEventListener("animationend", onAnimationEnd);

      // Fallback cleanup in case animationend doesn't fire
      setTimeout(() => {
        element.classList.remove("ai-edit-nebula");
      }, 1500); // Maximum animation duration + buffer
    };

    // Find the task element and apply nebula effect after DOM is fully updated
    setTimeout(() => {
      const taskElement = document.querySelector(
        `[data-task-id="${target.id}"]`
      );
      if (taskElement) {
        applyNebulaEffect(taskElement);
      }
    }, 100);

    // Play AI edit sound
    if (
      typeof audioManager !== "undefined" &&
      typeof audioManager.generateAIEditSound === "function"
    ) {
      try {
        await audioManager.generateAIEditSound();
      } catch (soundError) {
        console.warn("[AI] Failed to play AI edit sound:", soundError);
      }
    }

    // Update gamification (this will handle achievement checking internally)
    if (
      typeof gamificationManager !== "undefined" &&
      typeof gamificationManager.incrementAIEditCount === "function"
    ) {
      gamificationManager.incrementAIEditCount();
    }
    if (
      typeof gamificationManager !== "undefined" &&
      typeof gamificationManager.incrementAIWordsEdited === "function"
    ) {
      const originalWords = (
        originalTask.text ||
        originalTask.title ||
        ""
      ).split(/\s+/).length;
      const newWords = (result.title || "").split(/\s+/).length;
      gamificationManager.incrementAIWordsEdited(originalWords, newWords);
    }

    return true;
  }
}

/**
 * Initialize Center Bar and Tooltips after app is ready
 * Also create global app instance safely after DOM is ready to avoid early errors.
 */
document.addEventListener("DOMContentLoaded", function () {
  // Network layer inspection: fetch interception (install once)
  try {
    if (!window.__fetchInterceptInstalled) {
      const originalFetch = window.fetch;
      window.fetch = function (...args) {
        return originalFetch.apply(this, args);
      };
      window.__fetchInterceptInstalled = true;
    }
  } catch (e) {
    console.warn("[NETWORK] Failed to install fetch interception", e);
  }

  // Provider readiness diagnostics (no facade installers/guards)
  const checkAI = () => {
    try {
      const ok =
        typeof window !== "undefined" &&
        !!window.AIProviders &&
        typeof window.AIProviders.refactorTodo === "function";
      return ok;
    } catch (e) {
      console.warn("[AI] Provider check failed", e);
      return false;
    }
  };

  // No legacy facade creation. We call window.AIProviders.refactorTodo directly where needed.

  // Create global todo app
  try {
    if (!window.todoApp) {
      window.todoApp = new TodoApp();
    }
  } catch (e) {
    console.warn("TodoApp init failed:", e);
  }

  // Initialize Center Bar (prefer class-based controller)
  try {
    if (
      window.App &&
      App.CenterBarClass &&
      typeof App.CenterBarClass === "function"
    ) {
      if (!App.CenterBar || !(App.CenterBar instanceof App.CenterBarClass)) {
        App.CenterBar = new App.CenterBarClass({ debug: false });
      }
      App.CenterBar.init();
    } else if (
      window.App &&
      App.CenterBar &&
      typeof App.CenterBar.init === "function"
    ) {
      App.CenterBar.init();
    }
  } catch (e) {
    console.warn("CenterBar init failed:", e);
  }

  // Bind tooltips
  try {
    if (
      window.App &&
      App.TooltipService &&
      typeof App.TooltipService.bindAll === "function"
    ) {
      App.TooltipService.bindAll();
    }
  } catch (e) {
    console.warn("TooltipService bindAll failed:", e);
  }

  // Initial Lucide hydration on first load
  try {
    if (window.lucide && typeof lucide.createIcons === "function") {
      lucide.createIcons();
    }
  } catch (_) {}
});
