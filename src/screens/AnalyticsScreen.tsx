import { useState, useEffect } from "react";
import { ScreenLayout } from "@/components/pmsp/ScreenLayout";
import { getAnalyticsStatus } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { Sun, Moon, TrendingUp, Award, Activity } from "lucide-react";
import { toast } from "sonner";

export default function AnalyticsScreen() {
  const [shift, setShift] = useState<"DAY" | "NIGHT">("DAY");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getAnalyticsStatus(shift);
      setData(res);
    } catch (err) {
      toast.error("Failed to load shift analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shift]);

  // radial bar data for OEE gauge
  const radialData = data
    ? [
        {
          name: "OEE",
          value: data.oee,
          fill: data.oee >= 85 ? "#10B981" : data.oee >= 50 ? "#F59E0B" : "#EF4444",
        },
      ]
    : [];

  return (
    <ScreenLayout title="Shift Performance & Analytics" showBack>
      {/* Shift Toggle Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card rounded-xl border border-border p-4 shadow-card">
        <div>
          <h2 className="text-base font-semibold text-foreground">Select Shift Analysis</h2>
          <p className="text-xs text-muted-foreground">Compare hourly targets against completed assemblies</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setShift("DAY")}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              shift === "DAY" ? "bg-accent text-accent-foreground shadow-card" : "border border-border hover:bg-muted"
            }`}
          >
            <Sun size={16} /> Day Shift
          </button>
          <button
            onClick={() => setShift("NIGHT")}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              shift === "NIGHT" ? "bg-accent text-accent-foreground shadow-card" : "border border-border hover:bg-muted"
            }`}
          >
            <Moon size={16} /> Night Shift
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
          Calculating performance metrics...
        </div>
      ) : data && data.hasData ? (
        <div className="space-y-6">
          {/* Top Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* OEE Gauge */}
            <div className="bg-card rounded-xl border border-border p-4 shadow-card flex flex-col items-center justify-center text-center">
              <span className="text-sm font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <Activity size={16} className="text-accent" /> OEE Index
              </span>
              <div className="w-[180px] h-[150px] relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={10} data={radialData} startAngle={180} endAngle={0}>
                    <RadialBar background dataKey="value" />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="text-3xl font-extrabold text-foreground">{data.oee}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {data.oee >= 85 ? "🚀 High operational efficiency" : data.oee >= 50 ? "⚠️ Production backlog detected" : "❌ Critical downtime threshold"}
              </p>
            </div>

            {/* Shift Details */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-card space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                <Award size={16} className="text-accent" /> Shift Record
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Shift Date</span>
                  <p className="text-sm font-bold text-foreground">{data.date}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Current Status</span>
                  <p className="text-sm font-bold text-green-500">Live Active</p>
                </div>
              </div>
              <div className="border-t border-border pt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-muted-foreground">Received</span>
                  <p className="text-sm font-bold text-foreground">{data.totals?.totalReceived || 0}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground">Completed</span>
                  <p className="text-sm font-bold text-foreground">{data.totals?.totalProduction || 0}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground">Pending</span>
                  <p className="text-sm font-bold text-foreground">{data.totals?.totalPending || 0}</p>
                </div>
              </div>
            </div>

            {/* Performance Summary Card */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-card space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                <TrendingUp size={16} className="text-accent" /> Highlights
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Parts Monitored:</span>
                  <span className="font-semibold text-foreground">{data.metrics.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Highest Assembly Rate:</span>
                  <span className="font-bold text-green-500">
                    {Math.max(...data.metrics.map((m: any) => m.completionRate))}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Lowest Assembly Rate:</span>
                  <span className="font-bold text-red-500">
                    {Math.min(...data.metrics.map((m: any) => m.completionRate))}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Comparison Bar Chart */}
          <div className="bg-card rounded-xl border border-border p-4 shadow-card">
            <h3 className="text-base font-semibold text-foreground mb-4">Target vs. Actual Completion</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.metrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="partName" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="target" name="Hourly Target" fill="#94A3B8" />
                  <Bar dataKey="actual" name="Completed Production" fill="#E11D48" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
          No logs or active drafts found for {shift} Shift.
        </div>
      )}
    </ScreenLayout>
  );
}
