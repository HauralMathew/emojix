import { twitterEmojiDataset } from '../src/data/twitter-emoji-dataset';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Convert hex to UTF-8 bytes format like emojicoin-dot-fun
function hexToUtf8Bytes(hex: string): string {
  // Convert hex to UTF-8 bytes
  const codePoint = parseInt(hex, 16);
  const char = String.fromCodePoint(codePoint);
  
  // Convert to UTF-8 bytes
  const encoder = new TextEncoder();
  const bytes = encoder.encode(char);
  
  // Convert to hex format like emojicoin-dot-fun
  const hexBytes = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `x"${hexBytes}"`;
}

// Generate the complete emoji list
function generateCompleteEmojiList(): string {
  let result = '        vector [\n';
  
  twitterEmojiDataset.forEach((emoji, index) => {
    const hexBytes = hexToUtf8Bytes(emoji.hex);
    const comment = `// ${emoji.emoji} ${emoji.name}`;
    const comma = index < twitterEmojiDataset.length - 1 ? ',' : '';
    result += `            ${hexBytes}${comma} ${comment}\n`;
  });
  
  result += '        ]';
  return result;
}

// Update the emoji_registry.move file
function updateEmojiRegistry() {
  const registryPath = path.join(__dirname, '../emojix-contracts/core-contract/sources/emoji_registry.move');
  let content = fs.readFileSync(registryPath, 'utf8');
  
  // Generate the complete emoji list
  const completeEmojiList = generateCompleteEmojiList();
  
  // Replace the sample emoji list with the complete one
  const startMarker = '    fun get_all_supported_emojis(): vector<vector<u8>> {';
  const endMarker = '    }';
  
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker, startIndex);
  
  if (startIndex === -1 || endIndex === -1) {
    console.error('Could not find the emoji list in the file');
    return;
  }
  
  const beforeList = content.substring(0, startIndex + startMarker.length);
  const afterList = content.substring(endIndex);
  
  const newContent = beforeList + '\n' + completeEmojiList + '\n' + afterList;
  
  // Write the updated content back to the file
  fs.writeFileSync(registryPath, newContent, 'utf8');
  
  console.log(`✅ Updated emoji_registry.move with ${twitterEmojiDataset.length} emojis`);
  console.log(`📁 File: ${registryPath}`);
}

updateEmojiRegistry(); 