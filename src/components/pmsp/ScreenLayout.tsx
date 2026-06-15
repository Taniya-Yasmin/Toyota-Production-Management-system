import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

interface ScreenLayoutProps {
  title: string;
  children: ReactNode;
  showBack?: boolean;
  actions?: ReactNode;
  className?: string;
}

export function ScreenLayout({ title, children, showBack, actions, className }: ScreenLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 bg-primary px-4 lg:px-8 py-3 flex items-center gap-3 shadow-card">
        <div className="w-full max-w-6xl mx-auto flex items-center gap-3">
          {showBack && (
            <button onClick={() => navigate(-1)} className="text-primary-foreground p-1 -ml-1 rounded-lg hover:bg-primary-foreground/10 transition-colors">
              <ArrowLeft size={22} />
            </button>
          )}
          <div className="flex items-center gap-2 flex-1">
            <svg viewBox="0 0 100 100" className="w-6 h-6 stroke-primary-foreground fill-none" strokeWidth="8">
              <ellipse cx="50" cy="50" rx="45" ry="32"/>
              <ellipse cx="50" cy="50" rx="15" ry="32"/>
              <ellipse cx="50" cy="38" rx="30" ry="14"/>
            </svg>
            <h1 className="text-base sm:text-lg font-semibold text-primary-foreground">{title}</h1>
          </div>
          <ThemeToggle />
          {actions}
        </div>
      </header>
      <main className={cn("flex-1 p-4 lg:p-8 space-y-4 lg:space-y-6 w-full max-w-6xl mx-auto", className)}>
        {children}
      </main>
    </div>
  );
}
