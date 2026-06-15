import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProduction } from "@/context/ProductionContext";
import { Lock, User, Moon, Sun } from "lucide-react";
import { useEffect } from "react";

export default function LoginScreen() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useProduction();
  const navigate = useNavigate();

  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("pmsp-theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const saved = localStorage.getItem("pmsp-theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleLogin = async () => {
    if (!employeeId.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    const success = await login(employeeId, password);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors" aria-label="Toggle theme">
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-sm">
        <div className="bg-card rounded-2xl shadow-elevated p-8 space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-20 h-20 rounded-2xl bg-red-600 flex items-center justify-center shadow-card p-3">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <ellipse cx="50" cy="50" rx="45" ry="32" fill="none" stroke="white" strokeWidth="8"/>
                <ellipse cx="50" cy="50" rx="15" ry="32" fill="none" stroke="white" strokeWidth="8"/>
                <ellipse cx="50" cy="38" rx="30" ry="14" fill="none" stroke="white" strokeWidth="8"/>
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-foreground">Toyota Production Portal</h1>
              <p className="text-sm text-muted-foreground mt-1">Toyota Kirloskar Motor (TKM)</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Employee ID</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" value={employeeId} onChange={e => { setEmployeeId(e.target.value); setError(""); }} placeholder="Enter Employee ID"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="Enter Password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                  onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <button onClick={handleLogin}
              className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-card">
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
