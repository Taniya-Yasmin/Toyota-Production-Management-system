import { useState, useEffect } from "react";
import { ScreenLayout } from "@/components/pmsp/ScreenLayout";
import { useProduction } from "@/context/ProductionContext";
import { getInventory, adjustInventory, updateInventoryThreshold } from "@/lib/api";
import { InventoryItem } from "@/types/production";
import { AlertCircle, Plus, Minus, Settings, Package, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function InventoryScreen() {
  const { user } = useProduction();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState<number>(10);
  const [newThreshold, setNewThreshold] = useState<number>(20);

  // Check if role is authorized to adjust inventory
  const canAdjust = user && ["Admin", "Manager", "Team Leader"].includes(user.role);
  // Check if role is authorized to edit thresholds
  const canEditThreshold = user && ["Admin", "Manager"].includes(user.role);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const data = await getInventory();
      setInventory(data);
    } catch (err) {
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleAdjust = async (item: InventoryItem, adjustment: number) => {
    try {
      const updated = await adjustInventory(item.partName, item.lineType, adjustment);
      setInventory(prev => prev.map(i => i._id === item._id ? { ...i, currentStock: updated.currentStock } : i));
      toast.success(`Adjusted ${item.partName} stock by ${adjustment > 0 ? "+" : ""}${adjustment}`);
    } catch (err) {
      toast.error("Stock adjustment failed");
    }
  };

  const handleUpdateThreshold = async () => {
    if (!selectedItem) return;
    try {
      const updated = await updateInventoryThreshold(selectedItem._id, newThreshold);
      setInventory(prev => prev.map(i => i._id === selectedItem._id ? { ...i, minThreshold: updated.minThreshold } : i));
      toast.success(`Updated threshold for ${selectedItem.partName} to ${newThreshold}`);
      setSelectedItem(null);
    } catch (err) {
      toast.error("Failed to update threshold");
    }
  };

  return (
    <ScreenLayout title="Inventory & Component Stock" showBack>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-border p-4 shadow-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="text-accent" size={20} /> Parts Inventory Levels
            </h2>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading inventories...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-medium">
                      <th className="py-2">Part Name</th>
                      <th className="py-2">Line</th>
                      <th className="py-2 text-center">Current Stock</th>
                      <th className="py-2 text-center">Safety Min</th>
                      <th className="py-2 text-center">Status</th>
                      {canAdjust && <th className="py-2 text-center">Quick Adjust</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(item => {
                      const isLow = item.currentStock < item.minThreshold;
                      return (
                        <tr key={item._id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="py-3 font-medium text-foreground">{item.partName}</td>
                          <td className="py-3 text-muted-foreground">{item.lineType}</td>
                          <td className="py-3 text-center font-semibold text-foreground">{item.currentStock}</td>
                          <td className="py-3 text-center text-muted-foreground">{item.minThreshold}</td>
                          <td className="py-3 text-center">
                            {isLow ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium">
                                <AlertCircle size={12} /> Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium">
                                <CheckCircle2 size={12} /> Adequate
                              </span>
                            )}
                          </td>
                          {canAdjust && (
                            <td className="py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleAdjust(item, -adjustmentValue)}
                                  className="p-1 rounded bg-muted hover:bg-muted/80 text-foreground transition-all"
                                  title={`Remove ${adjustmentValue}`}
                                >
                                  <Minus size={14} />
                                </button>
                                <button
                                  onClick={() => handleAdjust(item, adjustmentValue)}
                                  className="p-1 rounded bg-accent text-accent-foreground hover:opacity-90 transition-all"
                                  title={`Add ${adjustmentValue}`}
                                >
                                  <Plus size={14} />
                                </button>
                                {canEditThreshold && (
                                  <button
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setNewThreshold(item.minThreshold);
                                    }}
                                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                                    title="Edit Safety Threshold"
                                  >
                                    <Settings size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Configurations Side Panel */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4 shadow-card space-y-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              Adjustment Settings
            </h2>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium">Quick Adjustment Amount</label>
              <div className="flex gap-2">
                {[5, 10, 20, 50].map(val => (
                  <button
                    key={val}
                    onClick={() => setAdjustmentValue(val)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      adjustmentValue === val
                        ? "bg-accent border-accent text-accent-foreground"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {val} pcs
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedItem && (
            <div className="bg-card rounded-xl border border-accent/50 p-4 shadow-card space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Set Alert Threshold for {selectedItem.partName}
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Line Type: {selectedItem.lineType}</label>
                  <input
                    type="number"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(parseInt(e.target.value) || 0)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium border border-border hover:bg-muted text-foreground transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateThreshold}
                    className="flex-1 py-2 rounded-lg text-xs font-medium bg-accent text-accent-foreground hover:opacity-90 transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ScreenLayout>
  );
}
