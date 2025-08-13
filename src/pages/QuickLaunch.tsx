import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconCheck, IconTrash, IconLoader, IconX } from '@tabler/icons-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';
import EmojiPicker from '../components/EmojiPicker';
import { validateEmojis, emojisToMarketName, emojiToShortName, emojisToContractFormat } from '../utils/emojiUtils';
import CanonicalImageDisplay from '../components/CanonicalImageDisplay';
import { marketService } from '../services/marketService';
import { downloadEmojiImage } from '../utils/emojiImageUtils';
import { getMarketAddress } from '../utils/addressDerivation';
import { CONTRACT_ADDRESS, APTOS_API_KEY, DEVNET } from '../constants/contract';
import { useToast } from '../hooks/use-toast';

// Constants
const MAX_EMOJI_BYTES = 10;
const ESTIMATED_COST_APT = 2.0;

// Types
interface SocialLinks {
  website: string;
  twitter: string;
  telegram: string;
}

export default function QuickLaunch() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { account, connected, signAndSubmitTransaction } = useWallet();
  
  // Initialize Aptos client
  const aptosConfig = new AptosConfig({ 
    network: DEVNET,
    clientConfig: {
      API_KEY: APTOS_API_KEY
    }
  });
  const aptos = new Aptos(aptosConfig);
  
  // State
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [socials, setSocials] = useState<SocialLinks>({
    website: '',
    twitter: '',
    telegram: ''
  });
  const [isLaunching, setIsLaunching] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState('1080p');

  // Helper Functions
  const createShortName = (emojis: string[]): string => {
    return emojis.map(emoji => {
      const shortName = emojiToShortName(emoji);
      return shortName || 'unknown';
    }).join(' ');
  };

  const calculateTotalBytes = (emojis: string[]): number => {
    return emojis.reduce((total, emoji) => {
      const bytes = emojisToContractFormat([emoji]);
      return total + (bytes.length > 0 ? bytes[0].length : 0);
    }, 0);
  };

  const createMinimalIcon = (emojis: string[]): string => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text x="32" y="40" font-size="32" text-anchor="middle">${emojis.join('')}</text></svg>`;
    
    // Use UTF-8 safe encoding for SVG content with emojis
    const encoder = new TextEncoder();
    const bytes = encoder.encode(svgContent);
    
    // Convert bytes to base64 using a UTF-8 safe method
    const base64String = btoa(
      Array.from(bytes, byte => String.fromCharCode(byte)).join('')
    );
    
    return `data:image/svg+xml;base64,${base64String}`;
  };

  const generateCanonicalImageData = async (emojis: string[]): Promise<{ data: string, size: number }> => {
    if (emojis.length === 0) {
      throw new Error('No emojis selected');
    }

    try {
      const dataUrl = createMinimalIcon(emojis);
      
      if (dataUrl.length > 10000) {
        throw new Error(`Icon too large: ${dataUrl.length} characters. Try using fewer emojis.`);
      }
      
      return {
        data: dataUrl,
        size: 64
      };
    } catch (error) {
      console.error('Failed to generate canonical image:', error);
      throw error;
    }
  };

  // Event Handlers
  const handleAddEmoji = (emoji: string) => {
    const newEmojis = [...selectedEmojis, emoji];
    const totalBytes = calculateTotalBytes(newEmojis);
    
    if (totalBytes > MAX_EMOJI_BYTES) {
      toast(`Cannot add emoji: Would exceed ${MAX_EMOJI_BYTES} byte limit (${totalBytes} bytes)`, { 
        variant: 'destructive' 
      });
      return;
    }
    
    setSelectedEmojis(newEmojis);
  };

  const handleRemoveEmoji = (index: number) => {
    setSelectedEmojis(selectedEmojis.filter((_, i) => i !== index));
  };

  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        toast('Please select a valid image (JPEG, PNG, GIF, WebP) or video (MP4, WebM) file.', { 
          variant: 'destructive' 
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast('File size must be less than 10MB.', { 
          variant: 'destructive' 
        });
        return;
      }

      setCoverImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialChange = (platform: keyof SocialLinks, value: string) => {
    setSocials(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleDeleteCoverImage = () => {
    setCoverImage(null);
    setCoverPreview('');
    const fileInput = document.getElementById('cover-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleLaunch = async () => {
    if (!connected || !account) {
      toast('Please connect your wallet first', { variant: 'destructive' });
      return;
    }

    const validEmojis = validateEmojis(selectedEmojis);
    if (validEmojis.length === 0) {
      toast('Please select at least one valid emoji to launch your token.', { variant: 'destructive' });
      return;
    }

    const emojiBytes = emojisToContractFormat(validEmojis);
    const canonicalImageData = await generateCanonicalImageData(validEmojis);
    const shortName = createShortName(validEmojis);
    const marketName = emojisToMarketName(validEmojis);
    const category = 0; // 0: Meme, 1: Product, 2: Gaming

    setIsLaunching(true);
    try {
      if (!canonicalImageData.data || canonicalImageData.data.length === 0) {
        throw new Error('Empty canonical image data');
      }
      
      if (emojiBytes.length === 0) {
        throw new Error('No emoji bytes to submit');
      }
      
      console.log('--- Launch Debug ---');
      console.log('emojiBytes:', emojiBytes);
      console.log('emojiBytes type:', typeof emojiBytes);
      console.log('emojiBytes length:', emojiBytes.length);
      console.log('emojiBytes[0]:', emojiBytes[0]);
      console.log('emojiBytes[0] type:', typeof emojiBytes[0]);
      console.log('emojiBytes[0][0]:', emojiBytes[0][0]);
      console.log('emojiBytes[0][0] type:', typeof emojiBytes[0][0]);
      console.log('marketName:', marketName);
      console.log('marketName type:', typeof marketName);
      console.log('shortName:', shortName);
      console.log('shortName type:', typeof shortName);
      console.log('canonicalImageData.data:', canonicalImageData.data);
      console.log('canonicalImageData.data type:', typeof canonicalImageData.data);
      console.log('category:', category);
      console.log('category type:', typeof category);
      
      // Convert strings to proper format for Move
      const moveMarketName = marketName || "Unknown Market";
      const moveTokenName = shortName || "Unknown Token";
      const moveCanonicalImage = canonicalImageData.data || "";
      const moveCategory = Number(category);
      
      // Convert emoji bytes to numbers (u8) for the contract
      // Ensure each byte is a proper number, not a string
      const emojiBytesAsNumbers = emojiBytes.map(emojiByteArray => 
        emojiByteArray.map(byte => {
          const num = Number(byte);
          if (isNaN(num)) {
            throw new Error(`Invalid byte value: ${byte}`);
          }
          return num;
        })
      );
      
      // Validate input data before proceeding
      if (!moveMarketName || moveMarketName.trim() === '') {
        throw new Error('Market name is required');
      }
      
      if (!moveTokenName || moveTokenName.trim() === '') {
        throw new Error('Token name is required');
      }
      
      if (!moveCanonicalImage || moveCanonicalImage.trim() === '') {
        throw new Error('Canonical image data is required');
      }
      
      if (emojiBytesAsNumbers.length === 0) {
        throw new Error('No emoji data provided');
      }
      
      // Validate emoji bytes structure
      emojiBytesAsNumbers.forEach((byteArray, emojiIndex) => {
        if (!Array.isArray(byteArray) || byteArray.length === 0) {
          throw new Error(`Invalid emoji data structure at index ${emojiIndex}`);
        }
        byteArray.forEach((byte, byteIndex) => {
          if (typeof byte !== 'number' || isNaN(byte) || byte < 0 || byte > 255) {
            throw new Error(`Invalid byte value at emoji ${emojiIndex}, byte ${byteIndex}: ${byte}`);
          }
        });
      });
      
      console.log('Original emojiBytes:', emojiBytes);
      console.log('Converted emojiBytesAsNumbers:', emojiBytesAsNumbers);
      console.log('Type check - emojiBytesAsNumbers[0][0]:', emojiBytesAsNumbers[0][0], 'type:', typeof emojiBytesAsNumbers[0][0]);
      
      // Validate that all bytes are numbers
      emojiBytesAsNumbers.forEach((byteArray, emojiIndex) => {
        byteArray.forEach((byte, byteIndex) => {
          if (typeof byte !== 'number' || isNaN(byte)) {
            throw new Error(`Invalid byte at emoji ${emojiIndex}, byte ${byteIndex}: ${byte}`);
          }
        });
      });
      
      // Test with a simple array to see if the issue is with the data structure
      const testArray = [[240, 159, 145, 187]];
      console.log('Test array:', testArray);
      console.log('Test array types:', testArray.map(arr => arr.map(byte => typeof byte)));
      
      // Create the function arguments array
      const functionArgs = [
        emojiBytesAsNumbers, // array of arrays of numbers (u8)
        moveMarketName,
        moveTokenName,
        moveCanonicalImage,
        moveCategory,
      ];
      
      console.log('Function arguments array:', functionArgs);
      console.log('Function arguments types:', functionArgs.map(arg => typeof arg));
      
      // Log final parameters being sent to contract
      console.log('--- Final Parameters ---');
      console.log('emojiBytesAsNumbers (array of arrays of numbers):', emojiBytesAsNumbers);
      console.log('emojiBytesAsNumbers length:', emojiBytesAsNumbers.length);
      console.log('moveMarketName:', moveMarketName, 'type:', typeof moveMarketName);
      console.log('moveTokenName:', moveTokenName, 'type:', typeof moveTokenName);
      console.log('moveCanonicalImage:', moveCanonicalImage.substring(0, 50) + '...', 'type:', typeof moveCanonicalImage);
      console.log('moveCategory:', moveCategory, 'type:', typeof moveCategory);
      
      const response = await signAndSubmitTransaction({
          data: {
            function: `${CONTRACT_ADDRESS}::emojixcore::register_market`,
            typeArguments: [],
            functionArguments: functionArgs,
          }
        });
      
      await aptos.waitForTransaction({ transactionHash: response.hash });
      
      const predictedMarketAddress = getMarketAddress(validEmojis);
      
      // Send social data to backend
      try {
        const backendData = {
          market_address: predictedMarketAddress.toString(),
          socials: {
            website: socials.website || undefined,
            twitter: socials.twitter || undefined,
            telegram: socials.telegram || undefined,
          },
          description: description || undefined,
          tags: [shortName.toLowerCase().replace(/\s+/g, '_')],
          featured: false,
          verified: false,
          last_updated: new Date().toISOString(),
        };
        
        await marketService.createMarketData(backendData);
        console.log('Backend data sent successfully');
      } catch (backendError) {
        console.warn('Failed to send data to backend:', backendError);
      }
      
      toast('Emojicoin launched successfully! 🚀', { variant: 'default' });
      navigate('/emojis');
    } catch (error) {
      console.error('Launch error:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to launch emojicoin';
      
      if (error instanceof Error) {
        const errorStr = error.message.toLowerCase();
        
        if (errorStr.includes('insufficient funds') || errorStr.includes('balance')) {
          errorMessage = 'Insufficient APT balance. You need at least 2 APT to create a market.';
        } else if (errorStr.includes('already registered') || errorStr.includes('exists')) {
          errorMessage = 'This emoji combination is already registered as a market.';
        } else if (errorStr.includes('invalid emoji') || errorStr.includes('emoji bytes')) {
          errorMessage = 'Invalid emoji data. Please try different emojis.';
        } else if (errorStr.includes('market name') || errorStr.includes('token name')) {
          errorMessage = error.message;
        } else if (errorStr.includes('user rejected') || errorStr.includes('cancelled')) {
          errorMessage = 'Transaction was cancelled by user.';
        } else if (errorStr.includes('network') || errorStr.includes('connection')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (errorStr.includes('gas') || errorStr.includes('fee')) {
          errorMessage = 'Transaction failed due to gas issues. Please try again.';
        } else {
          errorMessage = `Launch failed: ${error.message}`;
        }
      }
      
      toast(errorMessage, { variant: 'destructive' });
    } finally {
      setIsLaunching(false);
    }
  };

  const isLaunchDisabled = selectedEmojis.length === 0 || 
    isLaunching || 
    !connected || 
    calculateTotalBytes(selectedEmojis) > MAX_EMOJI_BYTES;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Premium, subtle lime glow gradient */}
      <div className="absolute left-[-15%] top-[-10%] h-[120%] w-[50%] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/30 via-primary/0 to-transparent z-0 pointer-events-none" />
      
      {/* Back Button */}
      <div className="relative z-10 pt-6 pl-6 mt-16">
        <button
          onClick={() => navigate('/type-selection')}
          className="flex items-center gap-2 text-text/70 hover:text-primary transition-colors duration-200"
        >
          <IconArrowLeft className="w-5 h-5" />
          <span>Back to Type Selection</span>
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full px-4 pt-1 pb-12 mt-16">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Input Form */}
            <div className="space-y-6">
              {/* Emoji Selection */}
              <EmojiPicker
                selectedEmojis={selectedEmojis}
                onEmojiSelect={handleAddEmoji}
                onEmojiRemove={handleRemoveEmoji}
                maxEmojis={MAX_EMOJI_BYTES}
              />

              {/* Token Details */}
              <div className="bg-surface/20 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text">Token Details</h3>
                  <span className="text-xs text-text/50 bg-surface/30 px-2 py-1 rounded">Can be updated later</span>
                </div>
                
                <div className="space-y-4">
                  {/* Cover Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-text/70 mb-2">Cover Image/Video</label>
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleCoverImageChange}
                          className="hidden"
                          id="cover-upload"
                        />
                        {coverPreview ? (
                          <div className="space-y-2">
                            <div className="relative">
                              {coverImage?.type.startsWith('video/') ? (
                                <video
                                  src={coverPreview}
                                  className="w-full h-32 object-cover rounded-lg mx-auto"
                                  controls
                                />
                              ) : (
                                <img
                                  src={coverPreview}
                                  alt="Cover preview"
                                  className="w-full h-32 object-cover rounded-lg mx-auto"
                                />
                              )}
                              <button
                                onClick={handleDeleteCoverImage}
                                className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
                                aria-label="Delete cover image"
                              >
                                <IconTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label htmlFor="cover-upload" className="cursor-pointer block">
                            <div className="space-y-2">
                              <div className="w-16 h-16 bg-surface/30 rounded-lg mx-auto flex items-center justify-center">
                                <svg className="w-8 h-8 text-text/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </div>
                              <p className="text-sm text-text/70">Click to upload cover image/video</p>
                            </div>
                          </label>
                        )}
                      </div>
                      <div className="text-xs text-text/50 space-y-1">
                        <p>• Supported formats: JPEG, PNG, GIF, WebP, MP4, WebM</p>
                        <p>• Maximum file size: 10MB</p>
                        <p>• Recommended resolution: 1200x630px or higher</p>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <label className="block text-sm font-medium text-text/70 mb-2">Social Links</label>
                    <div className="space-y-3">
                      <input
                        type="url"
                        value={socials.website}
                        onChange={(e) => handleSocialChange('website', e.target.value)}
                        placeholder="Website URL"
                        className="w-full px-4 py-2 bg-surface/30 border border-white/10 rounded-lg text-text placeholder-text/50 focus:outline-none focus:border-primary/50"
                      />
                      <input
                        type="url"
                        value={socials.twitter}
                        onChange={(e) => handleSocialChange('twitter', e.target.value)}
                        placeholder="Twitter/X URL"
                        className="w-full px-4 py-2 bg-surface/30 border border-white/10 rounded-lg text-text placeholder-text/50 focus:outline-none focus:border-primary/50"
                      />
                      <input
                        type="url"
                        value={socials.telegram}
                        onChange={(e) => handleSocialChange('telegram', e.target.value)}
                        placeholder="Telegram URL"
                        className="w-full px-4 py-2 bg-surface/30 border border-white/10 rounded-lg text-text placeholder-text/50 focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-text/70 mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your emojicoin..."
                      rows={3}
                      className="w-full px-4 py-2 bg-surface/30 border border-white/10 rounded-lg text-text placeholder-text/50 focus:outline-none focus:border-primary/50 resize-none"
                    />
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-text/70 mb-2">Category</label>
                    <div className="px-4 py-3 bg-surface/30 border border-white/10 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-xs text-primary">🎭</span>
                          </div>
                          <span className="text-text font-medium">Meme</span>
                        </div>
                        <span className="text-xs text-text/50 bg-surface/50 px-2 py-1 rounded">Default</span>
                      </div>
                      <p className="text-xs text-text/50 mt-2">
                        All Quick Launch tokens are automatically categorized as "Meme" tokens.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Launch Preview */}
            <div className="space-y-6">
              <div className="bg-surface/20 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-text mb-4">Launch Preview</h3>
                
                <div className="space-y-4">
                  {/* Emoji Display */}
                  <div>
                    <p className="text-sm text-text/70 mb-2">Your Emojicoin:</p>
                    <div className="flex items-center space-x-4 p-4 bg-surface/30 rounded-lg">
                      <div className="w-48 h-48 flex items-center justify-center">
                        <CanonicalImageDisplay
                          emojis={selectedEmojis}
                          size={192}
                          fallbackEmoji="😀"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-text">
                          {selectedEmojis.join('') || 'Your Token Name'}
                        </h4>
                        <p className="text-sm text-text/70">
                          {selectedEmojis.length} emoji{selectedEmojis.length !== 1 ? 's' : ''} selected
                        </p>
                        {selectedEmojis.length > 0 && (
                          <p className="text-xs text-text/60 mt-1">
                            Name: {createShortName(selectedEmojis)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Image Resolution & Download */}
                  {selectedEmojis.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-text/70">Download Image:</p>
                        <select
                          value={selectedResolution}
                          onChange={(e) => setSelectedResolution(e.target.value)}
                          className="bg-surface/30 border border-white/10 rounded px-3 py-1 text-sm text-text"
                        >
                          <option value="64px">64px</option>
                          <option value="128px">128px</option>
                          <option value="256px">256px</option>
                          <option value="512px">512px</option>
                          <option value="720p">720p (1280x720)</option>
                          <option value="1080p">1080p (1920x1080)</option>
                        </select>
                      </div>
                      <div className="bg-surface/30 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-16 h-16 flex items-center justify-center">
                              <CanonicalImageDisplay
                                emojis={selectedEmojis}
                                size={64}
                                fallbackEmoji="😀"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text">
                                {selectedResolution} Resolution
                              </p>
                              <p className="text-xs text-text/60">
                                High-quality PNG image
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                await downloadEmojiImage(selectedEmojis, selectedResolution);
                              } catch (error) {
                                console.error('Download failed:', error);
                                toast('Failed to download image. Please try again.', { 
                                  variant: 'destructive' 
                                });
                              }
                            }}
                            className="bg-primary text-background px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Launch Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text/70">Market Name:</span>
                      <span className="text-text font-medium">
                        {emojisToMarketName(selectedEmojis) || 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text/70">Emoji Name:</span>
                      <span className="text-text font-medium text-right max-w-xs">
                        {selectedEmojis.length > 0 ? createShortName(selectedEmojis) : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text/70">Cover Media:</span>
                      <span className="text-text font-medium">{coverImage ? 'Uploaded' : 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text/70">Number of Emojis:</span>
                      <span className="text-text font-medium">
                        {selectedEmojis.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text/70">Category:</span>
                      <span className="text-text font-medium">
                        Meme (Default)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text/70">Market Creation Fee:</span>
                      <span className="text-primary font-medium">{ESTIMATED_COST_APT} APT</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2">
                      <span className="text-text font-medium">Total Cost:</span>
                      <span className="text-primary font-bold">{ESTIMATED_COST_APT} APT</span>
                    </div>
                  </div>

                  {/* Launch Button */}
                  <button
                    onClick={handleLaunch}
                    disabled={isLaunchDisabled}
                    className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                      isLaunchDisabled
                        ? 'bg-surface/30 text-text/50 cursor-not-allowed'
                        : isLaunching
                        ? 'bg-primary/70 text-background cursor-not-allowed'
                        : 'bg-primary text-background hover:bg-primary/90 hover:scale-105'
                    }`}
                  >
                    {isLaunching ? (
                      <>
                        <IconLoader className="w-5 h-5 animate-spin" />
                        <span>Launching...</span>
                      </>
                    ) : !connected ? (
                      <>
                        <IconCheck className="w-5 h-5" />
                        <span>Connect Wallet to Launch</span>
                      </>
                    ) : calculateTotalBytes(selectedEmojis) > MAX_EMOJI_BYTES ? (
                      <>
                        <IconX className="w-5 h-5" />
                        <span>Exceeds {MAX_EMOJI_BYTES} Byte Limit</span>
                      </>
                    ) : (
                      <>
                        <IconCheck className="w-5 h-5" />
                        <span>Launch Emojitoken ({ESTIMATED_COST_APT} APT)</span>
                      </>
                    )}
                  </button>

                  <p className="text-xs text-text/50 text-center">
                    By launching, you agree to our terms and conditions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 