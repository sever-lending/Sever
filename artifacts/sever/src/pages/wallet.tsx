import { useState, useEffect } from "react";
import { 
  useGetMyProfile, 
  useWithdrawFunds,
  getGetMyProfileQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatMoney } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Wallet as WalletIcon, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, ExternalLink } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

async function createCheckoutSession(amount: number): Promise<{ url: string }> {
  const res = await fetch(`${BASE}/api/stripe/checkout-session`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to create checkout session");
  }
  return res.json();
}

async function confirmDeposit(sessionId: string): Promise<{ newBalance: number; depositAmount: number }> {
  const res = await fetch(`${BASE}/api/stripe/confirm-deposit`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to confirm deposit");
  }
  return res.json();
}

export function Wallet() {
  const { data: profile, isLoading } = useGetMyProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [depositPending, setDepositPending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const cancelled = params.get("deposit");

    if (sessionId) {
      window.history.replaceState({}, "", window.location.pathname);
      confirmDeposit(sessionId)
        .then(({ depositAmount: amt, newBalance }) => {
          toast({
            title: "Deposit successful!",
            description: `$${amt.toFixed(2)} added to your wallet. New balance: ${formatMoney(newBalance)}.`,
          });
          queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
        })
        .catch((err) => {
          if (err.message !== "Session already processed") {
            toast({ title: "Deposit issue", description: err.message, variant: "destructive" });
          }
        });
    }

    if (cancelled === "cancelled") {
      window.history.replaceState({}, "", window.location.pathname);
      toast({ title: "Deposit cancelled", description: "Your payment was not completed.", variant: "destructive" });
    }
  }, []);

  const handleDeposit = async () => {
    const amt = Number(depositAmount);
    if (!amt || amt < 10 || amt > 100000) return;
    setDepositPending(true);
    try {
      const { url } = await createCheckoutSession(amt);
      window.location.href = url;
    } catch (err: any) {
      toast({ title: "Deposit failed", description: err.message, variant: "destructive" });
      setDepositPending(false);
    }
  };

  const withdrawMutation = useWithdrawFunds({
    mutation: {
      onSuccess: () => {
        toast({ title: "Withdrawal successful", description: "Funds sent to your linked account." });
        setWithdrawAmount("");
        queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Withdrawal failed", description: err.error || "An error occurred.", variant: "destructive" });
      }
    }
  });

  if (isLoading) {
    return (
      <div className="container py-8 px-4 md:px-6 mx-auto max-w-4xl space-y-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-40 w-full mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container py-8 px-4 md:px-6 mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tighter mb-2">Wallet.</h1>
        <p className="text-muted-foreground">Manage your platform balance.</p>
      </div>

      <Card className="bg-card border-border rounded-none shadow-none">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full text-primary mb-2">
            <WalletIcon className="h-10 w-10" />
          </div>
          <div className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Available Balance</div>
          <div className="text-5xl md:text-6xl font-bold font-mono tracking-tighter">{formatMoney(profile.walletBalance)}</div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Deposit via Stripe */}
        <Card className="bg-card border-border rounded-none shadow-none">
          <CardHeader className="border-b border-border">
            <CardTitle className="font-mono uppercase tracking-widest text-base flex items-center gap-2">
              <ArrowDownToLine className="h-4 w-4 text-primary" />
              Deposit Funds
            </CardTitle>
            <CardDescription className="font-mono text-xs uppercase flex items-center gap-1">
              Secured by Stripe <ExternalLink className="h-3 w-3" />
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="deposit" className="text-xs uppercase font-mono text-muted-foreground">Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                <Input
                  id="deposit"
                  type="number"
                  placeholder="Min 10"
                  className="pl-8 font-mono rounded-none"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min={10}
                  max={100000}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-muted/30 p-3">
              <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
              <span>You'll be redirected to Stripe's secure checkout page.</span>
            </div>
            <Button 
              className="w-full rounded-none font-bold tracking-tight h-12"
              onClick={handleDeposit}
              disabled={!depositAmount || Number(depositAmount) < 10 || Number(depositAmount) > 100000 || depositPending}
            >
              {depositPending ? "REDIRECTING TO STRIPE..." : "DEPOSIT WITH STRIPE"}
            </Button>
          </CardContent>
        </Card>

        {/* Withdraw Form */}
        <Card className="bg-card border-border rounded-none shadow-none">
          <CardHeader className="border-b border-border">
            <CardTitle className="font-mono uppercase tracking-widest text-base flex items-center gap-2">
              <ArrowUpFromLine className="h-4 w-4 text-primary" />
              Withdraw Funds
            </CardTitle>
            <CardDescription className="font-mono text-xs uppercase">Transfer to external account.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="withdraw" className="text-xs uppercase font-mono text-muted-foreground">Amount (USD)</Label>
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-xs font-mono text-primary uppercase"
                  onClick={() => setWithdrawAmount(profile.walletBalance.toString())}
                >
                  Max
                </Button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                <Input
                  id="withdraw"
                  type="number"
                  placeholder="Min 1"
                  className="pl-8 font-mono rounded-none"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min={1}
                  max={profile.walletBalance}
                />
              </div>
            </div>
            <Button 
              variant="outline"
              className="w-full rounded-none font-bold tracking-tight h-12 hover:bg-muted"
              onClick={() => withdrawMutation.mutate({ data: { amount: Number(withdrawAmount) } })}
              disabled={!withdrawAmount || Number(withdrawAmount) < 1 || Number(withdrawAmount) > profile.walletBalance || withdrawMutation.isPending}
            >
              {withdrawMutation.isPending ? "PROCESSING..." : "WITHDRAW"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
