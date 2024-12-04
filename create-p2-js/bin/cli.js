#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_DIR = path.resolve(__dirname, '../template');

const UI_FRAMEWORKS = {
  TAILWIND: 'tailwind',
  CHAKRA: 'chakra-ui',
  STYLED: 'styled-components',
  MUI: 'material-ui'
};

const UI_DEPENDENCIES = {
  [UI_FRAMEWORKS.TAILWIND]: {
    dependencies: [],
    devDependencies: ['tailwindcss', 'postcss', 'autoprefixer']
  },
  [UI_FRAMEWORKS.CHAKRA]: {
    dependencies: ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion']
  },
  [UI_FRAMEWORKS.STYLED]: {
    dependencies: ['styled-components'],
    devDependencies: ['@types/styled-components']
  },
  [UI_FRAMEWORKS.MUI]: {
    dependencies: ['@mui/material', '@emotion/react', '@emotion/styled', '@mui/icons-material']
  }
};

const FEATURES = {
  SSR: 'ssr',
  API_ROUTES: 'api-routes',
  PWA: 'pwa',
  TESTING: 'testing'
};

async function createProject(projectName, options) {
  const spinner = ora('Creating your P2.js project...').start();

  try {
    if (!projectName) {
      spinner.fail('Project name is required');
      process.exit(1);
    }

    const targetDir = path.resolve(process.cwd(), projectName);

    if (fs.existsSync(targetDir)) {
      spinner.fail(`Directory ${projectName} already exists`);
      process.exit(1);
    }

    // Copy template to target directory
    await fs.copy(TEMPLATE_DIR, targetDir);

    // Read package.json
    const packageJsonPath = path.join(targetDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    // Update package name
    packageJson.name = projectName;

    // Add UI framework
    const uiFramework = options.uiFramework;
    if (uiFramework && UI_DEPENDENCIES[uiFramework]) {
      spinner.text = `Adding ${uiFramework} dependencies...`;
      const { dependencies = [], devDependencies = [] } = UI_DEPENDENCIES[uiFramework];
      
      dependencies.forEach(dep => {
        packageJson.dependencies[dep] = "latest";
      });
      
      devDependencies.forEach(dep => {
        if (!packageJson.devDependencies) {
          packageJson.devDependencies = {};
        }
        packageJson.devDependencies[dep] = "latest";
      });
    }

    // Add selected features
    if (options.features) {
      spinner.text = 'Configuring selected features...';
      
      if (options.features.includes(FEATURES.PWA)) {
        packageJson.dependencies['workbox-window'] = 'latest';
        packageJson.devDependencies['vite-plugin-pwa'] = 'latest';
      }

      if (options.features.includes(FEATURES.TESTING)) {
        packageJson.devDependencies['@testing-library/react'] = 'latest';
        packageJson.devDependencies['@testing-library/jest-dom'] = 'latest';
      }
    }

    // Write updated package.json
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    // Handle Tailwind setup if selected
    if (uiFramework === UI_FRAMEWORKS.TAILWIND) {
      spinner.text = 'Setting up Tailwind CSS...';
      await setupTailwind(targetDir);
    }

    spinner.succeed(chalk.green(`Successfully created ${projectName} with P2.js`));
    
    console.log('\nNext steps:');
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan('  npm install'));
    console.log(chalk.cyan('  npm run dev'));
    
    // Additional instructions based on features
    if (options.features?.includes(FEATURES.SSR)) {
      console.log(chalk.cyan('\nTo build for SSR:'));
      console.log(chalk.cyan('  npm run build:ssr'));
      console.log(chalk.cyan('  npm run serve'));
    }

  } catch (error) {
    spinner.fail('Failed to create project');
    console.error(chalk.red(error));
    process.exit(1);
  }
}

async function setupTailwind(targetDir) {
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
  
  await fs.writeFile(path.join(targetDir, 'tailwind.config.js'), tailwindConfig);

  const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
  
  await fs.writeFile(path.join(targetDir, 'postcss.config.js'), postcssConfig);

  const indexCssPath = path.join(targetDir, 'src', 'index.css');
  const tailwindCss = `@tailwind base;
@tailwind components;
@tailwind utilities;`;
  
  await fs.writeFile(indexCssPath, tailwindCss);
}

program
  .name('create-p2-js')
  .description('Create a new P2.js project - A high-performance React framework')
  .argument('[project-name]', 'Name of your project')
  .action(async (projectName) => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is your project named?',
        default: 'my-p2-app',
        when: !projectName
      },
      {
        type: 'list',
        name: 'uiFramework',
        message: 'Which UI framework would you like to use?',
        choices: [
          { name: 'Tailwind CSS', value: UI_FRAMEWORKS.TAILWIND },
          { name: 'Chakra UI', value: UI_FRAMEWORKS.CHAKRA },
          { name: 'Styled Components', value: UI_FRAMEWORKS.STYLED },
          { name: 'Material UI', value: UI_FRAMEWORKS.MUI }
        ]
      },
      {
        type: 'checkbox',
        name: 'features',
        message: 'Select additional features:',
        choices: [
          { name: 'Server-Side Rendering (SSR)', value: FEATURES.SSR },
          { name: 'API Routes', value: FEATURES.API_ROUTES },
          { name: 'Progressive Web App (PWA)', value: FEATURES.PWA },
          { name: 'Testing Setup', value: FEATURES.TESTING }
        ]
      }
    ]);

    createProject(projectName || answers.projectName, {
      uiFramework: answers.uiFramework,
      features: answers.features
    });
  });

program.parse();
