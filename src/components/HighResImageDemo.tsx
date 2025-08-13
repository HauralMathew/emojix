import { useState } from 'react';
import { IconDownload, IconEye, IconEyeOff } from '@tabler/icons-react';
import { 
  create720pCanonicalImageMetadata,
  create720pCombinedCanonicalImageMetadata,
  base64ToDataUrl,
  getBase64Size,
  type CanonicalImageMetadata
} from '../utils/emojiImageUtils';

interface HighResImageDemoProps {
  emojis: string[];
}

export default function HighResImageDemo({ emojis }: HighResImageDemoProps) {
  const [individualImages, setIndividualImages] = useState<CanonicalImageMetadata[]>([]);
  const [combinedImage, setCombinedImage] = useState<CanonicalImageMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const generate720pImages = async () => {
    if (emojis.length === 0) return;
    
    setLoading(true);
    try {
      // Generate individual 720p images
      const individual = await Promise.all(
        emojis.map(emoji => create720pCanonicalImageMetadata(emoji))
      );
      setIndividualImages(individual);

      // Generate combined 720p image
      const combined = await create720pCombinedCanonicalImageMetadata(emojis);
      setCombinedImage(combined);
    } catch (error) {
      console.error('Error generating 720p images:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (imageData: string, filename: string) => {
    const dataUrl = base64ToDataUrl(imageData);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-surface/20 backdrop-blur-xl rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text">720p High-Resolution Images</h3>
        <button
          onClick={generate720pImages}
          disabled={emojis.length === 0 || loading}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            emojis.length === 0 || loading
              ? 'bg-surface/30 text-text/50 cursor-not-allowed'
              : 'bg-primary text-background hover:bg-primary/90'
          }`}
        >
          {loading ? 'Generating...' : 'Generate 720p Images'}
        </button>
      </div>

      {emojis.length === 0 ? (
        <p className="text-text/70">Select emojis to generate 720p images</p>
      ) : loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-text/70 mt-2">Generating 720p images...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Combined 720p Image */}
          {combinedImage && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-text">Combined 720p Image (1280x720)</h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors text-sm"
                  >
                    {showDetails ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                    <span>{showDetails ? 'Hide' : 'Show'} Details</span>
                  </button>
                  <button
                    onClick={() => downloadImage(combinedImage.image_data, `720p_combined_${emojis.join('')}.png`)}
                    className="flex items-center space-x-1 bg-primary text-background px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors"
                  >
                    <IconDownload className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="bg-surface/30 rounded-lg p-4 border border-white/10">
                <img
                  src={base64ToDataUrl(combinedImage.image_data)}
                  alt={`720p combined image for ${emojis.join('')}`}
                  className="w-full h-auto rounded border border-white/10"
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                />
                
                {showDetails && (
                  <div className="mt-4 text-sm text-text/70 space-y-2">
                    <p>Resolution: {combinedImage.width}x{combinedImage.height} pixels</p>
                    <p>File Size: {getBase64Size(combinedImage.image_data).toLocaleString()} bytes</p>
                    <p>Format: {combinedImage.format}</p>
                    <p>Layout: {emojis.length === 1 ? 'Single' : emojis.length === 2 ? 'Side by Side' : 'Grid'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Individual 720p Images */}
          {individualImages.length > 1 && (
            <div>
              <h4 className="text-md font-medium text-text mb-3">Individual 720p Images</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {individualImages.map((image, index) => (
                  <div
                    key={index}
                    className="bg-surface/30 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{emojis[index]}</span>
                      <button
                        onClick={() => downloadImage(image.image_data, `720p_emoji_${index}.png`)}
                        className="text-primary hover:text-primary/80 transition-colors"
                        aria-label="Download image"
                      >
                        <IconDownload className="w-4 h-4" />
                      </button>
                    </div>
                    <img
                      src={base64ToDataUrl(image.image_data)}
                      alt={`720p image for ${emojis[index]}`}
                      className="w-full h-auto rounded border border-white/10"
                      style={{ maxHeight: '200px', objectFit: 'contain' }}
                    />
                    {showDetails && (
                      <div className="text-xs text-text/60 mt-2 space-y-1">
                        <p>Size: {image.width}x{image.height}px</p>
                        <p>Data: {getBase64Size(image.image_data).toLocaleString()} bytes</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 