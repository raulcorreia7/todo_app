/**
 * AI Providers Module
 * Handles different AI service providers for text refactoring
 */

class AIProviders {
  constructor() {
    this.providers = {
      openai: null,
      anthropic: null
    };
    
    this.initialize();
  }

  /**
   * Initialize AI providers
   */
  initialize() {
    // Check if AI features are enabled
    if (!window.AI_CONFIG || !window.AI_CONFIG.enabled) {
      console.warn('AI features are disabled');
      return;
    }

    // Initialize available providers based on API keys
    if (window.OPENAI_API_KEY && window.OPENAI_API_KEY.trim() !== '') {
      this.providers.openai = new OpenAIProvider();
    }

    if (window.ANTHROPIC_API_KEY && window.ANTHROPIC_API_KEY.trim() !== '') {
      this.providers.anthropic = new AnthropicProvider();
    }
  }

  /**
   * Get the appropriate AI provider based on configuration
   * @returns {Object|null} - The AI provider instance
   */
  getProvider() {
    // Check if we have a preferred provider
    if (window.AI_CONFIG && window.AI_CONFIG.preferredProvider) {
      const preferred = window.AI_CONFIG.preferredProvider.toLowerCase();
      if (this.providers[preferred]) {
        return this.providers[preferred];
      }
    }

    // Fall back to the first available provider
    for (const key in this.providers) {
      if (this.providers[key]) {
        return this.providers[key];
      }
    }

    return null;
  }

  /**
   * Refactor text using the configured AI provider
   * @param {string} text - The text to refactor
   * @param {string} style - The refactoring style
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - The refactored text
   */
  async refactorText(text, style = 'simple', options = {}) {
    const provider = this.getProvider();
    
    if (!provider) {
      console.warn('No AI provider available');
      return this.fallbackRefactor(text);
    }

    try {
      return await provider.refactorText(text, style, options);
    } catch (error) {
      console.error('AI refactor error:', error);
      return this.fallbackRefactor(text);
    }
  }

  /**
   * Fallback refactoring method when AI is unavailable
   * @param {string} text - The text to refactor
   * @returns {string} - The refactored text
   */
  fallbackRefactor(text) {
    // Simple improvements that don't require AI
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Check if AI features are available
   * @returns {boolean} - True if AI features are available
   */
  isAvailable() {
    return this.getProvider() !== null;
  }
}

/**
 * OpenAI Provider Implementation
 */
class OpenAIProvider {
  constructor() {
    this.apiKey = window.OPENAI_API_KEY;
    this.model = window.AI_CONFIG?.openaiModel || 'gpt-3.5-turbo';
    this.baseUrl = window.AI_CONFIG?.openaiBaseUrl || 'https://api.openai.com/v1';
  }

  /**
   * Refactor text using OpenAI API
   * @param {string} text - The text to refactor
   * @param {string} style - The refactoring style
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - The refactored text
   */
  async refactorText(text, style = 'simple', options = {}) {
    const prompt = this.buildPrompt(text, style, options);
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that refactors text to improve clarity, grammar, and style.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  /**
   * Build the prompt for text refactoring
   * @param {string} text - The text to refactor
   * @param {string} style - The refactoring style
   * @param {Object} options - Additional options
   * @returns {string} - The constructed prompt
   */
  buildPrompt(text, style, options) {
    const type = options.type || 'general';
    let instructions = '';

    switch (type) {
      case 'title':
        instructions = 'Refactor the following task title to be more clear, concise, and impactful. ';
        break;
      case 'description':
        instructions = 'Refactor the following task description to improve clarity, grammar, and readability. ';
        break;
      default:
        instructions = 'Refactor the following text to improve clarity, grammar, and style. ';
    }

    switch (style) {
      case 'simple':
        instructions += 'Make minor improvements to grammar, spelling, and clarity.';
        break;
      case 'professional':
        instructions += 'Make the text more professional and formal.';
        break;
      case 'casual':
        instructions += 'Make the text more casual and conversational.';
        break;
      default:
        instructions += 'Make the text clearer and more concise.';
    }

    return `${instructions}\n\nText to refactor:\n${text}`;
  }
}

/**
 * Anthropic Provider Implementation
 */
class AnthropicProvider {
  constructor() {
    this.apiKey = window.ANTHROPIC_API_KEY;
    this.model = window.AI_CONFIG?.anthropicModel || 'claude-3-haiku-20240307';
    this.baseUrl = window.AI_CONFIG?.anthropicBaseUrl || 'https://api.anthropic.com';
  }

  /**
   * Refactor text using Anthropic API
   * @param {string} text - The text to refactor
   * @param {string} style - The refactoring style
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - The refactored text
   */
  async refactorText(text, style = 'simple', options = {}) {
    const prompt = this.buildPrompt(text, style, options);
    
    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text.trim();
  }

  /**
   * Build the prompt for text refactoring
   * @param {string} text - The text to refactor
   * @param {string} style - The refactoring style
   * @param {Object} options - Additional options
   * @returns {string} - The constructed prompt
   */
  buildPrompt(text, style, options) {
    const type = options.type || 'general';
    let instructions = '';

    switch (type) {
      case 'title':
        instructions = 'Refactor the following task title to be more clear, concise, and impactful. ';
        break;
      case 'description':
        instructions = 'Refactor the following task description to improve clarity, grammar, and readability. ';
        break;
      default:
        instructions = 'Refactor the following text to improve clarity, grammar, and style. ';
    }

    switch (style) {
      case 'simple':
        instructions += 'Make minor improvements to grammar, spelling, and clarity.';
        break;
      case 'professional':
        instructions += 'Make the text more professional and formal.';
        break;
      case 'casual':
        instructions += 'Make the text more casual and conversational.';
        break;
      default:
        instructions += 'Make the text clearer and more concise.';
    }

    return `${instructions}\n\nText to refactor:\n${text}`;
  }
}

// Create global AI provider factory
const aiProviders = new AIProviders();

// Export for debugging
if (window.DEV) {
  window.AIProviders = aiProviders;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIProviders: aiProviders, OpenAIProvider, AnthropicProvider };
}
