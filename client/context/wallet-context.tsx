"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

interface WalletContextType {
  isConnected: boolean
  accountId: string | null
  balance: number | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  loading: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const connectWallet = useCallback(async () => {
    setLoading(true)
    try {
      // Simulate wallet connection (HashPack integration would go here)
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Mock wallet data for demo
      setAccountId("0.0.123456")
      setBalance(5000)
      setIsConnected(true)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setIsConnected(false)
    setAccountId(null)
    setBalance(null)
  }, [])

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        accountId,
        balance,
        connectWallet,
        disconnectWallet,
        loading,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
