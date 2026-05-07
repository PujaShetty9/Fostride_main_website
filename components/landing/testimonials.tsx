"use client"

import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Amrit Om Nayak",
    role: "Founder, Indra Waters",
    initials: "AN",
    color: "#0C8346",
    content:
      "Fostride's real strength goes well beyond hardware and lies in the intelligence layer it is building around waste. The smart bin is the hook that can shape behaviour and improve segregation. The deeper long-term value is in the data, analytics, and operating intelligence that can help cities, campuses, waste companies, machine manufacturers, and project sites understand waste composition, asset performance, and user behaviour far more clearly. That layer has the potential to become the real engine for better decisions, smarter operations, and more accountable waste management systems.",
  },
  {
    name: "Gaurang Shetty",
    role: "CEO, RIIDL",
    initials: "GS",
    color: "#0C8346",
    content:
      "Watching Fostride grow from an inspired idea into a purpose-driven organization has been nothing short of remarkable. The team's dedication to reducing waste and transforming communities is truly inspiring.",
  },
  {
    name: "Priya Mehta",
    role: "Sustainability Director, GreenLoop",
    initials: "PM",
    color: "#16a34a",
    content:
      "Fostride's AI-powered sorting platform gave us real-time visibility we never had before. Our recycling efficiency jumped 40% within the first quarter of deployment.",
  },
  {
    name: "Michael Johnson",
    role: "CEO, Brightsun",
    initials: "MJ",
    color: "#0C8346",
    content:
      "Fostride has been instrumental in transforming our sustainability goals. Their expertise across waste processing channels, coupled with their data-driven approach, significantly boosted our efficiency.",
  },
  {
    name: "Sarah Williams",
    role: "Director, EcoTech Solutions",
    initials: "SW",
    color: "#15803d",
    content:
      "The level of insight provided by Fostride's analytics platform is unmatched. We can now track waste generation in real-time and make informed decisions that save costs and protect the environment.",
  },
  {
    name: "Arjun Kapoor",
    role: "Head of Operations, CircleWaste",
    initials: "AK",
    color: "#0C8346",
    content:
      "Integrating Fostride's W.I.S.E. system into our facility was seamless. The accuracy of the AI sorting blew us away — 99%+ precision on mixed waste streams.",
  },
  {
    name: "Lena Braun",
    role: "VP Sustainability, NovaPack",
    initials: "LB",
    color: "#16a34a",
    content:
      "We've tried several waste management solutions, but Fostride stands apart. Their technology is genuinely next-generation and the team is incredibly responsive and knowledgeable.",
  },
  {
    name: "Kriti Gupta",
    role: "Partner Relationship Manager, Nasscom",
    initials: "KG",
    color: "#16a34a",
    content:
      "Fostride brings clarity and intelligence to waste management. Its W.I.S.E. powered system enables accurate segregation and real time data, making sustainability measurable and actionable for organisations.",
  },
  {
    name: "Rimjhim Charan",
    role: "Founder, 100krafts",
    initials: "RC",
    color: "#0C8346",
    content:
      "I'm thrilled to share my experience working with Gavi Kothari, the founder of Fostride. His innovative product is a game-changer in the sustainability space, and I'm impressed by his visionary approach to reducing carbon footprint. What's truly remarkable is his perseverance and grit in managing Fostride at such a young age — it's a testament to the fact that age is just a number. Gavi has surpassed many entrepreneurs with his achievements, and his product has the potential to revolutionize the way we think about sustainability. He is a real package for a long run, and I have no doubt he'll continue to make a significant impact in the industry.",
  },
]

// Duplicate for seamless infinite loop
const row1 = [...testimonials, ...testimonials]
const row2 = [...testimonials.slice(3), ...testimonials.slice(0, 3), ...testimonials.slice(3), ...testimonials.slice(0, 3)]

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div
      className="flex-shrink-0 w-[340px] md:w-[380px] rounded-[24px] p-6 flex flex-col gap-4 mx-3"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Stars */}
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={13} className="fill-[#0C8346] text-[#0C8346]" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-[13.5px] leading-relaxed font-light text-gray-300 flex-1">
        &ldquo;{t.content}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-3 border-t border-white/5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
          style={{ background: `${t.color}30`, border: `1px solid ${t.color}50` }}
        >
          {t.initials}
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-none mb-0.5">{t.name}</p>
          <p className="text-gray-500 text-[11px] uppercase tracking-wider">{t.role}</p>
        </div>
      </div>
    </div>
  )
}

export function Testimonials() {
  return (
    <section className="relative w-full py-24 overflow-hidden">
      {/* Edge fades */}
      <div className="absolute top-0 left-0 w-28 h-full bg-gradient-to-r from-[#070503] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-28 h-full bg-gradient-to-l from-[#070503] to-transparent z-10 pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-14 px-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0C8346]/25 bg-[#0C8346]/8 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0C8346]" style={{ animation: "dotBlink 1.6s ease-in-out infinite" }} />
          <span className="text-[#0C8346] text-[11px] font-semibold tracking-widest uppercase">What People Say</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-bold font-[family-name:var(--font-unbounded)] text-white tracking-tight leading-tight">
          Trusted by<br />
            <span
              style={{
                background: "linear-gradient(135deg, #0C8346 0%, #22c55e 50%, #0C8346 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradientShift 3s ease-in-out infinite",
              }}
            >
              pioneers.
            </span>
        </h2>
      </div>

      {/* Row 1 — scroll left */}
      <div className="flex overflow-hidden mb-4 group">
        <div
          className="flex items-stretch group-hover:[animation-play-state:paused]"
          style={{ animation: "marqueeLeft 35s linear infinite" }}
        >
          {row1.map((t, i) => (
            <TestimonialCard key={`r1a-${i}`} t={t} />
          ))}
        </div>
        <div
          className="flex items-stretch group-hover:[animation-play-state:paused]"
          style={{ animation: "marqueeLeft 35s linear infinite" }}
          aria-hidden
        >
          {row1.map((t, i) => (
            <TestimonialCard key={`r1b-${i}`} t={t} />
          ))}
        </div>
      </div>

      {/* Row 2 — scroll right */}
      <div className="flex overflow-hidden group">
        <div
          className="flex items-stretch group-hover:[animation-play-state:paused]"
          style={{ animation: "marqueeRight 40s linear infinite" }}
        >
          {row2.map((t, i) => (
            <TestimonialCard key={`r2a-${i}`} t={t} />
          ))}
        </div>
        <div
          className="flex items-stretch group-hover:[animation-play-state:paused]"
          style={{ animation: "marqueeRight 40s linear infinite" }}
          aria-hidden
        >
          {row2.map((t, i) => (
            <TestimonialCard key={`r2b-${i}`} t={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
