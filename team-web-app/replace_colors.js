import fs from 'fs';
import path from 'path';

const srcDir = path.join('d:', 'projects', 'React JS Project', 'team-web-app', 'src');

const replacements = {
  '#2E6F40': '#213448',
  '#68BA7F': '#547792',
  '#CFFFDC': '#94B4C1',
  '#253D2C': '#213448',
  'rgba(46,111,64,': 'rgba(33,52,72,',
  'rgba(46, 111, 64,': 'rgba(33, 52, 72,',
  'rgba(104, 186, 127,': 'rgba(84, 119, 146,',
  'rgba(104,186,127,': 'rgba(84,119,146,'
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const [oldC, newC] of Object.entries(replacements)) {
        const regex = new RegExp(escapeRegExp(oldC), 'gi');
        if (content.match(regex)) {
          content = content.replace(regex, newC);
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
