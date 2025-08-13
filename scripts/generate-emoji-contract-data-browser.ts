// Browser-based emoji contract data generator
// This script uses the existing emojiImageUtils.ts functions to generate real PNG images

import { twitterEmojiDataset } from '../src/data/twitter-emoji-dataset';
import { emojiToShortName } from '../src/utils/emojiUtils';
import { 
  createCanonicalImageMetadata,
  base64DataUrl,
  getBase64ize
} from '../src/utils/emojiImageUtils';

interface EmojiContractData {
  emoji: string;
  utf8Hex: string; // Hex string for contract validation (e.g., "f09f884")
  shortName: string; // Short name for token naming
  canonicalImageData: number[]; // PNG bytes for on-chain storage
  canonicalImageSize: number; // Image size (should be 64 for contract)
}

interface EmojiContractDataMap { [emoji: string]: EmojiContractData; }

// Helper function to convert emoji to UTF-8 hex string
function emojiToUtf8Hex(emoji: string): string {
  const utf8Bytes = Array.from(new TextEncoder().encode(emoji));
  return utf8Bytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Helper function to convert base64 to byte array
function base64ToByteArray(base64Data: string): number[] {
  const byteArray = [];
  for (let i = 0; i < base64Data.length; i++) {
    byteArray.push(base64Data.charCodeAt(i));
  }
  return byteArray;
}

// Helper function to download the generated data
function downloadContractData(data: EmojiContractDataMap, filename: string) {
  const fileContent = `// Auto-generated emoji contract data
// Generated on: ${new Date().toISOString()}
// Total emojis: ${Object.keys(data).length}

export interface EmojiContractData {
  emoji: string;
  utf8Hex: string; // Hex string for contract validation (e.g., "f09f884")
  shortName: string; // Short name for token naming
  canonicalImageData: number[]; // PNG bytes for on-chain storage
  canonicalImageSize: number; // Image size (should be 64 for contract)
}

export interface EmojiContractDataMap { [emoji: string]: EmojiContractData; }

// Helper function to get contract data for an emoji
export const getEmojiContractData = (emoji: string): EmojiContractData | null => {
  return emojiContractData[emoji] || null;
};

// Helper function to get UTF-8 contract validation
export const getEmojiUtf8Hex = (emoji: string): string | null => {
  return emojiContractData[emoji]?.utf8Hex || null;
};

// Helper function to get canonical image data for contract storage
export const getEmojiCanonicalImageData = (emoji: string): { data: number[], size: number } | null => {
  const data = emojiContractData[emoji];
  if (!data) return null;
  
  return { 
    data: data.canonicalImageData,
    size: data.canonicalImageSize
  };
};

// Main emoji contract data mapping
export const emojiContractData: EmojiContractDataMap = ${JSON.stringify(data, null, 2)};
`;

  const blob = new Blob([fileContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function generateEmojiContractData(): Promise<void> {
  console.log('🎨 Generating emoji contract data using browser rendering...');
  console.log(`📊 Processing ${twitterEmojiDataset.length} emojis...`);

  const emojiDataMap: EmojiContractDataMap = {};
  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;

  // Process emojis in batches to avoid overwhelming the browser
  const batchSize = 10;
  const batches = [];
  
  for (let i = 0; i < twitterEmojiDataset.length; i += batchSize) {
    batches.push(twitterEmojiDataset.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const batchPromises = batch.map(async (emojiData) => {
      const { emoji, hex } = emojiData;
      const shortName = emojiToShortName(emoji) || 'unknown';
      
      try {
        // Generate UTF-8 hex string for contract validation
        const utf8Hex = emojiToUtf8Hex(emoji);
        
        // Generate real 64x64 PNG using browser rendering
        const canonicalImage = await createCanonicalImageMetadata(emoji, 64);
        const canonicalImageData = base64ToByteArray(canonicalImage.image_data);
        
        emojiDataMap[emoji] = {
          emoji,
          utf8Hex,
          shortName,
          canonicalImageData,
          canonicalImageSize: 64
        };
        
        successCount++;
        return { success: true, emoji };
      } catch (error) {
        console.error(`❌ Failed to process emoji ${emoji}:`, error);
        errorCount++;
        return { success: false, emoji, error };
      }
    });

    // Wait for batch to complete
    const results = await Promise.all(batchPromises);
    
    processedCount += batch.length;
    console.log(`📈 Processed ${processedCount}/${twitterEmojiDataset.length} emojis... (${successCount} success, ${errorCount} errors)`);
    
    // Small delay to prevent browser freezing
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`✅ Successfully processed ${successCount}/${processedCount} emojis`);
  console.log(`❌ Errors: ${errorCount} emojis`);

  // Download the generated data
  downloadContractData(emojiDataMap, 'emoji-contract-data.ts');
  
  console.log('\n🎉 Emoji contract data generation complete!');
  console.log('\n📝 Next steps:');
  console.log('1. The file emoji-contract-data.ts has been downloaded');
  console.log('2. Copy it to src/data/emoji-contract-data.ts');
  console.log('3. Import emojiContractData in your frontend components');
  console.log('4. Use getEmojiContractData(emoji) to get contract-ready data');
  console.log('5. Pass utf8Hex and canonicalImageData to your smart contract');
}

// Export for use in browser console
(window as any).generateEmojiContractData = generateEmojiContractData;

// Auto-run if this script is loaded directly
if (typeof window !== 'undefined') {
  console.log('🚀 Browser-based emoji contract data generator loaded!');
  console.log('Run generateEmojiContractData() to start generation');
} 