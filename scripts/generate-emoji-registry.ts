import { twitterEmojiDataset } from '../src/data/twitter-emoji-dataset';

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

// Generate Move code for the emoji registry
function generateEmojiRegistry() {
  console.log('// Auto-generated from Twitter emoji dataset');
  console.log('// Total emojis:', twitterEmojiDataset.length);
  console.log('');
  console.log('fun get_all_supported_emojis(): vector<vector<u8>> {');
  console.log('    vector [');
  
  twitterEmojiDataset.forEach((emoji, index) => {
    const hexBytes = hexToUtf8Bytes(emoji.hex);
    const comment = `// ${emoji.emoji} ${emoji.name}`;
    const comma = index < twitterEmojiDataset.length - 1 ? ',' : '';
    console.log(`        ${hexBytes}${comma} ${comment}`);
  });
  
  console.log('    ]');
  console.log('}');
}

generateEmojiRegistry(); 