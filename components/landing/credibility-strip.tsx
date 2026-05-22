"use client"

import Image from "next/image"
import { useState } from "react"

const partners = [
  {
    label: "Incubated at",
    name: "RIIDL",
    sub: "Somaiya Vidyavihar University",
    logo: "/images/companies/riidl.png",
    logoW: 80,
    logoH: 32,
    whiteBg: false,
    invert: true,
  },
  {
    label: "Technology Partner",
    name: "NVIDIA Inception",
    sub: "AI & Deep Learning Program",
    logo: "/images/partners/nvidia-inception.png",
    logoW: 120,
    logoH: 36,
    whiteBg: true,
    invert: false,
  },
  {
    label: "Member",
    name: "Nasscom DeepTech",
    sub: "Club Launchpad",
    logo: "/images/partners/nasscom.svg",
    logoW: 96,
    logoH: 44,
    whiteBg: true,
    invert: false,
  },
  {
    label: "Supported by",
    name: "NIDHI Prayas",
    sub: "DST — Govt. of India",
    logo: "/images/partners/nidhi-prayas.png",
    logoW: 100,
    logoH: 36,
    whiteBg: true,
    invert: false,
  },
  {
    label: "Recognised by",
    name: "Startup India",
    sub: "DPIIT — Govt. of India",
    logo: "/images/partners/startup-india.jpg",
    logoW: 104,
    logoH: 38,
    whiteBg: true,
    invert: false,
  },
]

function PartnerCard({ p }: { p: typeof partners[0] }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 transition-all duration-300 cursor-default"
      style={{
        background: hovered ? "rgba(26,107,60,0.05)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${hovered ? "rgba(26,107,60,0.25)" : "rgba(255,255,255,0.06)"}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Label pill */}
      <span
        className="text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full whitespace-nowrap"
        style={{
          color: "#1A6B3C",
          background: "rgba(12,131,70,0.1)",
          border: "1px solid rgba(12,131,70,0.18)",
        }}
      >
        {p.label}
      </span>

      {/* Logo container */}
      <div
        className="flex items-center justify-center rounded-xl transition-all duration-300"
        style={{
          width: "100%",
          height: 56,
          background: p.whiteBg ? "rgba(255,255,255,0.94)" : "transparent",
          padding: p.whiteBg ? "8px 12px" : "0",
        }}
      >
        <div
          className="relative transition-opacity duration-300"
          style={{
            width: p.logoW,
            height: p.logoH,
            opacity: hovered ? 1 : 0.75,
            filter: p.invert ? "brightness(0) invert(1)" : "none",
          }}
        >
          <Image
            src={p.logo}
            alt={p.name}
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Name + sub */}
      <div className="text-center">
        <p className="text-[12px] font-semibold text-white leading-snug">{p.name}</p>
        <p className="text-[10px] mt-0.5" style={{ color: "#3A3830" }}>{p.sub}</p>
      </div>
    </div>
  )
}

export function CredibilityStrip() {
  return (
    <section
      className="relative w-full py-14 overflow-hidden"
      style={{ background: "#070503", borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(12,131,70,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="h-px flex-1 max-w-[60px]" style={{ background: "rgba(255,255,255,0.06)" }} />
          <span
            className="text-[10px] font-semibold tracking-[0.22em] uppercase"
            style={{ color: "#2A2820" }}
          >
            Backed &amp; Supported By
          </span>
          <div className="h-px flex-1 max-w-[60px]" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* 2 col mobile → 3 col tablet → 5 col desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {partners.map((p, i) => (
            <PartnerCard key={i} p={p} />
          ))}
        </div>

      </div>
    </section>
  )
}