import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registryPath = path.join(__dirname, '../emojix-contracts/core-contract/sources/emoji_registry.move');
let content = fs.readFileSync(registryPath, 'utf8');

// Regex to match comments like: // 😀 MAHJONG TILE RED DRAGON
const emojiCommentRegex = /(\/\/ )([^\s]+ )(.+)/g;

// Replace with: // MAHJONG TILE RED DRAGON
const newContent = content.replace(emojiCommentRegex, '// $3');

fs.writeFileSync(registryPath, newContent, 'utf8');
console.log('✅ Removed emoji icons from comments in emoji_registry.move'); 