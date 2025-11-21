"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import SignClient from "@walletconnect/sign-client";
import { Web3Modal } from "@web3modal/standalone";

const WalletContext = createContext({});

export function WalletProvider({ children }) {
  const [client, setClient] = useState(null);
  const [session, setSession] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const projectId = "2df0ba89a69d010fe65eb6a4c524af06";
  const web3ModalRef = useRef(null);

  const REQUIRED_METHODS = [
    "hedera_signAndExecuteTransaction",
    "hedera_getAccountInfo", 
    "hedera_signMessage"
  ];

  // Initialize Web3Modal
  useEffect(() => {
    web3ModalRef.current = new Web3Modal({
      projectId,
      walletConnectVersion: 2,
      themeMode: "light",
    });
  }, []);

  // Initialize WalletConnect Client
  useEffect(() => {
    async function initWallet() {
      try {
        setIsInitializing(true);
        console.log("🔄 Initializing WalletConnect client...");
        
        const signClient = await SignClient.init({
          projectId,
          metadata: {
            name: "Aether - Hedera dApp",
            description: "Decentralized API Marketplace on Hedera", 
            url: window.location.origin,
            icons: ["https://www.hedera.com/favicon-32x32.png"],
          },
        });

        setClient(signClient);
        console.log("✅ WalletConnect client initialized");

        // ✅ CLEAR ALL EXISTING SESSIONS ON LOAD
        const sessions = signClient.session.getAll();
        console.log("🗑️ Clearing existing sessions:", sessions.length);
        
        sessions.forEach(session => {
          try {
            signClient.disconnect({
              topic: session.topic,
              reason: { code: 6000, message: "Clearing on app load" }
            });
          } catch (err) {
            console.log("Could not disconnect session:", session.topic);
          }
        });

        // Start fresh
        setSession(null);
        setAccountId(null);

      } catch (err) {
        console.error("❌ Wallet init error:", err);
      } finally {
        setIsInitializing(false);
      }
    }

    initWallet();
  }, []);

  // Connect Wallet - UPDATED TO FORCE FRESH CONNECTION
  const connectWallet = async () => {
    console.log("🔗 connectWallet function called");
    if (!client) {
      throw new Error("Wallet client not initialized yet");
    }

    try {
      console.log("🔄 Starting fresh Hedera wallet connection...");
      
      // ✅ DISCONNECT ANY EXISTING SESSION FIRST
      if (session) {
        try {
          await client.disconnect({
            topic: session.topic,
            reason: { code: 6000, message: "Creating fresh connection" },
          });
        } catch (err) {
          console.log("No active session to disconnect");
        }
        setSession(null);
        setAccountId(null);
      }

      const { uri, approval } = await client.connect({
        requiredNamespaces: {
          hedera: {
            methods: REQUIRED_METHODS,
            chains: ["hedera:testnet"],
            events: ["accountsChanged"],
          },
        },
      });

      console.log("📱 Fresh connection URI generated");

      if (uri) {
        await web3ModalRef.current.openModal({ uri });
        console.log("📱 Web3Modal opened for fresh Hedera connection");
      }

      console.log("⏳ Waiting for user approval from wallet...");
      const newSession = await approval();
      
      web3ModalRef.current.closeModal();
      
      console.log("✅ Fresh wallet session approved:", newSession);
      console.log("📋 Available methods in new session:", newSession.namespaces.hedera.methods);

      // Extract account from Hedera namespace
      const accounts = newSession.namespaces.hedera.accounts;
      if (!accounts || accounts.length === 0) {
        throw new Error("No Hedera accounts found in session");
      }

      const account = accounts[0].split(":").pop();
      setSession(newSession);
      setAccountId(account);

      console.log("🎉 Fresh Hedera wallet connected successfully, account:", account);
      return { session: newSession, accountId: account, client };
    } catch (err) {
      web3ModalRef.current?.closeModal();
      console.error("❌ Hedera wallet connection failed:", err);
      
      if (err.message.includes("User rejected")) {
        throw new Error("Connection was rejected by user");
      } else if (err.message.includes("No Hedera accounts")) {
        throw new Error("No Hedera accounts found. Please make sure your wallet has testnet accounts.");
      } else {
        throw new Error("Failed to connect to wallet: " + err.message);
      }
    }
  };

  // Disconnect Function
  const disconnect = async () => {
    console.log("🔌 Disconnecting wallet...");
    if (client && session) {
      try {
        await client.disconnect({
          topic: session.topic,
          reason: { code: 6000, message: "User disconnected" },
        });
      } catch (err) {
        console.error("Error during disconnect:", err);
      }
    }

    setSession(null);
    setAccountId(null);
    console.log("✅ Wallet disconnected");
  };

  // Clear all sessions (manual cleanup)
  const clearAllSessions = async () => {
    if (!client) return;
    
    const sessions = client.session.getAll();
    console.log("🗑️ Manually clearing all sessions:", sessions.length);
    
    sessions.forEach(session => {
      try {
        client.disconnect({
          topic: session.topic,
          reason: { code: 6000, message: "Manual cleanup" }
        });
      } catch (err) {
        console.log("Could not disconnect session:", session.topic);
      }
    });

    setSession(null);
    setAccountId(null);
  };

  // Value to provide
  const value = {
    client,
    session,
    accountId,
    connectWallet,
    disconnect,
    clearAllSessions,
    isInitializing,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};