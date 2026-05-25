"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Brain, Wifi, BarChart3, Leaf, Sparkles, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScheduleDemoModal } from "@/components/landing/schedule-demo-modal"
import { AnimatedNumber } from "@/components/ui/animated-number"

const features = [
  {
    icon: Brain,
    label: "AI Vision",
    description: "65K+ Images Scanned",
    detail: "Computer vision classifies every item in under 500ms — on-device, no cloud needed.",
    position: "top-8 -left-4 lg:-left-14",
  },
  {
    icon: Wifi,
    label: "IoT Sensors",
    description: "Real-time monitoring",
    detail: "Fill-level, weight, and temperature sensors stream live data every 15 minutes.",
    position: "top-1/3 -right-4 lg:-right-14",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    description: "Live dashboard",
    detail: "Every sort becomes a data point — trends, predictions, and ESG reports, automatically.",
    position: "bottom-1/3 -left-4 lg:-left-14",
  },
  {
    icon: Leaf,
    label: "Eco Impact",
    description: "Track carbon savings",
    detail: "CO₂ offset, diversion rates, and recycler routing — measurable impact from day one.",
    position: "bottom-20 -right-4 lg:-right-14",
  },
]

export function HeroSection() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)
  const [activeFeature, setActiveFeature] = useState<number | null>(null)

  return (
    <>
      <section
        id="hero-section"
        className="relative min-h-screen pt-24 pb-16 select-none outline-none overflow-hidden"
      >
        {/* Dot grid — WISE style */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(12,131,70,0.14) 1.5px, transparent 1.5px)",
            backgroundSize: "44px 44px",
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 20%, #050505 76%)" }}
        />
        {/* Scan line */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div
            className="absolute left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(12,131,70,0.55) 50%, transparent 100%)",
              animation: "scanLine 10s ease-in-out infinite",
              top: 0,
            }}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0C8346]/20 to-transparent z-10" />

        <div className="relative mx-auto max-w-7xl px-4 lg:px-8 z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* ── LEFT ── */}
            <div className="space-y-8 order-2 lg:order-1">
              {/* Badge */}
              <div className="flex items-center gap-2.5 bg-[#0C8346]/10 border border-[#0C8346]/30 rounded-full px-4 py-2 w-fit">
                <span className="w-2 h-2 rounded-full bg-[#0C8346]" style={{ animation: "dotBlink 1.6s ease-in-out infinite" }} />
                <span className="text-sm text-[#0C8346] font-semibold tracking-wide">Powered by W.I.S.E.</span>
              </div>

              {/* Headline */}
              <div className="space-y-1">
                <h1 className="text-5xl md:text-6xl lg:text-[70px] font-bold tracking-tight leading-[0.92] font-[family-name:var(--font-unbounded)] text-white">
                  The Bin
                </h1>
                <h1
                  className="text-5xl md:text-6xl lg:text-[70px] font-bold tracking-tight leading-[0.92] font-[family-name:var(--font-unbounded)]"
                  style={{
                    background: "linear-gradient(135deg, #0C8346 0%, #22c55e 40%, #0C8346 80%)",
                    backgroundSize: "200% 200%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    animation: "gradientShift 6s ease infinite",
                  }}
                >
                  That Thinks.
                </h1>
              </div>

              <p className="text-lg text-gray-400 leading-relaxed max-w-xl font-light">
                R3Bin sorts, identifies, and logs every item — turning waste disposal into real-time intelligence.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 relative z-50">
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="group relative inline-flex items-center justify-center gap-2 bg-[#0C8346] text-white font-semibold px-8 py-4 rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(12,131,70,0.55)] hover:scale-[1.04] active:scale-100 pointer-events-auto cursor-pointer"
                >
                  <span className="relative z-10">Schedule Demo</span>
                  <ArrowRight className="relative z-10 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                </button>

                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-2 border border-white/20 hover:border-[#0C8346]/60 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:bg-[#0C8346]/10 backdrop-blur-sm pointer-events-auto"
                >
                  Live Analytics
                  <BarChart3 className="h-4 w-4 text-[#0C8346]" />
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-white/10">
                <div className="flex flex-col group cursor-default">
                  <span className="text-2xl font-bold text-[#0C8346] font-[family-name:var(--font-unbounded)] group-hover:scale-110 transition-transform duration-200 origin-left flex items-baseline gap-0.5">
                    <AnimatedNumber value={65000} commaSeparated duration={2000} />
                  </span>
                  <span className="text-[11px] text-gray-500 uppercase tracking-widest mt-0.5">Images Scanned</span>
                </div>
                <div className="flex flex-col group cursor-default">
                  <span className="text-2xl font-bold text-[#0C8346] font-[family-name:var(--font-unbounded)] group-hover:scale-110 transition-transform duration-200 origin-left">
                    <AnimatedNumber value={85} suffix="%" duration={1600} />
                  </span>
                  <span className="text-[11px] text-gray-500 uppercase tracking-widest mt-0.5">Sort Accuracy</span>
                </div>
                <div className="flex flex-col group cursor-default">
                  <span className="text-2xl font-bold text-[#0C8346] font-[family-name:var(--font-unbounded)] group-hover:scale-110 transition-transform duration-200 origin-left">&lt;500ms</span>
                  <span className="text-[11px] text-gray-500 uppercase tracking-widest mt-0.5">Classify Time</span>
                </div>
              </div>
            </div>

            {/* ── RIGHT — product showcase ── */}
            <div className="relative order-1 lg:order-2 flex flex-col items-center justify-center py-8 lg:py-0 gap-4">

              {/* Product + callouts wrapper */}
              <div className="relative flex items-center justify-center w-full">

                {/* Glowing backdrop */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 lg:w-96 lg:h-96 rounded-full bg-[#0C8346]/20 blur-[100px] animate-pulse" />
                </div>

                {/* Product image */}
                <div className="relative z-10 group">
                  {/* Rotating rings */}
                  <div className="absolute inset-0 -m-8 lg:-m-12 rounded-full border border-[#0C8346]/20 animate-[spin_20s_linear_infinite]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#0C8346]" />
                  </div>
                  <div className="absolute inset-0 -m-16 lg:-m-24 rounded-full border border-[#0C8346]/10 animate-[spin_30s_linear_infinite_reverse]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#0C8346]/50" />
                  </div>

                  <div className="relative w-64 h-80 sm:w-72 sm:h-96 lg:w-80 lg:h-[28rem] transition-transform duration-500 group-hover:scale-105">
                    <Image
                      src="/images/r3bin-product.svg"
                      alt="R3Bin Smart Waste Management System"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>

                  {/* ── Callout chips — compact, never expand ── */}
                  {features.map((feature, index) => {
                    const Icon = feature.icon
                    const isActive = activeFeature === index
                    return (
                      <button
                        key={feature.label}
                        className={cn("absolute z-20 text-left outline-none transition-all duration-250", feature.position)}
                        onClick={() => setActiveFeature(isActive ? null : index)}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl border backdrop-blur-md px-3 py-2.5 shadow-lg transition-all duration-250 whitespace-nowrap",
                            isActive
                              ? "bg-[#0a0a0a]/95 border-[#0C8346]/60 shadow-[0_0_18px_rgba(12,131,70,0.3)]"
                              : "bg-[#0a0a0a]/80 border-white/10 hover:border-[#0C8346]/40"
                          )}
                        >
                          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-250", isActive ? "bg-[#0C8346]" : "bg-[#0C8346]/20")}>
                            <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-white" : "text-[#0C8346]")} />
                          </div>
                          <div>
                            <div className={cn("text-xs font-semibold transition-colors duration-200", isActive ? "text-[#22c55e]" : "text-white")}>
                              {feature.label}
                            </div>
                            <div className="text-[10px] text-gray-500">{feature.description}</div>
                          </div>
                        </div>
                        {/* Connecting line */}
                        <div
                          className={cn(
                            "absolute top-1/2 h-px transition-all duration-250",
                            isActive ? "bg-[#0C8346]/50" : "bg-white/15",
                            index % 2 === 0
                              ? "right-0 translate-x-full w-4 lg:w-8"
                              : "left-0 -translate-x-full w-4 lg:w-8 rotate-180"
                          )}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Detail panel — appears BELOW bin when a card is active ── */}
              <div
                className="w-full max-w-sm transition-all duration-350 overflow-hidden"
                style={{
                  maxHeight: activeFeature !== null ? "72px" : "0px",
                  opacity: activeFeature !== null ? 1 : 0,
                }}
              >
                {activeFeature !== null && (
                  <div className="flex items-start gap-3 bg-[#0a0a0a]/90 border border-[#0C8346]/35 rounded-2xl px-4 py-3 backdrop-blur-md shadow-[0_4px_24px_rgba(12,131,70,0.18)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0C8346] flex-shrink-0 mt-1.5" style={{ animation: "dotBlink 1.6s ease-in-out infinite" }} />
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {features[activeFeature].detail}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom badges */}
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-2 rounded-full border border-[#0C8346]/25 bg-[#0a0a0a]/80 backdrop-blur-md px-4 py-2">
                  <Sparkles className="h-3.5 w-3.5 text-[#0C8346]" />
                  <span className="text-xs text-gray-400">AI-Powered</span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-[#0C8346]/25 bg-[#0a0a0a]/80 backdrop-blur-md px-4 py-2">
                  <Shield className="h-3.5 w-3.5 text-[#0C8346]" />
                  <span className="text-xs text-gray-400">Enterprise Ready</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <ScheduleDemoModal open={isDemoModalOpen} onOpenChange={setIsDemoModalOpen} />
    </>
  )
}
