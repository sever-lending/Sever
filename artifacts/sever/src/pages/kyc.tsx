import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2, Clock, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useQuery } from "@tanstack/react-query";

type KycStatus = "none" | "pending" | "approved" | "rejected";

async function startVerification(): Promise<{ url: string; sessionId: string }> {
  const res = await fetch("/api/kyc/start-verification", { method: "POST" });
  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.error ?? "Failed to start verification");
  }
  return res.json();
}

async function checkStatus(sessionId: string): Promise<{ status: KycStatus; sessionId: string }> {
  const res = await fetch("/api/kyc/check-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.error ?? "Failed to check status");
  }
  return res.json();
}

export function KYC() {
  const { isAuthenticated } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(
    () => sessionStorage.getItem("kyc_session_id"),
  );
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: statusData, isLoading: statusLoading, refetch } = useQuery({
    queryKey: ["kyc-status", sessionId],
    queryFn: () => checkStatus(sessionId!),
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      return s === "pending" ? 5000 : false;
    },
  });

  const currentStatus: KycStatus = statusData?.status ?? "none";

  const handleStart = async () => {
    setLaunching(true);
    setError(null);
    try {
      const { url, sessionId: sid } = await startVerification();
      setSessionId(sid);
      sessionStorage.setItem("kyc_session_id", sid);
      window.open(url, "_blank");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLaunching(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-lg text-center space-y-4">
        <ShieldCheck className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-2xl font-bold">Identity Verification</h1>
        <p className="text-muted-foreground">You must be logged in to complete KYC verification.</p>
        <Button onClick={() => window.location.href = "/api/login"}>Log In</Button>
      </div>
    );
  }

  if (currentStatus === "approved") {
    return (
      <div className="container mx-auto py-16 px-4 max-w-lg text-center space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 border border-primary/30 mb-2">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Identity Verified</h1>
        <p className="text-muted-foreground">
          Your identity has been verified. You now have full access to all lending and borrowing features.
        </p>
        <Badge variant="outline" className="border-primary/40 text-primary">VERIFIED</Badge>
      </div>
    );
  }

  if (currentStatus === "pending") {
    return (
      <div className="container mx-auto py-16 px-4 max-w-lg text-center space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-2">
          <Clock className="h-8 w-8 text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold">Verification Under Review</h1>
        <p className="text-muted-foreground">
          Your identity documents are being processed. This typically takes a few minutes.
        </p>
        <Badge variant="outline" className="border-yellow-500/40 text-yellow-400">PENDING REVIEW</Badge>
        <Button variant="outline" onClick={() => refetch()} className="mt-4">
          Check Status
        </Button>
      </div>
    );
  }

  if (currentStatus === "rejected") {
    return (
      <div className="container mx-auto py-16 px-4 max-w-lg text-center space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 border border-destructive/30 mb-2">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Verification Failed</h1>
        <p className="text-muted-foreground">
          Your verification was unsuccessful. Please resubmit with clearer documents.
        </p>
        <Button
          onClick={() => {
            sessionStorage.removeItem("kyc_session_id");
            setSessionId(null);
          }}
        >
          Retry Verification
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-2xl space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Identity Verification</h1>
        </div>
        <p className="text-muted-foreground">
          KYC verification is required to lend or borrow on Sever. This process is secure, powered by Stripe Identity, and takes about 3 minutes.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { icon: "📄", label: "Government ID", desc: "Passport, Driver's License, or State ID" },
          { icon: "🤳", label: "Selfie Check", desc: "Live photo matched to your document" },
          { icon: "🔒", label: "Encrypted", desc: "All data encrypted via Stripe" },
        ].map((item) => (
          <Card key={item.label} className="bg-card/50">
            <CardContent className="pt-5 pb-4 space-y-2">
              <div className="text-2xl">{item.icon}</div>
              <div className="text-xs font-semibold text-foreground">{item.label}</div>
              <div className="text-xs text-muted-foreground leading-snug">{item.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ready to verify?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Clicking the button below will open Stripe Identity in a new tab. Complete the verification there and return here to check your status.
          </p>
          <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
            By proceeding, you authorize Sever to verify your identity using Stripe Identity. Your data is processed securely and never stored on Sever's servers.
          </div>
          <Button
            className="w-full"
            onClick={handleStart}
            disabled={launching || statusLoading}
          >
            {launching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Opening Stripe Identity…
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Start Verification with Stripe
              </>
            )}
          </Button>
          {sessionId && (
            <Button variant="outline" className="w-full" onClick={() => refetch()}>
              I've completed verification — check my status
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
