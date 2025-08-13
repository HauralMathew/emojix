type CurrencySelectionProps = {
  onNext: () => void;
  onBack: () => void;
};

export default function CurrencySelection({ onNext, onBack }: CurrencySelectionProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Premium, subtle lime glow gradient */}
      <div className="absolute left-[-15%] top-[-10%] h-[120%] w-[50%] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/30 via-primary/0 to-transparent z-0 pointer-events-none" />
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4 pt-1 pb-12">
        {/* Top section - Indicator, Title, and Description */}
        <div className="w-full mb-20">
          {/* Indicator */}
          <div className="flex justify-center mb-6 w-full">
            <div className="h-2 w-32 rounded-full bg-surface">
              <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: '75%' }} />
            </div>
          </div>
          {/* Title and subtitle */}
          <h2 className="text-3xl font-bold text-text mb-2 text-center">Select Preferred Currency</h2>
          <p className="text-text/80 text-center max-w-md text-sm mx-auto">
            Select your preferred currency for transactions and pricing. You can change this later in settings.
          </p>
        </div>
        {/* Cards */}
        <div className="flex flex-col md:flex-row gap-8 w-full">
          {/* APT Card */}
          <div 
            onClick={onNext}
            className="flex-1 bg-surface/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 cursor-pointer hover:scale-105 transition-all duration-300 hover:border-primary/30 group"
          >
            <h3 className="text-2xl font-bold text-primary mb-4">APT</h3>
            {/* Skeleton Screen */}
            <div className="bg-background/50 rounded-lg p-4 mb-4 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-primary/20 rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-primary/10 rounded w-1/2"></div>
                  </div>
                </div>
                {/* Currency Box */}
                <div className="bg-primary/30 rounded-lg px-3 py-1 border border-primary/20">
                  <span className="text-primary font-semibold text-sm">APT</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-primary/15 rounded"></div>
                <div className="h-2 bg-primary/15 rounded w-5/6"></div>
                <div className="h-2 bg-primary/15 rounded w-4/6"></div>
              </div>
              <div className="flex gap-2 mt-3">
                <div className="w-6 h-6 bg-primary/30 rounded"></div>
                <div className="w-6 h-6 bg-primary/20 rounded"></div>
                <div className="w-6 h-6 bg-primary/10 rounded"></div>
              </div>
            </div>
            <p className="text-text/70 text-sm">Use Aptos blockchain for fast, secure transactions with low fees and high performance.</p>
          </div>
          
          {/* USD Card */}
          <div 
            onClick={onNext}
            className="flex-1 bg-surface/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 cursor-pointer hover:scale-105 transition-all duration-300 hover:border-primary/30 group"
          >
            <h3 className="text-2xl font-bold text-primary mb-4">USD</h3>
            {/* Skeleton Screen */}
            <div className="bg-background/50 rounded-lg p-4 mb-4 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-primary/20 rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-primary/10 rounded w-1/2"></div>
                  </div>
                </div>
                {/* Currency Box */}
                <div className="bg-primary/30 rounded-lg px-3 py-1 border border-primary/20">
                  <span className="text-primary font-semibold text-sm">USD</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-primary/15 rounded"></div>
                <div className="h-2 bg-primary/15 rounded w-4/5"></div>
                <div className="h-2 bg-primary/15 rounded w-3/5"></div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <div className="w-12 h-3 bg-primary/20 rounded"></div>
                <div className="w-8 h-8 bg-primary/30 rounded-full"></div>
              </div>
            </div>
            <p className="text-text/70 text-sm">Traditional US Dollar payments with familiar banking integration and widespread acceptance.</p>
          </div>
        </div>
      </div>
      {/* Top left back arrow (smaller) */}
      <button onClick={onBack} className="absolute top-8 left-8 flex items-center justify-center text-text hover:text-primary transition z-20">
        <svg width="28" height="16" viewBox="0 0 28 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M26 9H2M2 9L10 2M2 9L10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
} 