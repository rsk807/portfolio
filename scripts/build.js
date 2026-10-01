#!/usr/bin/env node

/**
 * =============================================================================
 * SUSHANT KUMAR PORTFOLIO - MODULAR BUILD COMPILER
 * =============================================================================
 * Zero-dependency Node.js build system.
 * 
 * Pipeline:
 *  1. CSS Bundler:
 *     - Concatenates 11 modular CSS files in topological dependency order.
 *     - Hoists @import rules to the top of stylesheet for CSS standards compliance.
 *     - Emits 'css/bundle.css'.
 *     - Minifies stylesheet and emits 'css/bundle.min.css'.
 *  2. HTML Assembler:
 *     - Reads 'src/components/head.html'.
 *     - Reads 'src/components/schema.jsonld' and injects JSON-LD Knowledge Graph into head.
 *     - Reads UI frame components (loader, spine-nav, header, drawer-nav, binder-open).
 *     - Reads chapters 00 through 08 in strict sequential order.
 *     - Reads closing components (footer, binder-close, lightbox).
 *     - Assembles and emits root 'index.html'.
 *  3. Structural Validator:
 *     - Audits every internal anchor (#hash) across HTML links and Schema definitions.
 *     - Verifies exact matching DOM element IDs exist in the assembled output.
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');

// Resolve project root directory relative to this script
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const COMP_DIR = path.join(SRC_DIR, 'components');
const CHAP_DIR = path.join(SRC_DIR, 'chapters');
const CSS_DIR = path.join(ROOT_DIR, 'css');

console.log('====================================================');
console.log('⚡ Sushant Kumar Portfolio - Build Compiler v2026.1');
console.log('====================================================');
console.log(`Root Directory: ${ROOT_DIR}\n`);

// -----------------------------------------------------------------------------
// STEP 1: CSS BUNDLE & MINIFICATION
// -----------------------------------------------------------------------------
console.log('📦 [Step 1/3] Bundling and minifying stylesheets...');

const CSS_MODULES = [
  'variables.css',
  'base.css',
  'components.css',
  'cover.css',
  'navigation.css',
  'engineer.css',
  'case-files.css',
  'chapters.css',
  'blueprint-viewer.css',
  'beyond-engineering.css',
  'music-archive.css'
];

const hoistedImports = [];
const bundledSections = [];

CSS_MODULES.forEach(fileName => {
  const filePath = path.join(CSS_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: Required CSS module not found: ${filePath}`);
    process.exit(1);
  }

  const rawCss = fs.readFileSync(filePath, 'utf8');
  const lines = rawCss.split('\n');
  const cleanLines = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('@import')) {
      if (!hoistedImports.includes(trimmed)) {
        hoistedImports.push(trimmed);
      }
    } else {
      cleanLines.push(line);
    }
  });

  bundledSections.push(
    `/* ==========================================================================\n` +
    `   MODULE: ${fileName}\n` +
    `   ========================================================================== */\n` +
    cleanLines.join('\n').trim()
  );
});

// Construct unminified bundled CSS
const bundleCssContent = [
  '/*',
  ' * UNIFIED DESIGN SYSTEM BUNDLE - "AN ENGINEER\'S RESEARCH NOTEBOOK"',
  ' * Automatically compiled by scripts/build.js. Do not edit directly.',
  ' */',
  '',
  ...hoistedImports,
  '',
  ...bundledSections,
  ''
].join('\n');

const bundleCssPath = path.join(CSS_DIR, 'bundle.css');
fs.writeFileSync(bundleCssPath, bundleCssContent, 'utf8');
console.log(`  ✓ Created unminified bundle: css/bundle.css (${bundleCssContent.length.toLocaleString()} bytes)`);

/**
 * Pure Node.js CSS Minifier (Zero dependencies)
 * Removes comments, preserves @imports, collapses whitespace, cleans rules.
 */
function minifyCss(css) {
  // 1. Extract @import statements to prevent regex distortion
  const imports = [];
  let minified = css.replace(/@import\s+url\([^)]+\)[^;]*;/gi, match => {
    if (!imports.includes(match.trim())) {
      imports.push(match.trim());
    }
    return '';
  });

  // 2. Remove standard CSS comments /* ... */
  minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');

  // 3. Normalize whitespace around CSS delimiters
  minified = minified
    .replace(/\s+/g, ' ')
    .replace(/\s*([\{\}\:\;\,>~])\s*/g, '$1')
    .replace(/\;}/g, '}')
    .trim();

  // 4. Prepend hoisted @import statements
  const prefix = imports.length > 0 ? imports.join('\n') + '\n' : '';
  return prefix + minified;
}

const bundleMinCssContent = minifyCss(bundleCssContent);
const bundleMinCssPath = path.join(CSS_DIR, 'bundle.min.css');
fs.writeFileSync(bundleMinCssPath, bundleMinCssContent, 'utf8');
const savingsPct = Math.round((1 - bundleMinCssContent.length / bundleCssContent.length) * 100);
console.log(`  ✓ Created minified bundle: css/bundle.min.css (${bundleMinCssContent.length.toLocaleString()} bytes, -${savingsPct}%)\n`);

// -----------------------------------------------------------------------------
// STEP 2: HTML MODULAR ASSEMBLY
// -----------------------------------------------------------------------------
console.log('🔨 [Step 2/3] Assembling HTML components and chapters...');

// 2A. Load Schema if present
const schemaPath = path.join(COMP_DIR, 'schema.jsonld');
let schemaTag = '';
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8').trim();
  schemaTag = [
    '  <!-- JSON-LD Comprehensive Knowledge Graph (SEO + AEO + GEO Optimization) -->',
    '  <script type="application/ld+json">',
    schemaContent,
    '  </script>'
  ].join('\n');
  console.log(`  ✓ Ingested SEO Knowledge Graph from src/components/schema.jsonld (${schemaContent.length.toLocaleString()} bytes)`);
} else {
  console.warn('  ⚠️ Notice: src/components/schema.jsonld not found. Skipping schema injection.');
}

// 2B. Read head.html and inject schema
const headPath = path.join(COMP_DIR, 'head.html');
if (!fs.existsSync(headPath)) {
  console.error(`❌ Error: Missing head component: ${headPath}`);
  process.exit(1);
}

let headHtml = fs.readFileSync(headPath, 'utf8');
if (headHtml.includes('<!-- SCHEMA_PLACEHOLDER -->')) {
  headHtml = headHtml.replace('<!-- SCHEMA_PLACEHOLDER -->', schemaTag);
} else if (schemaTag) {
  headHtml = headHtml.replace('</head>', `${schemaTag}\n</head>`);
}

// 2C. Sequence of components and chapters to assemble
const ASSEMBLY_MANIFEST = [
  { type: 'component', dir: COMP_DIR, file: 'loader.html' },
  { type: 'component', dir: COMP_DIR, file: 'spine-nav.html' },
  { type: 'component', dir: COMP_DIR, file: 'header.html' },
  { type: 'component', dir: COMP_DIR, file: 'drawer-nav.html' },
  { type: 'component', dir: COMP_DIR, file: 'binder-open.html' },
  { type: 'chapter',   dir: CHAP_DIR, file: '00-cover.html' },
  { type: 'chapter',   dir: CHAP_DIR, file: '01-engineer.html' },
  { type: 'chapter',   dir: CHAP_DIR, file: '02-beyond-eng.html' },
  { type: 'chapter',   dir: CHAP_DIR, file: '03-case-files.html' },
  { type: 'chapter',   dir: CHAP_DIR, file: '04-research.html' },
  { type: 'chapter',   dir: CHAP_DIR, file: '05-experience.html' },
  { type: 'chapter',   dir: CHAP_DIR, file: '06-expertise.html' },
  { type: 'chapter',   dir: CHAP_DIR, file: '07-recognition.html' },
  { type: 'chapter',   dir: CHAP_DIR, file: '08-contact.html' },
  { type: 'component', dir: COMP_DIR, file: 'footer.html' },
  { type: 'component', dir: COMP_DIR, file: 'binder-close.html' },
  { type: 'component', dir: COMP_DIR, file: 'lightbox.html' }
];

const assembledFragments = [headHtml];

ASSEMBLY_MANIFEST.forEach(entry => {
  const filePath = path.join(entry.dir, entry.file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: Required assembly file missing: ${filePath}`);
    process.exit(1);
  }
  const fileContent = fs.readFileSync(filePath, 'utf8');
  assembledFragments.push(fileContent);
  console.log(`  ✓ Loaded [${entry.type.padEnd(9)}] ${entry.file}`);
});

const assembledHtml = assembledFragments.join('\n\n');
const indexHtmlPath = path.join(ROOT_DIR, 'index.html');
fs.writeFileSync(indexHtmlPath, assembledHtml, 'utf8');
const lineCount = assembledHtml.split('\n').length;
console.log(`  ✓ Successfully compiled: index.html (${assembledHtml.length.toLocaleString()} bytes, ${lineCount} lines)\n`);

// -----------------------------------------------------------------------------
// STEP 3: INTEGRITY & ANCHOR LINK VALIDATION
// -----------------------------------------------------------------------------
console.log('🔍 [Step 3/3] Validating DOM anchor integrity...');

// Extract all declared DOM IDs: id="..."
const idRegex = /id="([^"]+)"/g;
const declaredIds = new Set();
let match;
while ((match = idRegex.exec(assembledHtml)) !== null) {
  declaredIds.add(match[1]);
}

// Extract internal navigation hash links: href="#..."
const hrefRegex = /href="#([^"]+)"/g;
const referencedHashes = new Set();
while ((match = hrefRegex.exec(assembledHtml)) !== null) {
  referencedHashes.add(match[1]);
}

// Extract schema URL hashes: https://rsk807.github.io/#...
if (schemaTag) {
  const schemaHashRegex = /https:\/\/rsk807\.github\.io\/#([a-zA-Z0-9_-]+)/g;
  while ((match = schemaHashRegex.exec(schemaTag)) !== null) {
    referencedHashes.add(match[1]);
  }
}

console.log(`  • Declared element IDs found: ${declaredIds.size}`);
console.log(`  • Referenced anchor targets:  ${referencedHashes.size}`);

const missingAnchors = [];
referencedHashes.forEach(hash => {
  if (!declaredIds.has(hash)) {
    missingAnchors.push(hash);
  }
});

if (missingAnchors.length > 0) {
  console.error(`\n❌ Validation Error: ${missingAnchors.length} internal anchor link(s) have no matching DOM element ID:`);
  missingAnchors.forEach(m => console.error(`    - #${m}`));
  process.exit(1);
} else {
  console.log(`  ✓ Validation Passed: All ${referencedHashes.size} referenced anchors have verified matching DOM element IDs.`);
}

console.log('\n====================================================');
console.log('🚀 Build Completed Successfully! Everything is green.');
console.log('====================================================\n');
