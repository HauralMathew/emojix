import { useState } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import EmojiPicker from '../components/EmojiPicker';
import { validateEmojis, emojisToHexCodes, getEmojiMetadata } from '../utils/emojiUtils';

export default function EmojiPickerDemo() {
  const navigate = useNavigate();
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);
  const [demoEmojis, setDemoEmojis] = useState<string[]>([]);

  const handleAddEmoji = (emoji: string) => {
    if (!selectedEmojis.includes(emoji)) {
      setSelectedEmojis([...selectedEmojis, emoji]);
    }
  };

  const handleRemoveEmoji = (index: number) => {
    setSelectedEmojis(selectedEmojis.filter((_, i) => i !== index));
  };

  const handleDemoAddEmoji = (emoji: string) => {
    if (!demoEmojis.includes(emoji)) {
      setDemoEmojis([...demoEmojis, emoji]);
    }
  };

  const handleDemoRemoveEmoji = (index: number) => {
    setDemoEmojis(demoEmojis.filter((_, i) => i !== index));
  };

  const handleTestValidation = () => {
    const validEmojis = validateEmojis(selectedEmojis);
    const hexCodes = emojisToHexCodes(validEmojis);
    
    console.log('Validation Results:', {
      original: selectedEmojis,
      valid: validEmojis,
      hexCodes,
      metadata: validEmojis.map(emoji => getEmojiMetadata(emoji))
    });
    
    alert(`Valid emojis: ${validEmojis.length}/${selectedEmojis.length}\nHex codes: ${hexCodes.join(', ')}`);
  };

  return (
    <div className="min-h-screen bg-background p-4 mt-16">
      {/* Header */}
      <div className="flex items-center mb-8 pl-4">
        <button
          onClick={() => navigate('/quick-launch')}
          className="flex items-center space-x-2 text-text/70 hover:text-primary transition-colors"
        >
          <IconArrowLeft className="w-5 h-5" />
          <span>Back to Quick Launch</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Emoji Picker Demo</h1>
          <p className="text-text/70">Professional emoji picker with search, categories, and validation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Emoji Picker */}
          <div className="space-y-6">
            <div className="bg-surface/20 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-text mb-4">Main Emoji Picker (Max 10)</h2>
              <EmojiPicker
                selectedEmojis={selectedEmojis}
                onEmojiSelect={handleAddEmoji}
                onEmojiRemove={handleRemoveEmoji}
                maxEmojis={10}
              />
            </div>

            {/* Validation Test */}
            <div className="bg-surface/20 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-text mb-4">Validation & Hex Conversion</h3>
              <div className="space-y-4">
                <button
                  onClick={handleTestValidation}
                  className="w-full py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Test Validation & Hex Conversion
                </button>
                <div className="text-sm text-text/70">
                  <p>• Validates selected emojis against our dataset</p>
                  <p>• Converts emojis to hex codes for smart contracts</p>
                  <p>• Shows metadata for each emoji</p>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Picker */}
          <div className="space-y-6">
            <div className="bg-surface/20 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-text mb-4">Demo Picker (Max 5)</h2>
              <EmojiPicker
                selectedEmojis={demoEmojis}
                onEmojiSelect={handleDemoAddEmoji}
                onEmojiRemove={handleDemoRemoveEmoji}
                maxEmojis={5}
              />
            </div>

            {/* Features Showcase */}
            <div className="bg-surface/20 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-text mb-4">Features</h3>
              <div className="space-y-3 text-sm text-text/70">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Search emojis by name or character</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Browse by categories (Smileys, Nature, Food, etc.)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Collapsible picker interface</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Configurable maximum emoji limit</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Real-time validation and feedback</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Hex code conversion for smart contracts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Accessible with proper ARIA labels</span>
                </div>
              </div>
            </div>

            {/* Dataset Info */}
            <div className="bg-surface/20 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-text mb-4">Dataset Information</h3>
              <div className="space-y-2 text-sm text-text/70">
                <p><strong>Source:</strong> Twitter Emoji Dataset</p>
                <p><strong>Total Emojis:</strong> 1,053</p>
                <p><strong>Categories:</strong> 10</p>
                <p><strong>Format:</strong> Unicode + Hex Codes</p>
                <p><strong>Compatibility:</strong> Smart Contract Ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 