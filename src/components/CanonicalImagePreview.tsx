import { useState, useEffect } from 'react';
import { IconDownload, IconEye, IconEyeOff } from '@tabler/icons-react';
import { 
  createCanonicalImageMetadata, 
  createCombinedCanonicalImageMetadata,
  createAptosFungibleAssetMetadata,
  base64ToDataUrl,
  getBase64Size,
  checkMetadataSizeLimit,
  type CanonicalImageMetadata,
  type AptosFungibleAssetMetadata
} from '../utils/emojiImageUtils';

interface CanonicalImagePreviewProps {
  emojis: string[];
  tokenName: string;
  description: string;
}

export default function CanonicalImagePreview({ 
  emojis, 
  tokenName, 
  description 
}: CanonicalImagePreviewProps) {
  const [canonicalImages, setCanonicalImages] = useState<CanonicalImageMetadata[]>([]);
  const [combinedImage, setCombinedImage] = useState<CanonicalImageMetadata | null>(null);
  const [fullMetadata, setFullMetadata] = useState<AptosFungibleAssetMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [imageSize, setImageSize] = useState(64);

  useEffect(() => {
    if (emojis.length > 0) {
      generateCanonicalImages();
    }
  }, [emojis, imageSize]);

  const generateCanonicalImages = async () => {
    setLoading(true);
    try {
      // Generate combined canonical image
      const combined = await createCombinedCanonicalImageMetadata(emojis, imageSize);
      setCombinedImage(combined);

      // Generate canonical images for each emoji
      const images = await Promise.all(
        emojis.map(emoji => createCanonicalImageMetadata(emoji, imageSize))
      );
      setCanonicalImages(images);

      // Generate full Aptos metadata
      const metadata = await createAptosFungibleAssetMetadata(
        emojis,
        tokenName,
        description,
        imageSize
      );
      setFullMetadata(metadata);
    } catch (error) {
      console.error('Error generating canonical images:', error);
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

  const downloadMetadata = () => {
    if (!fullMetadata) return;
    
    const metadataJson = JSON.stringify(fullMetadata, null, 2);
    const blob = new Blob([metadataJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tokenName.replace(/[^a-zA-Z0-9]/g, '_')}_metadata.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getTotalMetadataSize = () => {
    if (!fullMetadata) return 0;
    const metadataJson = JSON.stringify(fullMetadata);
    return new Blob([metadataJson]).size;
  };

  const isWithinSizeLimit = () => {
    if (!fullMetadata?.canonical_image) return true;
    return checkMetadataSizeLimit(fullMetadata.canonical_image);
  };

  if (emojis.length === 0) {
    return (
      <div className="bg-surface/20 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-text mb-4">Canonical Image Preview</h3>
        <p className="text-text/70">Select emojis to generate canonical images</p>
      </div>
    );
  }

  return (
    <div className="bg-surface/20 backdrop-blur-xl rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text">Canonical Image Preview</h3>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-text/70">Image Size:</label>
          <select
            value={imageSize}
            onChange={(e) => setImageSize(Number(e.target.value))}
            className="bg-surface/30 border border-white/10 rounded px-2 py-1 text-sm text-text"
          >
            <option value={16}>16px</option>
            <option value={24}>24px</option>
            <option value={32}>32px</option>
            <option value={48}>48px</option>
            <option value={64}>64px</option>
            <option value={128}>128px</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-text/70 mt-2">Generating canonical images...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Combined Canonical Image */}
          {combinedImage && (
            <div>
              <h4 className="text-md font-medium text-text mb-3">Combined Canonical Image</h4>
              <div className="bg-surface/30 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-medium text-text">Primary Token Image</span>
                  <button
                    onClick={() => downloadImage(combinedImage.image_data, `combined_${emojis.join('')}.png`)}
                    className="text-primary hover:text-primary/80 transition-colors"
                    aria-label="Download combined image"
                  >
                    <IconDownload className="w-4 h-4" />
                  </button>
                </div>
                <img
                  src={base64ToDataUrl(combinedImage.image_data)}
                  alt={`Combined canonical image for ${emojis.join('')}`}
                  className="w-full h-auto rounded border border-white/10"
                />
                <div className="text-xs text-text/60 mt-2 space-y-1">
                  <p>Size: {combinedImage.width}x{combinedImage.height}px</p>
                  <p>Data: {getBase64Size(combinedImage.image_data).toLocaleString()} bytes</p>
                  <p>Layout: {emojis.length === 1 ? 'Single' : emojis.length === 2 ? 'Side by Side' : 'Grid'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Individual Canonical Images */}
          {canonicalImages.length > 1 && (
            <div>
              <h4 className="text-md font-medium text-text mb-3">Individual Emoji Images</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {canonicalImages.map((image, index) => (
                  <div
                    key={index}
                    className="bg-surface/30 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{emojis[index]}</span>
                      <button
                        onClick={() => downloadImage(image.image_data, `emoji_${index}.png`)}
                        className="text-primary hover:text-primary/80 transition-colors"
                        aria-label="Download image"
                      >
                        <IconDownload className="w-4 h-4" />
                      </button>
                    </div>
                    <img
                      src={base64ToDataUrl(image.image_data)}
                      alt={`Canonical image for ${emojis[index]}`}
                      className="w-full h-auto rounded border border-white/10"
                    />
                    <div className="text-xs text-text/60 mt-2 space-y-1">
                      <p>Size: {image.width}x{image.height}px</p>
                      <p>Data: {getBase64Size(image.image_data).toLocaleString()} bytes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Summary */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-medium text-text">Aptos Metadata</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMetadata(!showMetadata)}
                  className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors text-sm"
                >
                  {showMetadata ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                  <span>{showMetadata ? 'Hide' : 'Show'} Metadata</span>
                </button>
                <button
                  onClick={downloadMetadata}
                  className="flex items-center space-x-1 bg-primary text-background px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors"
                >
                  <IconDownload className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div className="bg-surface/30 rounded-lg p-4 border border-white/10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-text/70">Token Name</p>
                  <p className="text-text font-medium">{tokenName}</p>
                </div>
                <div>
                  <p className="text-text/70">Symbol</p>
                  <p className="text-text font-medium">{emojis.join('')}</p>
                </div>
                <div>
                  <p className="text-text/70">Total Size</p>
                  <p className={`font-medium ${isWithinSizeLimit() ? 'text-green-400' : 'text-red-400'}`}>
                    {getTotalMetadataSize().toLocaleString()} bytes
                  </p>
                </div>
                <div>
                  <p className="text-text/70">Status</p>
                  <p className={`font-medium ${isWithinSizeLimit() ? 'text-green-400' : 'text-red-400'}`}>
                    {isWithinSizeLimit() ? '✅ Valid' : '❌ Too Large'}
                  </p>
                </div>
              </div>

              {showMetadata && fullMetadata && (
                <div className="mt-4">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-primary hover:text-primary/80">
                      View Full Metadata JSON
                    </summary>
                    <pre className="mt-2 bg-surface/50 rounded p-3 overflow-x-auto text-xs">
                      {JSON.stringify(fullMetadata, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h4 className="text-md font-medium text-primary mb-2">How to Use</h4>
            <div className="text-sm text-text/80 space-y-2">
              <p>• Canonical images are automatically generated for each emoji</p>
              <p>• Images are encoded as base64 PNG data in the metadata</p>
              <p>• The primary canonical image uses the first emoji</p>
              <p>• All emoji images are stored in additional_metadata</p>
              <p>• Download the metadata JSON to use with Aptos Fungible Assets</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 