import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProduction } from "@/context/ProductionContext";
import { ScreenLayout } from "@/components/pmsp/ScreenLayout";
import { SignaturePad } from "@/components/pmsp/SignaturePad";
import type { SignOffData } from "@/types/production";
import { CheckSquare, Square, Send } from "lucide-react";

export default function SignOffScreen() {
  const { submitEntry } = useProduction();
  const navigate = useNavigate();

  const [form, setForm] = useState<SignOffData>({
    tmName: "", tmNumber: "", designation: "", amName: "", glName: "", remarks: "", confirmed: false,
  });

  const [signatures, setSignatures] = useState({
    tmSignature: "",
    amSignature: "",
    glSignature: "",
  });

  const update = (field: keyof SignOffData, val: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const updateSig = (field: keyof typeof signatures, val: string) =>
    setSignatures(prev => ({ ...prev, [field]: val }));

  const handleSubmit = async () => {
    if (!form.confirmed || !form.tmName.trim() || !form.tmNumber.trim()) return;
    try {
      await submitEntry({ ...form, ...signatures });
      navigate("/history");
    } catch (err) {
      console.error("Failed to submit entry:", err);
    }
  };

  const inputClass = "w-full px-3 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all";

  return (
    <ScreenLayout title="Sign Off" showBack>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Form */}
        <div className="bg-card rounded-xl shadow-card border border-border p-4 lg:p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Personnel Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">TM Name *</label>
              <input value={form.tmName} onChange={e => update("tmName", e.target.value)} placeholder="Team Member Name" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">TM Number *</label>
              <input value={form.tmNumber} onChange={e => update("tmNumber", e.target.value)} placeholder="Team Member Number" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Designation</label>
              <input value={form.designation} onChange={e => update("designation", e.target.value)} placeholder="Designation" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">AM Name</label>
              <input value={form.amName} onChange={e => update("amName", e.target.value)} placeholder="Asst. Manager" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">GL Name</label>
              <input value={form.glName} onChange={e => update("glName", e.target.value)} placeholder="Group Leader" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Remarks</label>
            <textarea value={form.remarks} onChange={e => update("remarks", e.target.value)} placeholder="Additional remarks..." rows={3}
              className="w-full px-3 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none" />
          </div>
        </div>

        {/* Right column - Signatures */}
        <div className="bg-card rounded-xl shadow-card border border-border p-4 lg:p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Digital Signatures</h3>
          <SignaturePad label="Team Member" value={signatures.tmSignature} onChange={v => updateSig("tmSignature", v)} />
          <SignaturePad label="Asst. Manager" value={signatures.amSignature} onChange={v => updateSig("amSignature", v)} />
          <SignaturePad label="Group Leader" value={signatures.glSignature} onChange={v => updateSig("glSignature", v)} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <button onClick={() => update("confirmed", !form.confirmed)} className="flex items-center gap-3 py-2">
          {form.confirmed
            ? <CheckSquare size={22} className="text-accent" />
            : <Square size={22} className="text-muted-foreground" />}
          <span className="text-sm text-foreground">I confirm all data is accurate and complete</span>
        </button>

        <button
          onClick={handleSubmit}
          disabled={!form.confirmed || !form.tmName.trim() || !form.tmNumber.trim()}
          className="w-full sm:w-auto sm:ml-auto px-8 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-card flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={16} /> Submit Entry
        </button>
      </div>
    </ScreenLayout>
  );
}
