import { useState, useMemo } from 'react';
import { IconSearch, IconX, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { twitterEmojiDataset } from '../data/twitter-emoji-dataset';


interface EmojiPickerProps {
  selectedEmojis: string[];
  onEmojiSelect: (emoji: string) => void;
  onEmojiRemove: (index: number) => void;
  maxEmojis?: number;
}

// Category order for sorting (most used first)
const CATEGORY_ORDER = [
  'Smileys & Emotion',
  'People & Body', 
  'Animals & Nature',
  'Food & Drink',
  'Travel & Places',
  'Activities',
  'Objects',
  'Symbols',
  'Flags'
];

// Fitzpatrick skin tone modifiers to filter out
const SKIN_TONE_MODIFIERS = ['🏻', '🏼', '🏽', '🏾', '🏿'];

const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🎯' },
  { id: 'Smileys & Emotion', name: 'Smileys', icon: '😀' },
  { id: 'People & Body', name: 'People', icon: '👋' },
  { id: 'Animals & Nature', name: 'Nature', icon: '🐶' },
  { id: 'Food & Drink', name: 'Food', icon: '🍎' },
  { id: 'Travel & Places', name: 'Travel', icon: '🚗' },
  { id: 'Activities', name: 'Activities', icon: '⚽' },
  { id: 'Objects', name: 'Objects', icon: '💡' },
  { id: 'Symbols', name: 'Symbols', icon: '❤️' },
  { id: 'Flags', name: 'Flags', icon: '🏁' },
];



export default function EmojiPicker({ 
  selectedEmojis, 
  onEmojiSelect, 
  onEmojiRemove,
  maxEmojis = 10
}: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPicker, setShowPicker] = useState(false);

  // Sort emojis by category order and filter by search/category, excluding skin tone modifiers
  const sortedEmojis = useMemo(() => {
    let filtered = twitterEmojiDataset;
    
    // Filter out skin tone modifiers and component emojis
    filtered = filtered.filter(emoji => 
      !SKIN_TONE_MODIFIERS.includes(emoji.emoji) && 
      emoji.category !== 'Component'
    );
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(emoji => emoji.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(emoji => 
        emoji.name.toLowerCase().includes(query) ||
        emoji.emoji.includes(query)
      );
    }
    
    // Sort by category order
    if (selectedCategory === 'all' && !searchQuery.trim()) {
      return filtered.sort((a, b) => {
        const aIndex = CATEGORY_ORDER.indexOf(a.category);
        const bIndex = CATEGORY_ORDER.indexOf(b.category);
        return aIndex - bIndex;
      });
    }
    
    return filtered;
  }, [searchQuery, selectedCategory]);

  const handleEmojiClick = (emoji: string) => {
    console.log('Emoji clicked:', emoji, 'Current selectedEmojis:', selectedEmojis);
    
    // Allow selecting the same emoji multiple times
    const emojiBytes = new TextEncoder().encode(emoji).length;
    if (selectedEmojisBytes + emojiBytes <= maxEmojis) {
      onEmojiSelect(emoji);
    }
  };


  
  // Calculate total bytes of selected emojis
  const selectedEmojisBytes = useMemo(() => {
    return selectedEmojis.reduce((total, emoji) => {
      return total + new TextEncoder().encode(emoji).length;
    }, 0);
  }, [selectedEmojis]);
  
  const isMaxReached = selectedEmojisBytes >= maxEmojis;



  return (
    <div className="bg-surface/20 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-text">Emoji Picker</h3>
            <span className="text-sm text-text/70 bg-surface/30 px-2 py-1 rounded">
              {selectedEmojisBytes}/{maxEmojis} bytes
            </span>
          </div>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors"
          >
            <span className="text-sm">
              {showPicker ? 'Hide' : 'Show'} Picker
            </span>
            {showPicker ? (
              <IconChevronUp className="w-4 h-4" />
            ) : (
              <IconChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Selected Emojis - Always visible */}
        {selectedEmojis.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedEmojis.map((emoji, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-primary/20 px-3 py-2 rounded-lg border border-primary/30 shadow-sm"
              >
                <span className="text-2xl">{emoji}</span>
                <button
                  onClick={() => onEmojiRemove(index)}
                  className="text-primary hover:text-red-400 transition-colors p-1 rounded-full hover:bg-white/10"
                  aria-label="Remove emoji"
                >
                  <IconX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3 text-text/50">
            <p className="text-sm">No emojis selected yet</p>
          </div>
        )}



        {showPicker && (
          <>
            {/* Search Bar */}
            <div className="relative mb-4">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emojis..."
                className="w-full pl-10 pr-4 py-2 bg-surface/30 border border-white/10 rounded-lg text-text placeholder-text/50 focus:outline-none focus:border-primary/50"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-background'
                      : 'bg-surface/30 text-text hover:bg-surface/40'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Emoji Grid */}
      {showPicker && (
        <div className="p-6">
          {sortedEmojis.length > 0 ? (
            <div className="grid grid-cols-7 gap-4 max-h-80 overflow-y-auto px-2" style={{
              scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
            }}>
              {sortedEmojis.map((emojiItem, index) => (
                <button
                  key={`${emojiItem.hex}-${index}`}
                  onClick={() => handleEmojiClick(emojiItem.emoji)}
                  disabled={isMaxReached}
                  className={`py-4 mt-2 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-200 shadow-sm ${
                    isMaxReached
                      ? 'bg-surface/20 text-text/30 cursor-not-allowed'
                      : 'bg-surface/40 text-text hover:bg-surface/60 hover:scale-110 hover:shadow-md cursor-pointer border border-white/5'
                  }`}
                  title={emojiItem.name}
                  aria-label={`Select ${emojiItem.name} emoji`}
                >
                  <span className="relative flex items-center justify-center w-full h-full">
                    {emojiItem.emoji}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text/50">
              <div className="text-2xl mb-2">🔍</div>
              <p>No emojis found</p>
              <p className="text-sm">Try adjusting your search or category</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions - When picker is hidden */}
      {!showPicker && (
        <div className="p-6">
          <div className="grid grid-cols-7 gap-4 p-2">
            {sortedEmojis.slice(0, 35).map((emojiItem) => (
              <button
                key={emojiItem.emoji}
                onClick={() => handleEmojiClick(emojiItem.emoji)}
                disabled={isMaxReached}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-200 shadow-sm ${
                  isMaxReached
                    ? 'bg-surface/20 text-text/30 cursor-not-allowed'
                    : 'bg-surface/40 text-text hover:bg-surface/60 hover:scale-110 hover:shadow-md cursor-pointer border border-white/5'
                }`}
                title={emojiItem.name}
                aria-label={`Select ${emojiItem.name} emoji`}
              >
                {emojiItem.emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Max Emojis Warning */}
      {isMaxReached && (
        <div className="bg-amber-500/20 border-t border-amber-500/30 p-3">
          <p className="text-amber-400 text-sm text-center">
            Maximum {maxEmojis} bytes reached. Remove some emojis to add more.
          </p>
        </div>
      )}
    </div>
  );
} 