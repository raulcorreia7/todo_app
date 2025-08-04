/**
 * Main application controller
 * Coordinates all components and manages the todo list
 */

class TodoApp {
  constructor() {
    this.tasks = [];
    this.isInitialized = false;
    this.currentFilter = 'all';
    this.editingTaskId = null;
    this.isDirty = false;
    this.renderTimeout = null;

    this.CONFIG = {
      maxTaskLength: 500,
      autoSaveDelay: 500,
      animationDuration: 300,
      debounceDelay: 50
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
    this.loadTasks();
    this.render();
    this.setupFooterVisibility();

    // Initialize statistics manager
    if (typeof statisticsManager !== 'undefined' && statisticsManager.isReady()) {
      console.log('Statistics manager initialized');
    }

    this.isInitialized = true;
    console.log('Todo app initialized');
  }

  /**
   * Wait for all dependencies to load, including settings
   */
  async waitForDependencies() {
    const checkDependencies = () => {
      return (
        typeof storageManager !== 'undefined' && storageManager.isReady() &&
        typeof themeManager !== 'undefined' && themeManager.isReady &&
        typeof settingsManager !== 'undefined' && settingsManager.isReady() &&
        typeof settingsLoader !== 'undefined' && settingsLoader.isReady()
      );
    };

    return new Promise((resolve) => {
      const maxWait = 10000; // 10 seconds max
      const startTime = Date.now();

      const check = () => {
        if (checkDependencies()) {
          resolve();
        } else if (Date.now() - startTime > maxWait) {
          console.warn('Dependency loading timeout, proceeding anyway');
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Add task form
    const addTaskForm = document.getElementById('addTaskForm');
    if (addTaskForm) {
      addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addTask();
      });
    }

    // Filter buttons
    document.querySelectorAll('[data-filter]').forEach(button => {
      button.addEventListener('click', (e) => {
        this.setFilter(e.target.dataset.filter);
      });
    });

    // Clear completed
    const clearCompletedBtn = document.getElementById('clearCompleted');
    if (clearCompletedBtn) {
      clearCompletedBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.clearCompleted();
      });
    }

    // Delete all tasks
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    if (deleteAllBtn) {
      deleteAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.deleteAll();
      });
    }

    // Test data button
    const testDataBtn = document.getElementById('testDataBtn');
    if (testDataBtn) {
      testDataBtn.addEventListener('click', () => this.addTestData());
    }

    // Statistics button
    const statisticsBtn = document.getElementById('statisticsBtn');
    if (statisticsBtn) {
      statisticsBtn.addEventListener('click', () => {
        if (typeof statisticsManager !== 'undefined') {
          statisticsManager.toggleStatistics();
        }
      });
    }

    // Volume button
    const volumeBtn = document.getElementById('volumeBtn');
    if (volumeBtn) {
      volumeBtn.addEventListener('click', () => {
        if (typeof settingsManager !== 'undefined') {
          const newSoundEnabled = !settingsManager.soundEnabled;
          settingsManager.setSoundEnabled(newSoundEnabled);

          // Update volume icon
          const volumeIcon = document.getElementById('volumeIcon');
          if (volumeIcon) {
            settingsManager.updateVolumeIcon(volumeIcon, newSoundEnabled);
          }

          // Play sound toggle sound
          if (typeof audioManager !== 'undefined') {
            audioManager.play('toggle');
          }
        }
      });
    }

    // Event delegation for task interactions
    document.addEventListener('change', (e) => {
      // Handle checkbox changes
      if (e.target.matches('.task-checkbox input[type="checkbox"]')) {
        e.preventDefault();
        const taskId = e.target.dataset.taskId;
        if (taskId) {
          this.toggleTask(taskId);
        }
      }
    });

    document.addEventListener('click', (e) => {
      const target = e.target;

      // Handle clear completed via data-action attribute
      if (target.matches('[data-action="clear-completed"]')) {
        e.preventDefault();
        this.clearCompleted();
      }

      // Handle delete all via data-action attribute
      if (target.matches('[data-action="delete-all"]')) {
        e.preventDefault();
        this.deleteAll();
      }

      // Handle test data via data-action attribute
      if (target.matches('[data-action="test-data"]')) {
        e.preventDefault();
        this.addTestData();
      }

      // Handle task edit buttons
      if (target.closest('.task-edit-btn')) {
        e.preventDefault();
        const taskId = target.closest('.task-edit-btn').dataset.taskId;
        if (taskId) {
          this.startEdit(taskId);
        }
      }

      // Handle task delete buttons
      if (target.closest('.task-delete-btn')) {
        e.preventDefault();
        const taskId = target.closest('.task-delete-btn').dataset.taskId;
        if (taskId) {
          this.deleteTask(taskId);
        }
      }

      // Handle task save buttons
      if (target.closest('.task-save')) {
        e.preventDefault();
        const taskId = target.closest('.task-save').dataset.taskId;
        if (taskId) {
          this.saveEdit(taskId);
        }
      }

      // Handle task cancel buttons
      if (target.closest('.task-cancel')) {
        e.preventDefault();
        this.cancelEdit();
      }
    });

    // Event bus listeners
    if (typeof bus !== 'undefined') {
      bus.addEventListener('tasksUpdated', () => this.render());
      bus.addEventListener('settingsChanged', () => this.render());
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            document.getElementById('newTaskInput')?.focus();
            break;
          case 'a':
            e.preventDefault();
            this.setFilter('all');
            break;
          case 'Enter':
            if (this.editingTaskId) {
              this.saveEdit(this.editingTaskId);
            }
            break;
          case 'Escape':
            if (this.editingTaskId) {
              this.cancelEdit();
            }
            break;
        }
      }
    });

    // Character counters
    this.setupCharacterCounters();
  }

  /**
   * Load tasks from storage
   */
  loadTasks() {
    const oldTaskCount = this.tasks.length;
    this.tasks = storageManager.getTasks();
    const newTaskCount = this.tasks.length;

    // Mark as dirty if task count changed during load
    if (oldTaskCount !== newTaskCount) {
      this.markDirty('load');
    }
  }

  /**
   * Save tasks to storage
   */
  saveTasks() {
    storageManager.setTasks(this.tasks);
    this.markDirty('save');

    // Dispatch tasksUpdated event to notify other components
    if (typeof bus !== 'undefined') {
      bus.dispatchEvent(new CustomEvent('tasksUpdated'));
    }
  }

  /**
   * Mark the task list as dirty and trigger re-render
   * @param {string} source - Source of the change for debugging
   */
  markDirty(source = 'unknown') {
    this.isDirty = true;
    console.log(`Tasks marked dirty from: ${source}`);
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
   * Force immediate re-render regardless of dirty state
   */
  forceRender() {
    this.isDirty = false;
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout);
      this.renderTimeout = null;
    }
    this.render();
  }

  /**
   * Add a new task
   */
  addTask() {
    const input = document.getElementById('newTaskInput');
    const descriptionInput = document.getElementById('newTaskDescription');
    if (!input) return;

    const text = input.value.trim();
    const description = descriptionInput ? descriptionInput.value.trim() : '';

    if (!text) {
      this.showValidationError('Task title is required');
      return;
    }

    if (text.length > this.CONFIG.maxTaskLength) {
      this.showValidationError(`Task too long! Maximum ${this.CONFIG.maxTaskLength} characters.`);
      return;
    }

    if (description.length > 500) {
      this.showValidationError(`Description too long! Maximum 500 characters.`);
      return;
    }

    const task = {
      id: Date.now().toString(),
      text: text,
      description: description,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.tasks.unshift(task);
    this.saveTasks();

    input.value = '';

    // Play sound
    if (typeof audioManager !== 'undefined') {
      audioManager.play('add');
    }

    // Update gamification
    if (typeof gamificationManager !== 'undefined') {
      gamificationManager.addTask();
    }

    // Add animation class to the newly added task
    setTimeout(() => {
      const newTaskElement = document.querySelector(`[data-task-id="${task.id}"]`);
      if (newTaskElement) {
        newTaskElement.classList.add('new');
      }
    }, 10);
  }

  /**
   * Toggle task completion
   */
  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      console.warn(`Task with ID ${id} not found`);
      return;
    }

    task.completed = !task.completed;
    task.updatedAt = new Date().toISOString();

    this.saveTasks();

    // Play sound
    if (typeof audioManager !== 'undefined') {
      audioManager.play(task.completed ? 'complete' : 'edit');
    }

    // Update gamification
    if (typeof gamificationManager !== 'undefined') {
      if (task.completed) {
        gamificationManager.completeTask();
      }
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    const confirmed = await modalManager.showDeleteConfirm(task.text);

    if (!confirmed) return;

    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveTasks();

    // Play sound
    if (typeof audioManager !== 'undefined') {
      audioManager.play('delete');
    }

    // Update gamification
    if (typeof gamificationManager !== 'undefined') {
      gamificationManager.deleteTask();
    }
  }

  /**
   * Start editing a task
   */
  startEdit(id) {
    this.editingTaskId = id;
    this.forceRender();

    const input = document.querySelector(`[data-edit-input="${id}"]`);
    if (input) {
      input.focus();
      input.select();
    }
  }

  /**
   * Save edited task
   */
  saveEdit(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    const input = document.querySelector(`[data-edit-input="${id}"]`);
    const descriptionInput = document.querySelector(`[data-edit-desc="${id}"]`);
    if (!input) return;

    const newText = input.value.trim();
    const newDescription = descriptionInput ? descriptionInput.value.trim() : '';

    if (!newText) {
      this.deleteTask(id);
      return;
    }

    if (newText.length > this.CONFIG.maxTaskLength) {
      alert(`Task too long! Maximum ${this.CONFIG.maxTaskLength} characters.`);
      return;
    }

    if (newDescription.length > 500) {
      alert(`Description too long! Maximum 500 characters.`);
      return;
    }

    task.text = newText;
    task.description = newDescription;
    task.updatedAt = new Date().toISOString();

    this.editingTaskId = null;
    this.saveTasks();

    // Play sound
    if (typeof audioManager !== 'undefined') {
      audioManager.play('edit');
    }

    // Update gamification
    if (typeof gamificationManager !== 'undefined') {
      gamificationManager.editTask();
    }
  }

  /**
   * Cancel editing
   */
  cancelEdit() {
    this.editingTaskId = null;
    this.forceRender();
  }

  /**
   * Set filter
   */
  setFilter(filter) {
    this.currentFilter = filter;

    // Update active state
    document.querySelectorAll('[data-filter]').forEach(button => {
      button.classList.toggle('active', button.dataset.filter === filter);
    });

    this.forceRender();
  }

  /**
   * Clear completed tasks
   */
  async clearCompleted() {
    const completedCount = this.tasks.filter(t => t.completed).length;
    if (completedCount === 0) return;

    const confirmed = await modalManager.show({
      title: 'Confirm Deletion',
      message: `Are you sure you want to clear ${completedCount} completed task${completedCount !== 1 ? 's' : ''}? This cannot be undone.`,
      confirmText: 'Clear',
      cancelText: 'Cancel',
      confirmStyle: 'danger'
    });

    if (!confirmed) return;

    this.tasks = this.tasks.filter(t => !t.completed);
    this.saveTasks();
  }

  /**
   * Delete all tasks
   */
  async deleteAll() {
    if (this.tasks.length === 0) return;

    const confirmed = await modalManager.show({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete all ${this.tasks.length} task${this.tasks.length !== 1 ? 's' : ''}? This cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      confirmStyle: 'danger'
    });

    if (!confirmed) return;

    this.tasks = [];
    this.saveTasks();

    // Play sound
    if (typeof audioManager !== 'undefined') {
      audioManager.play('delete');
    }

    // Update gamification
    if (typeof gamificationManager !== 'undefined') {
      gamificationManager.resetStats();
    }
  }

  /**
   * Get filtered tasks
   */
  getFilteredTasks() {
    switch (this.currentFilter) {
      case 'active':
        return this.tasks.filter(t => !t.completed);
      case 'completed':
        return this.tasks.filter(t => t.completed);
      default:
        return this.tasks;
    }
  }

  /**
   * Render the todo list
   */
  render() {
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');
    const emptyState = document.getElementById('emptyState');

    if (!taskList || !taskCount) return;

    const filteredTasks = this.getFilteredTasks();

    // Update count
    const activeCount = this.tasks.filter(t => !t.completed).length;
    taskCount.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`;

    // Show/hide empty state
    if (filteredTasks.length === 0) {
      emptyState.style.display = 'block';
      taskList.innerHTML = '';
      return;
    }

    emptyState.style.display = 'none';

    // Render tasks
    taskList.innerHTML = filteredTasks.map(task => this.renderTask(task)).join('');

    // Setup task event listeners
    this.setupTaskEventListeners();
  }

  /**
   * Render individual task
   */
  renderTask(task) {
    const isEditing = this.editingTaskId === task.id;

    return `
      <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
        <div class="task-content">
          <label class="task-checkbox">
            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                   data-task-id="${task.id}">
            <span class="checkmark"></span>
          </label>
          
          <div class="task-text-content">
            ${isEditing ? `
              <div class="task-edit">
                <div class="edit-input-group">
                  <input type="text" 
                         class="task-edit-input luxury-input" 
                         data-edit-input="${task.id}"
                         value="${this.escapeHtml(task.text)}"
                         maxlength="${this.CONFIG.maxTaskLength}"
                         placeholder="Task title">
                  <div class="char-counter">
                    <span class="char-count">${task.text.length}/${this.CONFIG.maxTaskLength}</span>
                  </div>
                </div>
                <textarea class="task-edit-description luxury-textarea" 
                          data-edit-desc="${task.id}"
                          maxlength="500"
                          placeholder="Task description (optional)"
                          rows="2">${this.escapeHtml(task.description)}</textarea>
                <div class="char-counter">
                  <span class="desc-count">${task.description.length}/500</span>
                </div>
                <div class="edit-actions">
                  <button class="task-save btn btn--primary" data-task-id="${task.id}">Save</button>
                  <button class="task-cancel btn btn--ghost">Cancel</button>
                </div>
              </div>
            ` : `
              <div class="task-display" data-task-id="${task.id}">
                <div class="task-title">${this.escapeHtml(task.text)}</div>
                ${task.description ? `
                  <div class="task-description">${this.escapeHtml(task.description)}</div>
                ` : ''}
              </div>
            `}
          </div>
        </div>
        
        <div class="task-actions">
          <button class="task-edit-btn" data-task-id="${task.id}" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          
          <button class="task-delete-btn" data-task-id="${task.id}" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Setup task event listeners
   */
  setupTaskEventListeners() {
    // Task hover effects
    document.querySelectorAll('.task-item').forEach(taskEl => {
      taskEl.addEventListener('mouseenter', () => {
        taskEl.classList.add('hover');
      });

      taskEl.addEventListener('mouseleave', () => {
        taskEl.classList.remove('hover');
      });
    });
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get task statistics
   */
  getStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const active = total - completed;

    return {
      total,
      completed,
      active,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  /**
   * Show validation error
   */
  showValidationError(message) {
    // Create elegant error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
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
        description: "Adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      },
      {
        text: "Ut enim ad minim veniam quis nostrud",
        description: "Exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
      },
      {
        text: "Duis aute irure dolor in reprehenderit",
        description: "In voluptate velit esse cillum dolore eu fugiat nulla pariatur."
      },
      {
        text: "Excepteur sint occaecat cupidatat non proident",
        description: "Sunt in culpa qui officia deserunt mollit anim id est laborum."
      },
      {
        text: "Sed ut perspiciatis unde omnis iste natus",
        description: "Error sit voluptatem accusantium doloremque laudantium totam rem aperiam."
      },
      {
        text: "Eaque ipsa quae ab illo inventore veritatis",
        description: "Et quasi architecto beatae vitae dicta sunt explicabo."
      },
      {
        text: "Nemo enim ipsam voluptatem quia voluptas",
        description: "Sit aspernatur aut odit aut fugit sed quia consequuntur magni."
      },
      {
        text: "Neque porro quisquam est qui dolorem ipsum",
        description: "Quia dolor sit amet consectetur adipisci velit sed quia non numquam."
      },
      {
        text: "Ut enim ad minima veniam quis nostrum",
        description: "Exercitationem ullam corporis suscipit laboriosam nisi ut aliquid ex ea commodi."
      },
      {
        text: "At vero eos et accusamus et iusto odio",
        description: "Dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti."
      }
    ];

    // Generate 10 test tasks with robust IDs
    const timestamp = Date.now();
    loremTasks.forEach((taskData, index) => {
      const task = {
        id: `test-${timestamp}-${index}-${Math.random().toString(36).substr(2, 4)}`,
        text: taskData.text,
        description: taskData.description,
        completed: Math.random() > 0.7, // 30% chance of being completed
        createdAt: new Date(timestamp - index * 60000).toISOString(), // Stagger creation times
        updatedAt: new Date().toISOString()
      };

      this.tasks.unshift(task);
    });

    this.saveTasks();

    // Update gamification for each task added
    if (typeof gamificationManager !== 'undefined') {
      loremTasks.forEach(() => {
        gamificationManager.addTask();
      });
    }

    // Play sound
    if (typeof audioManager !== 'undefined') {
      audioManager.play('add');
    }
  }

  /**
   * Setup character counters for input fields
   */
  setupCharacterCounters() {
    const taskInput = document.getElementById('newTaskInput');
    const descInput = document.getElementById('newTaskDescription');
    const descCounter = document.getElementById('descCounter');

    if (taskInput) {
      taskInput.addEventListener('input', (e) => {
        const length = e.target.value.length;
        const maxLength = this.CONFIG.maxTaskLength;

        // Update any visible counter
        const counter = e.target.parentElement.querySelector('.char-counter');
        if (counter) {
          counter.textContent = `${length}/${maxLength}`;
          counter.className = 'char-counter';

          if (length > maxLength * 0.9) {
            counter.classList.add('warning');
          } else if (length > maxLength * 0.7) {
            counter.classList.add('success');
          }
        }
      });
    }

    if (descInput && descCounter) {
      descInput.addEventListener('input', (e) => {
        const length = e.target.value.length;
        const maxLength = 500;
        descCounter.textContent = `${length}/${maxLength}`;
        descCounter.parentElement.className = 'char-counter';

        if (length > maxLength * 0.9) {
          descCounter.parentElement.classList.add('error');
        } else if (length > maxLength * 0.7) {
          descCounter.parentElement.classList.add('warning');
        }
      });
    }
  }

  /**
   * Setup footer visibility based on scroll
   */
  setupFooterVisibility() {
    const footer = document.querySelector('.app-footer');
    if (!footer) return;

    // Make footer initially visible
    footer.classList.add('visible');

    // Handle footer visibility based on scroll position
    const updateFooterVisibility = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;

      // Show footer when within 10% of the bottom
      if (scrollPercentage >= 90) {
        footer.classList.add('visible');
        footer.classList.remove('hidden');
      } else {
        footer.classList.remove('visible');
        footer.classList.add('hidden');
      }
    };

    // Call on scroll and resize
    window.addEventListener('scroll', updateFooterVisibility, { passive: true });
    window.addEventListener('resize', updateFooterVisibility);

    // Initial check
    updateFooterVisibility();
  }
}

// Create global todo app
const todoApp = new TodoApp();

// Export for debugging
if (window.DEV) {
  window.todoApp = todoApp;
}
