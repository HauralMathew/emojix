import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import OnboardingLanding from "./pages/onboarding/OnboardingLanding";
import OnboardingStep from "./pages/onboarding/OnboardingStep";
import CurrencySelection from "./pages/CurrencySelection";
import OnboardingHowTo from "./pages/onboarding/OnboardingHowTo";
import LoadingScreen from "./pages/onboarding/LoadingScreen";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import Discover from "./pages/Discover";
import Portfolio from "./pages/Portfolio";
import EditProfile from "./pages/EditProfile";
import Activity from "./pages/Activity";
import Rewards from "./pages/Rewards";
import Cult from "./pages/Cult";
import QuickLaunch from "./pages/QuickLaunch";
import EmojiPickerDemo from "./pages/EmojiPickerDemo";
import Settings from "./pages/Settings";
import Trading from "./pages/Trading";
import { AuthTest } from "./components/AuthTest";
import { WalletProvider } from "@/components/WalletProvider";
import { WalletManagerProvider } from "@/context/WalletManagerContext";
import Studio from "./pages/Studio";
import TypeSelection from "./pages/TypeSelection";
import Emojis from "./pages/Emojis";
import { Toaster } from "./components/ui/toaster";

// Enum for onboarding steps
const ONBOARDING_STEPS = ["landing", "experience", "currency", "howto", "loading", "main"] as const;
type OnboardingStepType = typeof ONBOARDING_STEPS[number];

function App() {
  const [step, setStep] = useState<OnboardingStepType>("landing");
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("onboarded");
    if (done) {
      setOnboarded(true);
      setStep("main");
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem("onboarded", "true");
    setOnboarded(true);
    setStep("main");
  };

  // Force dark mode during onboarding
  useEffect(() => {
    if (!onboarded) {
      document.documentElement.classList.add('dark');
    }
  }, [onboarded]);

  // If not onboarded, show onboarding flow without layout
  if (!onboarded) {
    if (step === "loading") return <LoadingScreen onComplete={handleComplete} />;
    if (step === "howto") return <OnboardingHowTo onNext={() => setStep("loading")} onBack={() => setStep("currency")} />;
    if (step === "currency") return <CurrencySelection onNext={() => setStep("howto")} onBack={() => setStep("experience")} />;
    if (step === "experience") return <OnboardingStep onNext={() => setStep("currency")} onBack={() => setStep("landing")} />;
    return <OnboardingLanding onSkip={handleComplete} onStart={() => setStep("experience")} />;
  }

  // If onboarded, show main app with global layout
  return (
    <WalletProvider>
      <WalletManagerProvider>
        <Router>
          <Sidebar />
          <div className="min-h-screen">
            <Header />
            <Footer />
            
            {/* Main Content - positioned to account for fixed header and footer */}
            <main className=" pb-8 ml-[52px] ">
              <Routes>
                <Route path="/" element={<Navigate to="/discover" replace />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/cult" element={<Cult />} />
                <Route path="/studio" element={<Studio />} />
                <Route path="/quick-launch" element={<QuickLaunch />} />
                <Route path="/emoji-quick-launch" element={<QuickLaunch />} />
                <Route path="/emoji-picker-demo" element={<EmojiPickerDemo />} />
                <Route path="/emojis" element={<Emojis />} />
                <Route path="/trading/:marketAddress" element={<Trading />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/auth-test" element={<AuthTest />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/type-selection" element={<TypeSelection />} />
              </Routes>
            </main>
          </div>
        </Router>
        <Toaster />
      </WalletManagerProvider>
    </WalletProvider>
  );
}

export default App;
