import { twitterEmojiDataset } from '../src/data/twitter-emoji-dataset';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Convert hex string to Move hex format (x"f09f8084")
function hexToMoveHex(hex: string): string {
  // Convert hex to UTF-8 bytes
  const codePoint = parseInt(hex, 16);
  const char = String.fromCodePoint(codePoint);
  const bytes = new TextEncoder().encode(char);
  
  // Convert to Move hex format
  const hexBytes = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `x"${hexBytes}"`;
}

// Generate complete Move code
function generateCompleteMoveCode(): string {
  let moveCode = `module emojix::emoji_hex {
    use std::vector;
    friend emojix::market_core;
    friend emojix::token_factory;

    public inline fun get_token_symbol_emojis(): vector<vector<u8>> {
        vector [
`;

  // Add each emoji with comment
  twitterEmojiDataset.forEach((emoji, index) => {
    const moveHex = hexToMoveHex(emoji.hex);
    const comment = emoji.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    const isLast = index === twitterEmojiDataset.length - 1;
    const comma = isLast ? '' : ',';
    moveCode += `            ${moveHex}${comma}              // ${comment} [${emoji.hex.toUpperCase()}]\n`;
  });

  moveCode += `        ]
    }

    public inline fun is_supported_emoji_hex(hex: vector<u8>): bool {
        let supported_emojis = get_token_symbol_emojis();
        let n = vector::length(&supported_emojis);
        let i = 0;
        while (i < n) {
            if (hex == *vector::borrow(&supported_emojis, i)) {
                return true;
            };
            i = i + 1;
        };
        false
    }

    #[test_only] public fun get_token_symbol_emojis_test_only(): vector<vector<u8>> {
        get_token_symbol_emojis()
    }

    #[test_only] public fun is_supported_emoji_hex_test_only(hex: vector<u8>): bool {
        is_supported_emoji_hex(hex)
    }
}`;

  return moveCode;
}

// Generate and save the Move code
const moveCode = generateCompleteMoveCode();
const outputPath = path.join(__dirname, '../emojix-contracts/emojix/sources/emoji_hex.move');

fs.writeFileSync(outputPath, moveCode, 'utf8');

console.log('✅ Generated complete emoji_hex.move file');
console.log(`📁 Saved to: ${outputPath}`);
console.log(`📊 Total emojis: ${twitterEmojiDataset.length}`);
console.log('\n🎯 Architectural improvements:');
console.log('   • Function-based approach (get_token_symbol_emojis())');
console.log('   • Friend modules (market_core, token_factory)');
console.log('   • Test-only functions for testing');
console.log('   • Inline functions for gas optimization');
console.log('   • Comprehensive emoji validation'); 