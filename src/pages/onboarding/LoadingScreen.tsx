import { useEffect, useState } from "react";

type LoadingScreenProps = {
  onComplete: () => void;
};

const jokes = [
  "Why did the emoticon go to therapy? It had too many mixed feelings! 😅",
  "What do you call an emoticon that's always late? A procrasti-emoji! ⏰",
  "Why did the developer break up with their emoticon? It was too clingy! 💔",
  "What's an emoticon's favorite dance? The emoji shuffle! 🕺",
  "Why did the emoticon get kicked out of the library? It was too loud! 🤫",
  "What do you call an emoticon that's good at math? A calcula-emoji! 🧮",
  "Why did the emoticon go to the gym? To work on its emoji-cles! 💪",
  "What's an emoticon's favorite movie? The Emoji Movie! 🎬",
  "Why did the emoticon bring a ladder? To reach the high notes! 🎵",
  "What do you call an emoticon that's always happy? A joy-emoji! 😊"
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentJokeIndex, setCurrentJokeIndex] = useState(0);
  const [showJoke, setShowJoke] = useState(false);

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.random() * 15 + 5; // Random progress increments
      });
    }, 200);

    // Joke rotation
    const jokeInterval = setInterval(() => {
      setShowJoke(false);
      setTimeout(() => {
        setCurrentJokeIndex(prev => (prev + 1) % jokes.length);
        setShowJoke(true);
      }, 300);
    }, 3000);

    // Show first joke after a delay
    setTimeout(() => setShowJoke(true), 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(jokeInterval);
    };
  }, [onComplete]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating emoticons */}
        <div className="absolute top-20 left-10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
          <span className="text-4xl">😊</span>
        </div>
        <div className="absolute top-40 right-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '2.5s' }}>
          <span className="text-3xl">🚀</span>
        </div>
        <div className="absolute bottom-32 left-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>
          <span className="text-2xl">✨</span>
        </div>
        <div className="absolute bottom-20 right-10 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>
          <span className="text-3xl">🎯</span>
        </div>
        <div className="absolute top-1/2 left-1/4 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '4s' }}>
          <span className="text-2xl">💫</span>
        </div>
        <div className="absolute top-1/3 right-1/3 animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '3s' }}>
          <span className="text-3xl">🌟</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center max-w-md px-6">
        {/* Loading title */}
        <h2 className="text-3xl font-bold text-text mb-8 text-center">
          Preparing Your Experience
        </h2>

        {/* Progress bar */}
        <div className="w-full mb-8">
          <div className="h-3 bg-surface rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-text/60 text-sm text-center mt-2">
            {Math.round(progress)}% Complete
          </p>
        </div>

        {/* Joke section */}
        <div className="bg-surface/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8 min-h-[120px] flex items-center justify-center">
          <div className={`transition-opacity duration-300 ${showJoke ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-text text-center text-sm leading-relaxed">
              {jokes[currentJokeIndex]}
            </p>
          </div>
        </div>

        {/* Loading animation */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-text/60 text-sm">Loading amazing features...</span>
        </div>
      </div>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
    </div>
  );
} 