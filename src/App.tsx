import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProductionProvider, useProduction } from "@/context/ProductionContext";
import LoginScreen from "@/screens/LoginScreen";
import DashboardScreen from "@/screens/DashboardScreen";
import SubAssemblyScreen from "@/screens/SubAssemblyScreen";
import UnitPartsScreen from "@/screens/UnitPartsScreen";
import EtiosSectionScreen from "@/screens/EtiosSectionScreen";
import SummaryScreen from "@/screens/SummaryScreen";
import SignOffScreen from "@/screens/SignOffScreen";
import HistoryScreen from "@/screens/HistoryScreen";
import InventoryScreen from "@/screens/InventoryScreen";
import AnalyticsScreen from "@/screens/AnalyticsScreen";
import AuditLogsScreen from "@/screens/AuditLogsScreen";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useProduction();

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginScreen />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardScreen />} />
      <Route path="/sub-assembly" element={<SubAssemblyScreen />} />
      <Route path="/unit-parts" element={<UnitPartsScreen />} />
      <Route path="/etios" element={<EtiosSectionScreen />} />
      <Route path="/summary" element={<SummaryScreen />} />
      <Route path="/sign-off" element={<SignOffScreen />} />
      <Route path="/history" element={<HistoryScreen />} />
      <Route path="/inventory" element={<InventoryScreen />} />
      <Route path="/analytics" element={<AnalyticsScreen />} />
      <Route path="/audit-logs" element={<AuditLogsScreen />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ProductionProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ProductionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
