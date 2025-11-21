"use client";

import React from "react";
import Link from "next/link";
import { useWallet } from "@/context/wallet-context"; // ✅ Correct import
import { Package, Code, Zap } from "lucide-react";

export function GlobalNavbar() {
  const { accountId, connectWallet, disconnect, isInitializing } = useWallet();

  const handleConnectWallet = async () => {
    try {
      console.log("🔄 Connecting wallet...");
      await connectWallet();
      console.log("✅ Wallet connected successfully");
    } catch (error) {
      console.error("❌ Failed to connect wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  // Show loading state while checking wallet connection
  if (isInitializing) {
    return (
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Zap className="h-6 w-6 text-blue-600" />
              <span>Aether</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Zap className="h-6 w-6 text-blue-600" />
            <span>Aether</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link 
              href="/marketplace" 
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Package className="h-4 w-4" />
              Marketplace
            </Link>
            <Link 
              href="/developers" 
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Code className="h-4 w-4" />
              Developers
            </Link>
          </div>

          {/* Wallet Section */}
          <div className="flex items-center gap-4">
            {accountId ? (
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-mono border border-green-200">
                  {accountId.slice(0, 8)}...{accountId.slice(-4)}
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}