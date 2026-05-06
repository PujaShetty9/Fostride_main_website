import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Case Studies | Fostride",
  description: "Real-world R3Bin deployments — measurable results from live pilots.",
}

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}