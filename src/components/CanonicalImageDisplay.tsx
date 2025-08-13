import { useState, useEffect } from 'react';
import { createCombinedCanonicalImageMetadata, base64ToDataUrl } from '../utils/emojiImageUtils';

interface CanonicalImageDisplayProps {
  emojis: string[];
  size?: number;
  className?: string;
  fallbackEmoji?: string;
}

export default function CanonicalImageDisplay({ 
  emojis, 
  size = 48,
  className = "",
  fallbackEmoji = "😀"
}: CanonicalImageDisplayProps) {
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (emojis.length === 0) {
      setImageData(null);
      setError(null);
      return;
    }

    const generateImage = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const metadata = await createCombinedCanonicalImageMetadata(emojis, size);
        setImageData(metadata.image_data);
      } catch (err) {
        console.error('Error generating canonical image:', err);
        setError('Failed to generate image');
        setImageData(null);
      } finally {
        setLoading(false);
      }
    };

    generateImage();
  }, [emojis, size]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !imageData) {
    return (
      <div className={`flex items-center justify-center text-2xl ${className}`}>
        {fallbackEmoji}
      </div>
    );
  }

  return (
    <img
      src={base64ToDataUrl(imageData)}
      alt={`Canonical image for ${emojis.join('')}`}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
} 