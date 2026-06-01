"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import {
  Loader2, Recycle, RefreshCw, LogOut, AlertCircle
} from "lucide-react"

// ── User Dashboard ─────────────────────────────────────────────────────────────
function UserDashboardContent() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("")
  const [companyName, setCompanyName] = useState("")

  // ── Auth + init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, company_name")
        .eq("id", user.id)
        .maybeSingle()

      if (!profile) {
        setLoading(false)
        return
      }
      if (profile.role === "admin") { router.push("/admin/dashboard"); return }

      setUserName(profile.full_name || user.user_metadata?.full_name || "")
      setCompanyName(profile.company_name || "")
      setLoading(false)
    }
    init()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Recycle className="h-8 w-8 text-[#0C8346] animate-spin" />
        <p className="text-sm text-zinc-500">Loading your dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-[#050505]/95 backdrop-blur px-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#0C8346] flex items-center justify-center">
            <Recycle className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">My Dashboard</h1>
            <p className="text-xs text-zinc-500">Welcome back, {userName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push("/login") }}
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-400/30 rounded-lg px-3 py-1.5 transition-all">
            <LogOut className="h-3.5 w-3.5" />Sign Out
          </button>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-6xl mx-auto">

        {/* Welcome Card */}
        <div className="rounded-2xl bg-[#0C8346]/5 border border-[#0C8346]/20 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#0C8346] flex items-center justify-center shrink-0">
              <Recycle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Welcome, {userName}!</h2>
              {companyName && (
                <p className="text-sm text-zinc-400 mt-0.5">{companyName}</p>
              )}
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="rounded-2xl bg-[#111111] border border-white/5 p-8 flex flex-col items-center justify-center text-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-zinc-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white mb-1">Bin Not Linked Yet</h3>
            <p className="text-sm text-zinc-500 max-w-sm">
              Your account is set up but no bin has been assigned yet.
              Once your R3Bin device is linked, your waste analytics will appear here.
            </p>
          </div>
        </div>

      </main>
    </div>
  )
}

export default function UserDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0C8346]" />
      </div>
    }>
      <UserDashboardContent />
    </Suspense>
  )
}