export default function Cult() {
  return (
    <div className="p-8 mt-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-text mb-6">Cult</h1>
        <p className="text-text/70 text-lg mb-8">
          Join the community and connect with fellow emoticon enthusiasts.
        </p>
        
        {/* Placeholder content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-surface/20 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-lg font-semibold text-text mb-2">Community {item}</h3>
              <p className="text-text/70 text-sm">Connect with the emoticon community</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 