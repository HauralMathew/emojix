export default function Settings() {
  return (
    <div className="p-8 mt-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-text mb-6">Settings</h1>
        <p className="text-text/70 text-lg mb-8">
          Customize your experience and manage your account preferences.
        </p>
        
        {/* Placeholder content */}
        <div className="space-y-4">
          {['Account', 'Preferences', 'Privacy', 'Notifications', 'Security'].map((setting) => (
            <div key={setting} className="bg-surface/20 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">⚙️</div>
                <div>
                  <h3 className="text-lg font-semibold text-text">{setting}</h3>
                  <p className="text-text/70 text-sm">Manage your {setting.toLowerCase()} settings</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 