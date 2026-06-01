"use client"
import { useState, useEffect, useMemo, useCallback, Suspense } from "react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import {
  Loader2, Hash, Recycle, LogOut,
  ShieldCheck, Tag, AlertCircle,
  Cpu, Calendar, Clock,
  Plus, X, Save, Clipboard, Activity, FileText,
  LayoutDashboard, UserCircle, ChevronDown,
  Users, Package, TrendingUp, BarChart2,
  Layers, WifiOff, CheckCircle2,
  RefreshCw, TrendingDown
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from "recharts"

// ── Types ──────────────────────────────────────────────────────────────────────
type BinRegistry = {
  bin_id: string
  internal_id?: string
  manufacturing_serial?: string
  electronics_version?: string
  deployment_status?: string
  registered_by?: string
  remarks?: string
  created_at?: string
}
type Profile = {
  id: string
  full_name: string
  email: string
  role: string
  company_name: string
  created_at: string
}
type WasteLog = {
  bin_id: string
  waste_type: string
  user_response: string
  created_at: string
}
type BinStats = {
  total: number
  plastic: number
  paper: number
  metal: number
  mixed: number
  recyclingRate: number
}

// ── Constants ──────────────────────────────────────────────────────────────────
const WASTE_COLORS: Record<string, string> = {
  plastic: "#34d399", paper: "#60a5fa", metal: "#a78bfa", mixed: "#f59e0b",
}
const WASTE_ICONS: Record<string, React.ElementType> = {
  plastic: Package, paper: FileText, metal: Layers, mixed: Recycle,
}
const DEPLOYMENT_STATUSES = [
  { value: "inventory", label: "Inventory", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  { value: "deployed", label: "Deployed", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  { value: "pilot", label: "Pilot", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  { value: "offline", label: "Offline", color: "text-red-400 bg-red-400/10 border-red-400/20" },
]

function getStatusColor(status: string) {
  return DEPLOYMENT_STATUSES.find(s => s.value === status?.toLowerCase())?.color
    || "text-zinc-400 bg-zinc-400/10 border-zinc-400/20"
}

function parseLogDate(dateStr: string): Date | null {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? null : d
  } catch { return null }
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

// ── Register Bin Form ──────────────────────────────────────────────────────────
function RegisterBinForm({ adminName, onSuccess, onClose, supabase }: {
  adminName: string; onSuccess: (newBin: BinRegistry) => void
  onClose: () => void; supabase: any
}) {
  const [manufacturingSerial, setManufacturingSerial] = useState("")
  const [electronicsVersion, setElectronicsVersion] = useState("")
  const [deploymentStatus, setDeploymentStatus] = useState("inventory")
  const [remarks, setRemarks] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewBinId, setPreviewBinId] = useState<string | null>(null)

  useEffect(() => {
    const generatePreview = async () => {
      const { data } = await supabase.from("r3bin_registry").select("bin_id").order("bin_id", { ascending: false })
      const r3bNumbers = (data || [])
        .map((b: any) => b.bin_id).filter((id: string) => id.startsWith("R3B_"))
        .map((id: string) => parseInt(id.replace("R3B_", ""))).filter((n: number) => !isNaN(n))
      const nextNumber = r3bNumbers.length > 0 ? Math.max(...r3bNumbers) + 1 : 1
      setPreviewBinId(`R3B_${String(nextNumber).padStart(3, "0")}`)
    }
    generatePreview()
  }, [supabase])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null)
    try {
      const { data: existingBins } = await supabase.from("r3bin_registry").select("bin_id")
      const r3bNumbers = (existingBins || [])
        .map((b: any) => b.bin_id).filter((id: string) => id.startsWith("R3B_"))
        .map((id: string) => parseInt(id.replace("R3B_", ""))).filter((n: number) => !isNaN(n))
      const nextNumber = r3bNumbers.length > 0 ? Math.max(...r3bNumbers) + 1 : 1
      const newBinId = `R3B_${String(nextNumber).padStart(3, "0")}`
      const { data: newBin, error: insertError } = await supabase.from("r3bin_registry").insert({
        bin_id: newBinId,
        manufacturing_serial: manufacturingSerial || null,
        electronics_version: electronicsVersion || null,
        deployment_status: deploymentStatus,
        registered_by: adminName,
        remarks: remarks || null,
      }).select().single()
      if (insertError) throw insertError
      onSuccess(newBin)
    } catch (err: any) {
      setError(err.message || "Failed to register bin")
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Register New Bin</h2>
              <p className="text-xs text-muted-foreground">Add a new Bin to registry</p>
            </div>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg bg-secondary hover:bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
          <div className="px-6 py-4 bg-primary/5">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><Hash className="h-3 w-3" />Bin ID</p>
            <p className="text-xl font-black text-primary tracking-tight">
              {previewBinId ?? <span className="text-muted-foreground text-sm animate-pulse">Generating...</span>}
            </p>
          </div>
          <div className="px-6 py-4">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" />Registered By</p>
            <p className="text-sm font-semibold text-foreground">{adminName}</p>
          </div>
        </div>
        <form onSubmit={handleRegister} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Clipboard className="h-3 w-3 text-muted-foreground" />Mfg. Serial</label>
              <input type="text" value={manufacturingSerial} onChange={e => setManufacturingSerial(e.target.value)} placeholder="MFG-2026-001"
                className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Cpu className="h-3 w-3 text-muted-foreground" />Electronics Ver.</label>
              <input type="text" value={electronicsVersion} onChange={e => setElectronicsVersion(e.target.value)} placeholder="v1.2"
                className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Activity className="h-3 w-3 text-muted-foreground" />Deployment Status</label>
            <div className="relative">
              <select value={deploymentStatus} onChange={e => setDeploymentStatus(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all cursor-pointer">
                <option value="inventory">Inventory</option>
                <option value="pilot">Pilot</option>
                <option value="deployed">Deployed</option>
                <option value="offline">Offline</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5"><FileText className="h-3 w-3 text-muted-foreground" />Remarks</label>
            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Extra Notes If Any" rows={3}
              className="w-full resize-none rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all" />
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Registering...</> : <><Save className="h-4 w-4" />Register Bin</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Dashboard View ─────────────────────────────────────────────────────────────
function DashboardView({ allBins, adminName, supabase, onBinsUpdate }: {
  allBins: BinRegistry[]; adminName: string; supabase: any
  onBinsUpdate: (bins: BinRegistry[]) => void
}) {
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null)
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null)
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false)
  const [binDropdownOpen, setBinDropdownOpen] = useState(false)
  const [durationDropdownOpen, setDurationDropdownOpen] = useState(false)
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([])
  const [binStats, setBinStats] = useState<BinStats | null>(null)
  const [trendData, setTrendData] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false)
  const [organizations, setOrganizations] = useState<{ name: string }[]>([])
  const [orgBins, setOrgBins] = useState<BinRegistry[]>([])

  const durations = [
    { value: "7", label: "Last 7 Days" },
    { value: "30", label: "Last 1 Month" },
    { value: "90", label: "Last 3 Months" },
    { value: "180", label: "Last 6 Months" },
  ]

  // Fetch organizations from user profiles
  useEffect(() => {
    const fetchOrgs = async () => {
      const { data: profiles } = await supabase.from("profiles")
        .select("company_name").eq("role", "user").not("company_name", "is", null)
      if (!profiles) return
      const orgMap: Record<string, boolean> = {}
      profiles.forEach((p: any) => { if (p.company_name) orgMap[p.company_name] = true })
      setOrganizations(Object.keys(orgMap).map(name => ({ name })))
    }
    fetchOrgs()
  }, [supabase])

  // Fetch bins linked to selected organization
  useEffect(() => {
    const fetchOrgBins = async () => {
      if (!selectedOrg) { setOrgBins([]); return }

      // Get internal_ids of users belonging to selected org
      const { data: profiles } = await supabase
        .from("profiles")
        .select("internal_id")
        .eq("role", "user")
        .eq("company_name", selectedOrg)
        .not("internal_id", "is", null)

      if (!profiles || profiles.length === 0) { setOrgBins([]); return }

      const internalIds = profiles.map((p: any) => p.internal_id)

      // Get bins matching those internal_ids
      const { data: bins } = await supabase
        .from("r3bin_registry")
        .select("*")
        .in("internal_id", internalIds)

      setOrgBins(bins || [])
    }
    fetchOrgBins()
  }, [selectedOrg, supabase])

  const selectedBin = orgBins.find(b => b.bin_id === selectedBinId)
    || allBins.find(b => b.bin_id === selectedBinId)
    || null

  const fetchBinAnalytics = useCallback(async () => {
    if (!selectedBinId || !selectedDuration) return
    setRefreshing(true)
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - parseInt(selectedDuration))

    const { data: logs } = await supabase.from("bin_telemetry")
      .select("*").eq("bin_id", selectedBinId)
      .gte("created_at", daysAgo.toISOString())
      .order("created_at", { ascending: false }).limit(5000)

    const logsData: WasteLog[] = logs || []
    setWasteLogs(logsData)

    const stats: BinStats = { total: logsData.length, plastic: 0, paper: 0, metal: 0, mixed: 0, recyclingRate: 0 }
    logsData.forEach(l => {
      const t = l.waste_type?.toLowerCase() || "mixed"
      if (t.includes("plastic")) stats.plastic++
      else if (t.includes("paper")) stats.paper++
      else if (t.includes("metal")) stats.metal++
      else stats.mixed++
    })
    stats.recyclingRate = stats.total > 0
      ? Math.round(((stats.plastic + stats.paper + stats.metal) / stats.total) * 100) : 0
    setBinStats(stats)

    const daily: Record<string, any> = {}
    logsData.forEach(l => {
      const d = parseLogDate(l.created_at); if (!d) return
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      if (!daily[key]) daily[key] = { date: key, plastic: 0, paper: 0, metal: 0, mixed: 0 }
      const t = l.waste_type?.toLowerCase() || "mixed"
      if (t.includes("plastic")) daily[key].plastic++
      else if (t.includes("paper")) daily[key].paper++
      else if (t.includes("metal")) daily[key].metal++
      else daily[key].mixed++
    })
    setTrendData(Object.values(daily).sort((a, b) => a.date.localeCompare(b.date)))
    setRefreshing(false)
  }, [selectedBinId, selectedDuration, supabase])

  useEffect(() => { fetchBinAnalytics() }, [fetchBinAnalytics])

  const pieData = binStats ? [
    { name: "Plastic", value: binStats.plastic, color: WASTE_COLORS.plastic },
    { name: "Paper", value: binStats.paper, color: WASTE_COLORS.paper },
    { name: "Metal", value: binStats.metal, color: WASTE_COLORS.metal },
    { name: "Mixed", value: binStats.mixed, color: WASTE_COLORS.mixed },
  ].filter(d => d.value > 0) : []

  const deployedBins = allBins.filter(b => b.deployment_status === "deployed").length
  const inventoryBins = allBins.filter(b => b.deployment_status === "inventory").length
  const pilotBins = allBins.filter(b => b.deployment_status === "pilot").length
  const offlineBins = allBins.filter(b => b.deployment_status === "offline").length

  return (
    <div className="space-y-6">

      {/* ── Overview Stats ── */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Overview</h2>
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard label="Total Bins" value={allBins.length} color="#0C8346" icon={Recycle} />
          <StatCard label="Deployed" value={deployedBins} color="#34d399" icon={CheckCircle2} trend="up" />
          <StatCard label="In Inventory" value={inventoryBins} color="#60a5fa" icon={Package} />
          <StatCard label="Pilot" value={pilotBins} color="#f59e0b" icon={Activity} />
          <StatCard label="Offline" value={offlineBins} color="#f87171" icon={WifiOff} trend="down" />
        </div>
      </div>

      {/* ── Filter Section ── */}
      <div className="rounded-2xl bg-card border border-border p-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4">Filter Analytics</p>
        <div className="flex flex-wrap items-end gap-4">

          {/* Type Dropdown */}
          <div className="space-y-1.5 min-w-[160px] relative">
            <label className="text-xs font-semibold text-muted-foreground">Type</label>
            <button onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
              className="w-full flex items-center justify-between gap-3 bg-secondary border border-border hover:border-primary/40 rounded-xl px-4 py-2.5 text-sm transition-all text-left">
              <span className={selectedType ? "text-foreground" : "text-muted-foreground"}>
                {selectedType === "organization" ? "Organization" : "Select"}
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${typeDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {typeDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setTypeDropdownOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                  {[{ value: "organization", label: "Organization" }].map(t => (
                    <button key={t.value}
                      onClick={() => {
                        setSelectedType(t.value)
                        setSelectedOrg(null)
                        setSelectedBinId(null)
                        setSelectedDuration(null)
                        setTypeDropdownOpen(false)
                      }}
                      className={`w-full px-4 py-3 text-sm text-left hover:bg-secondary/50 transition-colors ${selectedType === t.value ? "bg-primary/5 text-primary" : "text-foreground"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Organization Dropdown */}
          {selectedType === "organization" && (
            <div className="space-y-1.5 min-w-[200px] relative">
              <label className="text-xs font-semibold text-muted-foreground">Organization</label>
              <button onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                className="w-full flex items-center justify-between gap-3 bg-secondary border border-border hover:border-primary/40 rounded-xl px-4 py-2.5 text-sm transition-all text-left">
                <span className={selectedOrg ? "text-foreground" : "text-muted-foreground"}>
                  {selectedOrg || "Select Organization"}
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${orgDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {orgDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOrgDropdownOpen(false)} />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                    {organizations.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-muted-foreground">No organizations yet</div>
                    ) : organizations.map(org => (
                      <button key={org.name}
                        onClick={() => {
                          setSelectedOrg(org.name)
                          setSelectedBinId(null)
                          setSelectedDuration(null)
                          setOrgDropdownOpen(false)
                        }}
                        className={`w-full px-4 py-3 text-sm text-left hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0 ${selectedOrg === org.name ? "bg-primary/5 text-primary" : "text-foreground"}`}>
                        {org.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Bin Dropdown — only shows bins linked to selected org */}
          {selectedOrg && (
            <div className="space-y-1.5 min-w-[180px] relative">
              <label className="text-xs font-semibold text-muted-foreground">Bin</label>
              <button onClick={() => setBinDropdownOpen(!binDropdownOpen)}
                className="w-full flex items-center justify-between gap-3 bg-secondary border border-border hover:border-primary/40 rounded-xl px-4 py-2.5 text-sm transition-all text-left">
                <span className={selectedBinId ? "text-foreground" : "text-muted-foreground"}>
                  {selectedBinId || "Select Bin"}
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${binDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {binDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBinDropdownOpen(false)} />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                    {orgBins.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-muted-foreground">No bins linked to this organization</div>
                    ) : orgBins.map(bin => (
                      <button key={bin.bin_id}
                        onClick={() => { setSelectedBinId(bin.bin_id); setBinDropdownOpen(false) }}
                        className={`w-full px-4 py-3 text-sm text-left hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0 ${selectedBinId === bin.bin_id ? "bg-primary/5 text-primary" : "text-foreground"}`}>
                        <p className="font-semibold">{bin.bin_id}</p>
                        <p className="text-xs text-muted-foreground capitalize">{bin.deployment_status || "—"}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Duration Dropdown */}
          {selectedBinId && (
            <div className="space-y-1.5 min-w-[180px] relative">
              <label className="text-xs font-semibold text-muted-foreground">Duration</label>
              <button onClick={() => setDurationDropdownOpen(!durationDropdownOpen)}
                className="w-full flex items-center justify-between gap-3 bg-secondary border border-border hover:border-primary/40 rounded-xl px-4 py-2.5 text-sm transition-all text-left">
                <span className={selectedDuration ? "text-foreground" : "text-muted-foreground"}>
                  {durations.find(d => d.value === selectedDuration)?.label || "Select Duration"}
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${durationDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {durationDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDurationDropdownOpen(false)} />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                    {durations.map(d => (
                      <button key={d.value}
                        onClick={() => { setSelectedDuration(d.value); setDurationDropdownOpen(false) }}
                        className={`w-full px-4 py-3 text-sm text-left hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0 ${selectedDuration === d.value ? "bg-primary/5 text-primary" : "text-foreground"}`}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Refresh */}
          {selectedBinId && selectedDuration && (
            <button onClick={fetchBinAnalytics}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-xl px-3 py-2.5 transition-all mb-0.5">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />Refresh
            </button>
          )}
        </div>
      </div>

      {/* ── Bin Details + Analytics ── */}
      {selectedBin && selectedDuration && (
        <div className="space-y-6">

          {/* Bin Registry Card */}
          <div className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clipboard className="h-4 w-4 text-primary" />Device Registry
              </h3>
              {selectedBin.deployment_status && (
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize ${getStatusColor(selectedBin.deployment_status)}`}>
                  {selectedBin.deployment_status}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Tag className="h-3 w-3" />Bin Code</p>
                <p className="text-sm font-semibold text-foreground">{selectedBin.bin_id}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Clipboard className="h-3 w-3" />Mfg. Serial</p>
                <p className="text-sm font-semibold text-foreground">{selectedBin.manufacturing_serial || "—"}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Cpu className="h-3 w-3" />Electronics Ver.</p>
                <p className="text-sm font-semibold text-foreground">{selectedBin.electronics_version || "—"}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Tag className="h-3 w-3" />Registered By</p>
                <p className="text-sm font-semibold text-foreground">{selectedBin.registered_by || "—"}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Calendar className="h-3 w-3" />Created At</p>
                <p className="text-sm font-semibold text-foreground">
                  {selectedBin.created_at ? new Date(selectedBin.created_at).toLocaleDateString() : "—"}
                </p>
              </div>
              {selectedBin.remarks && (
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><FileText className="h-3 w-3" />Remarks</p>
                  <p className="text-sm font-semibold text-foreground">{selectedBin.remarks}</p>
                </div>
              )}
            </div>
          </div>

          {/* Analytics Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            <StatCard label="Total Logs" value={binStats?.total ?? 0} color="#0C8346" icon={BarChart2} trend="up" />
            <StatCard label="Recycling Rate" value={`${binStats?.recyclingRate ?? 0}%`} color="#34d399" icon={Recycle} trend="up" />
            <StatCard label="Waste Types" value={pieData.length} color="#a78bfa" icon={Package} />
          </div>

          {/* Pie Chart */}
          {pieData.length > 0 && (
            <div className="rounded-2xl bg-card border border-border p-6">
              <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                <Recycle className="h-4 w-4 text-primary" />Waste Composition
              </h3>
              <div className="flex items-center gap-6">
                <div style={{ width: 160, height: 160 }}>
                  <PieChart width={160} height={160}>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </div>
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
            </div>
          )}

          {/* Trend Chart */}
          {trendData.length > 0 && (
            <div className="rounded-2xl bg-card border border-border p-6">
              <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />Collection Trends
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

          {/* Recent Logs */}
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
                    {["Waste Type", "Recycled", "Logged At"].map(h => (
                      <th key={h} className="text-left text-xs text-muted-foreground font-semibold px-6 py-3 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {wasteLogs.slice(0, 15).map((log, i) => {
                    const type = log.waste_type?.toLowerCase() || "mixed"
                    const color = Object.entries(WASTE_COLORS).find(([k]) => type.includes(k))?.[1] || WASTE_COLORS.mixed
                    const Icon = Object.entries(WASTE_ICONS).find(([k]) => type.includes(k))?.[1] || Recycle
                    const d = parseLogDate(log.created_at)
                    return (
                      <tr key={i} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-3.5">
                          <span className="flex items-center gap-2.5">
                            <span className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                              <Icon className="h-3.5 w-3.5" style={{ color }} />
                            </span>
                            <span className="text-foreground capitalize font-medium">{log.waste_type}</span>
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${log.user_response?.toLowerCase() === "yes" ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20" : "text-muted-foreground bg-secondary border border-border"}`}>
                            {log.user_response?.toLowerCase() === "yes" ? "✓ Recycled" : "✗ Not Recycled"}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-muted-foreground text-xs">
                          {d && !isNaN(d.getTime()) ? d.toLocaleString() : log.created_at}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {wasteLogs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">No activity for this bin in the selected period.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No selection placeholder */}
      {(!selectedOrg || !selectedBinId || !selectedDuration) && (
        <div className="rounded-2xl bg-card border border-border p-10 flex flex-col items-center justify-center text-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center">
            <BarChart2 className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">Select filters to view analytics</p>
          <p className="text-xs text-muted-foreground">Choose an organization, bin and duration to load data</p>
        </div>
      )}
    </div>
  )
}

// ── Profiles View ──────────────────────────────────────────────────────────────
function ProfilesView({ supabase }: { supabase: any }) {
  const [admins, setAdmins] = useState<Profile[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfiles = async () => {
      const [adminRes, userRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("role", "admin").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").eq("role", "user").order("created_at", { ascending: false }),
      ])
      if (adminRes.data) setAdmins(adminRes.data)
      if (userRes.data) setUsers(userRes.data)
      setLoading(false)
    }
    fetchProfiles()
  }, [supabase])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  )

  const ProfileTable = ({ profiles, emptyMessage }: { profiles: Profile[], emptyMessage: string }) => (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            {["Name", "Email", "Company", "Joined"].map(h => (
              <th key={h} className="text-left text-xs text-muted-foreground font-semibold px-6 py-3 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile, i) => (
            <tr key={profile.id || i} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
              <td className="px-6 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {profile.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <span className="text-foreground font-medium">{profile.full_name || "—"}</span>
                </div>
              </td>
              <td className="px-6 py-3.5 text-muted-foreground">{profile.email || "—"}</td>
              <td className="px-6 py-3.5 text-muted-foreground">{profile.company_name || "—"}</td>
              <td className="px-6 py-3.5 text-muted-foreground text-xs">
                {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {profiles.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">{emptyMessage}</div>
      )}
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-purple-400" />
            <h2 className="text-base font-bold text-foreground">Admins</h2>
          </div>
          <span className="text-xs bg-purple-400/10 border border-purple-400/20 text-purple-400 px-3 py-1 rounded-full">
            {admins.length} admin{admins.length !== 1 ? "s" : ""}
          </span>
        </div>
        <ProfileTable profiles={admins} emptyMessage="No admins found." />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" />
            <h2 className="text-base font-bold text-foreground">Users</h2>
          </div>
          <span className="text-xs bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 px-3 py-1 rounded-full">
            {users.length} user{users.length !== 1 ? "s" : ""}
          </span>
        </div>
        <ProfileTable profiles={users} emptyMessage="No users registered yet." />
      </div>
    </div>
  )
}

// ── Main Admin Dashboard ───────────────────────────────────────────────────────
type SidebarView = "dashboard" | "add_bin" | "profiles"

function AdminDashboardContent() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState("Admin")
  const [adminEmail, setAdminEmail] = useState("")
  const [allBins, setAllBins] = useState<BinRegistry[]>([])
  const [activeView, setActiveView] = useState<SidebarView>("dashboard")
  const [showRegisterForm, setShowRegisterForm] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data: profile } = await supabase.from("profiles")
        .select("role, full_name, email").eq("id", user.id).maybeSingle()

      if (!profile || profile.role !== "admin") { router.push("/dashboard"); return }
      setAdminName(profile.full_name || "Admin")
      setAdminEmail(profile.email || user.email || "")

      const { data: bins } = await supabase.from("r3bin_registry")
        .select("*").order("created_at", { ascending: false })
      if (bins) setAllBins(bins)

      setLoading(false)
    }
    init()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Recycle className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading admin panel...</p>
      </div>
    </div>
  )

  const sidebarItems = [
    { id: "dashboard" as SidebarView, label: "Dashboard", icon: LayoutDashboard },
    { id: "add_bin" as SidebarView, label: "Add New Bin", icon: Plus },
    { id: "profiles" as SidebarView, label: "Profiles", icon: Users },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">

        {/* ── Sidebar ── */}
        <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col sticky top-16 h-[calc(100vh-4rem)]">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center shrink-0">
                <UserCircle className="h-7 w-7 text-zinc-300" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{adminName}</p>
                <p className="text-xs text-muted-foreground truncate">{adminEmail}</p>
              </div>
            </div>
            <div className="mt-3">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Admin</Badge>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {sidebarItems.map(({ id, label, icon: Icon }) => (
              <button key={id}
                onClick={() => {
                  if (id === "add_bin") { setShowRegisterForm(true); return }
                  setActiveView(id)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${activeView === id && id !== "add_bin"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-border">
            <button onClick={async () => { await supabase.auth.signOut(); router.push("/login") }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-400/5 transition-all">
              <LogOut className="h-4 w-4 shrink-0" />Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {activeView === "dashboard" && "R3Bin Analytics"}
                  {activeView === "profiles" && "User Profiles"}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {activeView === "dashboard" && `Welcome back, ${adminName}`}
                  {activeView === "profiles" && "Manage registered users and admins"}
                </p>
              </div>
            </div>

            {activeView === "dashboard" && (
              <DashboardView
                allBins={allBins}
                adminName={adminName}
                supabase={supabase}
                onBinsUpdate={setAllBins}
              />
            )}
            {activeView === "profiles" && <ProfilesView supabase={supabase} />}
          </div>
        </main>
      </div>

      {showRegisterForm && (
        <RegisterBinForm
          adminName={adminName}
          supabase={supabase}
          onClose={() => setShowRegisterForm(false)}
          onSuccess={(newBin) => {
            setAllBins(prev => [newBin, ...prev])
            setShowRegisterForm(false)
          }}
        />
      )}
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