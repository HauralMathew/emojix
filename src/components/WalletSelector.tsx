"use client";

import { useCallback, useState } from 'react';
import {
  AboutAptosConnect,
  AptosPrivacyPolicy,
  WalletItem,
  groupAndSortWallets,
  isInstallRequired,
  truncateAddress,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import type {
  AboutAptosConnectEducationScreen,
  AdapterNotDetectedWallet,
  AdapterWallet,
  WalletSortingOptions,
} from "@aptos-labs/wallet-adapter-react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  LogOut,
  User,
  Check,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import aptosLogo from "@/assets/icons/Aptos_mark_WHT (1).png";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useWalletManager } from "@/context/WalletManagerContext";
import { useToast } from "@/hooks/use-toast";

export function WalletSelector(walletSortingOptions: WalletSortingOptions) {
  const { 
    connectedWallets, 
    activeWallet, 
    switchWallet, 
    authenticateWallet, 
    logoutWallet, 
    logoutAllWallets,
    removeWallet 
  } = useWalletManager();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();

  const closeDialog = useCallback(() => setIsDialogOpen(false), []);

  const handleWalletConnect = useCallback(async () => {
    closeDialog();
  }, [closeDialog]);

  const handleSwitchWallet = useCallback(async (address: string) => {
    await switchWallet(address);
  }, [switchWallet]);

  const handleAuthenticateWallet = useCallback(async (address: string) => {
    setIsAuthenticating(true);
    try {
      await authenticateWallet(address);
    } finally {
      setIsAuthenticating(false);
    }
  }, [authenticateWallet]);

  const handleLogoutWallet = useCallback(async (address: string) => {
    await logoutWallet(address);
  }, [logoutWallet]);

  const handleRemoveWallet = useCallback(async (address: string) => {
    await logoutWallet(address);
    removeWallet(address);
    toast("Wallet removed");
  }, [logoutWallet, removeWallet, toast]);

  const handleLogoutAll = useCallback(async () => {
    await logoutAllWallets();
  }, [logoutAllWallets]);

  // If no wallets are connected, show the connect dialog
  if (connectedWallets.length === 0) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="px-4 py-1.5 text-sm font-medium text-black bg-primary hover:bg-primary/90 rounded-md">
            Sign In
          </Button>
        </DialogTrigger>
        <ConnectWalletDialog close={handleWalletConnect} {...walletSortingOptions} />
      </Dialog>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-transparent hover:bg-white/10 backdrop-blur-sm border-0 p-2 h-auto">
          <div className="flex items-center gap-3">
            {/* Profile Picture with Aptos Logo */}
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-black rounded-full flex items-center justify-center">
                <img src={aptosLogo} alt="Aptos" className="w-3 h-3" />
              </div>
            </div>
            
            {/* Active Wallet Address */}
            <span className="text-sm text-text">
              {activeWallet?.ansName ||
                truncateAddress(activeWallet?.address) ||
                "Unknown"}
            </span>
            
            {/* Authentication Status */}
            {activeWallet?.isAuthenticated && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
            
            {/* Dropdown Icon */}
            <ChevronDown className="h-4 w-4 text-text/60" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="backdrop-blur-sm border border-primary/10 bg-background/30 w-80">
        {/* Connected Wallets List */}
        <div className="p-4">
          <div className="text-sm font-medium text-text mb-3">Connected Wallets</div>
          
          {connectedWallets.map((wallet) => (
            <div key={wallet.address} className="mb-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                {/* Wallet Icon */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-black rounded-full flex items-center justify-center">
                    <img src={aptosLogo} alt="Aptos" className="w-3 h-3" />
                  </div>
                </div>
                
                {/* Wallet Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-text truncate">
                      {wallet.ansName || truncateAddress(wallet.address)}
                    </div>
                    {wallet.isActive && (
                      <Check className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                  <div className="text-xs text-text/60 truncate">
                    {wallet.walletName}
                  </div>
                  {wallet.isAuthenticated && (
                    <div className="text-xs text-green-500">Authenticated</div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {/* Switch/Authenticate */}
                  {!wallet.isActive && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs hover:bg-white/10"
                      onClick={() => handleSwitchWallet(wallet.address)}
                    >
                      Switch
                    </Button>
                  )}
                  
                  {wallet.isActive && !wallet.isAuthenticated && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs bg-primary hover:bg-primary/80 text-black"
                      onClick={() => handleAuthenticateWallet(wallet.address)}
                      disabled={isAuthenticating}
                    >
                      {isAuthenticating ? "..." : "Auth"}
                    </Button>
                  )}
                  
                  {wallet.isActive && wallet.isAuthenticated && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs text-red-500 hover:bg-red-500/10"
                      onClick={() => handleLogoutWallet(wallet.address)}
                    >
                      Logout
                    </Button>
                  )}
                  
                  {/* Remove Wallet */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-500 hover:bg-red-500/10"
                    onClick={() => handleRemoveWallet(wallet.address)}
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Connect Another Wallet */}
          <Button 
            className="w-full bg-transparent hover:bg-white/10 text-text flex items-center justify-between mb-3"
            onClick={() => setIsDialogOpen(true)}
          >
            <span>Connect Another Wallet</span>
            <Plus className="w-4 h-4" />
          </Button>
          
          <DropdownMenuSeparator className="my-2" />
          
          {/* Profile Button */}
          <Button 
            className="w-full bg-transparent hover:bg-white/10 text-text flex items-center justify-between mb-2"
            onClick={() => navigate("/portfolio")}
          >
            <span>Profile</span>
            <User className="w-4 h-4" />
          </Button>
          
          {/* Logout All */}
          <Button 
            className="w-full bg-transparent hover:bg-white/10 text-text flex items-center justify-between"
            onClick={handleLogoutAll}
          >
            <span className="text-red-500">Disconnect All</span>
            <LogOut className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </DropdownMenuContent>
      
      {/* Connect Wallet Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <ConnectWalletDialog close={handleWalletConnect} {...walletSortingOptions} />
      </Dialog>
    </DropdownMenu>
  );
}

interface ConnectWalletDialogProps extends WalletSortingOptions {
  close: () => void;
}

function ConnectWalletDialog({
  close,
  ...walletSortingOptions
}: ConnectWalletDialogProps) {
  const { wallets = [], notDetectedWallets = [] } = useWallet();

  const { aptosConnectWallets, availableWallets, installableWallets } =
    groupAndSortWallets(
      [...wallets, ...notDetectedWallets],
      walletSortingOptions,
    );

  const hasAptosConnectWallets = !!aptosConnectWallets.length;

  return (
    <DialogContent className="max-h-screen overflow-auto border border-primary/20">
      <AboutAptosConnect renderEducationScreen={renderEducationScreen}>
        <DialogHeader>
          <DialogTitle className="flex flex-col text-center leading-snug">
            {hasAptosConnectWallets ? (
              <>
                <span>Log in or sign up</span>
                <span>with Social + Aptos Connect</span>
              </>
            ) : (
              "Connect Wallet"
            )}
          </DialogTitle>
        </DialogHeader>

        {hasAptosConnectWallets && (
          <div className="flex flex-col gap-2 pt-3">
            {aptosConnectWallets.map((wallet) => (
              <AptosConnectWalletRow
                key={wallet.name}
                wallet={wallet}
                onConnect={close}
              />
            ))}
            <p className="flex gap-1 justify-center items-center text-muted-foreground text-sm">
              Learn more about{" "}
              <AboutAptosConnect.Trigger className="flex gap-1 py-3 items-center text-foreground">
                Aptos Connect <ArrowRight size={16} />
              </AboutAptosConnect.Trigger>
            </p>
            <AptosPrivacyPolicy className="flex flex-col items-center py-1">
              <p className="text-xs leading-5">
                <AptosPrivacyPolicy.Disclaimer />{" "}
                <AptosPrivacyPolicy.Link className="text-muted-foreground underline underline-offset-4" />
                <span className="text-muted-foreground">.</span>
              </p>
              <AptosPrivacyPolicy.PoweredBy className="flex gap-1.5 items-center text-xs leading-5 text-muted-foreground" />
            </AptosPrivacyPolicy>
            <div className="flex items-center gap-3 pt-4 text-muted-foreground">
              <div className="h-px w-full bg-primary" />
              Or
              <div className="h-px w-full bg-primary" />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-3">
          {availableWallets.map((wallet) => (
            <WalletRow key={wallet.name} wallet={wallet} onConnect={close} />
          ))}
          {!!installableWallets.length && (
            <Collapsible className="flex flex-col gap-3">
              <CollapsibleTrigger asChild>
                <Button size="sm" variant="ghost" className="gap-2 border-0 bg-primary/20 hover:bg-primary/30">
                  More wallets <ChevronDown />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="flex flex-col gap-3">
                {installableWallets.map((wallet) => (
                  <WalletRow
                    key={wallet.name}
                    wallet={wallet}
                    onConnect={close}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </AboutAptosConnect>
    </DialogContent>
  );
}

interface WalletRowProps {
  wallet: AdapterWallet | AdapterNotDetectedWallet;
  onConnect?: () => void;
}

function WalletRow({ wallet, onConnect }: WalletRowProps) {
  return (
    <WalletItem
      wallet={wallet}
      onConnect={onConnect}
      className="flex items-center justify-between px-4 py-3 gap-4 rounded-md bg-primary/10 backdrop-blur-sm"
    >
      <div className="flex items-center gap-4">
        <WalletItem.Icon className="h-6 w-6" />
        <WalletItem.Name className="text-base font-normal" />
      </div>
      {isInstallRequired(wallet) ? (
        <Button size="sm" variant="ghost" className="border-0 bg-primary hover:bg-primary/80 text-black px-4 " asChild>
          <WalletItem.InstallLink />
        </Button>
      ) : (
        <WalletItem.ConnectButton asChild>
          <Button size="sm" className="border-0 bg-primary hover:bg-primary/80 text-black">Connect</Button>
        </WalletItem.ConnectButton>
      )}
    </WalletItem>
  );
}

function AptosConnectWalletRow({ wallet, onConnect }: WalletRowProps) {
  return (
    <WalletItem wallet={wallet} onConnect={onConnect}>
      <WalletItem.ConnectButton asChild>
        <Button size="lg" variant="outline" className="w-full gap-4 border-0 bg-primary/10 hover:bg-primary/50">
          <WalletItem.Icon className="h-5 w-5" />
          <WalletItem.Name className="text-base font-normal" />
        </Button>
      </WalletItem.ConnectButton>
    </WalletItem>
  );
}

function renderEducationScreen(screen: AboutAptosConnectEducationScreen) {
  return (
    <>
      <DialogHeader className="grid grid-cols-[1fr_4fr_1fr] items-center space-y-0">
        <Button variant="ghost" size="icon" className="border-0 bg-primary/20 hover:bg-primary/30" onClick={screen.cancel}>
          <ArrowLeft />
        </Button>
        <DialogTitle className="leading-snug text-base text-center">
          About Aptos Connect
        </DialogTitle>
      </DialogHeader>

      <div className="flex h-[162px] pb-3 items-end justify-center">
        <screen.Graphic />
      </div>
      <div className="flex flex-col gap-2 text-center pb-4">
        <screen.Title className="text-xl" />
        <screen.Description className="text-sm text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a]:text-foreground" />
      </div>

      <div className="grid grid-cols-3 items-center">
        <Button
          size="sm"
          variant="ghost"
          onClick={screen.back}
          className="justify-self-start border-0 bg-primary hover:bg-primary/30"
        >
          Back
        </Button>
        <div className="flex items-center gap-2 place-self-center">
          {screen.screenIndicators.map((ScreenIndicator, i) => (
            <ScreenIndicator key={i} className="py-4">
              <div className="h-0.5 w-6 transition-colors bg-muted [[data-active]>&]:bg-foreground" />
            </ScreenIndicator>
          ))}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={screen.next}
          className="gap-2 justify-self-end border-0 bg-primary/20 hover:bg-primary/30"
        >
          {screen.screenIndex === screen.totalScreens - 1 ? "Finish" : "Next"}
          <ArrowRight size={16} />
        </Button>
      </div>
    </>
  );
} 