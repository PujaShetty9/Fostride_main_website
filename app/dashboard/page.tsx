"use client"

import { useState, useEffect, useMemo, useCallback, Suspense } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import {
  Loader2, MapPin, Wifi, WifiOff, Recycle, Package,
  FileText, Layers, TrendingUp, TrendingDown, BarChart2,
  AlertCircle, CheckCircle2, Clock, RefreshCw, LogOut,
  Activity, Tag, Cpu, GitBranch, AlertTriangle, Radio, Calendar, Hash
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"

// ── Types ──────────────────────────────────────────────────────────────────────
type BinRegistry = { bin_id: string; location: string; installed_at: string; access_code: string }
type BinOverview = {
  id: string; bin_id: string; is_online: boolean
  bin_address: string; bin_registered_name: string
  software_version: string; model_version: string
  error_status: boolean; error_logs: any[]
  last_seen_at: string; updated_at: string
}
type BinRecord = {
  bin_id: string; bin1_plastics: boolean; bin2_paper: boolean
  bin3_metal: boolean; bin4_mixed: boolean; updated_at: string
}
type WasteLog = {
  id: string; bin_id: string; waste_type: string
  weight: number; response: string; updated_at: string
}
type BinStats = {
  total: number; plastic: number; paper: number; metal: number
  mixed: number; recyclingRate: number; totalWeight: number
}

// ── Constants ──────────────────────────────────────────────────────────────────
const WASTE_COLORS: Record<string, string> = {
  plastic: "#34d399", paper: "#60a5fa", metal: "#a78bfa", mixed: "#f59e0b",
}
const WASTE_ICONS: Record<string, React.ElementType> = {
  plastic: Package, paper: FileText, metal: Layers, mixed: Recycle,
}

// ── Helper ─────────────────────────────────────────────────────────────────────
function parseLogDate(dateStr: string): Date | null {
  if (!dateStr) return null
  try {
    if (dateStr.includes("T") || dateStr.match(/^\d{4}-\d{2}-\d{2} /)) {
      const d = new Date(dateStr); return isNaN(d.getTime()) ? null : d
    }
    const parts = dateStr.split(/[_ ]/)
    const dp = parts[0].split("-")
    const tp = parts[1] ? parts[1].split("-") : ["0", "0", "0"]
    if (dp.length >= 3) {
      let y = parseInt(dp[0]); if (y < 100) y += 2000
      return new Date(y, parseInt(dp[1]) - 1, parseInt(dp[2]),
        parseInt(tp[0] || "0"), parseInt(tp[1] || "0"), parseInt(tp[2] || "0"))
    }
  } catch { return null }
  return null
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon: Icon, trend }: {
  label: string; value: string | number
  color: string; icon: React.ElementType; trend?: "up" | "down" | "neutral"
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#111111] border border-white/5 p-5 group hover:border-white/10 transition-all duration-300">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at 80% 20%, ${color}08 0%, transparent 60%)` }} />
      <div className="flex items-start justify-between mb-3">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        {trend && trend !== "neutral" && (
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${trend === "up" ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"}`}>
            {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{label}</p>
    </div>
  )
}

// ── Fill Bar ───────────────────────────────────────────────────────────────────
function FillBar({ label, filled, color }: { label: string; filled: boolean; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-500 w-16 shrink-0 capitalize">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: filled ? "100%" : "12%", background: filled ? color : "#ffffff10" }} />
      </div>
      <span className={`text-xs font-medium w-8 text-right ${filled ? "text-white" : "text-zinc-600"}`}>
        {filled ? "Full" : "—"}
      </span>
    </div>
  )
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-zinc-400 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-300 capitalize">{p.name}:</span>
          <span className="text-white font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Bin Overview Card ──────────────────────────────────────────────────────────
function BinOverviewCard({ overview }: { overview: BinOverview | null }) {
  if (!overview) return (
    <div className="rounded-2xl bg-[#111111] border border-white/5 p-6">
      <div className="flex items-center gap-2 text-zinc-500 text-sm">
        <AlertCircle className="h-4 w-4" />No overview data available for this bin
      </div>
    </div>
  )
  return (
    <div className="rounded-2xl bg-[#111111] border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#0C8346]" />Bin Overview
        </h3>
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${overview.is_online
          ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
          : "text-red-400 bg-red-400/10 border-red-400/20"}`}>
          <Radio className={`h-3 w-3 ${overview.is_online ? "animate-pulse" : ""}`} />
          {overview.is_online ? "Online" : "Offline"}
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { icon: Tag, label: "Registered Name", value: overview.bin_registered_name },
          { icon: MapPin, label: "Address", value: overview.bin_address },
          { icon: Cpu, label: "Software Version", value: overview.software_version },
          { icon: GitBranch, label: "Model Version", value: overview.model_version },
          { icon: Clock, label: "Last Seen", value: overview.last_seen_at ? formatDistanceToNow(new Date(overview.last_seen_at), { addSuffix: true }) : "—" },
          { icon: AlertTriangle, label: "Error Status", value: null, isError: true },
        ].map(({ icon: Icon, label, value, isError }: any) => (
          <div key={label} className="space-y-1.5">
            <p className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Icon className="h-3 w-3" />{label}
            </p>
            {isError ? (
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${overview.error_status
                ? "text-red-400 bg-red-400/10 border border-red-400/20"
                : "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"}`}>
                {overview.error_status ? "⚠ Error Detected" : "✓ No Errors"}
              </span>
            ) : (
              <p className="text-sm font-semibold text-white">{value || "—"}</p>
            )}
          </div>
        ))}
      </div>
      {overview.error_status && overview.error_logs?.length > 0 && (
        <div className="border-t border-white/5 pt-5 mt-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-red-400" />Error Logs
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {overview.error_logs.map((log: any, i: number) => (
              <div key={i} className="flex items-start gap-3 bg-red-400/5 border border-red-400/10 rounded-lg p-3">
                <span className="text-xs font-mono text-red-400 shrink-0">{log.code || "ERR"}</span>
                <span className="text-xs text-zinc-400 flex-1">{log.message || JSON.stringify(log)}</span>
                {log.timestamp && <span className="text-xs text-zinc-600 shrink-0">{new Date(log.timestamp).toLocaleString()}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── User Dashboard ─────────────────────────────────────────────────────────────
function UserDashboardContent() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [binRegistry, setBinRegistry] = useState<BinRegistry | null>(null)
  const [binOverview, setBinOverview] = useState<BinOverview | null>(null)
  const [binRecord, setBinRecord] = useState<BinRecord | null>(null)
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([])
  const [binStats, setBinStats] = useState<BinStats | null>(null)
  const [trendData, setTrendData] = useState<any[]>([])

  // ── Auth + init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data: profile } = await supabase.from("profiles")
        .select("full_name, role").eq("id", user.id).single()
      if (!profile) { router.push("/login"); return }
      if (profile.role === "admin") { router.push("/admin/dashboard"); return }

      setUserName(profile.full_name || user.user_metadata?.full_name || "")

      // Get user's linked bin
      const { data: access } = await supabase.from("bin_access")
        .select("bin_id").eq("user_id", user.id).maybeSingle()

      if (!access?.bin_id) { setLoading(false); return }

      // Fetch registry + overview in parallel
      const [registryRes, overviewRes] = await Promise.all([
        supabase.from("r3bin_registry").select("*").eq("bin_id", access.bin_id).maybeSingle(),
        supabase.from("bin_overview").select("*").eq("bin_id", access.bin_id).maybeSingle(),
      ])

      if (registryRes.data) setBinRegistry(registryRes.data)
      if (overviewRes.data) setBinOverview(overviewRes.data)

      setLoading(false)
    }
    init()
  }, [])

  // ── Fetch analytics ──────────────────────────────────────────────────────────
  const fetchBinData = useCallback(async () => {
    if (!binRegistry) return
    setRefreshing(true)
    const [recordRes, logsRes] = await Promise.all([
      supabase.from("r3bin_records").select("*").eq("bin_id", binRegistry.bin_id).maybeSingle(),
      supabase.from("r3bin_waste_logs").select("*").eq("bin_id", binRegistry.bin_id)
        .order("updated_at", { ascending: false }).limit(5000),
    ])
    setBinRecord(recordRes.data)
    const logs: WasteLog[] = logsRes.data || []
    setWasteLogs(logs)
    const stats: BinStats = { total: logs.length, plastic: 0, paper: 0, metal: 0, mixed: 0, recyclingRate: 0, totalWeight: 0 }
    logs.forEach(l => {
      const t = l.waste_type?.toLowerCase() || "mixed"
      stats.totalWeight += Number(l.weight) || 0
      if (t.includes("plastic")) stats.plastic++
      else if (t.includes("paper")) stats.paper++
      else if (t.includes("metal")) stats.metal++
      else stats.mixed++
    })
    stats.recyclingRate = stats.total > 0
      ? Math.round(((stats.plastic + stats.paper + stats.metal) / stats.total) * 100) : 0
    setBinStats(stats)
    const daily: Record<string, any> = {}
    logs.forEach(l => {
      const d = parseLogDate(l.updated_at); if (!d) return
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      if (!daily[key]) daily[key] = { date: key, plastic: 0, paper: 0, metal: 0, mixed: 0 }
      const t = l.waste_type?.toLowerCase() || "mixed"
      if (t.includes("plastic")) daily[key].plastic++
      else if (t.includes("paper")) daily[key].paper++
      else if (t.includes("metal")) daily[key].metal++
      else daily[key].mixed++
    })
    setTrendData(Object.values(daily).sort((a, b) => a.date.localeCompare(b.date)).slice(-14))
    setRefreshing(false)
  }, [binRegistry, supabase])

  useEffect(() => { fetchBinData() }, [fetchBinData])

  const pieData = binStats ? [
    { name: "Plastic", value: binStats.plastic, color: WASTE_COLORS.plastic },
    { name: "Paper", value: binStats.paper, color: WASTE_COLORS.paper },
    { name: "Metal", value: binStats.metal, color: WASTE_COLORS.metal },
    { name: "Mixed", value: binStats.mixed, color: WASTE_COLORS.mixed },
  ].filter(d => d.value > 0) : []

  const lastActivity = useMemo(() => {
    if (!wasteLogs.length) return "No data"
    const d = parseLogDate(wasteLogs[0].updated_at)
    if (!d || isNaN(d.getTime())) return "Unknown"
    return formatDistanceToNow(d, { addSuffix: true })
  }, [wasteLogs])

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Recycle className="h-8 w-8 text-[#0C8346] animate-spin" />
        <p className="text-sm text-zinc-500">Loading your dashboard...</p>
      </div>
    </div>
  )

  if (!binRegistry) {
    router.push("/onboarding")
    return null
  }

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
          <div className="flex items-center gap-2 text-xs text-zinc-500 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5">
            <Recycle className="h-3.5 w-3.5 text-[#0C8346]" />
            {binRegistry.bin_id}
          </div>
          <button onClick={fetchBinData}
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />Refresh
          </button>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/login") }}
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-400/30 rounded-lg px-3 py-1.5 transition-all">
            <LogOut className="h-3.5 w-3.5" />Sign Out
          </button>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-6xl mx-auto">

        {/* Bin Info Banner */}
        <div className="rounded-2xl bg-[#0C8346]/5 border border-[#0C8346]/20 p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0C8346] flex items-center justify-center">
              <Recycle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{binRegistry.bin_id}</p>
              <p className="text-xs text-zinc-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" />{binRegistry.location}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 ml-auto text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#0C8346]" />
              Installed {new Date(binRegistry.installed_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-[#0C8346]" />
              {binRegistry.access_code}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#0C8346]" />
              Last active {lastActivity}
            </span>
            <span className={`flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-full border ${wasteLogs.length > 0
              ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
              : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"}`}>
              {wasteLogs.length > 0
                ? <><CheckCircle2 className="h-3 w-3" />Active</>
                : <><WifiOff className="h-3 w-3" />No Data</>}
            </span>
          </div>
        </div>

        {/* Bin Overview */}
        <BinOverviewCard overview={binOverview} />

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Logs" value={binStats?.total ?? 0} color="#0C8346" icon={BarChart2} trend="up" />
          <StatCard label="Recycling Rate" value={`${binStats?.recyclingRate ?? 0}%`} color="#34d399" icon={Recycle} trend="up" />
          <StatCard label="Total Weight" value={`${((binStats?.totalWeight ?? 0) / 1000).toFixed(2)} kg`} color="#60a5fa" icon={Layers} trend="neutral" />
          <StatCard label="Waste Types" value={pieData.length} color="#a78bfa" icon={Package} />
        </div>

        {/* Fill + Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-[#111111] border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Wifi className="h-4 w-4 text-[#0C8346]" />Current Fill Status
            </h3>
            {binRecord ? (
              <div className="space-y-3">
                <FillBar label="Plastics" filled={binRecord.bin1_plastics} color={WASTE_COLORS.plastic} />
                <FillBar label="Paper" filled={binRecord.bin2_paper} color={WASTE_COLORS.paper} />
                <FillBar label="Metal" filled={binRecord.bin3_metal} color={WASTE_COLORS.metal} />
                <FillBar label="Mixed" filled={binRecord.bin4_mixed} color={WASTE_COLORS.mixed} />
                <p className="text-xs text-zinc-600 pt-1 border-t border-white/5 mt-2">
                  Updated {binRecord.updated_at}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <AlertCircle className="h-4 w-4" />No fill data available
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-[#111111] border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Recycle className="h-4 w-4 text-[#0C8346]" />Waste Composition
            </h3>
            {pieData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                      paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 flex-1">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-xs text-zinc-400">{d.name}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden mx-2">
                        <div className="h-full rounded-full" style={{
                          width: `${binStats ? Math.round((d.value / binStats.total) * 100) : 0}%`,
                          background: d.color
                        }} />
                      </div>
                      <span className="text-xs font-semibold text-white">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <AlertCircle className="h-4 w-4" />No composition data
              </div>
            )}
          </div>
        </div>

        {/* Trend Chart */}
        {trendData.length > 0 && (
          <div className="rounded-2xl bg-[#111111] border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#0C8346]" />Collection Trends (Last 14 Days)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {Object.entries(WASTE_COLORS).map(([key, color]) => (
                    <linearGradient key={key} id={`ugrad-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#52525b" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#52525b" }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                {Object.entries(WASTE_COLORS).map(([key, color]) => (
                  <Area key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2}
                    fill={`url(#ugrad-${key})`} dot={false} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Logs */}
        <div className="rounded-2xl bg-[#111111] border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#0C8346]" />Recent Activity
            </h3>
            <span className="text-xs text-zinc-500 bg-white/5 px-2.5 py-1 rounded-full">
              {wasteLogs.length} total logs
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Waste Type", "Weight", "Recycled", "Logged At"].map(h => (
                    <th key={h} className="text-left text-xs text-zinc-500 font-medium px-5 py-3 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {wasteLogs.slice(0, 10).map((log, i) => {
                  const type = log.waste_type?.toLowerCase() || "mixed"
                  const color = Object.entries(WASTE_COLORS).find(([k]) => type.includes(k))?.[1] || WASTE_COLORS.mixed
                  const Icon = Object.entries(WASTE_ICONS).find(([k]) => type.includes(k))?.[1] || Recycle
                  const d = parseLogDate(log.updated_at)
                  return (
                    <tr key={log.id || i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                            <Icon className="h-3 w-3" style={{ color }} />
                          </span>
                          <span className="text-white capitalize">{log.waste_type}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3 text-zinc-400">{log.weight} kg</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${log.response?.toLowerCase() === "yes"
                          ? "text-emerald-400 bg-emerald-400/10"
                          : "text-zinc-500 bg-zinc-500/10"}`}>
                          {log.response?.toLowerCase() === "yes" ? "✓ Recycled" : "✗ Not Recycled"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-zinc-500 text-xs">
                        {d && !isNaN(d.getTime()) ? d.toLocaleString() : log.updated_at}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {wasteLogs.length === 0 && (
              <div className="text-center py-8 text-zinc-500 text-sm">No activity yet for this bin.</div>
            )}
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