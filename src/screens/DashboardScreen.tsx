import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProduction } from "@/context/ProductionContext";
import { ScreenLayout } from "@/components/pmsp/ScreenLayout";
import { MetricCard } from "@/components/pmsp/MetricCard";
import { Package, TrendingUp, AlertTriangle, Clock, ArrowRight, LogOut, Sun, Moon, Shield, Download, PieChart } from "lucide-react";

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { user, currentEntry, createNewEntry, logout, loadCurrentEntry, fetchHistory, loading } = useProduction();
  const [selectedShift, setSelectedShift] = useState<"DAY" | "NIGHT">("DAY");

  useEffect(() => {
    loadCurrentEntry();
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartNew = async () => {
    try {
      await createNewEntry(selectedShift);
      navigate("/sub-assembly");
    } catch (err) {
      console.error("Failed to start new entry:", err);
    }
  };

  const handleResumeDraft = () => {
    navigate("/sub-assembly");
  };

  const handleExportCSV = () => {
    const activeShift = currentEntry?.shift || selectedShift;
    const token = localStorage.getItem("pmsp-token");
    // Open in a new tab with token in query params or simply invoke standard browser download
    window.open(`/api/reports/export?shift=${activeShift}&token=${token || ""}`, "_blank");
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric"
  });

  // Dynamic Navigation Items based on Role
  const navItems = [
    { label: "Sub Assembly", desc: "Track sub assembly parts", path: "/sub-assembly", icon: Package },
    { label: "Unit Parts", desc: "Manage unit part quantities", path: "/unit-parts", icon: Package },
    { label: "Etios Section", desc: "HBK & SDN tracking", path: "/etios", icon: Package },
    { label: "Summary", desc: "View production summary", path: "/summary", icon: TrendingUp },
    { label: "History", desc: "Past entries & reports", path: "/history", icon: Clock },
    { label: "Inventory Stock", desc: "Component stock & alerts", path: "/inventory", icon: Package },
    { label: "OEE Analytics", desc: "Shift OEE & visual charts", path: "/analytics", icon: PieChart },
  ];

  if (user && ["Admin", "Manager", "Team Leader"].includes(user.role)) {
    navItems.push({ label: "Audit Trail", desc: "Traceability records", path: "/audit-logs", icon: Shield });
  }

  // Calculate target progress rate if we have entries
  const prdCount = currentEntry?.totals.totalProduction || 0;
  const receivedCount = currentEntry?.totals.totalReceived || 0;
  const progressPercent = receivedCount > 0 ? Math.round((prdCount / receivedCount) * 100) : 0;

  const canExport = user && ["Admin", "Manager", "Team Leader"].includes(user.role);

  return (
    <ScreenLayout
      title="Production Operations Dashboard"
      actions={
        <div className="flex items-center gap-2">
          {canExport && (
            <button
              onClick={handleExportCSV}
              className="text-primary-foreground p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors flex items-center gap-1 text-sm font-semibold"
              title="Export Report CSV"
            >
              <Download size={18} /> <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}
          <button onClick={() => { logout(); navigate("/"); }} className="text-primary-foreground p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      }
    >
      {/* Header info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-4 rounded-xl shadow-card">
        <div>
          <p className="text-xs text-muted-foreground">Welcome back,</p>
          <div className="flex items-center gap-2">
            <p className="text-base lg:text-lg font-bold text-foreground">
              {user?.name ? user.name.replace("Admin ", "") : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs lg:text-sm text-muted-foreground">{today}</span>
          <span className="px-3 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-bold shadow-sm">
            Shift: {currentEntry?.shift ?? selectedShift}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <MetricCard label="Total Received" value={currentEntry?.totals.totalReceived ?? 0} icon={<Package size={16} />} />
        <MetricCard label="Production Progress" value={`${progressPercent}%`} variant={progressPercent >= 85 ? "success" : "default"} icon={<TrendingUp size={16} />} />
        <MetricCard label="Production Done" value={currentEntry?.totals.totalProduction ?? 0} variant="success" icon={<TrendingUp size={16} />} />
        <MetricCard label="Pending Items" value={currentEntry?.totals.totalPending ?? 0} variant={currentEntry && currentEntry.totals.totalPending > 50 ? "destructive" : "default"} icon={<AlertTriangle size={16} />} />
      </div>

      {/* Shift Selection */}
      {!currentEntry && (
        <div className="bg-card rounded-xl shadow-card border border-border p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Select Shift to Start</p>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedShift("DAY")}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                selectedShift === "DAY"
                  ? "bg-accent text-accent-foreground shadow-card"
                  : "border border-border text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Sun size={16} className="inline mr-2" />DAY
            </button>
            <button
              onClick={() => setSelectedShift("NIGHT")}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                selectedShift === "NIGHT"
                  ? "bg-accent text-accent-foreground shadow-card"
                  : "border border-border text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Moon size={16} className="inline mr-2" />NIGHT
            </button>
          </div>
        </div>
      )}

      {/* Start New Entry / Resume Draft */}
      {currentEntry && currentEntry.status === "draft" ? (
        <button
          onClick={handleResumeDraft}
          className="w-full py-4 rounded-xl bg-accent text-accent-foreground font-bold text-base hover:opacity-90 active:scale-[0.99] transition-all shadow-card flex items-center justify-center gap-2"
        >
          Start New Entry <ArrowRight size={18} />
        </button>
      ) : (
        <button
          onClick={handleStartNew}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-accent text-accent-foreground font-bold text-base hover:opacity-90 active:scale-[0.99] transition-all shadow-card flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Starting..." : "Start New Entry"} <ArrowRight size={18} />
        </button>
      )}

      {/* Navigation Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="bg-card rounded-xl p-4 lg:p-5 shadow-card hover:shadow-card-hover active:scale-[0.97] transition-all text-left border border-border flex flex-col gap-2"
            >
              <Icon size={20} className="text-accent" />
              <span className="text-sm font-semibold text-foreground">{item.label}</span>
              <span className="text-xs text-muted-foreground hidden lg:block">{item.desc}</span>
            </button>
          );
        })}
      </div>
    </ScreenLayout>
  );
}
