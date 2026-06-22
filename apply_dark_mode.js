const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx')) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
};

const files = walkSync(path.join(__dirname, 'frontend/src'));

// We want to replace standard classes with their dark mode counterparts globally.
// We use regex to ensure we only match whole words.
const replacements = [
  // Backgrounds
  { regex: /\bbg-white(?!\/)\b(?! dark:bg-mocha)/g, replacement: 'bg-white dark:bg-mocha' },
  { regex: /\bbg-vanilla(?!\/)\b(?! dark:bg-espresso)/g, replacement: 'bg-vanilla dark:bg-espresso' },
  { regex: /\bbg-gray-50(?!\/)\b(?! dark:bg-\[\#2A1F1D\])/g, replacement: 'bg-gray-50 dark:bg-[#2A1F1D]' },
  { regex: /\bbg-gray-100(?!\/)\b(?! dark:bg-cacao)/g, replacement: 'bg-gray-100 dark:bg-cacao' },
  
  // Texts
  { regex: /\btext-chocolate\b(?! dark:text-crema)(?! dark:text-white)/g, replacement: 'text-chocolate dark:text-crema' },
  { regex: /\btext-slateGray\b(?! dark:text-latte)(?! dark:text-gray-400)/g, replacement: 'text-slateGray dark:text-latte' },
  { regex: /\btext-gray-500\b(?! dark:text-latte)/g, replacement: 'text-gray-500 dark:text-latte' },
  
  // Borders
  { regex: /\bborder-gray-100\b(?! dark:border-cacao)/g, replacement: 'border-gray-100 dark:border-cacao' },
  { regex: /\bborder-gray-200\b(?! dark:border-cacao)/g, replacement: 'border-gray-200 dark:border-cacao' },
  { regex: /\bborder-white\b(?! dark:border-cacao)(?! dark:border-slate)/g, replacement: 'border-white dark:border-cacao' },
];

let changedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  // Clean up any previously applied messy slate classes if we want
  newContent = newContent.replace(/dark:bg-slate-900/g, 'dark:bg-espresso');
  newContent = newContent.replace(/dark:bg-slate-800/g, 'dark:bg-mocha');
  newContent = newContent.replace(/dark:bg-slate-700/g, 'dark:bg-[#2A1F1D]');
  newContent = newContent.replace(/dark:text-white/g, 'dark:text-crema');
  newContent = newContent.replace(/dark:text-gray-\d00/g, 'dark:text-latte');
  newContent = newContent.replace(/dark:border-slate-\d00/g, 'dark:border-cacao');

  for (const r of replacements) {
    newContent = newContent.replace(r.regex, r.replacement);
  }

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
    console.log(`Updated ${file}`);
  }
}

console.log(`Successfully updated ${changedFiles} files with premium dark mode classes.`);
