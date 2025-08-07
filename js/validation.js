/**
 * Validation and character counter utilities
 */

// Lightweight runtime task validator/normalizer used across the app.
// Enforces strict schema: { id, title, description } and coerces description to string.
function validateTask(task) {
  const id = task && task.id != null ? task.id : (task && task._id != null ? task._id : null);

  // Normalize title: app historically uses "text" as the visible title field
  const rawTitle = task && (task.title != null ? task.title : task.text);
  const title = typeof rawTitle === 'string' ? rawTitle : String(rawTitle ?? '');

  // Coerce description to a plain string and trim
  let desc = task && task.description != null ? task.description : '';
  if (typeof desc !== 'string') {
    try {
      desc = String(desc);
    } catch (_) {
      desc = '';
    }
  }
  desc = desc.trim();

  // Return only the enforced keys
  return { id, title: title.trim(), description: desc };
}

// Batch normalization helper
function validateTasks(tasks) {
  if (!Array.isArray(tasks)) return [];
  return tasks.map(validateTask);
}

// Expose globally for use in app/storage without import system
if (typeof window !== 'undefined') {
  window.validateTask = validateTask;
  window.validateTasks = validateTasks;
}

class ValidationManager {
  constructor() {
    this.isInitialized = false;
    this.init();
  }

  init() {
    this.setupCharacterCounters();
    this.isInitialized = true;
  }

  /**
   * Setup real-time character counters
   */
  setupCharacterCounters() {
    // Add event listeners for character counting
    document.addEventListener('input', (e) => {
      if (e.target.matches('[maxlength]')) {
        this.updateCharCounter(e.target);
      }
    });

    // Add event listeners for edit mode
    document.addEventListener('focus', (e) => {
      if (e.target.matches('.task-edit-input, .task-edit-description')) {
        this.updateCharCounter(e.target);
      }
    }, true);
  }

  /**
   * Update character counter for an input
   */
  updateCharCounter(input) {
    const maxLength = parseInt(input.getAttribute('maxlength'));
    const currentLength = input.value.length;
    const remaining = maxLength - currentLength;

    // Find the associated counter
    let counter;
    if (input.classList.contains('task-edit-input')) {
      counter = input.parentElement.querySelector('.char-count');
    } else if (input.classList.contains('task-edit-description')) {
      counter = input.parentElement.querySelector('.desc-count');
    }

    if (counter) {
      const type = input.classList.contains('task-edit-input') ? 'title' : 'description';
      const max = type === 'title' ? 500 : 500;
      
      counter.textContent = `${currentLength}/${max}`;
      
      // Update counter styling based on remaining characters
      const counterElement = counter.parentElement;
      counterElement.classList.remove('warning', 'error');
      
      if (remaining <= 10) {
        counterElement.classList.add('error');
      } else if (remaining <= 50) {
        counterElement.classList.add('warning');
      }
    }
  }

  /**
   * Validate task input
   */
  validateTaskInput(text, description) {
    const errors = [];
    
    if (!text || String(text).trim().length === 0) {
      errors.push('Task title is required');
    }
    
    if (text && String(text).length > 500) {
      errors.push('Task title must be 500 characters or less');
    }
    
    if (description && String(description).length > 500) {
      errors.push('Task description must be 500 characters or less');
    }
    
    return errors;
  }

  /**
   * Test cases for validation
   */
  runValidationTests() {
    const tests = [
      {
        name: "Title-only task validation",
        input: { text: "Test task", description: "" },
        expected: []
      },
      {
        name: "Task with description validation",
        input: { text: "Test task", description: "This is a description" },
        expected: []
      },
      {
        name: "Empty title validation",
        input: { text: "", description: "Description" },
        expected: ['Task title is required']
      },
      {
        name: "Missing title validation",
        input: { text: null, description: "Description" },
        expected: ['Task title is required']
      },
      {
        name: "Long title validation",
        input: { text: "x".repeat(501), description: "" },
        expected: ['Task title must be 500 characters or less']
      },
      {
        name: "Long description validation",
        input: { text: "Valid title", description: "x".repeat(501) },
        expected: ['Task description must be 500 characters or less']
      },
      {
        name: "Title-only task with whitespace",
        input: { text: "  Task with spaces  ", description: "" },
        expected: []
      }
    ];

    
    let passed = 0;
    let failed = 0;

    tests.forEach((test, index) => {
      const result = this.validateTaskInput(test.input.text, test.input.description);
      const passedTest = JSON.stringify(result) === JSON.stringify(test.expected);
      
      if (passedTest) {
        passed++;
      } else {
        failed++;
        console.error(`[Test ${index + 1}] ✗ ${test.name}`);
        console.error(`  Expected: ${JSON.stringify(test.expected)}`);
        console.error(`  Got: ${JSON.stringify(result)}`);
      }
    });

    return { passed, failed, total: tests.length };
  }

  /**
   * Test task normalization for title-only tasks
   */
  runNormalizationTests() {
    const tests = [
      {
        name: "Title-only task normalization",
        input: { id: "123", title: "Test task", description: undefined },
        expected: { id: "123", title: "Test task", description: "" }
      },
      {
        name: "Task with null description",
        input: { id: "456", title: "Another task", description: null },
        expected: { id: "456", title: "Another task", description: "" }
      },
      {
        name: "Task with empty string description",
        input: { id: "789", title: "Task with empty desc", description: "" },
        expected: { id: "789", title: "Task with empty desc", description: "" }
      },
      {
        name: "Task with non-string description",
        input: { id: "101", title: "Task", description: 123 },
        expected: { id: "101", title: "Task", description: "" }
      }
    ];

    
    let passed = 0;
    let failed = 0;

    tests.forEach((test, index) => {
      const result = validateTask(test.input);
      const passedTest = JSON.stringify(result) === JSON.stringify(test.expected);
      
      if (passedTest) {
        passed++;
      } else {
        failed++;
        console.error(`[Test ${index + 1}] ✗ ${test.name}`);
        console.error(`  Expected: ${JSON.stringify(test.expected)}`);
        console.error(`  Got: ${JSON.stringify(result)}`);
      }
    });

    return { passed, failed, total: tests.length };
  }

  /**
   * Show validation error
   */
  showValidationError(message) {
    // Create temporary error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--error-color);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }
}

// Create global validation manager
const validationManager = new ValidationManager();

// Export for debugging
if (window.DEV) {
  window.validationManager = validationManager;
}
