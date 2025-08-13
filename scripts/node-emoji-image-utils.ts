import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

export interface CanonicalImageMetadata {
  /** Base64 encoded PNG image data */
  image_data: string;
  /** MIME type of the image (always "image/png") */
  image_type: string;
  /** Image dimensions */
  width: number;
  height: number;
  /** Image format description */
  format: string;
}

/**
 * Converts an emoji to a canvas and returns the image data (Node.js version)
 * @param emoji - The emoji string to convert
 * @param size - The size of the output image (default: 64)
 * @param width - Custom width (optional, overrides size for rectangular images)
 * @param height - Custom height (optional, overrides size for rectangular images)
 * @returns Promise that resolves to base64 encoded PNG data
 */
export const emojiToImageData = async (
  emoji: string, 
  size: number = 64,
  width?: number,
  height?: number
): Promise<string> => {
  try {
    // Create canvas
    const canvas = createCanvas(width || size, height || size);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Set canvas size
    const canvasWidth = width || size;
    const canvasHeight = height || size;
    
    // Check for canvas size limits
    const maxCanvasSize = 16384;
    if (canvasWidth > maxCanvasSize || canvasHeight > maxCanvasSize) {
      throw new Error(`Canvas size too large. Maximum supported: ${maxCanvasSize}x${maxCanvasSize}`);
    }

    // Set background (transparent)
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Configure text rendering with high quality
    const fontSize = Math.min(canvasWidth, canvasHeight) * 0.8;
    ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols", "EmojiOne Mozilla", "Twemoji Mozilla", "Segoe UI Symbol", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    (ctx as any).imageSmoothingQuality = 'high';

    // Draw emoji
    ctx.fillText(emoji, canvasWidth / 2, canvasHeight / 2);

    // Convert to base64 with maximum quality
    const buffer = canvas.toBuffer('image/png');
    const base64Data = buffer.toString('base64');
    
    return base64Data;
  } catch (error) {
    throw error;
  }
};

/**
 * Creates canonical image metadata for an emoji (Node.js version)
 * @param emoji - The emoji string
 * @param size - The size of the output image (default: 64)
 * @param width - Custom width (optional, overrides size for rectangular images)
 * @param height - Custom height (optional, overrides size for rectangular images)
 * @returns Promise that resolves to canonical image metadata
 */
export const createCanonicalImageMetadata = async (
  emoji: string, 
  size: number = 64,
  width?: number,
  height?: number
): Promise<CanonicalImageMetadata> => {
  const imageData = await emojiToImageData(emoji, size, width, height);
  const finalWidth = width || size;
  const finalHeight = height || size;
  
  return {
    image_data: imageData,
    image_type: 'image/png',
    width: finalWidth,
    height: finalHeight,
    format: 'PNG'
  };
};

/**
 * Creates a combined canonical image for multiple emojis (Node.js version)
 * @param emojis - Array of emoji strings
 * @param size - The size of the output image (default: 64)
 * @param width - Custom width (optional, overrides size for rectangular images)
 * @param height - Custom height (optional, overrides size for rectangular images)
 * @returns Promise that resolves to canonical image metadata
 */
export const createCombinedCanonicalImageMetadata = async (
  emojis: string[],
  size: number = 64,
  width?: number,
  height?: number
): Promise<CanonicalImageMetadata> => {
  try {
    // Create canvas
    const canvas = createCanvas(width || size, height || size);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Set canvas size
    const canvasWidth = width || size;
    const canvasHeight = height || size;
    
    // Check for canvas size limits
    const maxCanvasSize = 16384;
    if (canvasWidth > maxCanvasSize || canvasHeight > maxCanvasSize) {
      throw new Error(`Canvas size too large. Maximum supported: ${maxCanvasSize}x${maxCanvasSize}`);
    }

    // Set background (transparent)
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    (ctx as any).imageSmoothingQuality = 'high';

    if (emojis.length === 1) {
      // Single emoji - center it
      const fontSize = Math.min(canvasWidth, canvasHeight) * 0.7;
      ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols", "EmojiOne Mozilla", "Twemoji Mozilla", "Segoe UI Symbol", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emojis[0], canvasWidth / 2, canvasHeight / 2);
    } else if (emojis.length === 2) {
      // Two emojis - side by side with tighter spacing
      const emojiSize = Math.min(canvasWidth, canvasHeight) * 0.5;
      ctx.font = `${emojiSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols", "EmojiOne Mozilla", "Twemoji Mozilla", "Segoe UI Symbol", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Left emoji - closer to center
      ctx.fillText(emojis[0], canvasWidth * 0.35, canvasHeight / 2);
      // Right emoji - closer to center
      ctx.fillText(emojis[1], canvasWidth * 0.65, canvasHeight / 2);
    } else if (emojis.length === 3) {
      // Three emojis - triangle layout
      const emojiSize = Math.min(canvasWidth, canvasHeight) * 0.4;
      ctx.font = `${emojiSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols", "EmojiOne Mozilla", "Twemoji Mozilla", "Segoe UI Symbol", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Top emoji
      ctx.fillText(emojis[0], canvasWidth / 2, canvasHeight * 0.25);
      // Bottom left emoji
      ctx.fillText(emojis[1], canvasWidth * 0.25, canvasHeight * 0.75);
      // Bottom right emoji
      ctx.fillText(emojis[2], canvasWidth * 0.75, canvasHeight * 0.75);
    } else {
      // Four or more emojis - grid layout
      const gridSize = Math.ceil(Math.sqrt(emojis.length));
      const emojiSize = Math.min(canvasWidth, canvasHeight) / (gridSize * 1.5);
      ctx.font = `${emojiSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols", "EmojiOne Mozilla", "Twemoji Mozilla", "Segoe UI Symbol", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      for (let i = 0; i < emojis.length; i++) {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        const x = (col + 0.5) * (canvasWidth / gridSize);
        const y = (row + 0.5) * (canvasHeight / gridSize);
        ctx.fillText(emojis[i], x, y);
      }
    }

    // Convert to base64
    const buffer = canvas.toBuffer('image/png');
    const base64Data = buffer.toString('base64');
    
    return {
      image_data: base64Data,
      image_type: 'image/png',
      width: canvasWidth,
      height: canvasHeight,
      format: 'PNG'
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Optimizes image size by trying different compression strategies
 * @param emojis - Array of emoji strings
 * @param maxSizeBytes - Maximum size in bytes (default: 4096 for 4KB limit)
 * @returns Promise that resolves to optimized canonical image metadata or null if not possible
 */
export const optimizeEmojiImageForSize = async (
  emojis: string[],
  maxSizeBytes: number = 4096
): Promise<{ data: number[], size: number } | null> => {
  const sizes = [64, 48, 32, 24, 16];
  
  for (const size of sizes) {
    try {
      const metadata = await createCombinedCanonicalImageMetadata(emojis, size);
      const base64Data = metadata.image_data;
      const byteArray = [];
      for (let i = 0; i < base64Data.length; i++) {
        byteArray.push(base64Data.charCodeAt(i));
      }
      
      if (byteArray.length <= maxSizeBytes) {
        return {
          data: byteArray,
          size: size
        };
      }
    } catch (error) {
      console.warn(`Failed to generate ${size}x${size} image:`, error);
      continue;
    }
  }
  
  return null;
}; 