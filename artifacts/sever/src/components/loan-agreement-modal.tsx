import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ShieldAlert } from "lucide-react";

interface LoanAgreementModalProps {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
  role: "lender" | "borrower";
  loanTitle: string;
  principal: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment?: number;
  originationFee?: number;
}

export function LoanAgreementModal({
  open,
  onAccept,
  onCancel,
  role,
  loanTitle,
  principal,
  interestRate,
  termMonths,
  monthlyPayment,
  originationFee,
}: LoanAgreementModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [risk, setRisk] = useState(false);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const handleAccept = () => {
    if (agreed && risk) {
      setAgreed(false);
      setRisk(false);
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <DialogTitle>Loan Agreement — Electronic Signature Required</DialogTitle>
          </div>
          <DialogDescription>
            Review and accept the following agreement before proceeding.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 max-h-[50vh]">
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h3 className="font-semibold text-foreground">LOAN DETAILS</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Loan Title</span><div className="font-medium text-foreground mt-0.5">{loanTitle}</div></div>
                <div><span className="text-muted-foreground">Principal Amount</span><div className="font-medium text-foreground mt-0.5">{fmt(principal)}</div></div>
                <div><span className="text-muted-foreground">Interest Rate (APR)</span><div className="font-medium text-foreground mt-0.5">{interestRate}%</div></div>
                <div><span className="text-muted-foreground">Term</span><div className="font-medium text-foreground mt-0.5">{termMonths} months</div></div>
                {monthlyPayment != null && (
                  <div><span className="text-muted-foreground">Monthly Payment</span><div className="font-medium text-foreground mt-0.5">{fmt(monthlyPayment)}</div></div>
                )}
                {originationFee != null && (
                  <div><span className="text-muted-foreground">Origination Fee (1.5%)</span><div className="font-medium text-foreground mt-0.5">{fmt(originationFee)}</div></div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">PROMISSORY NOTE AND LOAN AGREEMENT</h3>
              <p>This agreement is entered into between the Borrower and Lender(s) as identified on the Sever Platform, facilitated by Sever Financial, LLC as a non-party intermediary.</p>

              {role === "borrower" ? (
                <>
                  <p><strong className="text-foreground">As Borrower</strong>, you promise to repay the principal of {fmt(principal)} plus interest at {interestRate}% APR over {termMonths} monthly installments. You authorize Sever to deduct payments from your wallet balance on each due date.</p>
                  <p>A late fee of $5.00 + 2% of the installment is charged for payments received more than 3 days after the due date. Failure to repay may result in collection action and reporting to credit bureaus.</p>
                  <p>A 1.5% origination fee ({fmt(principal * 0.015)}) is retained by Sever upon loan funding.</p>
                </>
              ) : (
                <>
                  <p><strong className="text-foreground">As Lender</strong>, you agree to advance funds toward this loan on an unsecured basis. You understand that repayment is not guaranteed and that you may lose some or all of your invested principal if the Borrower defaults.</p>
                  <p>Your investment is not insured by the FDIC or any government agency. You receive monthly repayments proportional to your funded share, inclusive of principal and interest.</p>
                  <p>Sever retains a 1.5% origination fee from the loan principal, which does not reduce your expected interest income.</p>
                </>
              )}

              <p>By clicking "Accept & Sign", you are providing a legally binding electronic signature under the E-SIGN Act and applicable state law. A timestamped digital record of this agreement will be maintained by Sever Financial, LLC.</p>
            </div>
          </div>
        </ScrollArea>

        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="agree-terms"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(!!v)}
              className="mt-0.5"
            />
            <label htmlFor="agree-terms" className="text-sm leading-snug cursor-pointer">
              I have read and agree to the Loan Agreement, <a href="/legal/terms" className="text-primary hover:underline" target="_blank">Terms of Service</a>, and <a href="/legal/contract" className="text-primary hover:underline" target="_blank">full loan contract</a>.
            </label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="agree-risk"
              checked={risk}
              onCheckedChange={(v) => setRisk(!!v)}
              className="mt-0.5"
            />
            <label htmlFor="agree-risk" className="text-sm leading-snug cursor-pointer">
              <ShieldAlert className="h-3.5 w-3.5 inline mr-1 text-orange-400" />
              {role === "lender"
                ? "I understand that this is a risk investment and I may lose my principal."
                : "I understand that I am legally obligated to repay this loan per the schedule above."}
            </label>
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
            <Button
              onClick={handleAccept}
              disabled={!agreed || !risk}
              className="flex-1"
            >
              Accept &amp; Sign Electronically
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
