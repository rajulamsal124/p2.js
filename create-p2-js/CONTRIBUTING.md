# Contributing to P2.js

We love your input! We want to make contributing to P2.js as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/p2-js.git

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test
```

## Testing

We use several testing tools:

- Unit Tests: Vitest
- Integration Tests: Playwright
- E2E Tests: TestContainers
- Performance Tests: k6

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm test:perf
```

## Pull Request Process

1. Update the README.md with details of changes to the interface
2. Update the documentation with details of any new features
3. The PR will be merged once you have the sign-off of two other developers

## Code Style

- Use TypeScript
- Follow the existing code style
- Use meaningful variable names
- Write descriptive commit messages
- Add comments for complex logic

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
