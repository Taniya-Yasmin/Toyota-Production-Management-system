import { useEffect } from "react";
import { useProduction } from "@/context/ProductionContext";
import { ScreenLayout } from "@/components/pmsp/ScreenLayout";
import { FileText, Package, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";

export default function HistoryScreen() {
  const { history, fetchHistory, loading } = useProduction();

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScreenLayout title="History" showBack>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 size={36} className="text-accent animate-spin mb-4" />
          <p className="text-muted-foreground text-sm">Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText size={48} className="text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-sm">No entries yet</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Submitted entries will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map(entry => (
            <div key={entry._id || entry.id} className="bg-card rounded-xl shadow-card border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{entry.date}</p>
                  <p className="text-xs text-muted-foreground">{entry.shift} Shift</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  entry.status === "submitted"
                    ? "bg-success/10 text-success"
                    : "bg-accent/10 text-accent"
                }`}>
                  {entry.status === "submitted" ? "Submitted" : "Draft"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <Package size={14} className="mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Received</p>
                  <p className="text-sm font-bold text-foreground">{entry.totals.totalReceived}</p>
                </div>
                <div className="bg-success/5 rounded-lg p-2 text-center">
                  <TrendingUp size={14} className="mx-auto text-success mb-1" />
                  <p className="text-xs text-muted-foreground">Production</p>
                  <p className="text-sm font-bold text-success">{entry.totals.totalProduction}</p>
                </div>
                <div className="bg-destructive/5 rounded-lg p-2 text-center">
                  <AlertTriangle size={14} className="mx-auto text-destructive mb-1" />
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-sm font-bold text-destructive">{entry.totals.totalPending}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScreenLayout>
  );
}
