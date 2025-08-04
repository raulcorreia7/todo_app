# Luxury Todo App

A premium todo application with AI-powered text refactoring, glass-morphism design, and modern UI/UX.

## Features

- **AI Text Refactoring**: Enhance your task titles and descriptions with AI-powered suggestions
- **Glass-morphism Design**: Modern, premium visual design with blur effects and transparency
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Task Management**: Create, edit, complete, and delete tasks with intuitive controls
- **Theme System**: Multiple color themes to personalize your experience
- **Statistics**: Track your productivity with visual progress indicators
- **Gamification**: Achievements and rewards to motivate task completion
- **Sound Effects**: Premium audio feedback for interactions
- **Keyboard Shortcuts**: Efficient keyboard navigation for power users

## AI Integration

The app includes a simple HTTP-based AI provider system that supports multiple AI services through standard API calls:

### Supported AI Providers

1. **OpenAI GPT-3.5/GPT-4**
   - Requires API key from OpenAI
   - High-quality text generation

2. **Generic HTTP API**
   - Works with any AI service that has a REST API
   - Customizable request/response handling

3. **Simple Rule-based Provider**
   - Built-in text improvements
   - No external dependencies
   - Always available

### Setting Up AI Providers

To use AI refactoring, you need to configure your preferred provider:

1. **For OpenAI**:
   ```javascript
   // Add this to your app initialization
   AIProviders.aiProviderFactory.registerProvider('openai', new AIProviders.OpenAIProvider({
     apiKey: 'your-openai-api-key'
   }));
   ```

2. **For Custom API**:
   ```javascript
   AIProviders.aiProviderFactory.registerProvider('custom', new AIProviders.GenericHTTPProvider({
     apiEndpoint: 'https://your-api-endpoint.com/refactor',
     apiKey: 'your-api-key', // optional
     preparePayload: (text, type, options) => {
       return {
         text: text,
         type: type,
         // your custom payload structure
       };
     },
     extractResponse: (data) => {
       // Extract the refactored text from your API's response
       return data.refactoredText;
     }
   }));
   ```

### Using AI Refactoring

1. Click the edit button on any task
2. Click the AI refactor icon (diamond shape) next to the title or description
3. The app will send your text to the configured AI provider
4. The refactored text will automatically replace your original text

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/luxury-todo-app.git
   cd luxury-todo-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:8080`

## Project Structure

```
luxury-todo-app/
├── index.html              # Main HTML file
├── styles/                 # CSS styles
│   ├── luxury-base.css     # Base styles and variables
│   ├── luxury-components.css # Component styles
│   ├── luxury-responsive.css # Responsive styles
│   └── ...
├── js/                     # JavaScript files
│   ├── app.js              # Main application logic
│   ├── ai-providers.js     # AI provider implementations
│   ├── storage.js          # Local storage management
│   ├── themes.js           # Theme management
│   └── ...
├── scripts/                # Utility scripts
├── test/                   # Test files
└── README.md               # This file
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Lucide Icons](https://lucide.dev/) for the beautiful icon set
- [Glassmorphism](https://github.com/creativetimofficial/tailwind-glassmorphism) design inspiration

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.
