"use client"

import { useEffect, useRef, useState } from "react"
import { Trash2, ScanEye, BarChart3 } from "lucide-react"

const flow = [
  { icon: Trash2,   label: "Toss",     desc: "Anything goes in — no pre-sorting" },
  { icon: ScanEye,  label: "Classify", desc: "W.I.S.E. identifies it in <500ms"  },
  { icon: BarChart3,label: "Report",   desc: "Audit-ready data hits your dashboard" },
]

export function WhatFostrideDoes() {
  const ref = useRef<HTMLDivElement>(null)
  const [lineVisible, setLineVisible] = useState(false)
  const flowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = flowRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setLineVisible(true) },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const els = ref.current?.querySelectorAll(".reveal-up") ?? []
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = "1"
          ;(e.target as HTMLElement).style.transform = "translateY(0)"
          obs.unobserve(e.target)
        }
      }),
      { threshold: 0.12 }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} className="relative py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Top rule */}
        <div className="w-full h-px mb-16" style={{ background: "rgba(255,255,255,0.06)" }} />

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 items-start">

          {/* LEFT — label + headline */}
          <div className="flex flex-col gap-6">
            <div
              className="reveal-up flex items-center gap-3"
              style={{ opacity: 0, transform: "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}
            >
              <span className="w-5 h-px bg-[#1A6B3C] inline-block" />
              <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "#1A6B3C" }}>
                What Fostride Does
              </span>
            </div>

            <h2
              className="reveal-up text-[clamp(28px,4vw,52px)] font-extrabold leading-[1.05] tracking-tight font-[family-name:var(--font-unbounded)]"
              style={{
                color: "#F2EDE6",
                opacity: 0,
                transform: "translateY(20px)",
                transition: "opacity 0.65s ease 0.08s, transform 0.65s ease 0.08s",
              }}
            >
              One platform.<br />
              Every waste stream.<br />
              <span style={{ color: "#1A6B3C" }}>Fully auditable.</span>
            </h2>
          </div>

          {/* RIGHT — body copy + two pills */}
          <div className="flex flex-col gap-8">
            <p
              className="reveal-up text-base md:text-lg leading-[1.8] font-light"
              style={{
                color: "#7A7060",
                opacity: 0,
                transform: "translateY(20px)",
                transition: "opacity 0.65s ease 0.14s, transform 0.65s ease 0.14s",
              }}
            >
              W.I.S.E. sits between your waste bin and your boardroom. It captures every item discarded,
              classifies it using computer vision in real time, and builds an immutable audit trail your
              ESG team can actually use.
            </p>

            <p
              className="reveal-up text-base md:text-lg leading-[1.8] font-light"
              style={{
                color: "#7A7060",
                opacity: 0,
                transform: "translateY(20px)",
                transition: "opacity 0.65s ease 0.22s, transform 0.65s ease 0.22s",
              }}
            >
              R3BIN brings the hardware. W.I.S.E. brings the intelligence. Together, they turn waste
              into data — and data into compliance.
            </p>

            {/* Two product pills */}
            <div
              className="reveal-up flex flex-wrap gap-3 pt-2"
              style={{
                opacity: 0,
                transform: "translateY(20px)",
                transition: "opacity 0.65s ease 0.3s, transform 0.65s ease 0.3s",
              }}
            >
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase"
                style={{ background: "rgba(26,107,60,0.1)", border: "1px solid rgba(26,107,60,0.25)", color: "#1A6B3C" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                R3BIN — Smart Hardware
              </span>
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase"
                style={{ background: "rgba(139,106,74,0.08)", border: "1px solid rgba(139,106,74,0.2)", color: "#8B6A4A" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                W.I.S.E. — AI Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* ── 3-step visual flow ── */}
        <div ref={flowRef} className="mt-20 relative">
          {/* Connecting line — desktop only */}
          <div className="hidden md:block absolute top-[28px] left-[calc(16.66%+20px)] right-[calc(16.66%+20px)] h-px overflow-hidden pointer-events-none">
            <div style={{
              height: "100%",
              backgroundImage: "linear-gradient(90deg, #1A6B3C 50%, transparent 50%)",
              backgroundSize: "12px 1px",
              transform: lineVisible ? "scaleX(1)" : "scaleX(0)",
              transformOrigin: "left",
              transition: "transform 1s ease 0.3s",
            }} />
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-4 relative z-10">
            {flow.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={f.label} className="flex flex-col items-center text-center gap-3"
                  style={{
                    opacity: lineVisible ? 1 : 0,
                    transform: lineVisible ? "translateY(0)" : "translateY(20px)",
                    transition: `opacity 0.6s ease ${0.2 + i * 0.15}s, transform 0.6s ease ${0.2 + i * 0.15}s`,
                  }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(26,107,60,0.12)", border: "1px solid rgba(26,107,60,0.3)" }}>
                    <Icon size={22} color="#1A6B3C" />
                  </div>
                  <p className="text-white font-bold text-base">{f.label}</p>
                  <p className="text-[12px] leading-relaxed max-w-[160px]" style={{ color: "#5A5450" }}>{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom rule */}
        <div className="w-full h-px mt-16" style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>
    </section>
  )
}