"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { FunctionCard } from "@/components/function-card"
import { useWallet } from "@/context/wallet-context"

export default function MarketplacePage() {
  const [functions, setFunctions] = useState([])
  const [loading, setLoading] = useState(true)
  const { walletData } = useWallet()
  const isConnected = !!walletData?.accountId // derived from walletData

  useEffect(() => {
    const fetchFunctions = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 600))
        setFunctions([
          {
            id: "1",
            name: "AI Image Generator",
            description: "Generates hyper-realistic images from text prompts using advanced AI models.",
            provider: "0.0.777",
            price: 10,
          },
          // ...other mock functions
        ])
      } catch (error) {
        console.error("Failed to fetch functions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFunctions()
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">API Marketplace</h1>
          <p className="text-lg text-muted-foreground">
            Discover and purchase API calls with instant Hedera micropayments
          </p>
        </div>

        {!isConnected && (
          <div className="mb-8 rounded-lg border border-primary/50 bg-primary/5 p-4">
            <p className="text-sm">
              <span className="font-semibold">Connect your wallet</span> to start using APIs
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-lg bg-secondary/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {functions.map((func) => (
              <FunctionCard
                key={func.id}
                id={func.id}
                name={func.name}
                description={func.description}
                provider={func.provider}
                price={func.price}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
