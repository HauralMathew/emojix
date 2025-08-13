type OnboardingHowToProps = {
  onNext: () => void;
  onBack: () => void;
};

export default function OnboardingHowTo({ onNext, onBack }: OnboardingHowToProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Premium, subtle lime glow gradient */}
      <div className="absolute left-[-15%] top-[-10%] h-[120%] w-[50%] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/30 via-primary/0 to-transparent z-0 pointer-events-none" />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4 pt-1 pb-12">
        {/* Top section - Indicator, Title, and Description */}
        <div className="w-full mb-16">
          {/* Indicator */}
          <div className="flex justify-center mb-6 w-full">
            <div className="h-2 w-32 rounded-full bg-surface">
              <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: '100%' }} />
            </div>
          </div>
          {/* Title and subtitle */}
          <h2 className="text-3xl font-bold text-text mb-2 text-center">How Emojix Works</h2>
          <p className="text-text/80 text-center max-w-md text-sm mx-auto">
            Discover the magic behind your personalized emoticon experience
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          {/* Feature 1 */}
          <div className="bg-surface/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">Smart Collections</h3>
            <p className="text-text/70 text-sm">Organize your emoticons into intelligent collections that adapt to your usage patterns</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-surface/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">Lightning Fast</h3>
            <p className="text-text/70 text-sm">Instant search and seamless integration across all your favorite platforms</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-surface/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">AI Powered</h3>
            <p className="text-text/70 text-sm">Advanced AI suggests the perfect emoticon for every conversation context</p>
          </div>
        </div>

        {/* Bottom section with Dive In button */}
        <div className="text-center">
          <p className="text-text/60 text-sm mb-8 max-w-lg mx-auto">
            Ready to transform your digital conversations? Your personalized emoticon journey starts now!
          </p>
          
          {/* Dive In Button */}
          <button 
            onClick={onNext}
            className="group relative px-8 py-4 bg-gradient-to-r from-primary to-primary/80 rounded-2xl text-background font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/25"
          >
            <span className="relative z-10">Dive In</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      {/* Top left back arrow */}
      <button onClick={onBack} className="absolute top-8 left-8 flex items-center justify-center text-text hover:text-primary transition z-20">
        <svg width="28" height="16" viewBox="0 0 28 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M26 9H2M2 9L10 2M2 9L10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
} 