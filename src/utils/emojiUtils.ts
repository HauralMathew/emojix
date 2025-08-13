import { twitterEmojiDataset, findEmojiByHex } from '../data/twitter-emoji-dataset';


/**
 * Converts an emoji to its hex code representation
 * @param emoji - The emoji string to convert
 * @returns The hex code string or null if not found
 */
export const emojiToHex = (emoji: string): string | null => {
  const emojiItem = twitterEmojiDataset.find(item => item.emoji === emoji);
  return emojiItem ? emojiItem.hex : null;
};

/**
 * Converts a hex code to its emoji representation
 * @param hex - The hex code string to convert
 * @returns The emoji string or null if not found
 */
export const hexToEmoji = (hex: string): string | null => {
  const emojiItem = findEmojiByHex(hex);
  return emojiItem ? emojiItem.emoji : null;
};

/**
 * Converts an emoji to its short name for token naming ]
 * @param emoji - The emoji string to convert
 * @returns The short name string or null if not found
 */
export const emojiToShortName = (emoji: string): string | null => {
  const emojiItem = twitterEmojiDataset.find(item => item.emoji === emoji);
  if (!emojiItem) return null;
  
  // Convert the full name to a short name format with proper case
  return emojiItem.name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Keep spaces as spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim() // Remove leading/trailing spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
    .join(' ');
};

/**
 * Converts an emoji to its short name for market naming (lowercase with underscores)
 * @param emoji - The emoji string to convert
 * @returns The short name string or null if not found
 */
export const emojiToMarketName = (emoji: string): string | null => {
  const emojiItem = twitterEmojiDataset.find(item => item.emoji === emoji);
  if (!emojiItem) return null;
  
  // Convert the full name to a short name format with lowercase and underscores
  return emojiItem.name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
};

/**
 * Converts multiple emojis to a combined short name for market naming
 * @param emojis - Array of emoji strings
 * @returns Combined short name string
 */
export const emojisToMarketName = (emojis: string[]): string => {
  const shortNames = emojis
    .map(emoji => emojiToMarketName(emoji))
    .filter((name): name is string => name !== null);
  
  return shortNames.join('_');
};

/**
 * Converts an emoji name to proper case (first letter capitalized)
 * @param emoji - The emoji string to convert
 * @returns The properly cased name string or null if not found
 */
export const emojiToProperCaseName = (emoji: string): string | null => {
  const emojiItem = twitterEmojiDataset.find(item => item.emoji === emoji);
  if (!emojiItem) return null;
  
  // Convert to proper case (first letter capitalized, rest lowercase)
  return emojiItem.name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Validates if an emoji is supported in our dataset
 * @param emoji - The emoji string to validate
 * @returns True if the emoji is supported
 */
export const isValidEmoji = (emoji: string): boolean => {
  return twitterEmojiDataset.some(item => item.emoji === emoji);
};

/**
 * Gets emoji metadata by emoji string
 * @param emoji - The emoji string
 * @returns Emoji metadata or null if not found
 */
export const getEmojiMetadata = (emoji: string) => {
  return twitterEmojiDataset.find(item => item.emoji === emoji) || null;
};

/**
 * Converts a short hex code to full UTF-8 bytes for smart contract
 * @param shortHex - Short hex code like "1f004"
 * @returns Full UTF-8 bytes as string like "f09f8084"
 */
export const shortHexToUtf8Bytes = (shortHex: string): string => {
  // Convert short hex to Unicode code point
  const codePoint = parseInt(shortHex, 16);
  
  // Convert to UTF-8 bytes
  const bytes = [];
  if (codePoint <= 0x7F) {
    bytes.push(codePoint);
  } else if (codePoint <= 0x7FF) {
    bytes.push(0xC0 | (codePoint >> 6));
    bytes.push(0x80 | (codePoint & 0x3F));
  } else if (codePoint <= 0xFFFF) {
    bytes.push(0xE0 | (codePoint >> 12));
    bytes.push(0x80 | ((codePoint >> 6) & 0x3F));
    bytes.push(0x80 | (codePoint & 0x3F));
  } else if (codePoint <= 0x10FFFF) {
    bytes.push(0xF0 | (codePoint >> 18));
    bytes.push(0x80 | ((codePoint >> 12) & 0x3F));
    bytes.push(0x80 | ((codePoint >> 6) & 0x3F));
    bytes.push(0x80 | (codePoint & 0x3F));
  }
  
  // Convert to hex string
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Converts an array of emojis to UTF-8 bytes for smart contract use
 * @param emojis - Array of emoji strings
 * @returns Array of UTF-8 byte strings (filters out invalid emojis)
 */
export const emojisToUtf8Bytes = (emojis: string[]): string[] => {
  return emojis
    .map(emoji => {
      const shortHex = emojiToHex(emoji);
      return shortHex ? shortHexToUtf8Bytes(shortHex) : null;
    })
    .filter((bytes): bytes is string => bytes !== null);
};

/**
 * Converts an emoji to the exact hex format expected by the smart contract
 * @param emoji - The emoji string to convert
 * @returns The hex bytes as number array (e.g., [240, 159, 128, 132]) or null if not found
 */
export const emojiToContractBytes = (emoji: string): number[] | null => {
  const shortHex = emojiToHex(emoji);
  if (!shortHex) return null;
  
  const fullHex = shortHexToUtf8Bytes(shortHex);
  const bytes: number[] = [];
  
  // Convert hex string to byte array
  for (let i = 0; i < fullHex.length; i += 2) {
    const byte = parseInt(fullHex.substr(i, 2), 16);
    bytes.push(byte);
  }
  
  return bytes;
};

/**
 * Converts an array of emojis to the exact format expected by the smart contract
 * @param emojis - Array of emoji strings
 * @returns Array of byte arrays for the contract (filters out invalid emojis)
 */
export const emojisToContractFormat = (emojis: string[]): number[][] => {
  return emojis
    .map(emoji => emojiToContractBytes(emoji))
    .filter((bytes): bytes is number[] => bytes !== null);
};

/**
 * Converts an array of emojis to a flat byte array for the smart contract
 * @param emojis - Array of emoji strings
 * @returns Flat array of bytes for the contract (filters out invalid emojis)
 */
export const emojisToFlatContractFormat = (emojis: string[]): number[] => {
  return emojis
    .map(emoji => emojiToContractBytes(emoji))
    .filter((bytes): bytes is number[] => bytes !== null)
    .flat();
};

/**
 * Converts an array of emojis to hex codes for smart contract use
 * @param emojis - Array of emoji strings
 * @returns Array of hex codes (filters out invalid emojis)
 */
export const emojisToHexCodes = (emojis: string[]): string[] => {
  return emojis
    .map(emoji => emojiToHex(emoji))
    .filter((hex): hex is string => hex !== null);
};

/**
 * Converts an array of hex codes to emojis
 * @param hexCodes - Array of hex code strings
 * @returns Array of emoji strings (filters out invalid hex codes)
 */
export const hexCodesToEmojis = (hexCodes: string[]): string[] => {
  return hexCodes
    .map(hex => hexToEmoji(hex))
    .filter((emoji): emoji is string => emoji !== null);
};

/**
 * Validates an array of emojis and returns only valid ones
 * @param emojis - Array of emoji strings to validate
 * @returns Array of valid emoji strings
 */
export const validateEmojis = (emojis: string[]): string[] => {
  return emojis.filter(isValidEmoji);
};

/**
 * Gets unique categories from the emoji dataset
 * @returns Array of unique category names
 */
export const getEmojiCategories = (): string[] => {
  const categories = new Set(twitterEmojiDataset.map(item => item.category));
  return Array.from(categories).sort();
};

/**
 * Gets emojis by category
 * @param category - The category name
 * @returns Array of emoji items in that category
 */
export const getEmojisByCategory = (category: string) => {
  return twitterEmojiDataset.filter(item => item.category === category);
};

/**
 * Searches emojis by name or emoji character
 * @param query - Search query
 * @returns Array of matching emoji items
 */
export const searchEmojis = (query: string) => {
  const searchTerm = query.toLowerCase();
  return twitterEmojiDataset.filter(item => 
    item.name.toLowerCase().includes(searchTerm) ||
    item.emoji.includes(searchTerm)
  );
};

 