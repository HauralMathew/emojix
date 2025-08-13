import { twitterEmojiDataset } from '../src/data/twitter-emoji-dataset';
import { emojiToShortName } from '../src/utils/emojiUtils';
import fs from 'fs';
import path from 'path';

interface EmojiContractData {
  emoji: string;
  utf8Hex: string; // Hex string for contract validation (e.g., "f09f8084")
  shortName: string; // Short name for token naming
  canonicalImageData: number[]; // PNG bytes for on-chain storage
  canonicalImageSize: number; // Image size (should be 64 for contract)
}

interface EmojiContractDataMap {
  [emoji: string]: EmojiContractData;
}

// Helper function to convert emoji to UTF-8 hex string
function emojiToUtf8Hex(emoji: string): string {
  const utf8Bytes = Array.from(Buffer.from(emoji, 'utf8'));
  return utf8Bytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Helper function to create a minimal 64x64 PNG for contract storage
function createMinimal64x64Png(): number[] {
  // This is a minimal 64x64 transparent PNG
  // In a real implementation, you would use the browser-based emoji rendering
  // For now, we'll create a placeholder that the contract can accept
  return [
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x40, // width: 64
    0x00, 0x00, 0x00, 0x40, // height: 64
    0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ];
}

async function generateEmojiContractData(): Promise<void> {
  console.log('🎨 Generating emoji contract data...');
  console.log(`📊 Processing ${twitterEmojiDataset.length} emojis...`);

  const emojiDataMap: EmojiContractDataMap = {};
  let processedCount = 0;
  let successCount = 0;

  for (const emojiData of twitterEmojiDataset) {
    const { emoji, hex } = emojiData;
    const shortName = emojiToShortName(emoji) || 'unknown';
    
    try {
      // Generate UTF-8 hex string for contract validation
      const utf8Hex = emojiToUtf8Hex(emoji);
      
      // For now, use minimal PNG placeholder
      // TODO: In a real implementation, you would:
      // 1. Use the browser-based emoji rendering from emojiImageUtils.ts
      // 2. Generate actual 64x64 PNG images for each emoji
      // 3. Convert the base64 data to byte array
      const canonicalImageData = createMinimal64x64Png();
      
      emojiDataMap[emoji] = {
        emoji,
        utf8Hex,
        shortName,
        canonicalImageData,
        canonicalImageSize: 64
      };
      
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to process emoji ${emoji}:`, error);
    }
    
    processedCount++;
    if (processedCount % 1000 === 0) {
      console.log(`📈 Processed ${processedCount}/${twitterEmojiDataset.length} emojis...`);
    }
  }

  console.log(`✅ Successfully processed ${successCount}/${processedCount} emojis`);

  // Generate the TypeScript file
  const outputPath = path.join(process.cwd(), 'src/data/emoji-contract-data.ts');
  const fileContent = `// Auto-generated emoji contract data
// Generated on: ${new Date().toISOString()}
// Total emojis: ${processedCount}
// Successfully processed: ${successCount}

export interface EmojiContractData {
  emoji: string;
  utf8Hex: string; // Hex string for contract validation (e.g., "f09f8084")
  shortName: string; // Short name for token naming
  canonicalImageData: number[]; // PNG bytes for on-chain storage
  canonicalImageSize: number; // Image size (should be 64 for contract)
}

export interface EmojiContractDataMap {
  [emoji: string]: EmojiContractData;
}

// Helper function to get contract data for an emoji
export const getEmojiContractData = (emoji: string): EmojiContractData | null => {
  return emojiContractData[emoji] || null;
};

// Helper function to get UTF-8ontract validation
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
export const emojiContractData: EmojiContractDataMap = ${JSON.stringify(emojiDataMap, null, 2)};
`;

  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`💾 Saved emoji contract data to: ${outputPath}`);
  console.log(`📁 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
  
  // Generate a summary report
  const summaryPath = path.join(process.cwd(), 'emoji-generation-summary.json');
  const summary = {
    generatedAt: new Date().toISOString(),
    totalEmojis: processedCount,
    successfulEmojis: successCount,
    failedEmojis: processedCount - successCount,
    outputFile: outputPath,
    fileSizeMB: (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)
  };
  
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`📋 Generated summary report: ${summaryPath}`);
  
  console.log('\n🎉 Emoji contract data generation complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Import emojiContractData in your frontend components');
  console.log('2. Use getEmojiContractData(emoji) to get contract-ready data');
  console.log('3. Pass utf8Hex and canonicalImageData to your smart contract');
  console.log('\n⚠️  Note: Current implementation uses placeholder PNG images.');
  console.log('   For production, integrate with your browser-based emoji rendering system.');
}

// Run the generation
generateEmojiContractData().catch(console.error); 