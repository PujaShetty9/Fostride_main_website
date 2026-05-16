"use client"

import { Trash2, ScanEye, DatabaseZap, Recycle } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const steps = [
  {
    step: "01",
    icon: Trash2,
    title: "Drop the Waste",
    desc: "Users simply dispose of waste into R3Bin — no pre-sorting required.",
    accent: "#0C8346",
  },
  {
    step: "02",
    icon: ScanEye,
    title: "AI Identifies & Sorts",
    desc: "W.I.S.E. uses computer vision to recognise and classify each item in real time.",
    accent: "#22c55e",
  },
  {
    step: "03",
    icon: DatabaseZap,
    title: "Data Captured & Tracked",
    desc: "Every item is converted into structured data and mapped to your dashboard — tracking waste trends, segregation, and impact.",
    accent: "#16a34a",
  },
  {
    step: "04",
    icon: Recycle,
    title: "Routed to Recyclers",
    desc: "Sorted waste is intelligently directed to authorised recyclers and upcycling partners — closing the loop.",
    accent: "#0C8346",
  },
]

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, visible }
}

export function HowItWorks() {
  const { ref, visible } = useReveal(0.1)

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      {/* Radial bg accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-[#0C8346]/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">

        {/* Header */}
        <div
          className="text-center mb-20"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <div className="inline-flex items-center gap-3 text-[#0C8346] text-xs font-semibold uppercase tracking-[0.2em] mb-5">
            <div
              className="h-px bg-[#0C8346]"
              style={{ width: visible ? "32px" : "0px", transition: "width 0.8s ease 0.3s" }}
            />
            How It Works
            <div
              className="h-px bg-[#0C8346]"
              style={{ width: visible ? "32px" : "0px", transition: "width 0.8s ease 0.3s" }}
            />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold font-[family-name:var(--font-unbounded)] text-white leading-tight">
            Four Steps.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #0C8346, #22c55e)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Closed Loop.
            </span>
          </h2>
          <p className="mt-4 text-gray-400 text-lg max-w-xl mx-auto">
            From drop to recycler — every gram of waste accounted for, automatically.
          </p>
        </div>

        <style>{`
          @keyframes travelDot {
            0%   { left: 0%; opacity: 0; }
            5%   { opacity: 1; }
            95%  { opacity: 1; }
            100% { left: 100%; opacity: 0; }
          }
        `}</style>

        {/* Steps */}
        <div className="relative max-w-6xl mx-auto">

          {/* Connecting line — spans all 4 nodes on desktop */}
          <div className="hidden lg:block absolute top-[52px] left-[calc(12.5%+8px)] right-[calc(12.5%+8px)] h-px pointer-events-none overflow-hidden">
            {/* Dashed base track */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "linear-gradient(90deg, rgba(26,107,60,0.25) 50%, transparent 50%)",
              backgroundSize: "10px 1px",
            }} />
            {/* Animated fill */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, #0C8346 0%, #22c55e 50%, #0C8346 100%)",
              transform: visible ? "scaleX(1)" : "scaleX(0)",
              transformOrigin: "left",
              transition: "transform 1.4s ease 0.7s",
              opacity: 0.7,
            }} />
            {/* Traveling dot */}
            {visible && (
              <div style={{
                position: "absolute", top: "50%", marginTop: "-4px",
                width: 8, height: 8,
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 8px #22c55e, 0 0 16px #22c55e80",
                animation: "travelDot 2.5s ease-in-out 1s infinite",
              }} />
            )}
          </div>

          {/* Arrows between steps — desktop */}
          {[1, 2, 3].map((pos) => (
            <div key={pos} className="hidden lg:flex absolute top-[44px] items-center justify-center pointer-events-none z-20"
              style={{ left: `calc(${pos * 25}% - 10px)`, width: 20 }}>
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{
                  opacity: visible ? 1 : 0,
                  transition: `opacity 0.5s ease ${1.2 + pos * 0.1}s`,
                }}>
                <path d="M2 7h10M8 3l4 4-4 4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ))}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
            {steps.map((s, i) => {
              const Icon = s.icon
              return (
                <div
                  key={s.step}
                  className="relative flex flex-col items-center text-center group"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(40px)",
                    transition: `opacity 0.7s ease ${0.3 + i * 0.15}s, transform 0.7s ease ${0.3 + i * 0.15}s`,
                  }}
                >
                  {/* Icon circle */}
                  <div className="relative z-10 mb-6">
                    {/* Hover pulse ring */}
                    <div className="absolute inset-0 rounded-full bg-[#0C8346]/20 scale-0 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                    <div
                      className="w-[104px] h-[104px] rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, ${s.accent}45, ${s.accent}12)`,
                        border: `1.5px solid ${s.accent}55`,
                        boxShadow: `0 0 32px ${s.accent}22`,
                      }}
                    >
                      <Icon className="w-9 h-9 transition-colors duration-300" style={{ color: s.accent }} />
                    </div>

                    {/* Step number badge */}
                    <div
                      className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#050505] border flex items-center justify-center"
                      style={{ borderColor: `${s.accent}60` }}
                    >
                      <span className="text-[10px] font-bold" style={{ color: s.accent }}>
                        {s.step}
                      </span>
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className="w-full rounded-3xl p-6 border transition-all duration-300 group-hover:border-[#0C8346]/40 group-hover:shadow-[0_0_40px_rgba(12,131,70,0.08)]"
                    style={{
                      background: "linear-gradient(160deg, rgba(12,131,70,0.08) 0%, rgba(12,131,70,0.02) 100%)",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <h3 className="text-lg font-bold text-white mb-2 font-[family-name:var(--font-unbounded)] leading-snug">
                      {s.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
