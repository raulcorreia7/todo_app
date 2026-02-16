const QUOTES: string[] = [
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

const STORAGE_KEY = "luxury-todo-quote";

interface QuoteData {
  currentQuote: string;
  lastQuoteDate: string;
}

function loadQuoteData(): QuoteData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveQuoteData(data: QuoteData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail
  }
}

function getRandomQuote(current: string): string {
  if (QUOTES.length === 0) return "";
  let newQuote: string | undefined;
  do {
    newQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  } while (newQuote === current && QUOTES.length > 1);
  return newQuote ?? "";
}

export interface QuoteService {
  getQuote: () => string;
  rotateQuote: () => string;
  getCurrentQuote: () => string;
}

export function createQuoteService(): QuoteService {
  let currentQuote: string = QUOTES[0] ?? "";
  let lastQuoteDate: string = "";

  function init() {
    const data = loadQuoteData();
    if (data) {
      currentQuote = data.currentQuote;
      lastQuoteDate = data.lastQuoteDate;
    }

    const today = new Date().toDateString();
    if (lastQuoteDate !== today) {
      currentQuote = getRandomQuote(currentQuote);
      lastQuoteDate = today;
      saveQuoteData({ currentQuote, lastQuoteDate });
    }
  }

  init();

  return {
    getQuote: () => currentQuote,
    rotateQuote: () => {
      currentQuote = getRandomQuote(currentQuote);
      lastQuoteDate = new Date().toDateString();
      saveQuoteData({ currentQuote, lastQuoteDate });
      return currentQuote;
    },
    getCurrentQuote: () => currentQuote,
  };
}

export const quoteService = createQuoteService();
export { QUOTES };
