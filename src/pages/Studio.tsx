import { useNavigate } from 'react-router-dom';

export default function Studio() {
  const navigate = useNavigate();

  const handleQuickLaunch = () => {
    navigate('/type-selection');
  };

  const handleProStudio = () => {
    // TODO: Navigate to Pro Studio page
    console.log('Pro Studio clicked');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Premium, subtle lime glow gradient */}
      <div className="absolute left-[-15%] top-[-10%] h-[120%] w-[50%] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/30 via-primary/0 to-transparent z-0 pointer-events-none" />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full px-4 pt-1 pb-12">
        {/* Top section - Title and Description */}
        <div className="w-full mb-16">
          {/* Title and subtitle */}
          <h2 className="text-3xl font-bold text-text mb-2 text-center">Welcome to Glayze Studio</h2>
          <p className="text-text/80 text-center max-w-md text-sm mx-auto">
            Choose your creation method and start building amazing content
          </p>
        </div>

        {/* Cards Section */}
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-4xl">
          {/* Quick Launch Card */}
          <div 
            onClick={handleQuickLaunch}
            className="flex-1 bg-surface/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 cursor-pointer hover:scale-105 transition-all duration-300 hover:border-primary/30 group"
          >
            <h3 className="text-2xl font-bold text-primary mb-4">Quick Launch</h3>
            
            {/* Skeleton Screen */}
            <div className="bg-background/50 rounded-lg p-4 mb-4 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-primary/20 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-primary/10 rounded w-1/2"></div>
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
            
            <p className="text-text/70 text-sm">Start with content type selection and choose from our pre-made templates and quick customization options.</p>
          </div>
          
          {/* Pro Studio Card */}
          <div 
            onClick={handleProStudio}
            className="flex-1 bg-surface/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 cursor-pointer hover:scale-105 transition-all duration-300 hover:border-primary/30 group"
          >
            <h3 className="text-2xl font-bold text-primary mb-4">Pro Studio</h3>
            
            {/* Skeleton Screen */}
            <div className="bg-background/50 rounded-lg p-4 mb-4 border border-white/5">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="w-full h-8 bg-primary/25 rounded"></div>
                <div className="w-full h-8 bg-primary/15 rounded"></div>
                <div className="w-full h-8 bg-primary/20 rounded"></div>
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
            
            <p className="text-text/70 text-sm">Advanced creation tools with full customization, layers, effects, and professional features.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
