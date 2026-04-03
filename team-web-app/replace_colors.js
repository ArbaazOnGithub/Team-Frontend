import fs from 'fs';
import path from 'path';

const srcDir = path.join('d:', 'projects', 'React JS Project', 'team-web-app', 'src');

const replacements = [
  { from: '#EAE0CF', to: '#68BA7F' }
];

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

      for (const r of replacements) {
        const regex = new RegExp(escapeRegExp(r.from), 'gi');
        if (content.match(regex)) {
          content = content.replace(regex, r.to);
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
