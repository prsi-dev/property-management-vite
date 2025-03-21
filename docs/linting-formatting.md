# Linting, Formatting, and Git Hooks

This document provides information about the linting, formatting, and git hooks setup in the Property Management System project.

## Table of Contents

1. [Overview](#overview)
2. [ESLint](#eslint)
3. [Prettier](#prettier)
4. [Husky & Git Hooks](#husky--git-hooks)
5. [Available Commands](#available-commands)

## Overview

The project uses the following tools for code quality and consistency:

- **ESLint**: For static code analysis to catch potential errors and enforce coding standards
- **Prettier**: For consistent code formatting
- **Husky**: For Git hooks to enforce checks before commits
- **lint-staged**: To run linters against staged Git files
- **commitlint**: To enforce conventional commit message format

## ESLint

ESLint is configured with rules tailored for React and TypeScript development.

Key configuration includes:

- React and React Hooks plugin rules
- TypeScript-specific rules
- Integration with Prettier

Configuration file: `.eslintrc.json`
Ignored files/directories: `.eslintignore`

## Prettier

Prettier ensures consistent code formatting across the project.

Key configuration options:

- Single quotes
- Semi-colons required
- Tab width of 2 spaces
- 100 character print width
- Trailing commas in ES5 mode
- Integration with Tailwind CSS (via prettier-plugin-tailwindcss)

Configuration file: `.prettierrc`
Ignored files/directories: `.prettierignore`

## Husky & Git Hooks

Husky is used to set up Git hooks for the project:

### pre-commit

The pre-commit hook runs lint-staged to:

- Check and fix ESLint issues
- Format code with Prettier

This ensures that all committed code follows project standards.

### commit-msg

The commit-msg hook uses commitlint to enforce the [Conventional Commits](https://www.conventionalcommits.org/) format.

Valid commit types:

- `build`: Changes to the build system or dependencies
- `chore`: Regular maintenance tasks
- `ci`: Changes to CI configuration files
- `docs`: Documentation changes
- `feat`: New features
- `fix`: Bug fixes
- `perf`: Performance improvements
- `refactor`: Code changes that neither fix bugs nor add features
- `revert`: Reverting previous commits
- `style`: Changes to code style (whitespace, formatting)
- `test`: Adding or fixing tests

Format: `<type>: <description>`

Example: `feat: add user authentication`

## Available Commands

Run these commands from the project root:

```bash
# Lint code
npm run lint

# Lint and fix issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## VS Code Integration

For the best development experience, install these VS Code extensions:

- ESLint
- Prettier - Code formatter

Recommended VS Code settings (`settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```
