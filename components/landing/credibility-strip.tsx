"use client"

import Image from "next/image"
import { useState } from "react"

const partners = [
  {
    label: "Incubated at",
    name: "RIIDL",
    sub: "Somaiya Vidyavihar University",
    logo: "/images/partners/riidl.png",
  },
  {
    label: "Technology Partner",
    name: "NVIDIA Inception",
    sub: "AI & Deep Learning Program",
    logo: "/images/partners/nvidia-inception.png",
  },
  {
    label: "Member",
    name: "Nasscom DeepTech",
    sub: "Club Launchpad",
    logo: "/images/partners/nasscom.svg",
  },
  {
    label: "Supported by",
    name: "NIDHI Prayas",
    sub: "DST — Govt. of India",
    logo: "/images/partners/nidhi-prayas.png",
  },
  {
    label: "Recognised by",
    name: "Startup India",
    sub: "DPIIT — Govt. of India",
    logo: "/images/partners/startup-india.jpg",
  },
]

function PartnerSlot({ p, last }: { p: typeof partners[0]; last: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex-1 flex flex-col items-center justify-between gap-6 px-8 py-10 relative transition-all duration-300 cursor-default min-w-0"
      style={{
        background: hovered ? "rgba(26,107,60,0.06)" : "transparent",
        borderRight: last ? "none" : "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top glow on hover */}
      {hovered && (
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(12,131,70,0.6), transparent)",
          }}
        />
      )}

      {/* Label pill */}
      <span
        className="text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full whitespace-nowrap transition-all duration-300"
        style={{
          color: hovered ? "#22c55e" : "#1A6B3C",
          background: hovered
            ? "rgba(12,131,70,0.2)"
            : "rgba(12,131,70,0.08)",
          border: "1px solid rgba(12,131,70,0.22)",
        }}
      >
        {p.label}
      </span>

      {/* Logo box — identical size for all, object-contain inside */}
      <div
        className="w-full flex items-center justify-center rounded-2xl transition-all duration-300"
        style={{
          height: 120,
          background: "rgba(255,255,255,0.96)",
          padding: "14px 20px",
          boxShadow: hovered
            ? "0 6px 30px rgba(0,0,0,0.3)"
            : "0 2px 12px rgba(0,0,0,0.15)",
        }}
      >
        {/* Fixed inner area, logo scales to fit via object-contain */}
        <div className="relative w-full h-full">
          <Image
            src={p.logo}
            alt={p.name}
            fill
            className="object-contain"
            style={{ opacity: hovered ? 1 : 0.88, transition: "opacity 0.3s" }}
          />
        </div>
      </div>

      {/* Name + sub */}
      <div className="text-center">
        <p
          className="text-[14px] font-bold leading-snug transition-colors duration-300"
          style={{ color: hovered ? "#ffffff" : "rgba(255,255,255,0.8)" }}
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
      className="relative w-full py-24 overflow-hidden"
      style={{
        background: "#070503",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
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
          <div className="inline-flex items-center gap-3 mb-4">
            <span
              className="h-px block"
              style={{ width: 48, background: "rgba(12,131,70,0.5)" }}
            />
            <span
              className="text-[11px] font-semibold tracking-[0.25em] uppercase"
              style={{ color: "#0C8346" }}
            >
              Backed &amp; Supported By
            </span>
            <span
              className="h-px block"
              style={{ width: 48, background: "rgba(12,131,70,0.5)" }}
            />
          </div>
          <h2 className="text-2xl md:text-4xl font-bold font-[family-name:var(--font-unbounded)] text-white leading-tight">
            Validated by industry leaders
          </h2>
          <p className="mt-3 text-[14px]" style={{ color: "#4A4540" }}>
            Institutional backing that speaks to our credibility and mission.
          </p>
        </div>

        {/* Single unified panel */}
        <div
          className="rounded-3xl overflow-hidden flex flex-col lg:flex-row"
          style={{
            border: "1px solid rgba(255,255,255,0.09)",
            background: "rgba(255,255,255,0.025)",
            boxShadow: "0 0 80px rgba(12,131,70,0.05)",
          }}
        >
          {partners.map((p, i) => (
            <PartnerSlot key={i} p={p} last={i === partners.length - 1} />
          ))}
        </div>

        {/* Footer note */}
        <p
          className="text-center mt-7 text-[11px] tracking-wider"
          style={{ color: "#2A2820" }}
        >
          Incubated &middot; Certified &middot; Recognised by Govt. of India programs
        </p>
      </div>
    </section>
  )
}