import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProduction } from "@/context/ProductionContext";
import { ScreenLayout } from "@/components/pmsp/ScreenLayout";
import type { SubAssemblyRow } from "@/types/production";
import { Save, ArrowRight } from "lucide-react";

const MODELS = ["innova", "bmc", "crysta"] as const;
const MODEL_LABELS = { innova: "Innova", bmc: "BMC", crysta: "Crysta" };

export default function SubAssemblyScreen() {
  const { currentEntry, updateSubAssembly } = useProduction();
  const navigate = useNavigate();
  const [rows, setRows] = useState<SubAssemblyRow[]>(currentEntry?.subAssembly ?? []);

  useEffect(() => {
    if (currentEntry) setRows(currentEntry.subAssembly);
  }, [currentEntry]);

  const handleChange = (rowIdx: number, model: typeof MODELS[number], field: "received" | "prd", val: string) => {
    const num = parseInt(val) || 0;
    setRows(prev => prev.map((r, i) => {
      if (i !== rowIdx) return r;
      const updated = { ...r, [model]: { ...r[model], [field]: num } };
      updated[model].pending = updated[model].received - updated[model].prd;
      return updated;
    }));
  };

  const handleSave = async () => {
    try {
      await updateSubAssembly(rows);
    } catch (err) {
      console.error("Failed to save sub assembly:", err);
    }
  };
  const handleNext = async () => {
    try {
      await updateSubAssembly(rows);
      navigate("/unit-parts");
    } catch (err) {
      console.error("Failed to save sub assembly:", err);
    }
  };

  return (
    <ScreenLayout
      title="Sub Assembly"
      showBack
      actions={
        <button onClick={handleSave} className="text-primary-foreground p-1 rounded-lg hover:bg-primary-foreground/10 transition-colors">
          <Save size={20} />
        </button>
      }
    >
      <div className="overflow-x-auto rounded-xl border border-border shadow-card bg-card">
        <table className="w-full min-w-[700px] text-xs lg:text-sm border-collapse">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="py-2.5 px-3 text-left font-semibold sticky left-0 bg-primary z-10 min-w-[120px]">Part</th>
              {MODELS.map(m => (
                <th key={m} colSpan={3} className="py-2.5 px-2 text-center font-semibold border-l border-primary-foreground/20">
                  {MODEL_LABELS[m]}
                </th>
              ))}
            </tr>
            <tr className="bg-primary/90 text-primary-foreground/80">
              <th className="py-1.5 px-3 text-left sticky left-0 bg-primary/90 z-10"></th>
              {MODELS.map(m => (
                <>{/* Fragment for sub-headers */}
                  <th key={`${m}-r`} className="py-1.5 px-2 text-center font-medium border-l border-primary-foreground/10">Rcvd</th>
                  <th key={`${m}-p`} className="py-1.5 px-2 text-center font-medium">PRD</th>
                  <th key={`${m}-pe`} className="py-1.5 px-2 text-center font-medium">Pend</th>
                </>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.part} className={`${idx % 2 === 0 ? "bg-card" : "bg-muted/50"} hover:bg-muted/70 transition-colors`}>
                <td className={`py-2.5 px-3 font-medium text-foreground sticky left-0 z-10 ${idx % 2 === 0 ? "bg-card" : "bg-muted/50"}`}>
                  {row.part}
                </td>
                {MODELS.map(m => (
                  <>{/* Fragment for model cells */}
                    <td key={`${m}-r-${idx}`} className="py-1.5 px-1 lg:px-2 border-l border-border">
                      <input type="number" value={row[m].received || ""} onChange={e => handleChange(idx, m, "received", e.target.value)}
                        className="w-full px-2 py-2 rounded-lg border border-input bg-background text-center text-xs lg:text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
                    </td>
                    <td key={`${m}-p-${idx}`} className="py-1.5 px-1 lg:px-2">
                      <input type="number" value={row[m].prd || ""} onChange={e => handleChange(idx, m, "prd", e.target.value)}
                        className="w-full px-2 py-2 rounded-lg border border-input bg-background text-center text-xs lg:text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
                    </td>
                    <td key={`${m}-pe-${idx}`} className="py-1.5 px-1 lg:px-2">
                      <span className={`block text-center font-semibold text-xs lg:text-sm ${row[m].pending < 0 ? "text-destructive" : row[m].pending > 0 ? "text-accent" : "text-muted-foreground"}`}>
                        {row[m].pending}
                      </span>
                    </td>
                  </>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} className="flex-1 py-3 rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-primary/5 active:scale-[0.98] transition-all">
          Save Draft
        </button>
        <button onClick={handleNext} className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-card flex items-center justify-center gap-2">
          Next <ArrowRight size={16} />
        </button>
      </div>
    </ScreenLayout>
  );
}
