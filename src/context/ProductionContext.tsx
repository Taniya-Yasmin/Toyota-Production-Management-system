import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type {
  User, ProductionEntry, SubAssemblyRow, UnitPartsRow, EtiosRow, SignOffData,
} from "@/types/production";
import * as api from "@/lib/api";

interface ProductionContextType {
  user: User | null;
  currentEntry: ProductionEntry | null;
  history: ProductionEntry[];
  loading: boolean;
  login: (employeeId: string, password: string) => Promise<boolean>;
  logout: () => void;
  createNewEntry: (shift: "DAY" | "NIGHT") => Promise<void>;
  updateSubAssembly: (data: SubAssemblyRow[]) => Promise<void>;
  updateUnitParts: (data: UnitPartsRow[]) => Promise<void>;
  updateEtios: (data: EtiosRow[]) => Promise<void>;
  saveDraft: () => Promise<void>;
  submitEntry: (signOff: SignOffData) => Promise<void>;
  fetchHistory: () => Promise<void>;
  loadCurrentEntry: () => Promise<void>;
}

const ProductionContext = createContext<ProductionContextType | null>(null);

/** Map _id from API response to id for frontend compat */
function normalizeEntry(entry: any): ProductionEntry {
  if (!entry) return entry;
  return {
    ...entry,
    id: entry.id || entry._id,
    _id: entry._id || entry.id,
  };
}

export function ProductionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentEntry, setCurrentEntry] = useState<ProductionEntry | null>(null);
  const [history, setHistory] = useState<ProductionEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // On mount: if a token exists, attempt to restore the session
  useEffect(() => {
    const token = localStorage.getItem("pmsp-token");
    if (token) {
      // Restore user info from stored data
      const storedUser = localStorage.getItem("pmsp-user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // ignore parse errors
        }
      }
      // Try loading the current draft
      loadCurrentEntry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (employeeId: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const data = await api.authLogin(employeeId, password);
      // Store token
      localStorage.setItem("pmsp-token", data.token);
      const userData: User = {
        employeeId: data.user?.employeeId || employeeId,
        name: data.user?.name || `Employee ${employeeId}`,
        role: data.user?.role || "Operator",
      };
      localStorage.setItem("pmsp-user", JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("pmsp-token");
    localStorage.removeItem("pmsp-user");
    setUser(null);
    setCurrentEntry(null);
    setHistory([]);
  }, []);

  const loadCurrentEntry = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getCurrentEntry();
      if (data && data.entry) {
        setCurrentEntry(normalizeEntry(data.entry));
      } else if (data && data._id) {
        setCurrentEntry(normalizeEntry(data));
      }
    } catch (err) {
      // No current entry — that's fine
      console.error("No current draft found:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewEntry = useCallback(async (shift: "DAY" | "NIGHT") => {
    try {
      setLoading(true);
      const data = await api.createEntry(shift);
      const entry = data.entry ? data.entry : data;
      setCurrentEntry(normalizeEntry(entry));
    } catch (err) {
      console.error("Failed to create entry:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSubAssembly = useCallback(async (data: SubAssemblyRow[]) => {
    if (!currentEntry) return;
    const entryId = currentEntry._id || currentEntry.id;
    try {
      const res = await api.updateSubAssembly(entryId, data);
      const entry = res.entry ? res.entry : res;
      setCurrentEntry(normalizeEntry(entry));
    } catch (err) {
      console.error("Failed to update sub assembly:", err);
    }
  }, [currentEntry]);

  const updateUnitParts = useCallback(async (data: UnitPartsRow[]) => {
    if (!currentEntry) return;
    const entryId = currentEntry._id || currentEntry.id;
    try {
      const res = await api.updateUnitParts(entryId, data);
      const entry = res.entry ? res.entry : res;
      setCurrentEntry(normalizeEntry(entry));
    } catch (err) {
      console.error("Failed to update unit parts:", err);
    }
  }, [currentEntry]);

  const updateEtios = useCallback(async (data: EtiosRow[]) => {
    if (!currentEntry) return;
    const entryId = currentEntry._id || currentEntry.id;
    try {
      const res = await api.updateEtios(entryId, data);
      const entry = res.entry ? res.entry : res;
      setCurrentEntry(normalizeEntry(entry));
    } catch (err) {
      console.error("Failed to update etios:", err);
    }
  }, [currentEntry]);

  const saveDraft = useCallback(async () => {
    if (!currentEntry) return;
    const entryId = currentEntry._id || currentEntry.id;
    try {
      setLoading(true);
      const res = await api.saveDraft(entryId);
      const entry = res.entry ? res.entry : res;
      setCurrentEntry(normalizeEntry(entry));
    } catch (err) {
      console.error("Failed to save draft:", err);
    } finally {
      setLoading(false);
    }
  }, [currentEntry]);

  const submitEntry = useCallback(async (signOff: SignOffData) => {
    if (!currentEntry) return;
    const entryId = currentEntry._id || currentEntry.id;
    try {
      setLoading(true);
      await api.submitEntry(entryId, signOff);
      setCurrentEntry(null);
    } catch (err) {
      console.error("Failed to submit entry:", err);
    } finally {
      setLoading(false);
    }
  }, [currentEntry]);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getHistory();
      const entries = data.entries ? data.entries : (Array.isArray(data) ? data : []);
      setHistory(entries.map(normalizeEntry));
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ProductionContext.Provider value={{
      user, currentEntry, history, loading,
      login, logout, createNewEntry,
      updateSubAssembly, updateUnitParts, updateEtios,
      saveDraft, submitEntry, fetchHistory, loadCurrentEntry,
    }}>
      {children}
    </ProductionContext.Provider>
  );
}

export function useProduction() {
  const ctx = useContext(ProductionContext);
  if (!ctx) throw new Error("useProduction must be used within ProductionProvider");
  return ctx;
}
