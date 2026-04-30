import { useGetLenderLeaderboard } from "@workspace/api-client-react";
import { formatMoney } from "@/lib/formatters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, ShieldCheck } from "lucide-react";

export function Lenders() {
  const { data: lenders, isLoading } = useGetLenderLeaderboard();

  return (
    <div className="container py-8 px-4 md:px-6 mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tighter mb-2">Leaderboard.</h1>
        <p className="text-muted-foreground">Top capital providers on the network.</p>
      </div>

      <div className="border border-border bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16 font-mono text-xs uppercase">Rank</TableHead>
              <TableHead className="font-mono text-xs uppercase">Lender</TableHead>
              <TableHead className="font-mono text-xs uppercase text-right">Total Supplied</TableHead>
              <TableHead className="font-mono text-xs uppercase text-right hidden sm:table-cell">Loans Funded</TableHead>
              <TableHead className="font-mono text-xs uppercase text-right">Trust Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-6 rounded-none" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32 rounded-none" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 ml-auto rounded-none" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-12 ml-auto rounded-none" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 ml-auto rounded-none" /></TableCell>
                </TableRow>
              ))
            ) : lenders && lenders.length > 0 ? (
              lenders.map((lender, index) => (
                <TableRow key={lender.userId} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-bold text-muted-foreground">
                    {index < 3 ? (
                      <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                        index === 1 ? 'bg-gray-400/20 text-gray-400' : 
                        'bg-orange-600/20 text-orange-600'
                      }`}>
                        <Trophy className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center h-8 w-8">
                        {index + 1}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold">{lender.displayName}</span>
                      <Badge variant="outline" className="w-fit mt-1 text-[10px] uppercase font-mono tracking-widest bg-primary/10 text-primary border-primary/20">
                        {lender.tier}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-primary">
                    {formatMoney(lender.totalLent)}
                  </TableCell>
                  <TableCell className="text-right font-mono hidden sm:table-cell">
                    {lender.loansFunded}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1 font-mono font-bold bg-muted px-2 py-1">
                      <ShieldCheck className="h-3 w-3 text-primary" />
                      {lender.trustScore}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground font-mono uppercase text-sm">
                  No lenders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
