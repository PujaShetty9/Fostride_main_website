"use client"

import { AnimatedNumber } from "@/components/ui/animated-number"

const stats = [
  { value: 65000, display: "65,000+", label: "Images Scanned", commaSeparated: true, suffix: "" },
  { value: 21, display: "21 kg", label: "CO₂ Offset", commaSeparated: false, suffix: " kg" },
  { value: 2, display: "2", label: "Active Pilots", commaSeparated: false, suffix: "" },
  { value: 500, display: "<500ms", label: "Classify Time", commaSeparated: false, suffix: "ms", prefix: "<" },
]

export function StatsStrip() {
  return (
    <section className="relative py-16 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(26,107,60,0.04) 30%, rgba(26,107,60,0.06) 50%, rgba(26,107,60,0.04) 70%, transparent 100%)" }} />
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(26,107,60,0.2) 30%, rgba(26,107,60,0.2) 70%, transparent)" }} />
      <div className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(26,107,60,0.2) 30%, rgba(26,107,60,0.2) 70%, transparent)" }} />

      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className="flex flex-col items-center text-center gap-1">
            <p className="font-extrabold font-[family-name:var(--font-unbounded)] leading-none"
              style={{ fontSize: "clamp(28px,3.5vw,44px)", color: "#1A6B3C" }}>
              {i === 3 ? (
                <span>&lt;<AnimatedNumber value={500} suffix="ms" duration={1200} /></span>
              ) : (
                <AnimatedNumber
                  value={s.value}
                  suffix={s.value === 21 ? " kg" : ""}
                  commaSeparated={s.commaSeparated}
                  duration={1800}
                />
              )}
              {s.value === 65000 && <span className="text-[0.55em] ml-0.5 opacity-70">+</span>}
            </p>
            <p className="text-[11px] uppercase tracking-widest font-medium mt-1" style={{ color: "#3A3830" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}