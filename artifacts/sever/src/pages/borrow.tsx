import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useCreateLoanRequest } from "@workspace/api-client-react";
import { formatMoney, formatPercentage } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Info } from "lucide-react";
import { CreateLoanBodyPurpose } from "@workspace/api-client-react";

export function Borrow() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [principal, setPrincipal] = useState<number>(5000);
  const [interestRate, setInterestRate] = useState<number>(10);
  const [termMonths, setTermMonths] = useState<number>(12);
  const [purpose, setPurpose] = useState<CreateLoanBodyPurpose>("other");
  const [description, setDescription] = useState("");

  const createMutation = useCreateLoanRequest({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Loan request created", description: "Your loan is now live on the marketplace." });
        setLocation(`/loans/${data.id}`);
      },
      onError: (err: any) => {
        toast({ title: "Request failed", description: err.error || "An error occurred.", variant: "destructive" });
      }
    }
  });

  // Calculations
  const originationFee = useMemo(() => principal * 0.015, [principal]);
  const monthlyPayment = useMemo(() => {
    if (!principal || !interestRate || !termMonths) return 0;
    const r = interestRate / 100 / 12;
    const n = termMonths;
    if (r === 0) return principal / n;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  }, [principal, interestRate, termMonths]);
  
  const totalRepayment = useMemo(() => monthlyPayment * termMonths, [monthlyPayment, termMonths]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      data: {
        title,
        principal,
        interestRate,
        termMonths,
        purpose,
        description
      }
    });
  };

  return (
    <div className="container py-8 px-4 md:px-6 mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tighter mb-2">Borrow.</h1>
        <p className="text-muted-foreground">Request capital on your own terms. Platform fee is 1.5%.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card border-border rounded-none shadow-none">
          <form onSubmit={handleSubmit}>
            <CardHeader className="border-b border-border">
              <CardTitle className="font-mono uppercase tracking-widest text-base">Loan Parameters</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs uppercase font-mono text-muted-foreground tracking-wider">Loan Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Home Renovation Project" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  maxLength={80}
                  required 
                  className="font-mono rounded-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="principal" className="text-xs uppercase font-mono text-muted-foreground tracking-wider">Principal</Label>
                    <span className="font-mono font-bold text-primary">{formatMoney(principal)}</span>
                  </div>
                  <Slider 
                    id="principal"
                    min={100} 
                    max={50000} 
                    step={100} 
                    value={[principal]} 
                    onValueChange={(v) => setPrincipal(v[0])}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>$100</span>
                    <span>$50,000</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="interestRate" className="text-xs uppercase font-mono text-muted-foreground tracking-wider">APR (%)</Label>
                    <span className="font-mono font-bold text-primary">{formatPercentage(interestRate)}</span>
                  </div>
                  <Slider 
                    id="interestRate"
                    min={1} 
                    max={35} 
                    step={0.5} 
                    value={[interestRate]} 
                    onValueChange={(v) => setInterestRate(v[0])}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>1%</span>
                    <span>35%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="termMonths" className="text-xs uppercase font-mono text-muted-foreground tracking-wider">Term (Months)</Label>
                    <span className="font-mono font-bold text-primary">{termMonths} MO</span>
                  </div>
                  <Slider 
                    id="termMonths"
                    min={3} 
                    max={60} 
                    step={1} 
                    value={[termMonths]} 
                    onValueChange={(v) => setTermMonths(v[0])}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>3 MO</span>
                    <span>60 MO</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose" className="text-xs uppercase font-mono text-muted-foreground tracking-wider">Purpose</Label>
                  <Select value={purpose} onValueChange={(v) => setPurpose(v as CreateLoanBodyPurpose)}>
                    <SelectTrigger id="purpose" className="font-mono rounded-none">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
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

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs uppercase font-mono text-muted-foreground tracking-wider">Description (Why do you need this loan?)</Label>
                <Textarea 
                  id="description" 
                  placeholder="Explain to potential lenders why they should fund your request..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  minLength={10}
                  maxLength={600}
                  required
                  className="min-h-[120px] font-mono rounded-none"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t border-border p-6">
              <Button 
                type="submit" 
                className="w-full rounded-none font-bold tracking-tight h-12 text-lg"
                disabled={createMutation.isPending || !title || !description}
              >
                {createMutation.isPending ? "SUBMITTING..." : "CREATE LOAN REQUEST"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Live Preview */}
        <div className="space-y-6">
          <Card className="bg-card border-border rounded-none shadow-none sticky top-24">
            <CardHeader className="bg-muted/50 border-b border-border pb-4">
              <CardTitle className="font-mono uppercase tracking-widest text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                Repayment Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="text-xs uppercase font-mono text-muted-foreground mb-1">Monthly Payment</div>
                  <div className="font-bold font-mono text-3xl">{formatMoney(monthlyPayment)}</div>
                </div>

                <div className="h-px w-full bg-border" />

                <div className="space-y-3 text-sm font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Principal Requested</span>
                    <span>{formatMoney(principal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-destructive">
                    <span>Origination Fee (1.5%)</span>
                    <span>-{formatMoney(originationFee)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span>Net to Wallet</span>
                    <span>{formatMoney(principal - originationFee)}</span>
                  </div>
                </div>

                <div className="h-px w-full bg-border" />

                <div className="space-y-3 text-sm font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Interest</span>
                    <span>{formatMoney(totalRepayment - principal)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-primary">
                    <span>Total Repayment</span>
                    <span>{formatMoney(totalRepayment)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
