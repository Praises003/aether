"use client"

import Link from "next/link"
import { useWallet } from "@/context/wallet-context"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"

export function Navbar() {
  const { isConnected, accountId, balance, connectWallet, disconnectWallet, loading } = useWallet()

  return (
    <nav
      className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-balance">Aether</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Marketplace
          </Link>
          <Link
            href="/developers"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            For Developers
          </Link>
        </div>

        {/* Wallet Connector */}
        <div className="flex items-center gap-4">
          {isConnected ? (
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary px-3 py-2 text-sm">
                <div className="font-mono text-xs text-muted-foreground">Balance</div>
                <div className="font-semibold">{balance?.toLocaleString()} HBAR</div>
              </div>
              <div className="rounded-lg bg-secondary px-3 py-2 text-sm">
                <div className="font-mono text-xs text-muted-foreground">Account</div>
                <div className="font-mono text-sm font-semibold">{accountId}</div>
              </div>
              <Button variant="outline" size="sm" onClick={disconnectWallet}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={connectWallet}
              disabled={loading}
              className="bg-primary hover:bg-primary/90">
              {loading ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
