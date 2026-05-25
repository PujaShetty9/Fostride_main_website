"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Trash2,
  BarChart3,
  Settings,
  FileText,
  MapPin,
  Bell,
  ChevronLeft,
  ChevronRight,
  Recycle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "#", active: true },
  { icon: Trash2, label: "Bin Status", href: "#" },
  { icon: BarChart3, label: "Analytics", href: "#" },
  { icon: MapPin, label: "Locations", href: "#" },
  { icon: FileText, label: "ESG Reports", href: "#" },
  { icon: Bell, label: "Alerts", href: "#" },
  { icon: Settings, label: "Settings", href: "#" },
]

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ onCollapsedChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const handleCollapse = (value: boolean) => {
    setCollapsed(value)
    onCollapsedChange?.(value)
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/5 bg-[#080808] transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-white/5 px-4">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center w-full")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0C8346]">
            <Recycle className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-white">Fostride</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleCollapse(!collapsed)}
          className={cn(
            "h-8 w-8 text-zinc-400 hover:text-white",
            collapsed && "hidden md:flex absolute -right-3 top-6 bg-[#080808] border border-white/10 rounded-full"
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              item.active
                ? "bg-[#0C8346]/10 text-[#0C8346]"
                : "text-zinc-400 hover:bg-white/5 hover:text-white",
              collapsed && "justify-center px-2"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </a>
        ))}
      </nav>

      <div className={cn("border-t border-white/5 p-4", collapsed && "p-2")}>
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="h-8 w-8 rounded-full bg-[#0C8346]/20 flex items-center justify-center">
            <span className="text-xs font-medium text-[#0C8346]">AD</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Admin User</span>
              <span className="text-xs text-zinc-500">admin@fostride.io</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}