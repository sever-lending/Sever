export function LoanContract() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Loan Agreement Template</h1>
      <p className="text-muted-foreground text-sm mb-8">This template governs all peer-to-peer loans executed through the Sever Platform.</p>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">PROMISSORY NOTE AND LOAN AGREEMENT</h2>
          <p>This Loan Agreement ("Agreement") is entered into between the Borrower and Lender(s) as identified in the loan listing on the Sever Platform, and is facilitated by Sever Financial, LLC ("Platform Operator") as a non-party intermediary.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 1 — Loan Terms</h2>
          <p>The Lender(s) agree to advance to the Borrower the principal amount specified in the loan listing ("Principal"). The Borrower promises to repay the Principal plus interest calculated at the Annual Percentage Rate (APR) stated in the loan listing, over the number of monthly installments specified. A 1.5% origination fee is deducted from the disbursed amount by the Platform Operator.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 2 — Repayment Schedule</h2>
          <p>The Borrower shall make equal monthly installment payments as calculated at loan origination. Each installment includes principal amortization and accrued interest. Payments are due on the same day of each month following loan funding. A grace period of 3 days is provided before a payment is marked as late.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 3 — Late Payments and Default</h2>
          <p>If any installment is not received within 3 days of its due date, a late fee of $5.00 plus 2% of the installment amount shall be assessed. If the Borrower fails to make three (3) or more consecutive payments, the entire remaining balance shall become immediately due and payable. The Platform Operator reserves the right to pursue collection through available legal channels.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 4 — Prepayment</h2>
          <p>The Borrower may prepay the outstanding balance in full at any time without penalty. Partial prepayments are not accepted; prepayment must cover the entire remaining principal and accrued interest.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 5 — Lender Rights</h2>
          <p>Each Lender's rights are proportional to their funded share of the loan. Lenders acknowledge that: (a) they are making an unsecured loan; (b) there is no guarantee of repayment; (c) their sole recourse in case of default is through the Platform's dispute process and applicable law; (d) the Platform Operator is not a co-signer or guarantor of any loan.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 6 — Electronic Signatures</h2>
          <p>By clicking "Confirm" or "Fund Loan" on the Platform, both Borrower and Lender(s) acknowledge that such action constitutes a legally binding electronic signature under the Electronic Signatures in Global and National Commerce Act (E-SIGN Act) and applicable state law. A digital record of this agreement, including timestamp and user identification, is maintained by the Platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 7 — Governing Law</h2>
          <p>This Agreement is governed by the laws of the State of Delaware. Any disputes arising hereunder shall be resolved through binding arbitration as provided in the Platform's Terms of Service.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 8 — Platform as Intermediary</h2>
          <p>Sever Financial, LLC acts solely as a marketplace operator and is not a party to this Agreement. The Platform facilitates loan matching, payment processing, and record-keeping. The Platform Operator is not responsible for collection of defaulted loans beyond the services described in the Terms of Service.</p>
        </section>

        <section className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs text-primary font-medium">ELECTRONIC ACCEPTANCE</p>
          <p className="text-xs mt-1">When a user clicks "Fund Loan" or submits a loan request on the Platform, they are digitally signing this agreement with respect to that specific transaction. The full terms specific to each loan (principal, rate, term, schedule) are displayed and must be reviewed before confirmation.</p>
        </section>
      </div>
    </div>
  );
}
