"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Navigation items
const navItems = [
  { label: "Home", href: "/" },
  { label: "R3Bin", href: "/r3bin" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Contact Us", href: "/contact" },
  { label: "Our Team", href: "/our-team" },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-[10px] border-b border-white/10">
      <nav className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-4 xl:px-8 h-[70px]">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/fostride-logo.png"
            alt="Fostride"
            width={70}
            height={70}
            className="h-[70px] w-auto"
          />
        </Link>

        {/* Desktop Navigation - Floating Pill Style */}
        <div className="hidden xl:flex xl:absolute xl:left-1/2 xl:-translate-x-1/2 xl:items-center xl:gap-1 bg-[#0a0a0a] border border-white/10 rounded-full p-1.5 shadow-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-all duration-200 px-4 py-2 rounded-full",
                  isActive
                    ? "bg-white/10 text-primary shadow-sm ring-1 ring-white/5"
                    : "text-white hover:text-white/80 hover:bg-white/10"
                )}
              >
                {item.label}
              </Link>
            )
          })}

        </div>

        <button
          type="button"
          className="xl:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#050505]/95 border-b border-white/10 absolute top-[70px] left-0 right-0 w-full z-40 px-4 py-4 space-y-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "block text-sm font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
