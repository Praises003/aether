"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@/context/wallet-context"
import axios from "axios"

export default function MarketplacePage() {
  const [functions, setFunctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { accountId, isInitializing } = useWallet()
  const isConnected = !!accountId

  useEffect(() => {
    const fetchFunctions = async () => {
      try {
        // Fetch real functions from your backend
        const response = await axios.get("http://localhost:5000/api/function")
        setFunctions(response.data)
      } catch (error) {
        console.error("Failed to fetch functions:", error)
        setError("Failed to load functions")
        // Fallback to mock data if backend is down
        setFunctions([
          {
            _id: "1",
            name: "AI Image Generator",
            description: "Generates hyper-realistic images from text prompts using advanced AI models.",
            providerAccountId: "0.0.777",
            priceHbar: 0.1,
            functionIdentifier: "IMAGE_GENERATOR_V1",
            executionType: "API"
          },
          {
            _id: "2", 
            name: "Text Summarizer",
            description: "Summarizes long text documents into concise summaries.",
            providerAccountId: "0.0.888",
            priceHbar: 0.05,
            functionIdentifier: "TEXT_SUMMARIZER_V1",
            executionType: "LOCAL"
          },
          {
            _id: "3",
            name: "Random Fact Generator",
            description: "Returns random interesting facts about various topics.",
            providerAccountId: "0.0.999", 
            priceHbar: 0.01,
            functionIdentifier: "RANDOM_FACT_V1",
            executionType: "LOCAL"
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchFunctions()
  }, [])

  // Show loading while checking wallet connection
  if (isInitializing) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading marketplace...</span>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar is now handled by layout */}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">API Marketplace</h1>
          <p className="text-lg text-gray-600">
            Discover and purchase API calls with instant Hedera micropayments
          </p>
        </div>

        {!isConnected && (
          <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Connect your wallet</span> to start using APIs. Use the connect button in the top right.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : functions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No functions available</div>
            <p className="text-gray-400">Be the first to list a function!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {functions.map((func) => (
              <div key={func._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{func.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{func.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {func.functionIdentifier}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {func.executionType}
                  </span>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    Provider: <span className="font-mono">{func.providerAccountId}</span>
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    {func.priceHbar} HBAR
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!isConnected) {
                      alert("Please connect your wallet first")
                      return
                    }
                    window.location.href = `/function/${func._id}`
                  }}
                  disabled={!isConnected}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isConnected ? "Use Function" : "Connect Wallet to Use"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}