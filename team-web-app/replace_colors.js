import fs from 'fs';
import path from 'path';

const srcDir = path.join('d:', 'projects', 'React JS Project', 'team-web-app', 'src');

const replacements = [
  { from: '#213448', to: 'PLACEHOLDER_CREAM' },
  { from: '#EAE0CF', to: 'PLACEHOLDER_DARK' },
  { from: 'bg-white/70', to: 'bg-black/20' },
  { from: 'bg-white/50', to: 'bg-black/30' },
  { from: 'bg-white/30', to: 'bg-white/5' },
  { from: 'border-white/40', to: 'border-white/10' },
  { from: 'border-white/20', to: 'border-white/5' },
  { from: 'text-[#213448]', to: 'text-[#EAE0CF]' },
  { from: 'text-gray-500', to: 'text-gray-400' },
  { from: 'bg-slate-100', to: 'bg-slate-800' },
  { from: 'text-slate-600', to: 'text-slate-300' }
];

const finalSwap = {
  'PLACEHOLDER_CREAM': '#EAE0CF',
  'PLACEHOLDER_DARK': '#213448'
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || (fullPath.endsWith('.css') && !fullPath.includes('index.css'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Phase 1: To placeholders
      for (const r of replacements) {
        const regex = new RegExp(escapeRegExp(r.from), 'gi');
        if (content.match(regex)) {
          content = content.replace(regex, r.to);
          modified = true;
        }
      }

      // Phase 2: Final swap
      for (const [placeholder, finalColor] of Object.entries(finalSwap)) {
        const regex = new RegExp(escapeRegExp(placeholder), 'g');
        if (content.match(regex)) {
          content = content.replace(regex, finalColor);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Modified:', fullPath);
      }
    }
  }
}

walkDir(srcDir);
