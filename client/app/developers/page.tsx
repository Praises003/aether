"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { useWallet } from "@/context/wallet-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertCircle } from "lucide-react"

type FormStep = "form" | "submitting" | "success"

export default function DevelopersPage() {
  const { isConnected, accountId } = useWallet()
  const [formStep, setFormStep] = useState<FormStep>("form")
  const [formData, setFormData] = useState({
    functionName: "",
    description: "",
    apiEndpoint: "",
    pricePerCall: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submittedData, setSubmittedData] = useState<typeof formData | null>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.functionName.trim()) {
      newErrors.functionName = "Function name is required"
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }
    if (!formData.apiEndpoint.trim()) {
      newErrors.apiEndpoint = "API endpoint is required"
    } else if (!formData.apiEndpoint.startsWith("https://")) {
      newErrors.apiEndpoint = "Endpoint must start with https://"
    }
    if (!formData.pricePerCall.trim()) {
      newErrors.pricePerCall = "Price is required"
    } else if (isNaN(Number(formData.pricePerCall)) || Number(formData.pricePerCall) <= 0) {
      newErrors.pricePerCall = "Price must be a positive number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setFormStep("submitting")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate successful submission
      setSubmittedData(formData)
      setFormStep("success")

      // Reset form after success
      setTimeout(() => {
        setFormData({
          functionName: "",
          description: "",
          apiEndpoint: "",
          pricePerCall: "",
        })
        setFormStep("form")
      }, 3000)
    } catch (error) {
      console.error("Submission failed:", error)
      setFormStep("form")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">List Your API</h1>
          <p className="text-lg text-muted-foreground">Monetize your API by listing it on the Aether marketplace</p>
        </div>

        {!isConnected && (
          <Card className="mb-8 border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">Connect your wallet</p>
                  <p className="text-sm text-muted-foreground">
                    You need to connect your wallet to list an API. This will be used for receiving payouts.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>API Details</CardTitle>
            <CardDescription>
              Fill in the details about your API. Your payout account ID will be auto-filled from your connected wallet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formStep === "form" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Function Name</label>
                  <input
                    type="text"
                    name="functionName"
                    value={formData.functionName}
                    onChange={handleInputChange}
                    placeholder="e.g., AI Image Generator"
                    className="w-full rounded-lg border border-input bg-input px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={!isConnected}
                  />
                  {errors.functionName && <p className="mt-1 text-sm text-destructive">{errors.functionName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what your API does..."
                    rows={3}
                    className="w-full rounded-lg border border-input bg-input px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={!isConnected}
                  />
                  {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Payout Account ID</label>
                  <input
                    type="text"
                    value={accountId || "Connect wallet to see account ID"}
                    disabled
                    className="w-full rounded-lg border border-input bg-secondary px-4 py-2 text-sm font-mono"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Auto-filled from your connected wallet</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Live API Endpoint URL</label>
                  <input
                    type="url"
                    name="apiEndpoint"
                    value={formData.apiEndpoint}
                    onChange={handleInputChange}
                    placeholder="https://api.yourdomain.com/function"
                    className="w-full rounded-lg border border-input bg-input px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={!isConnected}
                  />
                  {errors.apiEndpoint && <p className="mt-1 text-sm text-destructive">{errors.apiEndpoint}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price per Call (HBAR)</label>
                  <input
                    type="number"
                    name="pricePerCall"
                    value={formData.pricePerCall}
                    onChange={handleInputChange}
                    placeholder="e.g., 10"
                    step="0.1"
                    min="0"
                    className="w-full rounded-lg border border-input bg-input px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={!isConnected}
                  />
                  {errors.pricePerCall && <p className="mt-1 text-sm text-destructive">{errors.pricePerCall}</p>}
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={!isConnected}>
                  List My Function on Aether
                </Button>
              </form>
            )}

            {formStep === "submitting" && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
                  <div className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Creating HCS topics and registering your API...</p>
                  <p className="text-sm text-muted-foreground">This might take a moment</p>
                </div>
              </div>
            )}

            {formStep === "success" && submittedData && (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-500/10">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg">API Listed Successfully!</p>
                    <p className="text-sm text-muted-foreground">Your API is now available on the Aether marketplace</p>
                  </div>
                </div>

                <div className="rounded-lg border border-primary/50 bg-primary/5 p-6 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Function Name</p>
                    <p className="text-lg font-semibold">{submittedData.functionName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">API Endpoint</p>
                    <p className="font-mono text-sm break-all">{submittedData.apiEndpoint}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Price per Call</p>
                    <p className="text-lg font-semibold text-primary">{submittedData.pricePerCall} HBAR</p>
                  </div>
                </div>

                <Button className="w-full" onClick={() => (window.location.href = "/")}>
                  Back to Marketplace
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info section */}
        <Card className="mt-8 border-border">
          <CardHeader>
            <CardTitle className="text-base">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1 inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                  1
                </div>
                <div>
                  <p className="font-semibold">Submit Your API</p>
                  <p className="text-muted-foreground">
                    We create HCS topics for your API and register it on our platform
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1 inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                  2
                </div>
                <div>
                  <p className="font-semibold">Customers Discover</p>
                  <p className="text-muted-foreground">
                    Users find your API on the marketplace and pay HBAR to call it
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1 inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                  3
                </div>
                <div>
                  <p className="font-semibold">Get Paid</p>
                  <p className="text-muted-foreground">Receive micropayments to your Hedera account instantly</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
