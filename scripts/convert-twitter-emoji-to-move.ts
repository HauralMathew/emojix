import { twitterEmojiDataset } from '../src/data/twitter-emoji-dataset';

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

// Generate Move code
function generateMoveCode(): string {
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
    moveCode += `            ${moveHex},              // ${comment} [${emoji.hex.toUpperCase()}]\n`;
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
const moveCode = generateMoveCode();
console.log('Generated Move code for emoji_hex module:');
console.log(moveCode);

// You can save this to a file or copy it manually
console.log('\nTotal emojis converted:', twitterEmojiDataset.length); 