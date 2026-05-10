import { useState, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShieldCheck, LogOut } from "lucide-react";

export function AgeGateModal() {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    fetch(`${import.meta.env.BASE_URL}api/profile/age-status`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.ageVerified) setOpen(true); })
      .catch(() => {});
  }, [isAuthenticated, isLoading]);

  async function handleConfirm() {
    if (!checked) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/profile/age-verify`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) setOpen(false);
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthenticated) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md rounded-none border-primary/30 [&>button]:hidden"
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <DialogTitle className="font-mono uppercase tracking-tight">Age Verification Required</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Sever Lending is a financial platform restricted to adults. You must confirm your age before accessing the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>By continuing, you confirm that:</p>
            <ul className="list-disc list-inside space-y-1.5 text-xs">
              <li>You are <strong className="text-foreground">18 years of age or older</strong></li>
              <li>You have the legal capacity to enter into financial agreements</li>
              <li>You have read and agree to our <a href="/legal/terms" className="text-primary underline underline-offset-2" target="_blank">Terms of Service</a></li>
            </ul>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="age-confirm"
              checked={checked}
              onCheckedChange={v => setChecked(!!v)}
              className="mt-0.5"
            />
            <Label htmlFor="age-confirm" className="text-sm leading-relaxed cursor-pointer">
              I confirm that I am <strong>18 years of age or older</strong> and I agree to Sever Lending's Terms of Service.
            </Label>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              className="w-full font-mono font-bold rounded-none"
              disabled={!checked || submitting}
              onClick={handleConfirm}
            >
              {submitting ? "Confirming…" : "Confirm & Continue"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground rounded-none font-mono text-xs"
              onClick={logout}
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Sign out instead
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
