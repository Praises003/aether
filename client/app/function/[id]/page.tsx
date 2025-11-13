"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { useWallet } from "@/context/wallet-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface FunctionDetail {
  id: string
  name: string
  description: string
  provider: string
  price: number
  fullDescription: string
}

type TransactionStep = "idle" | "awaiting-approval" | "processing" | "complete" | "error"

export default function FunctionDetailPage() {
  const params = useParams()
  const functionId = params.id as string
  const { isConnected, accountId, balance } = useWallet()

  const [func, setFunc] = useState<FunctionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [prompt, setPrompt] = useState("")
  const [transactionStep, setTransactionStep] = useState<TransactionStep>("idle")
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchFunction = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 400))

        // Mock data
        setFunc({
          id: functionId,
          name: "AI Image Generator",
          description: "Generates hyper-realistic images from text.",
          provider: "0.0.777",
          price: 10,
          fullDescription:
            "Create stunning images from simple text descriptions using state-of-the-art AI models. Perfect for designers, marketers, and creative professionals.",
        })
      } catch (error) {
        console.error("Failed to fetch function:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFunction()
  }, [functionId])

  const handleGenerateClick = async () => {
    if (!prompt.trim()) return
    if (!isConnected) return
    if (!func) return
    if (balance !== null && balance < func.price) {
      setErrorMessage(`Insufficient balance. You need ${func.price} HBAR but have ${balance}.`)
      setTimeout(() => setErrorMessage(null), 5000)
      return
    }

    setErrorMessage(null)
    setTransactionStep("awaiting-approval")

    try {
      // Step 1: User approves in HashPack
      await new Promise((resolve) => setTimeout(resolve, 1200))

      setTransactionStep("processing")

      // Step 2: Backend processes
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Step 3: Result comes back
      setTransactionStep("complete")
      setResultImage("/ai-generated-image-of-space-cat.jpg")
    } catch (error) {
      setTransactionStep("error")
      setErrorMessage("Transaction failed. Please try again.")
    }
  }

  const handleReset = () => {
    setTransactionStep("idle")
    setResultImage(null)
    setPrompt("")
    setErrorMessage(null)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <div className="h-12 w-48 animate-pulse rounded-lg bg-secondary/50" />
            <div className="h-64 w-full animate-pulse rounded-lg bg-secondary/50" />
          </div>
        </div>
      </main>
    )
  }

  if (!func) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-muted-foreground">Function not found</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Function Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{func.name}</h1>
              <p className="mt-2 text-lg text-muted-foreground">{func.fullDescription}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Function Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Provider</p>
                    <p className="font-mono font-semibold">{func.provider}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price per Call</p>
                    <p className="text-xl font-semibold text-primary">{func.price} HBAR</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Generate</CardTitle>
                <CardDescription>Enter your prompt and we'll generate the result</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what you want to generate..."
                    disabled={transactionStep !== "idle" || !isConnected}
                    className="w-full rounded-lg border border-input bg-input px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    rows={4}
                  />
                </div>

                {errorMessage && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    {errorMessage}
                  </div>
                )}

                {!isConnected && (
                  <div className="rounded-lg border border-primary/50 bg-primary/5 p-3 text-sm">
                    Please connect your wallet to use this function
                  </div>
                )}

                {/* Status Display */}
                {transactionStep !== "idle" && (
                  <div className="space-y-3 rounded-lg border border-primary/50 bg-primary/5 p-4">
                    {transactionStep === "awaiting-approval" && (
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm">Awaiting your approval in HashPack...</span>
                      </div>
                    )}

                    {transactionStep === "processing" && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Payment confirmed on Hedera</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm">Processing your request...</span>
                        </div>
                      </div>
                    )}

                    {transactionStep === "complete" && (
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Generation complete!</span>
                      </div>
                    )}

                    {transactionStep === "error" && (
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full border-2 border-destructive" />
                        <span className="text-sm text-destructive">Transaction failed</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Result Display */}
                {resultImage && transactionStep === "complete" && (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-border overflow-hidden">
                      <img src={resultImage || "/placeholder.svg"} alt="Generated result" className="w-full" />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Transaction ID: {Math.random().toString(36).substring(7).toUpperCase()}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {transactionStep === "idle" ? (
                    <Button
                      onClick={handleGenerateClick}
                      disabled={!isConnected || !prompt.trim()}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      Generate for {func.price} HBAR
                    </Button>
                  ) : (
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      disabled={transactionStep === "processing"}
                      className="flex-1 bg-transparent"
                    >
                      {transactionStep === "complete" ? "Try Again" : "Cancel"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Your Wallet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isConnected ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Account ID</p>
                      <p className="font-mono text-sm font-semibold break-all">{accountId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Available Balance</p>
                      <p className="text-2xl font-bold text-primary">{balance} HBAR</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3">
                      <p className="text-xs text-muted-foreground mb-1">Cost</p>
                      <p className="font-semibold">{func.price} HBAR</p>
                    </div>
                    {balance !== null && balance >= func.price && (
                      <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-2">
                        <p className="text-xs text-green-500 font-medium">Sufficient balance</p>
                      </div>
                    )}
                    {balance !== null && balance < func.price && (
                      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-2">
                        <p className="text-xs text-destructive font-medium">Insufficient balance</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Connect wallet to see balance</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
