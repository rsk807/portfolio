const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const iconsDir = path.join(rootDir, 'assets', 'icons');
const docsDir = path.join(rootDir, 'assets', 'docs');

if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

const logoFiles = [
  'sk_logo_16x16.png',
  'sk_logo_32x32.png',
  'sk_logo_48x48.png',
  'sk_logo_64x64.png',
  'sk_logo_180x180.png',
  'sk_logo_192x192.png',
  'sk_logo_512x512.png',
  'sk_logo_reimagined_cropped.png'
];

logoFiles.forEach(file => {
  const src = path.join(rootDir, file);
  const dest = path.join(iconsDir, file);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Moved ${file} -> assets/icons/${file}`);
  }
});

const resumeSrc = path.join(rootDir, 'Sushant_Kumar_Resume.pdf');
const resumeDest = path.join(docsDir, 'Sushant_Kumar_Resume.pdf');
if (fs.existsSync(resumeSrc)) {
  fs.renameSync(resumeSrc, resumeDest);
  console.log(`Moved Sushant_Kumar_Resume.pdf -> assets/docs/Sushant_Kumar_Resume.pdf`);
}

// Update files that reference them
const filesToUpdate = [
  path.join(rootDir, 'manifest.json'),
  path.join(rootDir, 'sitemap.xml'),
  path.join(rootDir, 'llms.txt'),
  path.join(rootDir, 'llms-full.txt'),
  path.join(rootDir, 'design-system.html'),
  path.join(rootDir, 'src', 'components', 'head.html'),
  path.join(rootDir, 'src', 'components', 'header.html'),
  path.join(rootDir, 'src', 'components', 'loader.html'),
  path.join(rootDir, 'src', 'components', 'footer.html'),
  path.join(rootDir, 'src', 'components', 'schema.jsonld'),
  path.join(rootDir, 'src', 'chapters', '00-cover.html'),
  path.join(rootDir, 'src', 'chapters', '08-contact.html')
];

filesToUpdate.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace logo references
  logoFiles.forEach(logo => {
    // Replace URL paths like https://rsk807.github.io/sk_logo_512x512.png
    content = content.split(`https://rsk807.github.io/${logo}`).join(`https://rsk807.github.io/assets/icons/${logo}`);
    // Replace relative paths like href="sk_logo_..." or src="sk_logo_..."
    content = content.split(`"${logo}"`).join(`"assets/icons/${logo}"`);
    content = content.split(`'${logo}'`).join(`'assets/icons/${logo}'`);
  });

  // Replace resume references
  content = content.split('href="Sushant_Kumar_Resume.pdf"').join('href="assets/docs/Sushant_Kumar_Resume.pdf"');
  content = content.split('href="Sushant_Resume (2).pdf"').join('href="assets/docs/Sushant_Kumar_Resume.pdf"');
  content = content.split('https://rsk807.github.io/Sushant_Kumar_Resume.pdf').join('https://rsk807.github.io/assets/docs/Sushant_Kumar_Resume.pdf');
  content = content.split('https://rsk807.github.io/Sushant_Resume (2).pdf').join('https://rsk807.github.io/assets/docs/Sushant_Kumar_Resume.pdf');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated references in: ${path.relative(rootDir, filePath)}`);
});

console.log('Root cleanup & reference reorganization completed successfully.');
