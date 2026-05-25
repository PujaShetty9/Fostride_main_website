"use client"
import { useState, useEffect, useMemo, useCallback, Suspense } from "react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import {
  Loader2, MapPin, Calendar, Hash, Wifi, WifiOff,
  Recycle, Package, FileText, Layers,
  TrendingUp, TrendingDown, BarChart2, AlertCircle,
  CheckCircle2, Clock, RefreshCw, LogOut, Download,
  ShieldCheck, Building2, Tag, Activity,
  Cpu, GitBranch, AlertTriangle, Radio, ChevronDown, ChevronRight
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer
} from "recharts"
import { Badge } from "@/components/ui/badge"

// ── Types ──────────────────────────────────────────────────────────────────────
type BinRegistry = { bin_id: string; location: string; installed_at: string; access_code: string }
type BinOverview = {
  id: string; bin_id: string; is_online: boolean
  bin_address: string; bin_registered_name: string
  software_version: string; model_version: string
  error_status: boolean; error_logs: any[]
  last_seen_at: string; updated_at: string
}
type BinRecord = { bin_id: string; bin1_plastics: boolean; bin2_paper: boolean; bin3_metal: boolean; bin4_mixed: boolean; updated_at: string }
type WasteLog = { id: string; bin_id: string; waste_type: string; weight: number; response: string; updated_at: string }
type BinStats = { total: number; plastic: number; paper: number; metal: number; mixed: number; recyclingRate: number; totalWeight: number }
type FilterType = "bin_id" | "registered_name" | "address"

// ── Constants ──────────────────────────────────────────────────────────────────
const WASTE_COLORS: Record<string, string> = {
  plastic: "#34d399", paper: "#60a5fa", metal: "#a78bfa", mixed: "#f59e0b",
}
const WASTE_ICONS: Record<string, React.ElementType> = {
  plastic: Package, paper: FileText, metal: Layers, mixed: Recycle,
}
const FILTER_OPTIONS = [
  { key: "bin_id" as FilterType, label: "Filter by Bin ID", icon: Hash },
  { key: "registered_name" as FilterType, label: "Filter by Registered Name", icon: Building2 },
  { key: "address" as FilterType, label: "Filter by Address", icon: MapPin },
]

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

// ── Reusable Dropdown ──────────────────────────────────────────────────────────
function Dropdown({ label, value, open, onToggle, onClose, children }: {
  label: string; value: string; open: boolean
  onToggle: () => void; onClose: () => void; children: React.ReactNode
}) {
  return (
    <div className="relative">
      <button onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 bg-card border border-border hover:border-primary/40 rounded-xl px-4 py-3 transition-all duration-200 text-left">
        <span className="text-sm font-medium text-foreground truncate">{value || label}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto">
            {children}
          </div>
        </>
      )}
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon: Icon, trend }: {
  label: string; value: string | number; color: string
  icon: React.ElementType; trend?: "up" | "down" | "neutral"
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-5 group hover:border-border/80 transition-all duration-300">
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
      <p className="text-2xl font-bold text-foreground mb-0.5">{value}</p>
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
    </div>
  )
}

// ── Fill Bar ───────────────────────────────────────────────────────────────────
function FillBar({ label, filled, color }: { label: string; filled: boolean; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-16 shrink-0 capitalize">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: filled ? "100%" : "8%", background: filled ? color : "rgba(255,255,255,0.06)" }} />
      </div>
      <span className={`text-xs font-semibold w-10 text-right ${filled ? "text-foreground" : "text-muted-foreground"}`}>
        {filled ? "Full" : "Empty"}
      </span>
    </div>
  )
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 shadow-xl">
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
    <div className="rounded-2xl bg-card border border-border p-6">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <AlertCircle className="h-4 w-4" />No overview data available for this bin
      </div>
    </div>
  )
  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />Bin Overview
        </h3>
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${overview.is_online
          ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
          : "text-red-400 bg-red-400/10 border-red-400/20"}`}>
          <Radio className={`h-3 w-3 ${overview.is_online ? "animate-pulse" : ""}`} />
          {overview.is_online ? "Online" : "Offline"}
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Tag className="h-3 w-3" />Registered Name</p>
          <p className="text-sm font-semibold text-foreground">{overview.bin_registered_name || "—"}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><MapPin className="h-3 w-3" />Address</p>
          <p className="text-sm font-semibold text-foreground">{overview.bin_address || "—"}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Cpu className="h-3 w-3" />Software Version</p>
          <p className="text-sm font-semibold text-foreground">{overview.software_version || "—"}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><GitBranch className="h-3 w-3" />Model Version</p>
          <p className="text-sm font-semibold text-foreground">{overview.model_version || "—"}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Clock className="h-3 w-3" />Last Seen</p>
          <p className="text-sm font-semibold text-foreground">
            {overview.last_seen_at ? formatDistanceToNow(new Date(overview.last_seen_at), { addSuffix: true }) : "—"}
          </p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle className="h-3 w-3" />Error Status</p>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${overview.error_status
            ? "text-red-400 bg-red-400/10 border border-red-400/20"
            : "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"}`}>
            {overview.error_status ? "⚠ Error Detected" : "✓ No Errors"}
          </span>
        </div>
      </div>
      {overview.error_status && overview.error_logs?.length > 0 && (
        <div className="border-t border-border pt-5 mt-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-red-400" />Error Logs
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {overview.error_logs.map((log: any, i: number) => (
              <div key={i} className="flex items-start gap-3 bg-red-400/5 border border-red-400/10 rounded-lg p-3">
                <span className="text-xs font-mono text-red-400 shrink-0">{log.code || "ERR"}</span>
                <span className="text-xs text-muted-foreground flex-1">{log.message || JSON.stringify(log)}</span>
                {log.timestamp && <span className="text-xs text-muted-foreground shrink-0">{new Date(log.timestamp).toLocaleString()}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Admin Dashboard ───────────────────────────────────────────────────────
function AdminDashboardContent() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [adminName, setAdminName] = useState("Admin")
  const [allBins, setAllBins] = useState<BinRegistry[]>([])
  const [allOverviews, setAllOverviews] = useState<BinOverview[]>([])
  const [selectedBin, setSelectedBin] = useState<BinRegistry | null>(null)
  const [binOverview, setBinOverview] = useState<BinOverview | null>(null)

  // Filter state
  const [filterType, setFilterType] = useState<FilterType>("bin_id")
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
  const [secondDropdownOpen, setSecondDropdownOpen] = useState(false)

  // For registered_name / address flow
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  // Analytics
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
        .select("role, full_name").eq("id", user.id).single()
      if (!profile || profile.role !== "admin") { router.push("/dashboard"); return }
      setAdminName(profile.full_name || "Admin")

      const [binRes, overviewRes] = await Promise.all([
        supabase.from("r3bin_registry").select("*").order("bin_id"),
        supabase.from("bin_overview").select("*"),
      ])

      if (overviewRes.data) setAllOverviews(overviewRes.data)
      if (binRes.data) {
        setAllBins(binRes.data)
        const def = binRes.data.find((b: BinRegistry) => b.bin_id === "Bin_001") || binRes.data[0]
        if (overviewRes.data && def) {
          const ov = overviewRes.data.find((o: BinOverview) => o.bin_id === def.bin_id) || null
          setBinOverview(ov)
        }
        setSelectedBin(def)
      }
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!selectedBin) return
    setBinOverview(allOverviews.find(o => o.bin_id === selectedBin.bin_id) || null)
  }, [selectedBin, allOverviews])

  // ── Unique groups for registered name / address ──────────────────────────────
  const uniqueGroups = useMemo(() => {
    if (filterType === "bin_id") return []
    const seen = new Set<string>()
    allOverviews.forEach(o => {
      const key = filterType === "registered_name" ? o.bin_registered_name : o.bin_address
      if (key) seen.add(key)
    })
    return Array.from(seen).sort()
  }, [allOverviews, filterType])

  // ── Bins under selected group ────────────────────────────────────────────────
  const binsInGroup = useMemo(() => {
    if (!selectedGroup || filterType === "bin_id") return []
    const matchingIds = allOverviews
      .filter(o => (filterType === "registered_name" ? o.bin_registered_name : o.bin_address) === selectedGroup)
      .map(o => o.bin_id)
    return allBins.filter(b => matchingIds.includes(b.bin_id))
  }, [selectedGroup, allOverviews, allBins, filterType])

  // ── Fetch analytics ──────────────────────────────────────────────────────────
  const fetchBinData = useCallback(async () => {
    if (!selectedBin) return
    setRefreshing(true)
    const [recordRes, logsRes] = await Promise.all([
      supabase.from("r3bin_records").select("*").eq("bin_id", selectedBin.bin_id).maybeSingle(),
      supabase.from("r3bin_waste_logs").select("*").eq("bin_id", selectedBin.bin_id)
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
    setTrendData(Object.values(daily).sort((a, b) => a.date.localeCompare(b.date)).slice(-30))
    setRefreshing(false)
  }, [selectedBin, supabase])

  useEffect(() => { fetchBinData() }, [fetchBinData])

  // ── Export ───────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!selectedBin || !binStats) return
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const green = "#1b7f4b"
    doc.setFont("helvetica", "bold"); doc.setTextColor(green); doc.setFontSize(22)
    doc.text("Fostride", 14, 25)
    doc.setFontSize(16); doc.text(`Bin Report — ${selectedBin.bin_id}`, pageWidth - 14, 25, { align: "right" })
    doc.setFontSize(10); doc.setTextColor(100)
    doc.text(selectedBin.location, pageWidth - 14, 32, { align: "right" })
    doc.setDrawColor(green); doc.setLineWidth(1); doc.line(14, 38, pageWidth - 14, 38)
    let y = 55
    doc.setFontSize(13); doc.setTextColor(green); doc.text("Bin Details", 14, y); y += 10
    doc.setFontSize(10); doc.setTextColor(50)
    doc.text(`Bin ID: ${selectedBin.bin_id}`, 14, y); y += 7
    doc.text(`Location: ${selectedBin.location}`, 14, y); y += 7
    if (binOverview) {
      doc.text(`Registered Name: ${binOverview.bin_registered_name || "—"}`, 14, y); y += 7
      doc.text(`Address: ${binOverview.bin_address || "—"}`, 14, y); y += 7
      doc.text(`Software: ${binOverview.software_version || "—"} | Model: ${binOverview.model_version || "—"}`, 14, y); y += 7
      doc.text(`Status: ${binOverview.is_online ? "Online" : "Offline"}`, 14, y); y += 7
    }
    y += 8
    doc.setFontSize(13); doc.setTextColor(green); doc.text("Statistics", 14, y); y += 10
    doc.setFontSize(10); doc.setTextColor(50)
    doc.text(`Total Logs: ${binStats.total}`, 14, y); y += 7
    doc.text(`Recycling Rate: ${binStats.recyclingRate}%`, 14, y); y += 7
    doc.text(`Total Weight: ${(binStats.totalWeight / 1000).toFixed(2)} kg`, 14, y); y += 7
    doc.text(`Plastic: ${binStats.plastic} | Paper: ${binStats.paper} | Metal: ${binStats.metal} | Mixed: ${binStats.mixed}`, 14, y); y += 15
    doc.setFontSize(13); doc.setTextColor(green); doc.text("Recent Waste Logs", 14, y); y += 5
    autoTable(doc, {
      startY: y,
      head: [["Waste Type", "Weight (kg)", "Recycled", "Logged At"]],
      body: wasteLogs.slice(0, 50).map(l => [l.waste_type, l.weight, l.response, l.updated_at]),
      theme: "grid", styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: green, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [246, 246, 246] },
    })
    const finalY = (doc as any).lastAutoTable.finalY + 20
    doc.setFontSize(9); doc.setTextColor(150)
    doc.text("Generated by Fostride R3Bin • AI-Powered Waste Segregation", pageWidth / 2, finalY, { align: "center" })
    doc.save(`${selectedBin.bin_id}-report-${new Date().toISOString().split("T")[0]}.pdf`)
  }

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

  const currentFilterLabel = FILTER_OPTIONS.find(f => f.key === filterType)?.label || "Filter by Bin ID"

  // Second dropdown value label
  const secondDropdownValue = filterType === "bin_id"
    ? (selectedBin ? `${selectedBin.bin_id} — ${binOverview?.bin_registered_name || selectedBin.location}` : "")
    : (selectedGroup || "")

  const secondDropdownLabel = filterType === "bin_id"
    ? "Select Bin ID"
    : filterType === "registered_name"
    ? "Select Registered Name"
    : "Select Address"

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Recycle className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading admin panel...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">

          {/* ── Page Header ── */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">Live Dashboard</Badge>
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />Admin
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground">R3Bin Analytics</h1>
              <p className="text-muted-foreground mt-1">Welcome back, {adminName}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchBinData}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-border/60 rounded-lg px-3 py-2 transition-all">
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />Refresh
              </button>
              <button onClick={handleExport}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-border/60 rounded-lg px-3 py-2 transition-all">
                <Download className="h-3.5 w-3.5" />Export PDF
              </button>
              <button onClick={async () => { await supabase.auth.signOut(); router.push("/login") }}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-red-400 border border-border hover:border-red-400/30 rounded-lg px-3 py-2 transition-all">
                <LogOut className="h-3.5 w-3.5" />Sign Out
              </button>
            </div>
          </div>

          {/* ── Bin Selector ── */}
          <div className="rounded-2xl bg-card border border-border p-6 mb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4">Select Bin</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Dropdown 1 — Filter Type */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Filter Type</p>
                <Dropdown
                  label="Select filter type"
                  value={currentFilterLabel}
                  open={filterDropdownOpen}
                  onToggle={() => { setFilterDropdownOpen(!filterDropdownOpen); setSecondDropdownOpen(false) }}
                  onClose={() => setFilterDropdownOpen(false)}
                >
                  {FILTER_OPTIONS.map(({ key, label, icon: Icon }) => (
                    <button key={key}
                      onClick={() => {
                        setFilterType(key)
                        setFilterDropdownOpen(false)
                        setSecondDropdownOpen(false)
                        setSelectedGroup(null)
                        // For bin_id, keep current selectedBin; for others reset
                        if (key !== "bin_id") setSelectedBin(null)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left border-b border-border/50 last:border-0 ${filterType === key ? "bg-primary/5 border-l-4 border-l-primary" : ""}`}>
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${filterType === key ? "bg-primary" : "bg-secondary"}`}>
                        <Icon className={`h-3.5 w-3.5 ${filterType === key ? "text-white" : "text-muted-foreground"}`} />
                      </div>
                      <span className={`text-sm font-medium ${filterType === key ? "text-primary" : "text-foreground"}`}>{label}</span>
                      {filterType === key && <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />}
                    </button>
                  ))}
                </Dropdown>
              </div>

              {/* Dropdown 2 — Bin ID / Group Name */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">{secondDropdownLabel}</p>
                <Dropdown
                  label={secondDropdownLabel}
                  value={secondDropdownValue}
                  open={secondDropdownOpen}
                  onToggle={() => { setSecondDropdownOpen(!secondDropdownOpen); setFilterDropdownOpen(false) }}
                  onClose={() => setSecondDropdownOpen(false)}
                >
                  {filterType === "bin_id" ? (
                    // All bin IDs
                    allBins.map(bin => {
                      const ov = allOverviews.find(o => o.bin_id === bin.bin_id)
                      const isSelected = selectedBin?.bin_id === bin.bin_id
                      return (
                        <button key={bin.bin_id}
                          onClick={() => { setSelectedBin(bin); setSecondDropdownOpen(false) }}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left border-b border-border/50 last:border-0 ${isSelected ? "bg-primary/5 border-l-4 border-l-primary" : ""}`}>
                          <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${ov?.is_online ? "bg-emerald-400" : ov ? "bg-red-400" : "bg-zinc-600"}`} />
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>{bin.bin_id}</p>
                            <p className="text-xs text-muted-foreground">{ov?.bin_registered_name || bin.location}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${ov?.is_online ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : ov ? "text-red-400 bg-red-400/10 border-red-400/20" : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"}`}>
                            {ov?.is_online ? "Online" : ov ? "Offline" : "—"}
                          </span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                        </button>
                      )
                    })
                  ) : (
                    // Unique group names (Registered Name or Address)
                    uniqueGroups.map(group => (
                      <button key={group}
                        onClick={() => {
                          setSelectedGroup(group)
                          setSelectedBin(null)
                          setSecondDropdownOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left border-b border-border/50 last:border-0 ${selectedGroup === group ? "bg-primary/5 border-l-4 border-l-primary" : ""}`}>
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${selectedGroup === group ? "bg-primary" : "bg-secondary"}`}>
                          {filterType === "registered_name"
                            ? <Building2 className={`h-3.5 w-3.5 ${selectedGroup === group ? "text-white" : "text-muted-foreground"}`} />
                            : <MapPin className={`h-3.5 w-3.5 ${selectedGroup === group ? "text-white" : "text-muted-foreground"}`} />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${selectedGroup === group ? "text-primary" : "text-foreground"}`}>{group}</p>
                          <p className="text-xs text-muted-foreground">
                            {allOverviews.filter(o => (filterType === "registered_name" ? o.bin_registered_name : o.bin_address) === group).length} bins
                          </p>
                        </div>
                        <ChevronRight className={`h-4 w-4 shrink-0 ${selectedGroup === group ? "text-primary" : "text-muted-foreground"}`} />
                      </button>
                    ))
                  )}
                </Dropdown>
              </div>
            </div>

            {/* Step 3 — Bins under selected group (for registered_name / address) */}
            {(filterType === "registered_name" || filterType === "address") && selectedGroup && binsInGroup.length > 0 && (
              <div className="mt-5 pt-5 border-t border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                  {filterType === "registered_name"
                    ? <><Building2 className="h-3.5 w-3.5 text-primary" />Bins under "{selectedGroup}"</>
                    : <><MapPin className="h-3.5 w-3.5 text-primary" />Bins at "{selectedGroup}"</>}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {binsInGroup.map(bin => {
                    const ov = allOverviews.find(o => o.bin_id === bin.bin_id)
                    const isSelected = selectedBin?.bin_id === bin.bin_id
                    return (
                      <button key={bin.bin_id}
                        onClick={() => setSelectedBin(bin)}
                        className={`flex flex-col gap-2 p-4 rounded-xl border transition-all duration-200 text-left group ${isSelected
                          ? "bg-primary/10 border-primary/40 shadow-[0_0_16px_rgba(var(--primary),0.15)]"
                          : "bg-secondary/30 border-border hover:border-primary/30 hover:bg-secondary/50"}`}>
                        <div className="flex items-center justify-between">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isSelected ? "bg-primary" : "bg-secondary"}`}>
                            <Recycle className={`h-4 w-4 ${isSelected ? "text-white" : "text-muted-foreground"}`} />
                          </div>
                          <div className={`h-2 w-2 rounded-full ${ov?.is_online ? "bg-emerald-400" : ov ? "bg-red-400" : "bg-zinc-600"}`} />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>{bin.bin_id}</p>
                          <p className="text-xs text-muted-foreground truncate">{bin.location}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full self-start border ${ov?.is_online ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : ov ? "text-red-400 bg-red-400/10 border-red-400/20" : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"}`}>
                          {ov?.is_online ? "Online" : ov ? "Offline" : "—"}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {selectedBin && (
            <>
              {/* ── Bin Info Bar ── */}
              <div className="rounded-2xl bg-card border border-border p-4 mb-6 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" /><span>{selectedBin.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Installed {new Date(selectedBin.installed_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4 text-primary" /><span>{selectedBin.access_code}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" /><span>Last active {lastActivity}</span>
                </div>
                <div className="ml-auto">
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${wasteLogs.length > 0 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"}`}>
                    {wasteLogs.length > 0 ? <><CheckCircle2 className="h-3 w-3" />Active</> : <><WifiOff className="h-3 w-3" />No Data</>}
                  </span>
                </div>
              </div>

              {/* ── Bin Overview ── */}
              <div className="mb-6">
                <BinOverviewCard overview={binOverview} />
              </div>

              {/* ── Stats ── */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Logs" value={binStats?.total ?? 0} color="#0C8346" icon={BarChart2} trend="up" />
                <StatCard label="Recycling Rate" value={`${binStats?.recyclingRate ?? 0}%`} color="#34d399" icon={Recycle} trend="up" />
                <StatCard label="Total Weight" value={`${((binStats?.totalWeight ?? 0) / 1000).toFixed(2)} kg`} color="#60a5fa" icon={Layers} trend="neutral" />
                <StatCard label="Waste Types" value={pieData.length} color="#a78bfa" icon={Package} />
              </div>

              {/* ── Fill Status + Composition ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl bg-card border border-border p-6">
                  <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-primary" />Current Fill Status
                  </h3>
                  {binRecord ? (
                    <div className="space-y-4">
                      <FillBar label="Plastics" filled={binRecord.bin1_plastics} color={WASTE_COLORS.plastic} />
                      <FillBar label="Paper" filled={binRecord.bin2_paper} color={WASTE_COLORS.paper} />
                      <FillBar label="Metal" filled={binRecord.bin3_metal} color={WASTE_COLORS.metal} />
                      <FillBar label="Mixed" filled={binRecord.bin4_mixed} color={WASTE_COLORS.mixed} />
                      <p className="text-xs text-muted-foreground pt-1 border-t border-border mt-2">Last updated: {binRecord.updated_at}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <AlertCircle className="h-4 w-4" />No fill data available
                    </div>
                  )}
                </div>
                <div className="rounded-2xl bg-card border border-border p-6">
                  <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                    <Recycle className="h-4 w-4 text-primary" />Waste Composition
                  </h3>
                  {pieData.length > 0 ? (
                    <div className="flex items-center gap-6">
                      <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                            {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                          </Pie>
                          <RechartsTooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-3 flex-1">
                        {pieData.map(d => (
                          <div key={d.name} className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                            <span className="text-sm text-muted-foreground">{d.name}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden mx-2">
                              <div className="h-full rounded-full" style={{ width: `${binStats ? Math.round((d.value / binStats.total) * 100) : 0}%`, background: d.color }} />
                            </div>
                            <span className="text-sm font-semibold text-foreground">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <AlertCircle className="h-4 w-4" />No composition data
                    </div>
                  )}
                </div>
              </div>

              {/* ── Trend Chart ── */}
              {trendData.length > 0 && (
                <div className="rounded-2xl bg-card border border-border p-6 mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />Collection Trends (Last 30 Days)
                  </h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        {Object.entries(WASTE_COLORS).map(([key, color]) => (
                          <linearGradient key={key} id={`ag-${key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#71717a" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#71717a" }} tickLine={false} axisLine={false} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "16px" }} />
                      {Object.entries(WASTE_COLORS).map(([key, color]) => (
                        <Area key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} fill={`url(#ag-${key})`} dot={false} />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* ── Recent Logs ── */}
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />Recent Activity
                  </h3>
                  <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">{wasteLogs.length} total logs</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/30">
                        {["Waste Type", "Weight", "Recycled", "Logged At"].map(h => (
                          <th key={h} className="text-left text-xs text-muted-foreground font-semibold px-6 py-3 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {wasteLogs.slice(0, 15).map((log, i) => {
                        const type = log.waste_type?.toLowerCase() || "mixed"
                        const color = Object.entries(WASTE_COLORS).find(([k]) => type.includes(k))?.[1] || WASTE_COLORS.mixed
                        const Icon = Object.entries(WASTE_ICONS).find(([k]) => type.includes(k))?.[1] || Recycle
                        const d = parseLogDate(log.updated_at)
                        return (
                          <tr key={log.id || i} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                            <td className="px-6 py-3.5">
                              <span className="flex items-center gap-2.5">
                                <span className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                                </span>
                                <span className="text-foreground capitalize font-medium">{log.waste_type}</span>
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-muted-foreground">{log.weight} kg</td>
                            <td className="px-6 py-3.5">
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${log.response?.toLowerCase() === "yes"
                                ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
                                : "text-muted-foreground bg-secondary border border-border"}`}>
                                {log.response?.toLowerCase() === "yes" ? "✓ Recycled" : "✗ Not Recycled"}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-muted-foreground text-xs">
                              {d && !isNaN(d.getTime()) ? d.toLocaleString() : log.updated_at}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {wasteLogs.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm">No activity logged for this bin.</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  )
}