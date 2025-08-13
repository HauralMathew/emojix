import videoBg from '../../assets/6573838-hd_1920_1080_30fps.mp4';

type OnboardingLandingProps = {
  onSkip: () => void;
  onStart: () => void;
};

export default function OnboardingLanding({ onSkip, onStart }: OnboardingLandingProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        src={videoBg}
        autoPlay
        loop
        muted
        playsInline
      />
      {/* Glassy Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="flex flex-col items-center w-full max-w-lg">
          <h1 className="text-4xl font-bold text-primary mb-4 drop-shadow-lg">Welcome to Emoticons</h1>
          <p className="text-lg text-text mb-8 max-w-xl text-center">Set your preferences to personalize your experience. You can skip or get started below.</p>
          <div className="flex gap-4">
            <button className="px-6 py-2 rounded-lg bg-surface/60 border border-white/20 text-text shadow-lg backdrop-blur-md hover:bg-surface/80 transition font-medium" onClick={onSkip}>
              Skip to App
            </button>
            <button className="px-6 py-2 rounded-lg bg-primary/80 border border-white/20 text-white shadow-lg backdrop-blur-md hover:bg-primary/90 transition font-medium" onClick={onStart}>
              Get Started
            </button>
          </div>
        </div>
      </div>
      {/* Overlay for darken effect */}
      <div className="absolute inset-0 bg-black/80 z-5 pointer-events-none" />
    </div>
  );
} 