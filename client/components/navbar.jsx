"use client";

import React from "react";
import { Aperture, Code, Package } from "lucide-react";
import { useWallet } from "../context/wallet-context";


export function Navbar({ onNavClick }) {
  const { walletData, connectWallet, disconnectWallet } = useWallet();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Aperture className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">
              Aether
            </span>
          </div>

          {/* Nav buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavClick("marketplace")}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Package className="h-4 w-4 inline-block mr-1" />
              Marketplace
            </button>

            <button
              onClick={() => onNavClick("developer")}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Code className="h-4 w-4 inline-block mr-1" />
              For Developers
            </button>
          </div>

          {/* Wallet Section */}
          <div className="flex items-center">
            {walletData ? (
              <div className="flex items-center space-x-3">
                <span className="px-3 py-2 bg-green-100 text-green-800 rounded-full text-xs font-mono shadow-sm">
                  ✅ {walletData.accountId}
                </span>

                <button
                  onClick={disconnectWallet}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 shadow-md"
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
