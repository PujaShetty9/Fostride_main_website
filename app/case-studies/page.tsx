"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"


const cases = [
  {
    id: "01",
    href: "/case-studies/somaiya",
    client: "Somaiya Vidyavihar University",
    location: "Engineering Building, Mumbai",
    period: "Jan 20–30, 2026",
    duration: "10-Day Pilot",
    stats: ["664 items classified", "21 kg CO₂ offset", "94.2% recycling rate"],
    tag: "Education",
    tagColor: "#1A6B3C",
  },
  {
    id: "02",
    href: "/case-studies/brookfield",
    client: "Brookfield Properties",
    location: "Wenchester & Kingsinton Building",
    period: "Nov 11–14, 2025",
    duration: "4-Day Pilot",
    stats: ["100 items classified", "4× daily adoption growth", "GRI / LEED ready"],
    tag: "Commercial Real Estate",
    tagColor: "#8B6432",
  },
]

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-foreground">
      <Navbar />

      <main className="pt-[70px]">

        {/* Hero */}
        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(12,131,70,0.07) 0%, transparent 70%)" }} />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0C8346]/25 bg-[#0C8346]/8 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0C8346]" />
              <span className="text-[#0C8346] text-[11px] font-semibold tracking-widest uppercase">Live Deployments</span>
            </div>

            <h1 className="font-extrabold leading-tight tracking-tight font-[family-name:var(--font-unbounded)] mb-4"
              style={{ fontSize: "clamp(36px,6vw,68px)", color: "#EDE8E0" }}>
              Case Studies
            </h1>
            <p className="text-[16px] font-light leading-relaxed max-w-xl mx-auto" style={{ color: "#6B6358" }}>
              Real pilots. Real data. Measurable outcomes from every R3Bin deployment.
            </p>
          </div>
        </section>

        {/* Cards */}
        <section className="pb-32 px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            {cases.map((c) => (
              <Link key={c.id} href={c.href} className="group block">
                <div
                  className="relative rounded-3xl p-8 h-full flex flex-col gap-6 transition-all duration-300 group-hover:scale-[1.02]"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 0 0 0 rgba(26,107,60,0)",
                    transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(26,107,60,0.3)"
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(26,107,60,0.1)"
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)"
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 0 rgba(26,107,60,0)"
                  }}
                >
                  {/* Case number + tag */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                      style={{ background: `${c.tagColor}18`, color: c.tagColor, border: `1px solid ${c.tagColor}40` }}>
                      Case Study · {c.id}
                    </span>
                    <span className="text-[11px] tracking-wider uppercase" style={{ color: "#3A3830" }}>{c.tag}</span>
                  </div>

                  {/* Client name */}
                  <div>
                    <h2 className="font-bold text-white leading-snug mb-2 font-[family-name:var(--font-unbounded)]"
                      style={{ fontSize: "clamp(18px,2.5vw,26px)" }}>
                      {c.client}
                    </h2>
                    <p className="text-[13px]" style={{ color: "#4A4540" }}>
                      {c.location}
                    </p>
                  </div>

                  {/* Stats */}
                  <ul className="flex flex-col gap-2.5">
                    {c.stats.map((s) => (
                      <li key={s} className="flex items-center gap-2.5 text-[13px]" style={{ color: "#6B6358" }}>
                        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#1A6B3C" }} />
                        {s}
                      </li>
                    ))}
                  </ul>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-5"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                      <p className="text-[11px] uppercase tracking-widest mb-0.5" style={{ color: "#3A3830" }}>Period</p>
                      <p className="text-[13px] font-medium text-white">{c.period}</p>
                      <p className="text-[11px]" style={{ color: "#4A4540" }}>{c.duration}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
                      style={{ background: "rgba(26,107,60,0.15)", border: "1px solid rgba(26,107,60,0.3)" }}>
                      <ArrowRight size={16} color="#1A6B3C" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}