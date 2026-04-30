import { Link } from "wouter";
import { useListMyLendings, useListMyBorrowings } from "@workspace/api-client-react";
import { formatMoney, formatPercentage } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/empty-state";
import { Briefcase, Activity } from "lucide-react";
import { LoanSummary } from "@workspace/api-client-react";

function LoanCard({ loan, role }: { loan: LoanSummary, role: 'lender' | 'borrower' }) {
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

  return (
    <Link href={`/loans/${loan.id}`} className="block">
      <div className="bg-card border border-border p-6 hover:border-primary/50 transition-colors rounded-none space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="font-bold text-lg hover:underline mb-1">{loan.title}</div>
            <div className="text-sm font-mono text-muted-foreground uppercase flex items-center gap-2">
              <span>{role === 'lender' ? `Borrower: ${loan.borrowerName}` : `Your request`}</span>
              <span>•</span>
              <span>{loan.purpose.replace('-', ' ')}</span>
            </div>
          </div>
          <Badge variant="outline" className={`uppercase font-mono tracking-widest ${getStatusColor(loan.status)}`}>
            {loan.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs font-mono uppercase text-muted-foreground mb-1">Principal</div>
            <div className="font-bold font-mono text-lg">{formatMoney(loan.principal)}</div>
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-muted-foreground mb-1">APR</div>
            <div className="font-bold font-mono text-lg text-primary">{formatPercentage(loan.interestRate)}</div>
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-muted-foreground mb-1">Term</div>
            <div className="font-bold font-mono text-lg">{loan.termMonths} MO</div>
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-muted-foreground mb-1">Funded</div>
            <div className="font-bold font-mono text-lg">
              {formatPercentage(loan.fundedAmount / loan.principal * 100)}
            </div>
          </div>
        </div>

        {loan.status === 'open' && (
          <div className="w-full space-y-1">
            <Progress value={(loan.fundedAmount / loan.principal) * 100} className="h-2 bg-muted rounded-none" />
            <div className="flex justify-between text-xs font-mono text-muted-foreground">
              <span>{formatMoney(loan.fundedAmount)} funded</span>
              <span>{formatMoney(loan.principal)} goal</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

export function Portfolio() {
  const { data: lendings, isLoading: lendingsLoading } = useListMyLendings();
  const { data: borrowings, isLoading: borrowingsLoading } = useListMyBorrowings();

  return (
    <div className="container py-8 px-4 md:px-6 mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tighter mb-2">Portfolio.</h1>
        <p className="text-muted-foreground">Track your active investments and obligations.</p>
      </div>

      <Tabs defaultValue="lending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-none h-12 bg-muted/50 p-1 mb-8">
          <TabsTrigger value="lending" className="rounded-none font-mono uppercase tracking-widest text-xs data-[state=active]:bg-background">
            Lending
          </TabsTrigger>
          <TabsTrigger value="borrowing" className="rounded-none font-mono uppercase tracking-widest text-xs data-[state=active]:bg-background">
            Borrowing
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="lending" className="space-y-4">
          {lendingsLoading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-none" />)
          ) : lendings && lendings.length > 0 ? (
            <div className="grid gap-4">
              {lendings.map(loan => (
                <LoanCard key={loan.id} loan={loan} role="lender" />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Briefcase}
              title="No lending activity"
              description="You haven't funded any loans yet. Check out the marketplace to find opportunities."
              action={<Link href="/marketplace" className="text-primary hover:underline font-bold">Go to Marketplace</Link>}
              className="py-12 border border-border border-dashed rounded-none"
            />
          )}
        </TabsContent>
        
        <TabsContent value="borrowing" className="space-y-4">
          {borrowingsLoading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-none" />)
          ) : borrowings && borrowings.length > 0 ? (
            <div className="grid gap-4">
              {borrowings.map(loan => (
                <LoanCard key={loan.id} loan={loan} role="borrower" />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Activity}
              title="No borrowing activity"
              description="You don't have any active loan requests."
              action={<Link href="/borrow" className="text-primary hover:underline font-bold">Request a Loan</Link>}
              className="py-12 border border-border border-dashed rounded-none"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
