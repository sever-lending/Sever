import { useState } from "react";
import { useLocation } from "wouter";
import { 
  useGetLoan, 
  useGetMyProfile, 
  useFundLoan, 
  useCancelLoan, 
  usePayInstallment,
  getGetLoanQueryKey,
  getGetDashboardOverviewQueryKey,
  getGetMyProfileQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@workspace/replit-auth-web";
import { formatMoney, formatPercentage, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ShieldCheck, Calendar, Info, CheckCircle2, Clock, AlertCircle, MessageSquare } from "lucide-react";
import { LoanAgreementModal } from "@/components/loan-agreement-modal";
import { LoanChat } from "@/components/loan-chat";

export function LoanDetail({ id }: { id: string }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [fundAmount, setFundAmount] = useState<string>("");
  const [showAgreement, setShowAgreement] = useState(false);

  const { data: loan, isLoading } = useGetLoan(id, { 
    query: { enabled: !!id, queryKey: getGetLoanQueryKey(id) } 
  });
  const { data: profile } = useGetMyProfile();

  const fundMutation = useFundLoan({
    mutation: {
      onSuccess: () => {
        toast({ title: "Funding successful", description: "You have successfully funded this loan." });
        queryClient.invalidateQueries({ queryKey: getGetLoanQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getGetDashboardOverviewQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
        setFundAmount("");
      },
      onError: (err: any) => {
        toast({ title: "Funding failed", description: err.error || "An error occurred.", variant: "destructive" });
      }
    }
  });

  const cancelMutation = useCancelLoan({
    mutation: {
      onSuccess: () => {
        toast({ title: "Loan cancelled", description: "Your loan request has been cancelled." });
        queryClient.invalidateQueries({ queryKey: getGetLoanQueryKey(id) });
      },
      onError: (err: any) => {
        toast({ title: "Cancellation failed", description: err.error || "An error occurred.", variant: "destructive" });
      }
    }
  });

  const payMutation = usePayInstallment({
    mutation: {
      onSuccess: () => {
        toast({ title: "Payment successful", description: "Your installment has been paid." });
        queryClient.invalidateQueries({ queryKey: getGetLoanQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getGetDashboardOverviewQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Payment failed", description: err.error || "An error occurred.", variant: "destructive" });
      }
    }
  });

  if (isLoading) {
    return (
      <div className="container py-8 px-4 md:px-6 mx-auto max-w-5xl space-y-8">
        <Skeleton className="h-8 w-24 mb-4" />
        <Skeleton className="h-12 w-2/3 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-2 space-y-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!loan) return <div className="p-8 text-center">Loan not found</div>;

  const isBorrower = profile?.id === loan.borrowerId;
  const remainingToFund = loan.principal - loan.fundedAmount;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'funded': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'repaying': return 'bg-primary/10 text-primary border-primary/20';
      case 'repaid': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'defaulted': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'cancelled': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const nextPendingInstallment = loan.schedule.find(i => i.status === 'pending');

  return (
    <div className="container py-8 px-4 md:px-6 mx-auto max-w-5xl space-y-8">
      <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-foreground mb-2" onClick={() => window.history.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> BACK
      </Button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className={`uppercase font-mono tracking-widest ${getStatusColor(loan.status)}`}>
              {loan.status}
            </Badge>
            <span className="text-xs font-mono uppercase text-muted-foreground tracking-widest">
              {loan.purpose.replace('-', ' ')}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-2">{loan.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-card border border-border rounded-none shadow-none">
            <div>
              <div className="text-xs font-mono uppercase text-muted-foreground mb-1">Principal</div>
              <div className="font-bold font-mono text-2xl">{formatMoney(loan.principal)}</div>
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-muted-foreground mb-1">APR</div>
              <div className="font-bold font-mono text-2xl text-primary">{formatPercentage(loan.interestRate)}</div>
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-muted-foreground mb-1">Term</div>
              <div className="font-bold font-mono text-2xl">{loan.termMonths} MO</div>
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-muted-foreground mb-1">Funded</div>
              <div className="font-bold font-mono text-2xl">
                {formatPercentage(loan.fundedAmount / loan.principal * 100)}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tighter uppercase font-mono border-b border-border pb-2">Description</h2>
            <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {loan.description}
            </div>
          </div>

          {/* Borrower Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tighter uppercase font-mono border-b border-border pb-2">Borrower</h2>
            <Card className="bg-card border-border rounded-none shadow-none">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-muted flex items-center justify-center rounded-full text-lg font-bold">
                      {loan.borrowerName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-lg">{loan.borrowerName}</div>
                      <Badge variant="outline" className="uppercase font-mono tracking-widest bg-primary/10 text-primary border-primary/20">
                        {loan.borrowerTier}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isAuthenticated && !isBorrower && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none font-mono gap-1.5"
                        onClick={() => setLocation(`/messages/${loan.borrowerId}`)}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Message
                      </Button>
                    )}
                    <div className="text-right flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-xs font-mono text-muted-foreground uppercase">Trust Score</div>
                        <div className="font-bold font-mono text-xl">{loan.borrowerTrustScore}/1000</div>
                      </div>
                    </div>
                  </div>
                </div>
                {loan.borrowerBio && (
                  <p className="text-sm text-muted-foreground">{loan.borrowerBio}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Schedule */}
          {loan.schedule.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tighter uppercase font-mono border-b border-border pb-2">Repayment Schedule</h2>
              <div className="border border-border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-mono text-xs uppercase">No.</TableHead>
                      <TableHead className="font-mono text-xs uppercase">Due Date</TableHead>
                      <TableHead className="font-mono text-xs uppercase text-right">Amount</TableHead>
                      <TableHead className="font-mono text-xs uppercase">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loan.schedule.map((installment, i) => (
                      <TableRow key={installment.id}>
                        <TableCell className="font-mono">{i + 1}</TableCell>
                        <TableCell className="font-mono">{formatDate(installment.dueDate)}</TableCell>
                        <TableCell className="font-mono text-right font-bold">{formatMoney(installment.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`uppercase font-mono text-[10px] tracking-widest ${
                            installment.status === 'paid' ? 'bg-primary/10 text-primary border-primary/20' : 
                            installment.status === 'late' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                            'text-muted-foreground'
                          }`}>
                            {installment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Fundings */}
          {loan.fundings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tighter uppercase font-mono border-b border-border pb-2">Lenders ({loan.fundings.length})</h2>
              <div className="divide-y divide-border border border-border">
                {loan.fundings.map((funding) => (
                  <div key={funding.id} className="p-4 flex items-center justify-between hover:bg-muted/30">
                    <div className="font-bold">{funding.lenderName}</div>
                    <div className="text-right">
                      <div className="font-mono font-bold">{formatMoney(funding.amount)}</div>
                      <div className="text-xs font-mono text-muted-foreground uppercase">{formatPercentage(funding.sharePct * 100)} Share</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loan Discussion Chat */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tighter uppercase font-mono border-b border-border pb-2">Discussion</h2>
            <LoanChat
              loanId={id}
              myId={profile?.id}
              myUsername={profile?.username ?? null}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card className="bg-card border-border rounded-none shadow-none sticky top-24">
            <CardHeader className="bg-muted/50 border-b border-border pb-4">
              <CardTitle className="font-mono uppercase tracking-widest text-base">Funding Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-mono uppercase">
                  <span className="text-muted-foreground">Raised</span>
                  <span className="font-bold text-primary">{formatMoney(loan.fundedAmount)}</span>
                </div>
                <Progress value={(loan.fundedAmount / loan.principal) * 100} className="h-2 bg-muted rounded-none" />
                <div className="flex justify-between text-xs font-mono text-muted-foreground">
                  <span>{formatPercentage(loan.fundedAmount / loan.principal * 100)}</span>
                  <span>Goal: {formatMoney(loan.principal)}</span>
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span>{formatMoney(loan.originationFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Repayment</span>
                  <span>{formatMoney(loan.totalRepayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Payment</span>
                  <span className="font-bold">{formatMoney(loan.monthlyPayment)}</span>
                </div>
              </div>

              <Separator className="bg-border" />

              {isBorrower ? (
                <div className="space-y-4">
                  {loan.status === 'open' && (
                    <Button 
                      variant="destructive" 
                      className="w-full rounded-none font-bold tracking-tight"
                      onClick={() => cancelMutation.mutate({ id })}
                      disabled={cancelMutation.isPending}
                    >
                      CANCEL LOAN
                    </Button>
                  )}
                  {(loan.status === 'funded' || loan.status === 'repaying') && nextPendingInstallment && (
                    <div className="space-y-2">
                      <div className="p-3 bg-muted/30 border border-border text-sm font-mono text-center">
                        <div className="text-muted-foreground mb-1">Next Payment Due</div>
                        <div className="font-bold">{formatDate(nextPendingInstallment.dueDate)}</div>
                      </div>
                      <Button 
                        className="w-full rounded-none font-bold tracking-tight"
                        onClick={() => payMutation.mutate({ installmentId: nextPendingInstallment.id })}
                        disabled={payMutation.isPending}
                      >
                        PAY {formatMoney(nextPendingInstallment.amount)}
                      </Button>
                    </div>
                  )}
                  {loan.status === 'repaid' && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 text-center font-bold tracking-tight uppercase">
                      LOAN FULLY REPAID
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {loan.status === 'open' ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fundAmount" className="text-xs uppercase font-mono text-muted-foreground">Investment Amount</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                          <Input
                            id="fundAmount"
                            type="number"
                            placeholder="Min 25"
                            className="pl-8 font-mono rounded-none"
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                            min={25}
                            max={remainingToFund}
                          />
                        </div>
                        {fundAmount && Number(fundAmount) > 0 && (
                          <div className="text-xs font-mono text-primary flex items-center gap-1 mt-2">
                            <Info className="h-3 w-3" />
                            Your share: {formatPercentage(Number(fundAmount) / loan.principal * 100)}
                          </div>
                        )}
                      </div>
                      <Button 
                        className="w-full rounded-none font-bold tracking-tight h-12"
                        onClick={() => setShowAgreement(true)}
                        disabled={!fundAmount || Number(fundAmount) < 25 || Number(fundAmount) > remainingToFund || fundMutation.isPending}
                      >
                        REVIEW &amp; FUND
                      </Button>
                      {loan && (
                        <LoanAgreementModal
                          open={showAgreement}
                          role="lender"
                          loanTitle={loan.title}
                          principal={Number(fundAmount) || 0}
                          interestRate={loan.interestRate}
                          termMonths={loan.termMonths}
                          monthlyPayment={loan.monthlyPayment}
                          originationFee={loan.originationFee}
                          onAccept={() => {
                            setShowAgreement(false);
                            fundMutation.mutate({ id, data: { amount: Number(fundAmount) } });
                          }}
                          onCancel={() => setShowAgreement(false)}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 border border-border text-center text-muted-foreground font-mono uppercase text-sm">
                      Funding closed
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
