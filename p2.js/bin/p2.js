#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import prompts from 'prompts';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function init() {
  const questions = [
    {
      type: 'text',
      name: 'projectName',
      message: 'What is your project named?',
      initial: 'my-p2-app',
      validate: value => {
        if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
          return 'Project name can only include letters, numbers, underscores and hashes';
        }
        return true;
      }
    },
    {
      type: 'select',
      name: 'language',
      message: 'Select the language you want to use:',
      choices: [
        { title: 'TypeScript', value: 'typescript', description: 'Recommended for type safety' },
        { title: 'JavaScript', value: 'javascript', description: 'Plain JavaScript project' }
      ],
      initial: 0
    },
    {
      type: 'select',
      name: 'styling',
      message: 'Choose your styling solution:',
      choices: [
        { title: 'TailwindCSS', value: 'tailwind', description: 'Utility-first CSS framework' },
        { title: 'CSS Modules', value: 'css-modules', description: 'Scoped CSS with modules' },
        { title: 'Styled Components', value: 'styled-components', description: 'CSS-in-JS solution' },
        { title: 'Emotion', value: 'emotion', description: 'CSS-in-JS with high performance' },
        { title: 'Vanilla CSS', value: 'vanilla', description: 'Plain CSS with PostCSS' }
      ],
      initial: 0
    },
    {
      type: 'select',
      name: 'stateManagement',
      message: 'Choose your state management solution:',
      choices: [
        { title: 'React Query + Zustand', value: 'react-query-zustand', description: 'Server + Client state management' },
        { title: 'Redux Toolkit', value: 'redux', description: 'Powerful state management with Redux' },
        { title: 'Context + Hooks', value: 'context', description: 'React built-in state management' },
        { title: 'Jotai', value: 'jotai', description: 'Atomic state management' }
      ],
      initial: 0
    },
    {
      type: 'multiselect',
      name: 'routing',
      message: 'Select routing features:',
      choices: [
        { title: 'React Router', value: 'react-router', description: 'Client-side routing' },
        { title: 'Protected Routes', value: 'protected-routes', description: 'Authentication-based routing' },
        { title: 'Layouts System', value: 'layouts', description: 'Nested layouts support' }
      ],
      min: 1
    },
    {
      type: 'multiselect',
      name: 'features',
      message: 'Select additional features:',
      choices: [
        { title: 'Import Aliases', value: 'import-aliases', description: 'Clean imports with @ alias' },
        { title: 'API Integration', value: 'api', description: 'Axios + API interceptors setup' },
        { title: 'Form Handling', value: 'forms', description: 'React Hook Form + Zod validation' },
        { title: 'Authentication', value: 'auth', description: 'JWT authentication setup' },
        { title: 'Error Boundary', value: 'error-boundary', description: 'Global error handling' },
        { title: 'SEO', value: 'seo', description: 'React Helmet for SEO' },
        { title: 'PWA Support', value: 'pwa', description: 'Progressive Web App setup' },
        { title: 'Internationalization', value: 'i18n', description: 'Multi-language support' }
      ]
    },
    {
      type: 'multiselect',
      name: 'devtools',
      message: 'Select development tools:',
      choices: [
        { title: 'ESLint', value: 'eslint', description: 'Code linting' },
        { title: 'Prettier', value: 'prettier', description: 'Code formatting' },
        { title: 'Husky', value: 'husky', description: 'Git hooks' },
        { title: 'Jest', value: 'jest', description: 'Testing framework' },
        { title: 'Cypress', value: 'cypress', description: 'E2E testing' },
        { title: 'Storybook', value: 'storybook', description: 'Component documentation' }
      ],
      initial: [0, 1]
    },
    {
      type: 'multiselect',
      name: 'deployment',
      message: 'Select deployment options:',
      choices: [
        { title: 'Docker', value: 'docker', description: 'Containerization support' },
        { title: 'CI/CD', value: 'ci-cd', description: 'GitHub Actions workflow' },
        { title: 'Environment Setup', value: 'env', description: '.env file configuration' }
      ]
    }
  ];

  const response = await prompts(questions);
  
  // Create project directory
  const projectPath = path.join(process.cwd(), response.projectName);
  fs.mkdirSync(projectPath, { recursive: true });

  // Create project structure
  const dirs = [
    'src/components/ui',
    'src/components/features',
    'src/components/layouts',
    'src/pages',
    'src/hooks',
    'src/utils',
    'src/styles',
    'src/types',
    'src/lib',
    'src/config',
    'src/api',
    'src/store',
    'src/assets',
    'src/constants',
    response.features.includes('i18n') ? 'src/locales' : null,
    response.features.includes('api') ? 'src/services' : null,
  ].filter(Boolean);

  dirs.forEach(dir => {
    fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
  });

  // Initialize package.json
  execSync('npm init -y', { cwd: projectPath });

  // Core dependencies based on language choice
  const coreDeps = [
    'react',
    'react-dom',
    response.language === 'typescript' ? 'typescript' : null,
  ].filter(Boolean);

  // Styling dependencies
  const stylingDeps = {
    tailwind: ['tailwindcss', 'postcss', 'autoprefixer'],
    'css-modules': [],
    'styled-components': ['styled-components'],
    'emotion': ['@emotion/react', '@emotion/styled'],
    'vanilla': ['postcss']
  };

  // State management dependencies
  const stateDeps = {
    'react-query-zustand': ['@tanstack/react-query', 'zustand'],
    'redux': ['@reduxjs/toolkit', 'react-redux'],
    'context': [],
    'jotai': ['jotai']
  };

  // Routing dependencies
  const routingDeps = response.routing.map(route => {
    if (route === 'react-router') return 'react-router-dom';
    return null;
  }).filter(Boolean);

  // Feature dependencies
  const featureDeps = [];
  if (response.features.includes('forms')) featureDeps.push('react-hook-form', 'zod');
  if (response.features.includes('api')) featureDeps.push('axios');
  if (response.features.includes('seo')) featureDeps.push('react-helmet');
  if (response.features.includes('i18n')) featureDeps.push('react-i18next', 'i18next');

  // Dev dependencies
  const devDeps = [];
  if (response.devtools.includes('eslint')) devDeps.push('eslint');
  if (response.devtools.includes('prettier')) devDeps.push('prettier');
  if (response.devtools.includes('husky')) devDeps.push('husky', 'lint-staged');
  if (response.devtools.includes('jest')) devDeps.push('jest', '@testing-library/react');
  if (response.devtools.includes('cypress')) devDeps.push('cypress');
  if (response.devtools.includes('storybook')) devDeps.push('@storybook/react');

  // Combine all dependencies
  const dependencies = [
    ...coreDeps,
    ...stylingDeps[response.styling],
    ...stateDeps[response.stateManagement],
    ...routingDeps,
    ...featureDeps
  ];

  console.log('Installing dependencies...');
  execSync(`npm install ${dependencies.join(' ')}`, { cwd: projectPath });

  // Install dev dependencies
  const devDependencies = [
    ...devDeps,
    'vite',
    '@vitejs/plugin-react',
    response.language === 'typescript' ? '@types/react' : null,
    response.language === 'typescript' ? '@types/react-dom' : null,
  ].filter(Boolean);

  console.log('Installing dev dependencies...');
  execSync(`npm install -D ${devDependencies.join(' ')}`, { cwd: projectPath });

  // Create configuration files based on choices
  if (response.features.includes('import-aliases')) {
    const tsconfigContent = {
      compilerOptions: {
        baseUrl: ".",
        paths: {
          "@/*": ["src/*"]
        }
      }
    };
    fs.writeFileSync(
      path.join(projectPath, 'tsconfig.json'),
      JSON.stringify(tsconfigContent, null, 2)
    );
  }

  // Setup environment files if selected
  if (response.deployment.includes('env')) {
    fs.writeFileSync(path.join(projectPath, '.env.example'), '');
    fs.writeFileSync(path.join(projectPath, '.env'), '');
  }

  // Create Docker files if selected
  if (response.deployment.includes('docker')) {
    fs.writeFileSync(path.join(projectPath, 'Dockerfile'), '');
    fs.writeFileSync(path.join(projectPath, '.dockerignore'), '');
  }

  console.log('🎉 Project created successfully!');
  console.log(`\nNext steps:\n  cd ${response.projectName}\n  npm run dev`);
}

init().catch(console.error);
