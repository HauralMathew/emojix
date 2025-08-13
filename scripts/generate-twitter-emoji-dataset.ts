import fs from 'fs';
import path from 'path';
import emojiData from 'emoji-datasource-twitter';

interface EmojiItem {
  emoji: string;
  hex: string;
  name: string;
  category: string;
}

// Convert unicode codepoints to hex string
const codepointsToHex = (codepoints: string): string => {
  return codepoints
    .split('-')
    .map(cp => parseInt(cp, 16).toString(16))
    .join('');
};

// Convert unicode codepoints to emoji string
const codepointsToEmoji = (codepoints: string): string => {
  return codepoints
    .split('-')
    .map(cp => String.fromCodePoint(parseInt(cp, 16)))
    .join('');
};

// Filter out skin tone variants, keeping only base emojis
const isBaseEmoji = (emoji: any): boolean => {
  // Skip emojis with skin tone modifiers
  if (emoji.skin_variations) {
    return false;
  }
  
  // Skip emojis that are part of sequences (like family emojis)
  if (emoji.unified.includes('-')) {
    // Only keep single emojis, not sequences
    return emoji.unified.split('-').length === 1;
  }
  
  return true;
};

// Generate the emoji dataset
const generateEmojiDataset = (): EmojiItem[] => {
  const emojis: EmojiItem[] = [];
  
  // Process each emoji from the Twitter dataset
  emojiData.forEach((emoji: any) => {
    // Skip if not a base emoji
    if (!isBaseEmoji(emoji)) {
      return;
    }
    
    // Convert codepoints to emoji string and hex
    const emojiString = codepointsToEmoji(emoji.unified);
    const hexCode = codepointsToHex(emoji.unified);
    
    // Create emoji item
    const emojiItem: EmojiItem = {
      emoji: emojiString,
      hex: hexCode,
      name: emoji.name || 'Unknown',
      category: emoji.category || 'Symbols'
    };
    
    emojis.push(emojiItem);
  });
  
  // Sort by unicode order (hex code)
  emojis.sort((a, b) => a.hex.localeCompare(b.hex));
  
  return emojis;
};

// Generate and save the dataset
const main = () => {
  console.log('🚀 Generating Twitter emoji dataset...');
  
  const emojis = generateEmojiDataset();
  
  console.log(`📊 Generated ${emojis.length} emojis`);
  
  // Create the output content
  const outputContent = `// Auto-generated Twitter emoji dataset
// Generated on: ${new Date().toISOString()}
// Total emojis: ${emojis.length}

export interface EmojiItem {
  emoji: string;
  hex: string;
  name: string;
  category: string;
}

export const twitterEmojiDataset: EmojiItem[] = ${JSON.stringify(emojis, null, 2)};

// Export individual categories for easier access
export const emojiCategories = {
  'Smileys & Emotion': emojis.filter(e => e.category === 'Smileys & Emotion'),
  'People & Body': emojis.filter(e => e.category === 'People & Body'),
  'Animals & Nature': emojis.filter(e => e.category === 'Animals & Nature'),
  'Food & Drink': emojis.filter(e => e.category === 'Food & Drink'),
  'Travel & Places': emojis.filter(e => e.category === 'Travel & Places'),
  'Activities': emojis.filter(e => e.category === 'Activities'),
  'Objects': emojis.filter(e => e.category === 'Objects'),
  'Symbols': emojis.filter(e => e.category === 'Symbols'),
  'Flags': emojis.filter(e => e.category === 'Flags'),
};

// Helper function to find emoji by hex code
export const findEmojiByHex = (hex: string): EmojiItem | undefined => {
  return emojis.find(e => e.hex === hex);
};

// Helper function to find emoji by name
export const findEmojiByName = (name: string): EmojiItem | undefined => {
  return emojis.find(e => e.name.toLowerCase().includes(name.toLowerCase()));
};

// Helper function to validate if hex code is supported
export const isSupportedEmoji = (hex: string): boolean => {
  return emojis.some(e => e.hex === hex);
};

export default twitterEmojiDataset;
`;

  // Ensure the data directory exists
  const dataDir = path.join(process.cwd(), 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Write the file
  const outputPath = path.join(dataDir, 'twitter-emoji-dataset.ts');
  fs.writeFileSync(outputPath, outputContent, 'utf8');
  
  console.log(`✅ Dataset saved to: ${outputPath}`);
  
  // Log category breakdown
  const categoryCounts = emojis.reduce((acc, emoji) => {
    acc[emoji.category] = (acc[emoji.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n📈 Category breakdown:');
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} emojis`);
  });
};

// Run the script
main(); 