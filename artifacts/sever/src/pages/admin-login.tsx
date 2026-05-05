import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ShieldCheck, Loader2, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLogin() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"checking" | "not-authed" | "not-admin">("checking");

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/admin/verify`, {
      method: "POST",
      credentials: "include",
    })
      .then((r) => {
        if (r.ok) {
          setLocation("/admin");
        } else if (r.status === 401) {
          setStatus("not-authed");
        } else {
          setStatus("not-admin");
        }
      })
      .catch(() => setStatus("not-authed"));
  }, [setLocation]);

  if (status === "checking") {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Checking access…</span>
        </div>
      </div>
    );
  }

  if (status === "not-admin") {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-destructive/10 border border-destructive/30 mb-4">
            <ShieldX className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground text-sm">
            Your account does not have administrator privileges.
          </p>
          <Button variant="outline" onClick={() => setLocation("/")}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 border border-primary/30 mb-4">
          <ShieldCheck className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Access</h1>
        <p className="text-muted-foreground text-sm">
          Sign in with your Replit account to access the admin panel.
        </p>
        <Button
          className="w-full"
          onClick={() => {
            window.location.href = `${import.meta.env.BASE_URL}api/login?returnTo=/admin-login`;
          }}
        >
          Sign In
        </Button>
        <p className="text-xs text-center text-muted-foreground/60">
          This area is restricted to platform owners only.
        </p>
      </div>
    </div>
  );
}
