import { useWalletAuth } from "@/hooks/useWalletAuth";
import { Button } from "./ui/button";
import { useToast } from '@/hooks/use-toast';

export const AuthTest = () => {
  const { 
    isAuthenticated, 
    isLoading,
    authenticate, 
    logout, 
    verifyToken, 
    getProfile, 
    updateProfile, 
    testAuth,
    testSignature
  } = useWalletAuth();

  const { toast } = useToast();

  const handleAuthenticate = async () => {
    try {
      const result = await authenticate();
      console.log("Authentication result:", result);
      alert(result.success ? "Authentication successful!" : `Authentication failed: ${result.error}`);
    } catch (error) {
      console.error("Authentication error:", error);
      alert("Authentication error");
    }
  };

  const handleTestSignature = async () => {
    try {
      const result = await testSignature();
      console.log("Test signature result:", result);
      alert(result ? "Test signature successful!" : "Test signature failed");
    } catch (error) {
      console.error("Test signature error:", error);
      alert("Test signature error");
    }
  };

  const handleTestAuth = async () => {
    try {
      const result = await testAuth();
      console.log("Test auth result:", result);
      alert(result.success ? "Auth test successful!" : `Auth test failed: ${result.error}`);
    } catch (error) {
      console.error("Test auth error:", error);
      alert("Auth test error");
    }
  };

  const handleVerifyToken = async () => {
    try {
      const result = await verifyToken();
      console.log("Verify token result:", result);
      alert(result.success ? "Token verified!" : `Token verification failed: ${result.error}`);
    } catch (error) {
      console.error("Verify token error:", error);
      alert("Token verification error");
    }
  };

  const handleGetProfile = async () => {
    try {
      const result = await getProfile();
      console.log("Get profile result:", result);
      alert(result.success ? `Profile: ${JSON.stringify(result.user)}` : `Get profile failed: ${result.error}`);
    } catch (error) {
      console.error("Get profile error:", error);
      alert("Get profile error");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const result = await updateProfile("test.apt");
      console.log("Update profile result:", result);
      alert(result.success ? "Profile updated!" : `Update profile failed: ${result.error}`);
    } catch (error) {
      console.error("Update profile error:", error);
      alert("Update profile error");
    }
  };

  const handleTestToast = () => {
    toast('This is a test of the React Hot Toast implementation!');
  };

  const handleTestErrorToast = () => {
    toast('This is a test of the error toast variant.', { variant: 'destructive' });
  };

  const handleTestSimpleToast = () => {
    toast('This is a simple toast message');
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Authentication Test</h2>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span>Authentication Status:</span>
          <span className={`px-2 py-1 rounded text-sm ${isAuthenticated ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </span>
          {isLoading && (
            <span className="px-2 py-1 rounded text-sm bg-blue-500 text-white">
              Loading...
                  </span>
              )}
            </div>
          </div>

      <div className="space-y-2">
        <Button 
          onClick={handleTestSignature} 
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          Test Wallet Signature
        </Button>
        
        <Button 
                    onClick={handleAuthenticate}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Authenticating..." : "Authenticate"}
        </Button>
        
        <Button onClick={handleTestAuth} className="w-full">
          Test Authentication
        </Button>
        
        <Button onClick={handleVerifyToken} className="w-full">
          Verify Token
        </Button>
        
        <Button onClick={handleGetProfile} className="w-full">
          Get Profile
        </Button>
        
        <Button onClick={handleUpdateProfile} className="w-full">
          Update Profile (test.apt)
        </Button>
        
        <Button onClick={logout} className="w-full bg-red-500 hover:bg-red-600">
                    Logout
        </Button>
        </div>

      <div className="text-sm text-gray-600">
        <p>Check the browser console for detailed results.</p>
        <p>Authentication state updates automatically when you authenticate or logout.</p>
        <p>Try "Test Wallet Signature" first to see if your wallet can sign messages.</p>
      </div>

      <h2 className="text-xl font-bold">Toast Test</h2>
      <div className="space-x-4">
        <button
          onClick={handleTestToast}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Success Toast
        </button>
        <button
          onClick={handleTestErrorToast}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Test Error Toast
        </button>
        <button
          onClick={handleTestSimpleToast}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Simple Toast
        </button>
      </div>
    </div>
  );
};