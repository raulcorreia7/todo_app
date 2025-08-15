/**
 * Enhanced Daily Quotes System
 * Provides dynamic daily quotes with persistence
 */

class QuoteManager {
  constructor() {
    this.quotes = [
      "Excellence is never an accident. It is always the result of high intention, sincere effort, and intelligent execution.",
      "Quality is not an act, it is a habit. Excellence, then, is not an act but a habit.",
      "Success is the sum of small efforts repeated day in and day out.",
      "The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks.",
      "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort.",
      "Discipline is choosing between what you want now and what you want most.",
      "You don't have to be great to start, but you have to start to be great.",
      "The way to get started is to quit talking and begin doing.",
      "Excellence is doing ordinary things extraordinarily well.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "The only way to do great work is to love what you do.",
      "Don't watch the clock; do what it does. Keep going.",
      "A year from now you may wish you had started today.",
      "The future depends on what you do today.",
      "Small daily improvements over time lead to stunning results.",
      "Focus on being productive instead of busy.",
      "You are what you do, not what you say you'll do.",
      "Action is the foundational key to all success.",
      "The best way to predict the future is to create it.",
      "Dream big and dare to fail.",
      "What you do today can improve all your tomorrows.",
      "Success usually comes to those who are too busy to be looking for it.",
      "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.",
      "The only impossible journey is the one you never begin.",
      "Success is not how high you have climbed, but how you make a positive difference to the world.",
      "Don't let yesterday take up too much of today.",
      "The future belongs to those who believe in the beauty of their dreams.",
      "It always seems impossible until it's done.",
      "The best time to plant a tree was 20 years ago. The second best time is now.",
      "Your limitation—it's only your imagination.",
      "Push yourself, because no one else is going to do it for you.",
      "Great things never come from comfort zones.",
      "Dream it. Wish it. Do it.",
      "Success doesn't just find you. You have to go out and get it.",
      "The harder you work for something, the greater you'll feel when you achieve it.",
      "Dream bigger. Do bigger.",
      "Don't stop when you're tired. Stop when you're done.",
      "Wake up with determination. Go to bed with satisfaction.",
      "Do something today that your future self will thank you for.",
      "Little things make big days.",
      "It's going to be hard, but hard does not mean impossible.",
      "Don't wait for opportunity. Create it.",
      "The key to success is to focus on goals, not obstacles.",
      "Dream it. Believe it. Build it.",
    ];

    this.currentQuote = null;
    this.nextQuote = null; // Preloaded next quote
    this.lastQuoteDate = null;

    this.init();
  }

  /**
   * Initialize quote system
   */
  init() {
    this.loadQuoteData();
    this.updateDailyQuote();
    this.preloadNextQuote();
    this.startQuoteRotation();
    this.setupQuoteClickHandler();
  }

  /**
   * Load quote data from storage
   */
  loadQuoteData() {
    const data = storageManager.getQuoteData();
    if (data) {
      this.currentQuote = data.currentQuote;
      this.lastQuoteDate = data.lastQuoteDate;
    }
  }

  /**
   * Save quote data to storage
   */
  saveQuoteData() {
    const data = {
      currentQuote: this.currentQuote,
      lastQuoteDate: this.lastQuoteDate,
    };
    storageManager.setQuoteData(data);
  }

  /**
   * Update daily quote
   */
  updateDailyQuote() {
    const today = new Date().toDateString();

    if (this.lastQuoteDate !== today) {
      this.selectNewQuote();
      this.lastQuoteDate = today;
      this.saveQuoteData();
    }

    this.displayQuote();
  }

  /**
   * Select a new random quote
   */
  selectNewQuote() {
    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    this.currentQuote = this.quotes[randomIndex];
  }

  /**
   * Display current quote
   */
  displayQuote() {
    const quoteElement = document.querySelector(".daily-quote");
    if (quoteElement && this.currentQuote) {
      quoteElement.textContent = `"${this.currentQuote}"`;
    }
  }

  /**
   * Start quote rotation (15 seconds with daily reset)
   */
  startQuoteRotation() {
    // Check if it's a new day and set daily quote
    this.updateDailyQuote();

    // Start 15-second rotation for subtle quote changes
    setInterval(() => {
      this.rotateToNewQuote();
    }, 15000); // 15 seconds
  }

  /**
   * Rotate to a new quote (subtle change)
   */
  rotateToNewQuote() {
    const quoteElement = document.querySelector(".daily-quote");
    if (!quoteElement) return;

    // Add changing class for fade effect
    quoteElement.classList.add("changing");

    // After fade out, change quote and fade back in
    setTimeout(() => {
      // Select a different quote from the array
      let newQuote;
      do {
        const randomIndex = Math.floor(Math.random() * this.quotes.length);
        newQuote = this.quotes[randomIndex];
      } while (newQuote === this.currentQuote && this.quotes.length > 1);

      this.currentQuote = newQuote;
      this.displayQuote();

      // Remove changing class to fade back in
      setTimeout(() => {
        quoteElement.classList.remove("changing");
      }, 50);
    }, 500); // Match the CSS transition duration
  }

  /**
   * Get current quote
   */
  getCurrentQuote() {
    return this.currentQuote;
  }

  /**
   * Refresh quote (for testing)
   */
  refreshQuote() {
    this.selectNewQuote();
    this.lastQuoteDate = new Date().toDateString();
    this.saveQuoteData();
    this.displayQuote();
  }

  /**
   * Preload the next quote for instant switching
   */
  preloadNextQuote() {
    let newQuote;
    do {
      const randomIndex = Math.floor(Math.random() * this.quotes.length);
      newQuote = this.quotes[randomIndex];
    } while (newQuote === this.currentQuote && this.quotes.length > 1);

    this.nextQuote = newQuote;
  }

  /**
   * Setup click handler for the quote element
   */
  setupQuoteClickHandler() {
    const quoteElement = document.querySelector(".daily-quote");
    if (quoteElement) {
      quoteElement.addEventListener("click", () => {
        this.instantQuoteChange();
      });
    }
  }

  /**
   * Instantly change quote when clicked
   */
  instantQuoteChange() {
    const quoteElement = document.querySelector(".daily-quote");
    if (!quoteElement || !this.nextQuote) return;

    // Use the preloaded quote if available
    if (this.nextQuote) {
      this.currentQuote = this.nextQuote;
      this.nextQuote = null; // Clear the preloaded quote
    } else {
      // Fallback to selecting a new quote
      let newQuote;
      do {
        const randomIndex = Math.floor(Math.random() * this.quotes.length);
        newQuote = this.quotes[randomIndex];
      } while (newQuote === this.currentQuote && this.quotes.length > 1);

      this.currentQuote = newQuote;
    }

    // Preload the next quote for future clicks
    this.preloadNextQuote();

    // Update display with instant transition
    quoteElement.style.opacity = "0";

    // Use requestAnimationFrame for smoother transition
    requestAnimationFrame(() => {
      this.displayQuote();
      quoteElement.style.opacity = "1";
    });
  }
}

// Extend storage manager for quotes
if (typeof StorageManager !== "undefined") {
  StorageManager.prototype.getQuoteData = function () {
    if (!this.isReady()) return null;

    try {
      const data = localStorage.getItem("luxury-todo-quote");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn("Failed to load quote data:", error);
      return null;
    }
  };

  StorageManager.prototype.setQuoteData = function (data) {
    if (!this.isReady()) return false;

    try {
      localStorage.setItem("luxury-todo-quote", JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn("Failed to save quote data:", error);
      return false;
    }
  };
}

// Create global quote manager
const quoteManager = new QuoteManager();

// Remove test button functionality (no longer needed)

// Export for debugging
if (window.DEV) {
  window.quoteManager = quoteManager;
}
