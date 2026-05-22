"use client"

import Image from "next/image"
import { useState } from "react"

function PartnerLogo({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
  const [errored, setErrored] = useState(false)
  if (errored) return (
    <span className="text-sm font-bold tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>{alt}</span>
  )
  return (
    <div className="relative" style={{ width, height }}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain opacity-55 group-hover:opacity-85 transition-opacity duration-300"
        onError={() => setErrored(true)}
      />
    </div>
  )
}

const partners = [
  {
    label: "Incubated at",
    name: "RIIDL",
    sub: "Somaiya Vidyavihar University",
    logo: "/images/companies/riidl.png",
    logoW: 90,
    logoH: 36,
    invert: true,
  },
  {
    label: "Technology Partner",
    name: "NVIDIA Inception",
    sub: "AI & Deep Learning Program",
    logo: "/images/partners/nvidia-inception.png",
    logoW: 130,
    logoH: 34,
    invert: false,
  },
  {
    label: "Member",
    name: "Nasscom",
    sub: "DeepTech Club Launchpad",
    logo: "/images/partners/nasscom.png",
    logoW: 110,
    logoH: 34,
    invert: false,
  },
]

function PartnerCard({ p }: { p: typeof partners[0] }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="group flex flex-col items-center gap-4 rounded-2xl px-6 py-7 transition-all duration-300 cursor-default"
      style={{
        background: hovered ? "rgba(26,107,60,0.05)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${hovered ? "rgba(26,107,60,0.22)" : "rgba(255,255,255,0.06)"}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Label pill */}
      <span
        className="text-[9px] font-bold tracking-[0.22em] uppercase px-3 py-1 rounded-full"
        style={{
          color: "#1A6B3C",
          background: "rgba(12,131,70,0.1)",
          border: "1px solid rgba(12,131,70,0.18)",
        }}
      >
        {p.label}
      </span>

      {/* Logo */}
      <div className="flex items-center justify-center h-10">
        {p.invert ? (
          <div className="relative" style={{ width: p.logoW, height: p.logoH }}>
            <Image
              src={p.logo}
              alt={p.name}
              fill
              className="object-contain brightness-0 invert opacity-55 group-hover:opacity-85 transition-opacity duration-300"
            />
          </div>
        ) : (
          <PartnerLogo src={p.logo} alt={p.name} width={p.logoW} height={p.logoH} />
        )}
      </div>

      {/* Name + sub */}
      <div className="text-center">
        <p className="text-[13px] font-semibold text-white leading-snug">{p.name}</p>
        <p className="text-[11px] mt-0.5" style={{ color: "#3A3830" }}>{p.sub}</p>
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
      {/* Subtle glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(12,131,70,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Section label */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="h-px flex-1 max-w-[80px]" style={{ background: "rgba(255,255,255,0.06)" }} />
          <span
            className="text-[10px] font-semibold tracking-[0.22em] uppercase"
            style={{ color: "#2A2820" }}
          >
            Backed &amp; Supported By
          </span>
          <div className="h-px flex-1 max-w-[80px]" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Partner cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {partners.map((p, i) => (
            <PartnerCard key={i} p={p} />
          ))}
        </div>

      </div>
    </section>
  )
}