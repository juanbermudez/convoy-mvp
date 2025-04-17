import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the package.json file
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('Package manager:', packageJson.packageManager || 'Not specified');
console.log('Dependencies:', Object.keys(packageJson.dependencies || {}).length);
console.log('DevDependencies:', Object.keys(packageJson.devDependencies || {}).length);
