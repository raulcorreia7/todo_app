/**
 * AI Environment Configuration
 * Handles AI configuration and environment setup
 */

class AIEnvironment {
  constructor() {
    this.config = {
      enabled: false,
      preferredProvider: "openai",
      defaultStyle: "simple",
      maxTokens: 500,
      temperature: 0.7,
      openaiModel: "gpt-3.5-turbo",
      anthropicModel: "claude-3-haiku-20240307",
    };

    this.initialize();
  }

  /**
   * Initialize AI environment
   */
  initialize() {
    // Check if we're in a development environment
    const isDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    // Set default configuration based on environment
    if (isDev) {
      this.config.enabled = true; // Enable AI in development by default
    }

    // Load configuration from localStorage if available
    this.loadConfig();

    // Set up API keys from environment variables or localStorage
    this.setupApiKeys();

    // Initialize AI providers if enabled
    if (this.config.enabled) {
      this.initializeAIProviders();
    }
  }

  /**
   * Load configuration from localStorage
   */
  loadConfig() {
    try {
      const savedConfig = localStorage.getItem("ai_config");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        this.config = { ...this.config, ...parsed };
      }
    } catch (error) {
      console.error("Error loading AI configuration:", error);
    }
  }

  /**
   * Save configuration to localStorage
   */
  saveConfig() {
    try {
      localStorage.setItem("ai_config", JSON.stringify(this.config));
    } catch (error) {
      console.error("Error saving AI configuration:", error);
    }
  }

  /**
   * Set up API keys from environment variables or localStorage
   */
  setupApiKeys() {
    // Check for environment variables (in development)
    if (typeof process !== "undefined" && process.env) {
      this.config.openaiApiKey = process.env.OPENAI_API_KEY;
      this.config.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    }

    // Check for global variables (set in development)
    if (window.OPENAI_API_KEY) {
      this.config.openaiApiKey = window.OPENAI_API_KEY;
    }

    if (window.ANTHROPIC_API_KEY) {
      this.config.anthropicApiKey = window.ANTHROPIC_API_KEY;
    }

    // Check localStorage for API keys
    try {
      const savedOpenAIKey = localStorage.getItem("openai_api_key");
      if (savedOpenAIKey) {
        this.config.openaiApiKey = savedOpenAIKey;
      }

      const savedAnthropicKey = localStorage.getItem("anthropic_api_key");
      if (savedAnthropicKey) {
        this.config.anthropicApiKey = savedAnthropicKey;
      }
    } catch (error) {
      console.error("Error loading API keys from localStorage:", error);
    }

    // Set global variables for the AI providers
    window.OPENAI_API_KEY = this.config.openaiApiKey;
    window.ANTHROPIC_API_KEY = this.config.anthropicApiKey;

    // Set global AI configuration
    window.AI_CONFIG = this.config;
  }

  /**
   * Initialize AI providers
   */
  initializeAIProviders() {
    // Check if AI providers module is loaded
    if (typeof AIProviders !== "undefined") {
      AIProviders.initialize();
    }
  }

  /**
   * Enable AI features
   */
  enable() {
    this.config.enabled = true;
    this.saveConfig();
    this.setupApiKeys();
    this.initializeAIProviders();
  }

  /**
   * Disable AI features
   */
  disable() {
    this.config.enabled = false;
    this.saveConfig();

    // Clear global API keys
    window.OPENAI_API_KEY = null;
    window.ANTHROPIC_API_KEY = null;
    window.AI_CONFIG = { ...this.config, enabled: false };
  }

  /**
   * Set API key
   * @param {string} provider - The provider ('openai' or 'anthropic')
   * @param {string} key - The API key
   */
  setApiKey(provider, key) {
    if (provider === "openai") {
      this.config.openaiApiKey = key;
      window.OPENAI_API_KEY = key;
    } else if (provider === "anthropic") {
      this.config.anthropicApiKey = key;
      window.ANTHROPIC_API_KEY = key;
    }

    this.saveConfig();
  }

  /**
   * Get API key
   * @param {string} provider - The provider ('openai' or 'anthropic')
   * @returns {string|null} - The API key
   */
  getApiKey(provider) {
    if (provider === "openai") {
      return this.config.openaiApiKey;
    } else if (provider === "anthropic") {
      return this.config.anthropicApiKey;
    }
    return null;
  }

  /**
   * Check if AI features are enabled
   * @returns {boolean} - True if AI features are enabled
   */
  isEnabled() {
    return this.config.enabled;
  }

  /**
   * Check if a specific provider is available
   * @param {string} provider - The provider to check
   * @returns {boolean} - True if the provider is available
   */
  isProviderAvailable(provider) {
    if (!this.config.enabled) return false;

    const apiKey = this.getApiKey(provider);
    return apiKey && apiKey.trim() !== "";
  }

  /**
   * Get available providers
   * @returns {Array} - Array of available provider names
   */
  getAvailableProviders() {
    const providers = [];

    if (this.isProviderAvailable("openai")) {
      providers.push("openai");
    }

    if (this.isProviderAvailable("anthropic")) {
      providers.push("anthropic");
    }

    return providers;
  }

  /**
   * Set preferred provider
   * @param {string} provider - The provider name
   */
  setPreferredProvider(provider) {
    if (this.isProviderAvailable(provider)) {
      this.config.preferredProvider = provider;
      this.saveConfig();
    }
  }

  /**
   * Set refactoring style
   * @param {string} style - The refactoring style
   */
  setDefaultStyle(style) {
    const validStyles = ["simple", "professional", "casual"];
    if (validStyles.includes(style)) {
      this.config.defaultStyle = style;
      this.saveConfig();
    }
  }

  /**
   * Set max tokens
   * @param {number} tokens - The maximum number of tokens
   */
  setMaxTokens(tokens) {
    if (typeof tokens === "number" && tokens > 0) {
      this.config.maxTokens = tokens;
      this.saveConfig();
    }
  }

  /**
   * Set temperature
   * @param {number} temperature - The temperature value (0-1)
   */
  setTemperature(temperature) {
    if (
      typeof temperature === "number" &&
      temperature >= 0 &&
      temperature <= 1
    ) {
      this.config.temperature = temperature;
      this.saveConfig();
    }
  }

  /**
   * Set OpenAI model
   * @param {string} model - The OpenAI model name
   */
  setOpenAIModel(model) {
    this.config.openaiModel = model;
    this.saveConfig();
  }

  /**
   * Set Anthropic model
   * @param {string} model - The Anthropic model name
   */
  setAnthropicModel(model) {
    this.config.anthropicModel = model;
    this.saveConfig();
  }

  /**
   * Get configuration
   * @returns {Object} - The current configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Reset configuration to defaults
   */
  reset() {
    this.config = {
      enabled: false,
      preferredProvider: "openai",
      defaultStyle: "simple",
      maxTokens: 500,
      temperature: 0.7,
      openaiModel: "gpt-3.5-turbo",
      anthropicModel: "claude-3-haiku-20240307",
    };

    this.saveConfig();
    this.setupApiKeys();
  }
}

// Create global AI environment
const aiEnvironment = new AIEnvironment();

// Export for debugging
if (window.DEV) {
  window.aiEnvironment = aiEnvironment;
}

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = { AIEnvironment };
}
