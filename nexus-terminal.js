#!/usr/bin/env node

import { NexusLocalBackend } from './local-backend.js';
import { SVGGenerator } from './svg-gui.js';
import { APIRuntime } from './api-runtime.js';
import { SCXQ2 } from './scxq2-compressor.js';
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';

const program = new Command();

// ASCII Art & Banner
const BANNER = chalk.cyan(`
╔══════════════════════════════════════════════════════════╗
║                    NEXUS RUNTIME v1.0                    ║
║    SVG GUI • CLI • API • LOCAL-FIRST • ZERO-TRUST       ║
╚══════════════════════════════════════════════════════════╝
`);

console.log(BANNER);

// Global instances
let backend = null;
let svgGenerator = null;
let apiRuntime = null;

// Initialize system
async function initializeSystem() {
  const spinner = ora('Loading Nexus Runtime...').start();

  try {
    backend = new NexusLocalBackend();
    await backend.initialize();

    svgGenerator = new SVGGenerator();
    apiRuntime = new APIRuntime(backend);

    spinner.succeed('Nexus Runtime Ready');
    console.log(chalk.gray('  Local Database: ~/.nexus/'));
    console.log(chalk.gray(`  Current Project: ${process.cwd()}`));
  } catch (error) {
    spinner.fail('Initialization failed');
    console.error(chalk.red(`  Error: ${error.message}`));
    process.exit(1);
  }
}

// 1. FILE SYSTEM COMMANDS (Java JAR-like functionality)
program
  .command('fs <action>')
  .description('File system operations with SCXQ2 glyphs')
  .option('-g, --glyph <glyph>', 'Use glyph instead of path')
  .option('-o, --output <path>', 'Output path')
  .action(async (action, options) => {
    await initializeSystem();

    switch (action) {
      case 'index':
        await fsIndex(options);
        break;
      case 'ls':
        await fsList(options);
        break;
      case 'cat':
        await fsCat(options);
        break;
      case 'cp':
        await fsCopy(options);
        break;
      case 'mv':
        await fsMove(options);
        break;
      case 'rm':
        await fsRemove(options);
        break;
      case 'stat':
        await fsStat(options);
        break;
      default:
        console.log(chalk.red('Unknown fs action'));
    }
  });

// 2. SVG GUI GENERATION
program
  .command('svg <action>')
  .description('Generate SVG interfaces from code')
  .option('-t, --type <type>', 'Component type')
  .option('-p, --props <props>', 'Component properties')
  .option('-o, --output <file>', 'Output SVG file')
  .action(async (action, options) => {
    await initializeSystem();

    switch (action) {
      case 'component':
        await svgComponent(options);
        break;
      case 'dashboard':
        await svgDashboard(options);
        break;
      case 'form':
        await svgForm(options);
        break;
      case 'chart':
        await svgChart(options);
        break;
      case 'preview':
        await svgPreview(options);
        break;
      default:
        console.log(chalk.red('Unknown svg action'));
    }
  });

// 3. API RUNTIME COMMANDS
program
  .command('api <action>')
  .description('API runtime operations')
  .option('-e, --endpoint <url>', 'API endpoint')
  .option('-m, --method <method>', 'HTTP method')
  .option('-d, --data <json>', 'Request data')
  .option('-g, --glyph <glyph>', 'Use API glyph')
  .action(async (action, options) => {
    await initializeSystem();

    switch (action) {
      case 'call':
        await apiCall(options);
        break;
      case 'register':
        await apiRegister(options);
        break;
      case 'list':
        await apiList(options);
        break;
      case 'test':
        await apiTest(options);
        break;
      case 'mock':
        await apiMock(options);
        break;
      default:
        console.log(chalk.red('Unknown api action'));
    }
  });

// 4. BUILD & DEPLOY (JAR-like packaging)
program
  .command('build <target>')
  .description('Build project into deployable package')
  .option('-t, --type <type>', 'Build type (svg, web, cli, api)')
  .option('-o, --output <dir>', 'Output directory')
  .option('--minify', 'Minify output')
  .option('--bundle', 'Create single bundle file')
  .action(async (target, options) => {
    await initializeSystem();

    const spinner = ora(`Building ${target}...`).start();

    try {
      const result = await buildProject(target, options);
      spinner.succeed(`Built: ${result.output}`);

      if (result.stats) {
        console.log(chalk.gray(`  Files: ${result.stats.files}`));
        console.log(chalk.gray(`  Size: ${result.stats.size}`));
        console.log(chalk.gray(`  Glyphs: ${result.stats.glyphs}`));
      }
    } catch (error) {
      spinner.fail(`Build failed: ${error.message}`);
    }
  });

// 5. SERVE & DEV SERVER
program
  .command('serve')
  .description('Start development server with live reload')
  .option('-p, --port <port>', 'Port number', '61680')
  .option('--hot', 'Enable hot reload')
  .option('--api', 'Also start API server')
  .action(async (options) => {
    await initializeSystem();

    console.log(chalk.cyan('\n🌐 Starting Nexus Server...'));
    console.log(chalk.gray(`  Port: ${options.port}`));
    console.log(chalk.gray(`  Directory: ${process.cwd()}`));

    if (options.api) {
      await startAPIServer(options.port);
    }

    await startDevServer(options.port, options.hot);
  });

// 6. DATABASE COMMANDS (KUHUL IDB-QL)
program
  .command('db <action>')
  .description('Database operations with KUHUL syntax')
  .option('-q, --query <query>', 'KUHUL query')
  .option('-s, --schema <file>', 'Schema file')
  .action(async (action, options) => {
    await initializeSystem();

    switch (action) {
      case 'query':
        await dbQuery(options.query);
        break;
      case 'schema':
        await dbSchema(options.schema);
        break;
      case 'migrate':
        await dbMigrate();
        break;
      case 'backup':
        await dbBackup();
        break;
      case 'restore':
        await dbRestore();
        break;
      default:
        console.log(chalk.red('Unknown db action'));
    }
  });

// 7. GLYPH OPERATIONS (SCXQ2)
program
  .command('glyph <action>')
  .description('SCXQ2 glyph operations')
  .option('-p, --path <path>', 'File path to compress')
  .option('-g, --glyph <glyph>', 'Glyph to expand')
  .option('-l, --list', 'List all glyphs in project')
  .action(async (action, options) => {
    await initializeSystem();

    switch (action) {
      case 'compress':
        await glyphCompress(options.path);
        break;
      case 'expand':
        await glyphExpand(options.glyph);
        break;
      case 'list':
        await glyphList();
        break;
      case 'stats':
        await glyphStats();
        break;
      default:
        console.log(chalk.red('Unknown glyph action'));
    }
  });

// 8. AI/ML COMMANDS (With local API keys)
program
  .command('ai <prompt>')
  .description('AI operations using local API keys')
  .option('-m, --model <glyph>', 'Model glyph (⚡▣, ⚡◈, etc)', '⚡▣')
  .option('-s, --stream', 'Stream response')
  .option('--code', 'Generate code')
  .option('--svg', 'Generate SVG')
  .action(async (prompt, options) => {
    await initializeSystem();

    const spinner = ora('Thinking...').start();

    try {
      const result = await aiProcess(prompt, options);
      spinner.succeed('AI Response');

      if (options.svg) {
        // Save SVG output
        const svgFile = `ai_output_${Date.now()}.svg`;
        fs.writeFileSync(svgFile, result);
        console.log(chalk.green(`SVG saved: ${svgFile}`));

        // Preview in browser if possible
        if (process.env.BROWSER) {
          const open = (await import('open')).default;
          await open(svgFile);
        }
      } else if (options.code) {
        // Format and display code
        console.log(chalk.cyan(`\`\`\`${result.language}\n${result.code}\n\`\`\``));
      } else {
        console.log(chalk.white(result));
      }
    } catch (error) {
      spinner.fail(`AI Error: ${error.message}`);
    }
  });

// 9. WORKFLOW/PIPELINE COMMANDS
program
  .command('pipeline <name>')
  .description('Define and execute workflows')
  .option('-d, --define', 'Define new pipeline')
  .option('-r, --run', 'Run pipeline')
  .option('-l, --list', 'List pipelines')
  .action(async (name, options) => {
    await initializeSystem();

    if (options.define) {
      await definePipeline(name);
    } else if (options.run) {
      await runPipeline(name);
    } else if (options.list) {
      await listPipelines();
    }
  });

// 10. EXPORT/IMPORT (JAR-like distribution)
program
  .command('export <type>')
  .description('Export project for distribution')
  .option('-o, --output <file>', 'Output file')
  .option('--encrypt', 'Encrypt export')
  .option('--password <password>', 'Encryption password')
  .action(async (type, options) => {
    await initializeSystem();

    const spinner = ora(`Exporting ${type}...`).start();

    try {
      const result = await exportProject(type, options);
      spinner.succeed(`Exported: ${result.file}`);

      console.log(chalk.gray(`  Size: ${result.size}`));
      console.log(chalk.gray(`  Type: ${result.type}`));
      if (result.encrypted) {
        console.log(chalk.gray('  🔐 Encrypted'));
      }
    } catch (error) {
      spinner.fail(`Export failed: ${error.message}`);
    }
  });

program
  .command('import <file>')
  .description('Import project bundle')
  .option('--password <password>', 'Decryption password')
  .action(async (file, options) => {
    await initializeSystem();

    const spinner = ora('Importing...').start();

    try {
      const result = await importProject(file, options);
      spinner.succeed(`Imported: ${result.project}`);

      console.log(chalk.gray(`  Files: ${result.files}`));
      console.log(chalk.gray(`  Glyphs: ${result.glyphs}`));
    } catch (error) {
      spinner.fail(`Import failed: ${error.message}`);
    }
  });

// IMPLEMENTATION FUNCTIONS

async function fsIndex(options) {
  const spinner = ora('Indexing files with SCXQ2...').start();

  const result = await backend.indexProjectFiles(process.cwd());

  spinner.succeed(`Indexed ${result.indexed} files`);
  console.log(chalk.gray(`  Project: ${result.project.name}`));
  console.log(chalk.gray(`  Glyphs generated: ${result.indexed}`));
}

async function fsList(options) {
  const files = await backend.getAllFiles();

  console.log('\n📁 Project Files (SCXQ2 Glyphs):\n');

  files.forEach((file) => {
    const icon = file.type === 'directory' ? '📁' : '📄';
    const size = file.size ? chalk.gray(`(${formatBytes(file.size)})`) : '';

    console.log(`  ${icon} ${chalk.cyan(file.glyph)}  ${file.path} ${size}`);
  });

  console.log(chalk.gray(`\nTotal: ${files.length} files`));
}

async function fsCat(options) {
  if (!options.glyph) {
    console.log(chalk.red('Please specify --glyph'));
    return;
  }

  const content = await backend.getFileByGlyph(options.glyph);
  console.log(content);
}

async function svgComponent(options) {
  const props = options.props ? JSON.parse(options.props) : {};
  const svg = svgGenerator.createComponent(options.type, props);

  if (options.output) {
    fs.writeFileSync(options.output, svg);
    console.log(chalk.green(`SVG saved: ${options.output}`));
  } else {
    console.log(svg);
  }
}

async function svgDashboard(options) {
  const dashboard = await svgGenerator.createDashboard({
    title: 'Nexus Dashboard',
    components: [
      { type: 'stats', data: [10, 20, 30, 40] },
      { type: 'chart', data: { x: [1, 2, 3], y: [4, 5, 6] } },
      { type: 'table', data: [{ id: 1, name: 'Item' }] },
    ],
  });

  const outputFile = options.output || 'dashboard.svg';
  fs.writeFileSync(outputFile, dashboard);

  console.log(chalk.green(`Dashboard SVG: ${outputFile}`));
  console.log(chalk.gray('  Run: nexus svg preview --file dashboard.svg'));
}

async function apiCall(options) {
  if (options.glyph) {
    // Use glyph-based API call
    const result = await apiRuntime.callByGlyph(options.glyph, options.data);
    console.log(JSON.stringify(result, null, 2));
  } else if (options.endpoint) {
    // Direct API call
    const result = await apiRuntime.callDirect({
      endpoint: options.endpoint,
      method: options.method || 'GET',
      data: options.data ? JSON.parse(options.data) : null,
    });
    console.log(JSON.stringify(result, null, 2));
  }
}

async function buildProject(target, options) {
  const buildTypes = {
    svg: buildSVG,
    web: buildWeb,
    cli: buildCLI,
    api: buildAPI,
    bundle: buildBundle,
  };

  const builder = buildTypes[options.type || target] || buildWeb;
  return await builder(target, options);
}

async function buildWeb(target, options) {
  // Package as web app
  const outputDir = options.output || './dist';

  // Collect all files
  const files = await backend.getAllFiles();

  // Create dist structure
  fs.mkdirSync(outputDir, { recursive: true });

  // Copy and process files
  let processed = 0;

  for (const file of files) {
    if (file.type === 'file') {
      const content = await backend.getFileByGlyph(file.glyph);
      const outputPath = path.join(outputDir, file.path);

      // Ensure directory exists
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });

      // Write file
      fs.writeFileSync(outputPath, content.content);
      processed++;
    }
  }

  // Generate index.html if not exists
  if (!fs.existsSync(path.join(outputDir, 'index.html'))) {
    const indexHtml = generateIndexHTML(files);
    fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);
  }

  // Create package.json for web
  const packageJson = {
    name: path.basename(process.cwd()),
    version: '1.0.0',
    type: 'module',
    scripts: {
      start: 'serve -s .',
    },
  };

  fs.writeFileSync(
    path.join(outputDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  return {
    output: outputDir,
    stats: {
      files: processed,
      size: formatBytes(getDirSize(outputDir)),
      glyphs: files.length,
    },
  };
}

async function buildCLI(target, options) {
  // Package as CLI tool
  const outputFile = options.output || './dist/cli.js';

  // Generate CLI wrapper
  const cliCode = generateCLIWrapper();
  fs.writeFileSync(outputFile, cliCode);

  // Make executable
  fs.chmodSync(outputFile, '755');

  // Create package.json for CLI
  const packageJson = {
    name: path.basename(process.cwd()),
    version: '1.0.0',
    bin: {
      [path.basename(process.cwd())]: './cli.js',
    },
    dependencies: {
      commander: '^9.0.0',
      chalk: '^5.0.0',
    },
  };

  const outputDir = path.dirname(outputFile);
  fs.writeFileSync(
    path.join(outputDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  return {
    output: outputFile,
    stats: {
      files: 2,
      size: formatBytes(fs.statSync(outputFile).size),
      glyphs: 0,
    },
  };
}

async function startDevServer(port, hot) {
  const { createServer } = await import('vite');

  const server = await createServer({
    root: process.cwd(),
    server: {
      port: parseInt(port, 10),
      open: true,
    },
    plugins: hot ? [hotReloadPlugin()] : [],
  });

  await server.listen();

  console.log(chalk.green('\n✅ Server running at:'));
  console.log(chalk.cyan(`  http://localhost:${port}`));
  console.log(chalk.gray('\nPress Ctrl+C to stop\n'));

  // Keep alive
  process.on('SIGINT', () => {
    server.close();
    process.exit(0);
  });
}

async function startAPIServer(port) {
  const expressModule = await import('express');
  const app = expressModule.default();

  app.use(expressModule.json());

  // API routes
  app.get('/api/files', async (req, res) => {
    const files = await backend.getAllFiles();
    res.json(files);
  });

  app.get('/api/file/:glyph', async (req, res) => {
    try {
      const file = await backend.getFileByGlyph(req.params.glyph);
      res.json(file);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  app.post('/api/ai', async (req, res) => {
    // AI processing endpoint
    const result = await aiProcess(req.body.prompt, req.body.options);
    res.json({ result });
  });

  app.listen(port, () => {
    console.log(chalk.green(`API Server: http://localhost:${port}/api`));
  });
}

// Helper functions
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getDirSize(dir) {
  let size = 0;

  function traverse(current) {
    const items = fs.readdirSync(current);

    for (const item of items) {
      const itemPath = path.join(current, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        traverse(itemPath);
      } else {
        size += stat.size;
      }
    }
  }

  traverse(dir);
  return size;
}

// Main execution
program.parse();

// If no command, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
  console.log(
    `\n${boxen(
      `${chalk.yellow('💡 Quick Start:\n')}` +
        `${chalk.white('  nexus init          ')}${chalk.gray('# Initialize project\n')}` +
        `${chalk.white('  nexus fs index      ')}${chalk.gray('# Index files with SCXQ2\n')}` +
        `${chalk.white('  nexus svg dashboard ')}${chalk.gray('# Generate SVG dashboard\n')}` +
        `${chalk.white('  nexus serve         ')}${chalk.gray('# Start dev server\n')}` +
        `${chalk.white('  nexus build web     ')}${chalk.gray('# Build web app\n')}` +
        `${chalk.white('  nexus export bundle ')}${chalk.gray('# Create distributable\n')}`,
      { padding: 1, borderColor: 'cyan' }
    )}`
  );
}
