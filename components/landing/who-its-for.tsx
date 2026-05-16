"use client"

import { useEffect, useRef, useState } from "react"
import { Building2, GraduationCap, Landmark } from "lucide-react"

const audiences = [
  {
    icon: Building2,
    label: "Corporations",
    headline: "Turn ESG compliance into a competitive advantage.",
    points: [
      "Automated BRSR & GRI waste disclosures",
      "Photographic audit trail per item",
      "Real-time diversion dashboards",
    ],
    tag: "ESG / Sustainability Teams",
    color: "#1A6B3C",
  },
  {
    icon: GraduationCap,
    label: "Campuses & Universities",
    headline: "Handle thousands of disposals daily — with zero manual sorting.",
    points: [
      "Handles high footfall without staff overhead",
      "Engagement data by zone & time",
      "Drives student sustainability initiatives",
    ],
    tag: "Facilities & Admin",
    color: "#2A8A50",
  },
  {
    icon: Landmark,
    label: "Municipalities",
    headline: "Know exactly what your city throws away — and act on it.",
    points: [
      "Waste composition maps by ward",
      "Recycler routing & vendor accountability",
      "Supports Smart City KPIs",
    ],
    tag: "Urban Local Bodies",
    color: "#1A6B3C",
  },
]

export function WhoItsFor() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(12,131,70,0.05) 0%, transparent 70%)" }} />

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0C8346]/25 bg-[#0C8346]/8 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0C8346]" />
            <span className="text-[#0C8346] text-[11px] font-semibold tracking-widest uppercase">Who It&apos;s For</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-unbounded)] text-white leading-tight">
            Built for organisations<br />
            <span style={{
              background: "linear-gradient(135deg, #0C8346 0%, #22c55e 60%, #0C8346 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>that mean it.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed max-w-lg mx-auto" style={{ color: "#6B6358" }}>
            R3Bin is deployable anywhere waste is generated at scale. Here&apos;s who&apos;s using it.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {audiences.map((a, i) => {
            const Icon = a.icon
            return (
              <div
                key={a.label}
                className="group relative rounded-3xl p-7 flex flex-col gap-5 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(32px)",
                  transition: `opacity 0.7s ease ${0.15 + i * 0.12}s, transform 0.7s ease ${0.15 + i * 0.12}s, scale 0.3s ease, border-color 0.3s ease`,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(26,107,60,0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
              >
                {/* Subtle top glow on hover */}
                <div className="absolute inset-x-0 top-0 h-px rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(26,107,60,0.5), transparent)" }} />

                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${a.color}18`, border: `1px solid ${a.color}30` }}>
                  <Icon size={22} color={a.color} />
                </div>

                {/* Tag */}
                <span className="text-[10px] font-semibold tracking-widest uppercase"
                  style={{ color: "#3A3830" }}>{a.tag}</span>

                {/* Headline */}
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug mb-1">{a.label}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#6B6358" }}>{a.headline}</p>
                </div>

                {/* Points */}
                <ul className="flex flex-col gap-2.5 mt-auto">
                  {a.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-[12px]" style={{ color: "#5A5450" }}>
                      <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.color }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}