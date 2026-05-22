import { BackgroundPattern } from "@/components/landing/background-pattern"
import { Navbar } from "@/components/landing/navbar"
import { HomeLandingHero } from "@/components/landing/home-landing-hero"
import dynamic from "next/dynamic"

const SectionLoader = () => (
  <div className="w-full py-20 min-h-[30vh] flex flex-col items-center justify-center gap-4 text-[#0C8346]/40">
    <div className="w-8 h-8 border-[3px] border-[#0C8346]/20 border-t-[#0C8346] rounded-full animate-spin" />
  </div>
)

const ProblemSection = dynamic(
  () => import("@/components/landing/problem-section").then((m) => m.ProblemSection),
  { loading: () => <SectionLoader />, ssr: true }
)

const WhatFostrideDoes = dynamic(
  () => import("@/components/landing/what-fostride-does").then((m) => m.WhatFostrideDoes),
  { loading: () => <SectionLoader />, ssr: true }
)

const HowItWorks = dynamic(
  () => import("@/components/landing/how-it-works").then((m) => m.HowItWorks),
  { loading: () => <SectionLoader />, ssr: true }
)

const StatsStrip = dynamic(
  () => import("@/components/landing/stats-strip").then((m) => m.StatsStrip),
  { loading: () => <SectionLoader />, ssr: true }
)

const WhoItsFor = dynamic(
  () => import("@/components/landing/who-its-for").then((m) => m.WhoItsFor),
  { loading: () => <SectionLoader />, ssr: true }
)

const DataFlywheel = dynamic(
  () => import("@/components/landing/data-flywheel-client").then((m) => m.DataFlywheelClient),
  { loading: () => <SectionLoader />, ssr: true }
)

const PilotsTimeline = dynamic(
  () => import("@/components/landing/pilots-timeline").then((m) => m.PilotsTimeline),
  { loading: () => <SectionLoader />, ssr: true }
)

const Testimonials = dynamic(
  () => import("@/components/landing/testimonials").then((m) => m.Testimonials),
  { loading: () => <SectionLoader />, ssr: true }
)

const CredibilityStrip = dynamic(
  () => import("@/components/landing/credibility-strip").then((m) => m.CredibilityStrip),
  { loading: () => <SectionLoader />, ssr: true }
)

const Footer = dynamic(
  () => import("@/components/landing/footer").then((m) => m.Footer),
  { loading: () => <SectionLoader />, ssr: true }
)

export default function Home() {
  return (
    <main className="min-h-screen bg-[#070503] text-foreground relative">
      {/* Geometric Background Pattern */}
      <BackgroundPattern />

      {/* Dark overlay gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#070503]/90 via-[#070503]/60 to-[#070503]/90" />

      <div className="relative z-10">
        <Navbar />
        <div id="section-hero"><HomeLandingHero /></div>
        <div id="section-problem"><ProblemSection /></div>
        <div id="section-what"><WhatFostrideDoes /></div>
        <StatsStrip />
        <div id="section-how"><HowItWorks /></div>
        <div id="section-who"><WhoItsFor /></div>
        <div id="section-flywheel"><DataFlywheel /></div>
        <div id="section-pilots"><PilotsTimeline /></div>
        <Testimonials />
        <CredibilityStrip />
        <Footer />
      </div>
    </main>
  )
}