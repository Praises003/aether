"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import SignClient from "@walletconnect/sign-client";
import { WalletConnectModal } from "@walletconnect/modal";

// YOUR WALLETCONNECT PROJECT ID (from https://cloud.walletconnect.com)
const PROJECT_ID = "2df0ba89a69d010fe65eb6a4c524af06";

// Hedera namespace definition (required)
const HEDERA_NAMESPACE = {
  hedera: {
    chains: ["hedera:testnet"],
    methods: [
      "hedera_signMessage",
      "hedera_signTransaction",
    ],
    events: ["chainChanged", "accountsChanged"],
  },
};

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [client, setClient] = useState(null);
  const [modal, setModal] = useState(null);
  const [session, setSession] = useState(null);
  const [walletData, setWalletData] = useState(null);

  // Initialize WalletConnect client + modal
  useEffect(() => {
    async function init() {
      const _client = await SignClient.init({
        projectId: PROJECT_ID,
        metadata: {
          name: "Aether",
          description: "A decentralized API marketplace",
          url: "https://aether-gilt-delta.vercel.app",
          //icons: ["https://yourapp.com/icon.png"],
        },
      });

      const _modal = new WalletConnectModal({
        projectId: PROJECT_ID,
        themeMode: "light",
      });

      setClient(_client);
      setModal(_modal);
    }

    init();
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!client || !modal) return;

    try {
      const { uri, approval } = await client.connect({
        requiredNamespaces: HEDERA_NAMESPACE,
      });

      // If URI exists → show modal
      if (uri) {
        modal.openModal({ uri });
      }

      const _session = await approval();

      modal.closeModal();

      setSession(_session);

      // Extract Hedera account
      const hederaAccounts = _session.namespaces.hedera.accounts;
      const account = hederaAccounts[0].split(":")[2];

      setWalletData({ accountId: account });
    } catch (err) {
      console.error("WalletConnect connection error:", err);
    }
  }, [client, modal]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      if (client && session) {
        await client.disconnect({
          topic: session.topic,
          reason: { code: 6000, message: "User disconnected" },
        });
      }

      setSession(null);
      setWalletData(null);
    } catch (err) {
      console.error("Wallet disconnect failed:", err);
    }
  }, [client, session]);

  return (
    <WalletContext.Provider
      value={{
        walletData,
        connectWallet,
        disconnectWallet,
        session,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
