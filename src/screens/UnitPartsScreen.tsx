import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProduction } from "@/context/ProductionContext";
import { ScreenLayout } from "@/components/pmsp/ScreenLayout";
import type { UnitPartsRow } from "@/types/production";
import { Save, ArrowRight } from "lucide-react";

export default function UnitPartsScreen() {
  const { currentEntry, updateUnitParts } = useProduction();
  const navigate = useNavigate();
  const [rows, setRows] = useState<UnitPartsRow[]>(currentEntry?.unitParts ?? []);

  useEffect(() => {
    if (currentEntry) setRows(currentEntry.unitParts);
  }, [currentEntry]);

  const handleChange = (idx: number, field: "qty1" | "qty2", val: string) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: parseInt(val) || 0 } : r));
  };

  const totals = rows.reduce((a, r) => ({ qty1: a.qty1 + r.qty1, qty2: a.qty2 + r.qty2 }), { qty1: 0, qty2: 0 });

  const handleSave = async () => {
    try {
      await updateUnitParts(rows);
    } catch (err) {
      console.error("Failed to save unit parts:", err);
    }
  };
  const handleNext = async () => {
    try {
      await updateUnitParts(rows);
      navigate("/etios");
    } catch (err) {
      console.error("Failed to save unit parts:", err);
    }
  };

  return (
    <ScreenLayout title="Unit Parts" showBack actions={
      <button onClick={handleSave} className="text-primary-foreground p-1 rounded-lg hover:bg-primary-foreground/10 transition-colors">
        <Save size={20} />
      </button>
    }>
      <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden lg:max-w-3xl">
        <table className="w-full text-sm lg:text-base">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="py-2.5 px-4 text-left font-semibold">Part</th>
              <th className="py-2.5 px-4 text-center font-semibold">Qty 1</th>
              <th className="py-2.5 px-4 text-center font-semibold">Qty 2</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.part} className={`${idx % 2 === 0 ? "bg-card" : "bg-muted/50"} hover:bg-muted/70 transition-colors`}>
                <td className="py-2.5 px-4 font-medium text-foreground">{row.part}</td>
                <td className="py-2 px-3">
                  <input type="number" value={row.qty1 || ""} onChange={e => handleChange(idx, "qty1", e.target.value)}
                    className="w-full max-w-[120px] mx-auto block px-3 py-2 rounded-lg border border-input bg-background text-center text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
                </td>
                <td className="py-2 px-3">
                  <input type="number" value={row.qty2 || ""} onChange={e => handleChange(idx, "qty2", e.target.value)}
                    className="w-full max-w-[120px] mx-auto block px-3 py-2 rounded-lg border border-input bg-background text-center text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
                </td>
              </tr>
            ))}
            <tr className="bg-primary/10 font-bold">
              <td className="py-2.5 px-4 text-foreground">Total</td>
              <td className="py-2.5 px-4 text-center text-foreground">{totals.qty1}</td>
              <td className="py-2.5 px-4 text-center text-foreground">{totals.qty2}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 pt-2 lg:max-w-3xl">
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
