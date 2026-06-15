import { useState, useEffect } from "react";
import { ScreenLayout } from "@/components/pmsp/ScreenLayout";
import { getAuditLogs } from "@/lib/api";
import { AuditLogItem } from "@/types/production";
import { ShieldCheck, Calendar, User, Tag, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function AuditLogsScreen() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs(filterAction);
      setLogs(data);
    } catch (err) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterAction]);

  const toggleExpand = (id: string) => {
    setExpandedLogId(prev => prev === id ? null : id);
  };

  return (
    <ScreenLayout title="Security Audit Logs" showBack>
      {/* Filters Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card rounded-xl border border-border p-4 shadow-card">
        <div>
          <h2 className="text-base font-semibold text-foreground">Operational Traceability Logs</h2>
          <p className="text-xs text-muted-foreground">Audit trails of database changes made during production runs</p>
        </div>
        <div className="w-full md:w-auto flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Filter Action:</label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-background border border-border text-foreground rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent w-full md:w-[180px]"
          >
            <option value="">All Actions</option>
            <option value="create">Create Entry</option>
            <option value="update_sub_assembly">Update Sub Assembly</option>
            <option value="update_unit_parts">Update Unit Parts</option>
            <option value="update_etios">Update Etios</option>
            <option value="submit">Submit Entry</option>
            <option value="inventory_adjust">Adjust Stock</option>
            <option value="target_update">Configure Target</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-card">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading audit records...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No matching logs found.</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-medium">
                    <th className="py-2">Timestamp</th>
                    <th className="py-2">Action</th>
                    <th className="py-2">User (Role)</th>
                    <th className="py-2">Table</th>
                    <th className="py-2 text-center">Inspect</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const isExpanded = expandedLogId === log._id;
                    const dateStr = new Date(log.timestamp).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    });

                    return (
                      <>
                        <tr key={log._id} className="border-b border-border hover:bg-muted/20 transition-colors">
                          <td className="py-3 text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} /> {dateStr}
                            </span>
                          </td>
                          <td className="py-3 font-semibold text-foreground">
                            <span className="inline-block px-2 py-0.5 rounded bg-accent/10 text-accent text-xs">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 text-foreground">
                            <span className="flex items-center gap-1">
                              <User size={12} className="text-muted-foreground" />
                              {log.userId?.name || "System"} ({log.userId?.role || "N/A"})
                            </span>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Tag size={12} /> {log.collectionName}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => toggleExpand(log._id)}
                              className="text-accent hover:opacity-80 transition-colors p-1"
                              title="Toggle Details"
                            >
                              {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={5} className="py-3 px-4 bg-muted/30 border-b border-border">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                                <div>
                                  <h4 className="font-sans font-bold text-muted-foreground mb-1">Previous State</h4>
                                  <pre className="p-3 bg-card rounded border border-border overflow-auto max-h-[200px]">
                                    {log.previousState
                                      ? JSON.stringify(log.previousState, null, 2)
                                      : "None (Created new record)"}
                                  </pre>
                                </div>
                                <div>
                                  <h4 className="font-sans font-bold text-muted-foreground mb-1">New State</h4>
                                  <pre className="p-3 bg-card rounded border border-border overflow-auto max-h-[200px]">
                                    {log.newState
                                      ? JSON.stringify(log.newState, null, 2)
                                      : "None (Deleted record)"}
                                  </pre>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}
