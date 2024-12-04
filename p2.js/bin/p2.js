#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const prompts = require('prompts');

async function init() {
  const questions = [
    {
      type: 'text',
      name: 'projectName',
      message: 'What is your project named?',
      initial: 'my-p2-app'
    },
    {
      type: 'select',
      name: 'styling',
      message: 'Choose your styling solution:',
      choices: [
        { title: 'TailwindCSS', value: 'tailwind' },
        { title: 'CSS Modules', value: 'css-modules' },
        { title: 'Styled Components', value: 'styled-components' }
      ],
      initial: 0
    },
    {
      type: 'select',
      name: 'stateManagement',
      message: 'Choose your state management solution:',
      choices: [
        { title: 'React Query', value: 'react-query' },
        { title: 'Redux Toolkit', value: 'redux' }
      ],
      initial: 0
    },
    {
      type: 'multiselect',
      name: 'features',
      message: 'Select additional features:',
      choices: [
        { title: 'Docker Setup', value: 'docker' },
        { title: 'PWA Support', value: 'pwa' },
        { title: 'API Routes', value: 'api-routes' },
        { title: 'Authentication', value: 'auth' }
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
    'src/server'
  ];

  dirs.forEach(dir => {
    fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
  });

  // Initialize package.json
  execSync('npm init -y', { cwd: projectPath });

  // Install core dependencies
  const coreDeps = [
    'react',
    'react-dom',
    'react-router-dom',
    'zod'
  ];

  // Install styling dependencies
  const stylingDeps = {
    tailwind: ['tailwindcss', 'postcss', 'autoprefixer'],
    'css-modules': [],
    'styled-components': ['styled-components']
  };

  // Install state management dependencies
  const stateDeps = {
    'react-query': ['@tanstack/react-query'],
    redux: ['@reduxjs/toolkit', 'react-redux']
  };

  // Install feature dependencies
  const featureDeps = {
    docker: [],
    pwa: ['workbox-webpack-plugin', 'webpack-pwa-manifest'],
    'api-routes': ['express'],
    auth: ['next-auth']
  };

  // Combine all dependencies
  const dependencies = [
    ...coreDeps,
    ...stylingDeps[response.styling],
    ...stateDeps[response.stateManagement],
    ...response.features.flatMap(feature => featureDeps[feature])
  ];

  console.log('Installing dependencies...');
  execSync(`npm install ${dependencies.join(' ')}`, { cwd: projectPath });

  // Install dev dependencies
  const devDependencies = [
    'typescript',
    '@types/react',
    '@types/react-dom',
    'vite',
    'vitest',
    '@testing-library/react',
    '@testing-library/jest-dom',
    'eslint',
    'prettier'
  ];

  console.log('Installing dev dependencies...');
  execSync(`npm install -D ${devDependencies.join(' ')}`, { cwd: projectPath });

  console.log('🎉 Project created successfully!');
  console.log(`\nNext steps:\n  cd ${response.projectName}\n  npm run dev`);
}

init().catch(console.error);
