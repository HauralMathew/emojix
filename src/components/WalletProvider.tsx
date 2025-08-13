"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import type { PropsWithChildren } from "react";
import { DEVNET } from "../constants/contract";


let dappImageURI: string | undefined;
if (typeof window !== "undefined") {
  dappImageURI = `${window.location.origin}${window.location.pathname}favicon.ico`;
}

export const WalletProvider = ({ children }: PropsWithChildren) => {
  // const { autoConnect } = useAutoConnect();
  // const { toast } = useToast();
  // const { useCustomSubmitter } = useTransactionSubmitter();



  const dappConfig = {
    network: DEVNET,
    aptosApiKeys: {
      testnet: undefined,
      devnet: undefined,
    },
    aptosConnect: {
      dappId: "57fa42a9-29c6-4f1e-939c-4eefa36d9ff5",
      dappImageURI,
    },
    mizuwallet: {
      manifestURL:
        "https://assets.mz.xyz/static/config/mizuwallet-connect-manifest.json",
    },
    transactionSubmitter: undefined,
  };

  return (
    <AptosWalletAdapterProvider
      key="default"
      autoConnect={true}
      dappConfig={dappConfig}
      onError={(error) => {
        console.error("Wallet error:", error || "Unknown wallet error");
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};