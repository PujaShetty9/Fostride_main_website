"use client"

import Image from "next/image"
import { useState } from "react"

const partners = [
  {
    label: "Incubated at",
    name: "RIIDL",
    sub: "Somaiya Vidyavihar University",
    logo: "/images/partners/riidl.png",
    logoW: 130,
    logoH: 52,
    whiteBg: true,
    invert: false,
  },
  {
    label: "Technology Partner",
    name: "NVIDIA Inception",
    sub: "AI & Deep Learning Program",
    logo: "/images/partners/nvidia-inception.png",
    logoW: 160,
    logoH: 50,
    whiteBg: true,
    invert: false,
  },
  {
    label: "Member",
    name: "Nasscom DeepTech",
    sub: "Club Launchpad",
    logo: "/images/partners/nasscom.svg",
    logoW: 110,
    logoH: 56,
    whiteBg: true,
    invert: false,
  },
  {
    label: "Supported by",
    name: "NIDHI Prayas",
    sub: "DST — Govt. of India",
    logo: "/images/partners/nidhi-prayas.png",
    logoW: 140,
    logoH: 50,
    whiteBg: true,
    invert: false,
  },
  {
    label: "Recognised by",
    name: "Startup India",
    sub: "DPIIT — Govt. of India",
    logo: "/images/partners/startup-india.jpg",
    logoW: 90,
    logoH: 90,
    whiteBg: true,
    invert: false,
  },
]

function PartnerSlot({
  p,
  last,
}: {
  p: typeof partners[0]
  last: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex-1 flex flex-col items-center justify-between gap-5 px-6 py-9 relative transition-all duration-300 cursor-default min-w-0"
      style={{
        background: hovered ? "rgba(26,107,60,0.06)" : "transparent",
        borderRight: last ? "none" : "1px solid rgba(255,255,255,0.06)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top glow on hover */}
      {hovered && (
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(12,131,70,0.5), transparent)",
          }}
        />
      )}

      {/* Label */}
      <span
        className="text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full whitespace-nowrap"
        style={{
          color: hovered ? "#22c55e" : "#1A6B3C",
          background: hovered ? "rgba(12,131,70,0.18)" : "rgba(12,131,70,0.08)",
          border: "1px solid rgba(12,131,70,0.2)",
          transition: "color 0.3s, background 0.3s",
        }}
      >
        {p.label}
      </span>

      {/* Logo */}
      <div
        className="flex items-center justify-center rounded-2xl transition-all duration-300"
        style={{
          width: "100%",
          height: 96,
          background: p.whiteBg ? "rgba(255,255,255,0.96)" : "transparent",
          padding: p.whiteBg ? "10px 16px" : "0",
          boxShadow: p.whiteBg && hovered ? "0 4px 24px rgba(0,0,0,0.25)" : "none",
        }}
      >
        <div
          className="relative"
          style={{
            width: p.logoW,
            height: p.logoH,
            filter: p.invert ? "brightness(0) invert(1)" : "none",
            opacity: hovered ? 1 : 0.8,
            transition: "opacity 0.3s",
          }}
        >
          <Image src={p.logo} alt={p.name} fill className="object-contain" />
        </div>
      </div>

      {/* Name + sub */}
      <div className="text-center">
        <p
          className="text-[13px] font-semibold leading-snug transition-colors duration-300"
          style={{ color: hovered ? "#ffffff" : "rgba(255,255,255,0.7)" }}
        >
          {p.name}
        </p>
        <p className="text-[11px] mt-1" style={{ color: "#3A3830" }}>
          {p.sub}
        </p>
      </div>
    </div>
  )
}

export function CredibilityStrip() {
  return (
    <section
      className="relative w-full py-20 overflow-hidden"
      style={{ background: "#070503", borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(12,131,70,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-3 mb-3">
            <span
              className="h-px block"
              style={{ width: 40, background: "rgba(12,131,70,0.4)" }}
            />
            <span
              className="text-[11px] font-semibold tracking-[0.25em] uppercase"
              style={{ color: "#0C8346" }}
            >
              Backed &amp; Supported By
            </span>
            <span
              className="h-px block"
              style={{ width: 40, background: "rgba(12,131,70,0.4)" }}
            />
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-unbounded)] text-white leading-tight"
          >
            Validated by industry leaders
          </h2>
          <p className="mt-2 text-[14px]" style={{ color: "#4A4540" }}>
            Institutional backing that speaks to our credibility and mission.
          </p>
        </div>

        {/* Partner strip — single dark card, horizontal */}
        <div
          className="rounded-3xl overflow-hidden flex flex-col lg:flex-row"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {partners.map((p, i) => (
            <PartnerSlot key={i} p={p} last={i === partners.length - 1} />
          ))}
        </div>

        {/* Bottom micro-text */}
        <p
          className="text-center mt-6 text-[11px]"
          style={{ color: "#2A2820" }}
        >
          Incubated &middot; Certified &middot; Recognised by Govt. of India programs
        </p>
      </div>
    </section>
  )
}