import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard, Users, FileText, DollarSign,
  Megaphone, MessageSquarePlus, ShieldCheck, AlertCircle, Crown,
} from "lucide-react";
import { TabOverview } from "./tab-overview";
import { TabUsers } from "./tab-users";
import { TabLoans } from "./tab-loans";
import { TabRevenue } from "./tab-revenue";
import { TabUpdates } from "./tab-updates";
import { TabFeedback } from "./tab-feedback";
import { TabAccess } from "./tab-access";

type Tab = "overview" | "users" | "loans" | "revenue" | "updates" | "feedback" | "access";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "loans", label: "Loans", icon: FileText },
  { id: "revenue", label: "Revenue", icon: DollarSign },
  { id: "updates", label: "Updates", icon: Megaphone },
  { id: "feedback", label: "Feedback", icon: MessageSquarePlus },
  { id: "access", label: "Access", icon: ShieldCheck },
];

export function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [authState, setAuthState] = useState<"loading" | "ok" | "denied">("loading");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/admin/verify`, { method: "POST", credentials: "include" })
      .then((r) => {
        if (r.status === 401 || r.status === 403) {
          setAuthState("denied");
          setTimeout(() => { window.location.href = `${import.meta.env.BASE_URL}admin-login`; }, 1200);
          return null;
        }
        if (!r.ok) { setAuthState("denied"); return null; }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setAuthState("ok");
          setIsOwner(d.isOwner === true);
        }
      })
      .catch(() => setAuthState("denied"));
  }, []);

  if (authState === "loading") {
    return (
      <div className="container py-12 px-4 mx-auto max-w-7xl space-y-6">
        <Skeleton className="h-10 w-56" />
        <div className="flex gap-2">{[...Array(7)].map((_, i) => <Skeleton key={i} className="h-9 w-24" />)}</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      </div>
    );
  }

  if (authState === "denied") {
    return (
      <div className="container py-24 px-4 mx-auto max-w-md text-center">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Access Denied</h1>
        <p className="text-sm text-muted-foreground">Redirecting to login…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Admin header bar */}
      <div className="border-b border-border/60 bg-card/40 backdrop-blur sticky top-16 z-40">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Crown className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm tracking-tight">Admin Dashboard</span>
              <Badge variant="outline" className="border-primary/40 text-primary text-[10px] px-2 py-0.5 font-mono">
                {isOwner ? "OWNER" : "ADMIN"}
              </Badge>
            </div>
          </div>

          {/* Tab navigation */}
          <nav className="flex gap-0.5 -mb-px overflow-x-auto scrollbar-hide pb-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="container px-4 md:px-6 mx-auto max-w-7xl py-8">
        {activeTab === "overview" && <TabOverview />}
        {activeTab === "users" && <TabUsers />}
        {activeTab === "loans" && <TabLoans />}
        {activeTab === "revenue" && <TabRevenue />}
        {activeTab === "updates" && <TabUpdates />}
        {activeTab === "feedback" && <TabFeedback />}
        {activeTab === "access" && <TabAccess isOwner={isOwner} />}
      </div>
    </div>
  );
}
