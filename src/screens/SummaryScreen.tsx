import { useNavigate } from "react-router-dom";
import { useProduction } from "@/context/ProductionContext";
import { ScreenLayout } from "@/components/pmsp/ScreenLayout";
import { MetricCard } from "@/components/pmsp/MetricCard";
import { Package, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";

export default function SummaryScreen() {
  const { currentEntry } = useProduction();
  const navigate = useNavigate();

  const totals = currentEntry?.totals ?? { totalReceived: 0, totalProduction: 0, totalPending: 0 };

  return (
    <ScreenLayout title="Summary" showBack>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Total Received" value={totals.totalReceived} icon={<Package size={18} />} className="py-5" />
        <MetricCard label="Total Production" value={totals.totalProduction} variant="success" icon={<TrendingUp size={18} />} className="py-5" />
        <MetricCard
          label="Total Pending"
          value={totals.totalPending}
          variant={totals.totalPending > 50 ? "destructive" : "warning"}
          icon={<AlertTriangle size={18} />}
          className="py-5"
        />
      </div>

      {/* Progress bar */}
      <div className="bg-card rounded-xl border border-border p-4 lg:p-6 shadow-card max-w-3xl">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Production Progress</span>
          <span className="font-semibold text-foreground">
            {totals.totalReceived > 0 ? Math.round((totals.totalProduction / totals.totalReceived) * 100) : 0}%
          </span>
        </div>
        <div className="h-3 lg:h-4 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all duration-500"
            style={{ width: `${totals.totalReceived > 0 ? Math.min(100, (totals.totalProduction / totals.totalReceived) * 100) : 0}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => navigate("/sign-off")}
        className="w-full max-w-md py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-card flex items-center justify-center gap-2"
      >
        Proceed to Sign Off <ArrowRight size={16} />
      </button>
    </ScreenLayout>
  );
}
