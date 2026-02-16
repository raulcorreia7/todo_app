# Contributing

Thank you for your interest in contributing to Luxury Todo!

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```
4. Start the dev server:
   ```bash
   pnpm run dev
   ```

## Code Style

- TypeScript for all code
- SolidJS patterns for reactivity
- Use the `@/` alias for imports from `src/`
- Run `pnpm run format` before committing
- Run `pnpm run lint` and fix any issues

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance

Examples:
```
feat(tasks): add priority levels
fix(ai): handle empty task description
docs(readme): update setup instructions
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run checks:
   ```bash
   pnpm run typecheck
   pnpm run lint
   pnpm run test
   ```
4. Push and create a pull request
5. Ensure CI passes
6. Request review

## Testing

- Write unit tests for new features
- Update existing tests if needed
- Maintain or improve coverage

Thank you for contributing!
