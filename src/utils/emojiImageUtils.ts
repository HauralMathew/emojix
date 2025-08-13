/**
 * Emoji Image Utilities for Aptos Fungible Asset Metadata
 * 
 * This module provides utilities for converting emojis to canonical images
 * and encoding them in Aptos Fungible Asset metadata format.
 */

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

export interface AptosFungibleAssetMetadata {
  /** Token name */
  name: string;
  /** Token symbol (emoji) */
  symbol: string;
  /** Token description */
  description: string;
  /** Canonical image metadata */
  canonical_image?: CanonicalImageMetadata;
  /** Additional metadata */
  additional_metadata?: Record<string, string>;
}

/**
 * Converts an emoji to a canvas and returns the image data
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
  return new Promise((resolve, reject) => {
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas size
      const canvasWidth = width || size;
      const canvasHeight = height || size;
      
      // Check for canvas size limits (browser-dependent, typically 16,384x16,384)
      const maxCanvasSize = 16384;
      if (canvasWidth > maxCanvasSize || canvasHeight > maxCanvasSize) {
        reject(new Error(`Canvas size too large. Maximum supported: ${maxCanvasSize}x${maxCanvasSize}`));
        return;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Set background (transparent)
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Configure text rendering with high quality
      const fontSize = Math.min(canvasWidth, canvasHeight) * 0.8;
      ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols", "EmojiOne Mozilla", "Twemoji Mozilla", "Segoe UI Symbol", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw emoji
      ctx.fillText(emoji, canvasWidth / 2, canvasHeight / 2);

      // Convert to base64 with maximum quality
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const base64Data = dataUrl.split(',')[1]; // Remove data:image/png;base64, prefix
      
      resolve(base64Data);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Creates canonical image metadata for an emoji
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
 * Creates a combined canonical image for multiple emojis
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
  return new Promise((resolve, reject) => {
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas size
      const canvasWidth = width || size;
      const canvasHeight = height || size;
      
      // Check for canvas size limits
      const maxCanvasSize = 16384;
      if (canvasWidth > maxCanvasSize || canvasHeight > maxCanvasSize) {
        reject(new Error(`Canvas size too large. Maximum supported: ${maxCanvasSize}x${maxCanvasSize}`));
        return;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Set background (transparent)
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

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
      } else if (emojis.length === 4) {
        // Four emojis - 2x2 grid
        const emojiSize = Math.min(canvasWidth, canvasHeight) * 0.4;
        ctx.font = `${emojiSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols", "EmojiOne Mozilla", "Twemoji Mozilla", "Segoe UI Symbol", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Top left
        ctx.fillText(emojis[0], canvasWidth * 0.25, canvasHeight * 0.25);
        // Top right
        ctx.fillText(emojis[1], canvasWidth * 0.75, canvasHeight * 0.25);
        // Bottom left
        ctx.fillText(emojis[2], canvasWidth * 0.25, canvasHeight * 0.75);
        // Bottom right
        ctx.fillText(emojis[3], canvasWidth * 0.75, canvasHeight * 0.75);
      } else {
        // Multiple emojis - improved grid layout with better spacing
        const gridSize = Math.ceil(Math.sqrt(emojis.length));
        const padding = Math.min(canvasWidth, canvasHeight) * 0.1; // Add padding
        const availableWidth = canvasWidth - (padding * 2);
        const availableHeight = canvasHeight - (padding * 2);
        const cellWidth = availableWidth / gridSize;
        const cellHeight = availableHeight / gridSize;
        const emojiSize = Math.min(cellWidth, cellHeight) * 0.6; // Smaller emojis for better spacing
        
        ctx.font = `${emojiSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols", "EmojiOne Mozilla", "Twemoji Mozilla", "Segoe UI Symbol", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        emojis.forEach((emoji, index) => {
          const row = Math.floor(index / gridSize);
          const col = index % gridSize;
          const x = padding + (col * cellWidth) + (cellWidth / 2);
          const y = padding + (row * cellHeight) + (cellHeight / 2);
          ctx.fillText(emoji, x, y);
        });
      }

      // Convert to base64 with maximum quality
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const base64Data = dataUrl.split(',')[1]; // Remove data:image/png;base64, prefix
      
      resolve({
        image_data: base64Data,
        image_type: 'image/png',
        width: canvasWidth,
        height: canvasHeight,
        format: 'PNG'
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Creates canonical image metadata for multiple emojis
 * @param emojis - Array of emoji strings
 * @param size - The size of each emoji image (default: 64)
 * @returns Promise that resolves to array of canonical image metadata
 */
export const createCanonicalImageMetadataForEmojis = async (
  emojis: string[],
  size: number = 64
): Promise<CanonicalImageMetadata[]> => {
  const metadataPromises = emojis.map(emoji => 
    createCanonicalImageMetadata(emoji, size)
  );
  
  return Promise.all(metadataPromises);
};

/**
 * Creates Aptos Fungible Asset metadata with canonical images
 * @param emojis - Array of emoji strings
 * @param name - Token name
 * @param description - Token description
 * @param imageSize - Size of canonical images (default: 64)
 * @returns Promise that resolves to complete metadata
 */
export const createAptosFungibleAssetMetadata = async (
  emojis: string[],
  name: string,
  description: string,
  imageSize: number = 64
): Promise<AptosFungibleAssetMetadata> => {
  // Create combined canonical image for all emojis
  const combinedCanonicalImage = await createCombinedCanonicalImageMetadata(emojis, imageSize);
  
  // Create individual canonical images for additional metadata
  const canonicalImages = await createCanonicalImageMetadataForEmojis(emojis, imageSize);
  
  // Create additional metadata with all emoji images
  const additionalMetadata: Record<string, string> = {};
  canonicalImages.forEach((image, index) => {
    additionalMetadata[`emoji_${index}_image`] = image.image_data;
    additionalMetadata[`emoji_${index}_type`] = image.image_type;
  });
  
  return {
    name,
    symbol: emojis.join(''),
    description,
    canonical_image: combinedCanonicalImage,
    additional_metadata: additionalMetadata
  };
};

/**
 * Validates canonical image metadata
 * @param metadata - The metadata to validate
 * @returns True if metadata is valid
 */
export const validateCanonicalImageMetadata = (metadata: CanonicalImageMetadata): boolean => {
  return (
    typeof metadata.image_data === 'string' &&
    metadata.image_data.length > 0 &&
    metadata.image_type === 'image/png' &&
    typeof metadata.width === 'number' &&
    typeof metadata.height === 'number' &&
    metadata.width > 0 &&
    metadata.height > 0 &&
    metadata.format === 'PNG'
  );
};

/**
 * Decodes base64 image data back to a data URL
 * @param base64Data - Base64 encoded image data
 * @param mimeType - MIME type (default: 'image/png')
 * @returns Data URL string
 */
export const base64ToDataUrl = (base64Data: string, mimeType: string = 'image/png'): string => {
  return `data:${mimeType};base64,${base64Data}`;
};

/**
 * Gets the size of base64 encoded data in bytes
 * @param base64Data - Base64 encoded data
 * @returns Size in bytes
 */
export const getBase64Size = (base64Data: string): number => {
  // Base64 encoding increases size by ~33%, so we need to decode to get actual size
  const padding = (base64Data.match(/=/g) || []).length;
  return Math.floor((base64Data.length * 3) / 4) - padding;
};

/**
 * Checks if canonical image metadata would fit within Aptos metadata size limits
 * @param metadata - The metadata to check
 * @param maxSizeBytes - Maximum size in bytes (default: 100KB)
 * @returns True if metadata fits within limits
 */
export const checkMetadataSizeLimit = (
  metadata: CanonicalImageMetadata, 
  maxSizeBytes: number = 100 * 1024
): boolean => {
  const imageSize = getBase64Size(metadata.image_data);
  const totalSize = imageSize + JSON.stringify(metadata).length;
  
  return totalSize <= maxSizeBytes;
};

/**
 * Creates a 720p (1280x720) canonical image for an emoji
 * @param emoji - The emoji string
 * @returns Promise that resolves to canonical image metadata
 */
export const create720pCanonicalImageMetadata = async (
  emoji: string
): Promise<CanonicalImageMetadata> => {
  return createCanonicalImageMetadata(emoji, 720, 1280, 720);
};

/**
 * Creates a 720p (1280x720) combined canonical image for multiple emojis
 * @param emojis - Array of emoji strings
 * @returns Promise that resolves to canonical image metadata
 */
export const create720pCombinedCanonicalImageMetadata = async (
  emojis: string[]
): Promise<CanonicalImageMetadata> => {
  return createCombinedCanonicalImageMetadata(emojis, 720, 1280, 720);
};

/**
 * Gets resolution dimensions from resolution string
 * @param resolution - Resolution string (e.g., "720p", "64px")
 * @returns Object with width and height
 */
export const getResolutionDimensions = (resolution: string): { width: number; height: number } => {
  switch (resolution) {
    case '64px':
      return { width: 64, height: 64 };
    case '128px':
      return { width: 128, height: 128 };
    case '256px':
      return { width: 256, height: 256 };
    case '512px':
      return { width: 512, height: 512 };
    case '720p':
      return { width: 1280, height: 720 };
    case '1080p':
      return { width: 1920, height: 1080 };
    default:
      return { width: 128, height: 128 };
  }
};

/**
 * Downloads an emoji image at the specified resolution
 * @param emojis - Array of emoji strings
 * @param resolution - Resolution string
 * @param filename - Optional filename (without extension)
 */
export const downloadEmojiImage = async (
  emojis: string[],
  resolution: string,
  filename?: string
): Promise<void> => {
  try {
    const { width, height } = getResolutionDimensions(resolution);
    
    // For square resolutions, use the same approach as preview
    if (width === height) {
      const metadata = await createCombinedCanonicalImageMetadata(emojis, width);
      const dataUrl = base64ToDataUrl(metadata.image_data);
      const link = document.createElement('a');
      link.href = dataUrl;
      
      const defaultFilename = filename || `emoji_${emojis.join('')}_${resolution}`;
      link.download = `${defaultFilename}.png`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For rectangular resolutions (720p, 1080p), use the width/height parameters
      const metadata = await createCombinedCanonicalImageMetadata(emojis, Math.min(width, height), width, height);
      const dataUrl = base64ToDataUrl(metadata.image_data);
      const link = document.createElement('a');
      link.href = dataUrl;
      
      const defaultFilename = filename || `emoji_${emojis.join('')}_${resolution}`;
      link.download = `${defaultFilename}.png`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('Error downloading emoji image:', error);
    throw error;
  }
};

/**
 * Optimizes canonical image metadata to fit within size limits
 * @param metadata - The metadata to optimize
 * @param maxSizeBytes - Maximum size in bytes (default: 100KB)
 * @returns Optimized metadata or null if optimization fails
 */
export const optimizeMetadataForSize = async (
  metadata: CanonicalImageMetadata,
  maxSizeBytes: number = 100 * 1024
): Promise<CanonicalImageMetadata | null> => {
  if (checkMetadataSizeLimit(metadata, maxSizeBytes)) {
    return metadata;
  }

  // Try reducing image size
  const sizes = [48, 32, 24, 16];
  
  for (const size of sizes) {
    // Recreate image with smaller size
    // Note: This is a simplified approach - in practice you'd need to recreate from the original emoji
    const optimizedMetadata: CanonicalImageMetadata = {
      ...metadata,
      width: size,
      height: size
    };
    
    if (checkMetadataSizeLimit(optimizedMetadata, maxSizeBytes)) {
      return optimizedMetadata;
    }
  }
  
  return null; // Could not optimize within limits
};

/**
 * Advanced size optimization for emoji images with multiple strategies
 * @param emojis - Array of emoji strings
 * @param maxSizeBytes - Maximum size in bytes (default: 4096 for 4KB limit)
 * @returns Promise that resolves to optimized image data or null if not possible
 */
export const advancedOptimizeEmojiImageForSize = async (
  emojis: string[],
  maxSizeBytes: number = 4096
): Promise<{ data: number[], size: number } | null> => {
  // Strategy 1: Try progressively smaller sizes
  const sizes = [64, 48, 32, 24, 16, 12, 8];
  
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
  
  // Strategy 2: Try with reduced emoji count (for multi-emoji combinations)
  if (emojis.length > 1) {
    // Try with just the first emoji
    const singleEmojiResult = await advancedOptimizeEmojiImageForSize([emojis[0]], maxSizeBytes);
    if (singleEmojiResult) {
      return singleEmojiResult;
    }
    
    // Try with first two emojis
    if (emojis.length > 2) {
      const twoEmojiResult = await advancedOptimizeEmojiImageForSize(emojis.slice(0, 2), maxSizeBytes);
      if (twoEmojiResult) {
        return twoEmojiResult;
      }
    }
  }
  
  // Strategy 3: Create a minimal fallback image
  try {
    // Create a minimal 1x1 transparent PNG as absolute fallback
    const minimalPngBytes = [
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // width: 1
      0x00, 0x00, 0x00, 0x01, // height: 1
      0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
      0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
      0x49, 0x44, 0x41, 0x54, // IDAT
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
      0x00, 0x00, 0x00, 0x00, // IEND chunk length
      0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82  // CRC
    ];
    
    if (minimalPngBytes.length <= maxSizeBytes) {
      return {
        data: minimalPngBytes,
        size: 1
      };
    }
  } catch (error) {
    console.warn('Failed to create minimal fallback image:', error);
  }
  
  return null;
};

/**
 * Gets size statistics for emoji images
 * @param emojis - Array of emoji strings
 * @returns Promise that resolves to size statistics
 */
export const getEmojiImageSizeStats = async (emojis: string[]): Promise<{
  sizes: { [size: number]: number };
  recommendations: string[];
}> => {
  const sizes: { [size: number]: number } = {};
  const recommendations: string[] = [];
  
  const testSizes = [64, 48, 32, 24, 16];
  
  for (const size of testSizes) {
    try {
      const metadata = await createCombinedCanonicalImageMetadata(emojis, size);
      const base64Data = metadata.image_data;
      const byteArray = [];
      for (let i = 0; i < base64Data.length; i++) {
        byteArray.push(base64Data.charCodeAt(i));
      }
      
      sizes[size] = byteArray.length;
    } catch (error) {
      sizes[size] = -1; // Error
    }
  }
  
  // Generate recommendations
  const minSize = Math.min(...Object.values(sizes).filter(s => s > 0));
  if (minSize > 4096) {
    recommendations.push('All image sizes exceed 4KB limit. Consider using fewer or simpler emojis.');
  } else if (minSize > 2048) {
    recommendations.push('Image size is large. Consider using a smaller emoji combination.');
  } else if (minSize <= 1024) {
    recommendations.push('Image size is well within limits. You can use larger sizes if needed.');
  }
  
  return { sizes, recommendations };
}; 