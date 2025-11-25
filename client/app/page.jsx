"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Zap, Send, Code, TrendingUp, CheckCircle } from 'lucide-react'

export default function LandingPage() {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = "smooth"
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Navbar */}
      {/* <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Zap className="h-6 w-6 text-primary" />
            <span>Aether</span>
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
            <a href="#problem" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Problem
            </a>
            <a href="#solution" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Solution
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              How it Works
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/developers">For Developers</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/marketplace">Launch Marketplace</Link>
            </Button>
          </div>
        </div>
      </nav> */}

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold tracking-tight text-balance leading-tight sm:text-6xl">
              Kill the Subscription. <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Pay per Call.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Welcome to Aether, the decentralized API marketplace. Stop paying for expensive monthly subscriptions and start paying only for what you use, down to a fraction of a cent.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
                <Link href="/marketplace">Launch Marketplace</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/developers">List Your API</Link>
              </Button>
            </div>
          </div>

          <div className="relative h-96 w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl" />
            <div className="relative h-full rounded-2xl border border-primary/30 bg-card/50 backdrop-blur flex items-center justify-center overflow-hidden">
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    {[...Array(3)].map((_, j) => (
                      <div
                        key={j}
                        className="h-8 w-8 rounded-lg bg-primary/30"
                        style={{ animationDelay: `${(i * 3 + j) * 100}ms` }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-y border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
            Built On
          </p>
          <div className="flex flex-col items-center justify-center gap-8 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <span className="font-semibold">Hedera</span>
            </div>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <span className="font-semibold">HCS</span>
            </div>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <span className="font-semibold">HCS(crypto service)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-balance">
              The SaaS Trap is Broken.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* High Fees */}
            <div className="rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/20">
                <TrendingUp className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">High Fees</h3>
              <p className="text-muted-foreground">
                Minimum $0.30 fee makes true micropayments impossible.
              </p>
            </div>

            {/* High Gas */}
            <div className="rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/20">
                <Zap className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">High Gas</h3>
              <p className="text-muted-foreground">
                A $50 gas fee for a $0.01 API call? No thank you.
              </p>
            </div>

            {/* Subscription Fatigue */}
            <div className="rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/20">
                <CheckCircle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Subscription Fatigue</h3>
              <p className="text-muted-foreground">
                Why pay $20/month for a service you only use twice?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-balance">
              Aether is the New Economy for Software.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Pay-per-Call */}
            <div className="rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Pay-per-Call</h3>
              <p className="text-muted-foreground">
                Pay only for what you use. Our HBAR-powered micropayments mean you can pay $0.001 for a single API call.
              </p>
            </div>

            {/* Instant & Auditable */}
            <div className="rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant & Auditable</h3>
              <p className="text-muted-foreground">
                All jobs and receipts are logged on the Hedera Consensus Service (HCS), creating a fast and fully auditable, trustless system.
              </p>
            </div>

            {/* Open Marketplace */}
            <div className="rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Open Marketplace</h3>
              <p className="text-muted-foreground">
                Any developer can list their API. Any user can access it. No barriers, just code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-balance">
              How It Works
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-semibold text-primary">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Find</h3>
              <p className="text-muted-foreground">
                Browse the marketplace and find the function you need.
              </p>
              <div className="absolute top-6 left-14 h-0.5 w-16 bg-gradient-to-r from-primary/50 to-transparent hidden md:block" />
            </div>

            {/* Step 2 */}
            <div className="relative md:pt-6">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-semibold text-primary">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Pay & Submit</h3>
              <p className="text-muted-foreground">
                Your wallet pays the developer and submits the job to HCS in one atomic transaction.
              </p>
              <div className="absolute top-6 left-14 h-0.5 w-16 bg-gradient-to-r from-primary/50 to-transparent hidden md:block" />
            </div>

            {/* Step 3 */}
            <div className="relative md:pt-6">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-semibold text-primary">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Receive</h3>
              <p className="text-muted-foreground">
                Our gateway processes the job, and you get your result back on-chain. Simple, fast, and verifiable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 p-12 text-center space-y-6">
          <h2 className="text-4xl font-bold tracking-tight">
            Join the Pay-per-Call Economy.
          </h2>
          <p className="text-lg text-muted-foreground">
            Stop subscribing. Start building. Explore the marketplace or list your own API today.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row justify-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <Link href="/marketplace">Launch Marketplace</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/developers">I'm a Developer</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-center md:text-left">
              <p className="font-semibold">Aether © 2025</p>
              <p className="text-sm text-muted-foreground">
                Built for the Hedera Ascension Hackathon
              </p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Discord
              </a>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Twitter
              </a>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
