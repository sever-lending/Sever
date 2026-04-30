import { useState } from "react";
import { Link } from "wouter";
import { useListLoans } from "@workspace/api-client-react";
import { formatMoney, formatPercentage } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Filter, Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export function Marketplace() {
  const [minRate, setMinRate] = useState<string>("");
  const [maxRate, setMaxRate] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("all");

  const queryParams: any = { status: "open" };
  if (minRate) queryParams.minRate = Number(minRate);
  if (maxRate) queryParams.maxRate = Number(maxRate);
  if (purpose && purpose !== "all") queryParams.purpose = purpose;

  const { data: loans, isLoading } = useListLoans(queryParams);

  return (
    <div className="container py-8 px-4 md:px-6 mx-auto space-y-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2">Marketplace.</h1>
          <p className="text-muted-foreground">Fund vetted loans and earn yield.</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border rounded-none shadow-none">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="space-y-2 flex-1 w-full">
              <Label className="text-xs uppercase font-mono tracking-wider text-muted-foreground">Min Rate (%)</Label>
              <Input 
                type="number" 
                placeholder="e.g. 5" 
                value={minRate} 
                onChange={(e) => setMinRate(e.target.value)}
                className="rounded-none font-mono"
              />
            </div>
            <div className="space-y-2 flex-1 w-full">
              <Label className="text-xs uppercase font-mono tracking-wider text-muted-foreground">Max Rate (%)</Label>
              <Input 
                type="number" 
                placeholder="e.g. 20" 
                value={maxRate} 
                onChange={(e) => setMaxRate(e.target.value)}
                className="rounded-none font-mono"
              />
            </div>
            <div className="space-y-2 flex-1 w-full">
              <Label className="text-xs uppercase font-mono tracking-wider text-muted-foreground">Purpose</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger className="rounded-none font-mono">
                  <SelectValue placeholder="All purposes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Purposes</SelectItem>
                  <SelectItem value="debt-consolidation">Debt Consolidation</SelectItem>
                  <SelectItem value="home-improvement">Home Improvement</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-none" />)
        ) : loans && loans.length > 0 ? (
          loans.map((loan, index) => (
            <motion.div
              key={loan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-card border-border hover:border-primary/50 transition-colors rounded-none shadow-none overflow-hidden group">
                <div className="p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">{loan.borrowerName}</span>
                        <Badge variant="outline" className="uppercase font-mono tracking-widest bg-primary/10 text-primary border-primary/20">
                          {loan.borrowerTier}
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">SCORE: {loan.borrowerTrustScore}</span>
                      </div>
                      <Badge variant="secondary" className="uppercase font-mono tracking-widest w-fit">
                        {loan.purpose}
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

                    <div className="w-full space-y-1">
                      <Progress value={(loan.fundedAmount / loan.principal) * 100} className="h-2 bg-muted rounded-none" />
                      <div className="flex justify-between text-xs font-mono text-muted-foreground">
                        <span>{formatMoney(loan.fundedAmount)}</span>
                        <span>{formatMoney(loan.principal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto flex-shrink-0 flex justify-end">
                    <Button asChild className="rounded-none font-bold tracking-tight w-full md:w-32 h-12" size="lg">
                      <Link href={`/loans/${loan.id}`}>FUND LOAN</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <EmptyState
            icon={Search}
            title="No loans found"
            description="Try adjusting your filters or check back later for new loan requests."
            className="py-12 border-border border border-dashed rounded-none"
          />
        )}
      </div>
    </div>
  );
}
