export function LoanContract() {
  const effectiveDate = "May 1, 2025";
  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Loan Agreement & Promissory Note Template</h1>
      <p className="text-muted-foreground text-sm mb-1">Effective Date: {effectiveDate}</p>
      <p className="text-muted-foreground text-sm mb-8">
        This template governs all peer-to-peer loans executed through the Sever Platform. Each executed loan will incorporate the specific terms shown in the loan listing at the time of funding.
      </p>

      <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 mb-8">
        <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">Federal Truth in Lending Act (TILA) — Required Disclosure</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Before any loan is consummated, the specific Annual Percentage Rate (APR), Finance Charge, Amount Financed, Total of Payments, and Payment Schedule will be disclosed to the Borrower as required by the Truth in Lending Act, 15 U.S.C. § 1601 et seq., and Regulation Z (12 C.F.R. Part 1026). These disclosures will appear in the loan confirmation screen prior to acceptance.
        </p>
      </div>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">PROMISSORY NOTE AND PEER-TO-PEER LOAN AGREEMENT</h2>
          <p>This Peer-to-Peer Loan Agreement and Promissory Note ("Agreement") is entered into between the identified Borrower and the Lender(s) as specified in the applicable loan listing on the Sever Platform. Sever Financial, LLC ("Platform Operator") is a non-party facilitator and marketplace intermediary. This Agreement is not a loan from Sever Financial, LLC.</p>
          <p className="mt-3 text-xs text-muted-foreground/70">This Agreement is entered into electronically and is governed by the Electronic Signatures in Global and National Commerce Act (E-SIGN Act), 15 U.S.C. § 7001 et seq., and applicable state electronic transactions laws.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 1 — Loan Terms and TILA Disclosures</h2>
          <p>The Lender(s) agree to advance to the Borrower the principal amount specified in the loan listing ("Principal Amount"). The Borrower unconditionally promises to pay to the Lender(s) the Principal Amount plus interest, fees, and charges as specified below:</p>
          <div className="rounded border border-border bg-card/50 p-4 mt-3 space-y-2 font-mono text-xs">
            <div className="flex justify-between"><span>Principal Amount (Amount Financed):</span><span className="text-foreground">[As shown in loan listing]</span></div>
            <div className="flex justify-between"><span>Annual Percentage Rate (APR):</span><span className="text-foreground">[As shown in loan listing]</span></div>
            <div className="flex justify-between"><span>Finance Charge (total interest cost):</span><span className="text-foreground">[Calculated at consummation]</span></div>
            <div className="flex justify-between"><span>Origination Fee:</span><span className="text-foreground">1.5% of Principal (deducted)</span></div>
            <div className="flex justify-between"><span>Total of Payments:</span><span className="text-foreground">[Principal + Finance Charge]</span></div>
            <div className="flex justify-between"><span>Payment Schedule:</span><span className="text-foreground">[Monthly installments as listed]</span></div>
            <div className="flex justify-between"><span>Loan Term:</span><span className="text-foreground">[As shown in loan listing]</span></div>
          </div>
          <p className="mt-3 text-xs">The origination fee of 1.5% of the Principal Amount (1.0% for Premium subscribers) will be deducted from the disbursement by the Platform Operator upon full funding. Premium subscribers who are verified at the time of origination will receive the reduced rate.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 2 — Repayment Schedule</h2>
          <p>The Borrower shall make equal monthly installment payments (each, an "Installment") on the same calendar day each month following the loan funding date ("Due Date"). Each Installment is calculated using standard amortization to include:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Principal amortization component</li>
            <li>Accrued interest at the stated APR, calculated on a 30/360-day basis</li>
          </ul>
          <p className="mt-2">A grace period of three (3) calendar days from the Due Date is provided before a payment is classified as late. The exact payment amount and schedule will be presented to the Borrower before loan acceptance as a TILA disclosure.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 3 — Late Payments, Default, and Collections</h2>
          <p><strong className="text-foreground">Late Fee:</strong> If any Installment is not received within three (3) calendar days of its Due Date, a late fee equal to the greater of (a) $5.00 or (b) 2% of the overdue Installment amount shall be assessed and added to the outstanding balance. Late fees are capped as required by applicable state usury laws.</p>
          <p className="mt-2"><strong className="text-foreground">Default:</strong> A Default occurs if: (a) the Borrower fails to pay three (3) or more consecutive Installments; (b) the Borrower files for or has filed against them a petition in bankruptcy; (c) the Borrower makes a material misrepresentation in their loan application; or (d) any other event occurs that materially impairs the Lender's security or the Borrower's ability to repay.</p>
          <p className="mt-2"><strong className="text-foreground">Acceleration:</strong> Upon Default, the entire unpaid principal balance, accrued interest, and all outstanding fees shall become immediately due and payable at the election of the Lender(s).</p>
          <p className="mt-2"><strong className="text-foreground">Collections:</strong> Upon Default, Lenders or their assigns may pursue collection through available legal channels, including civil litigation. Any collection activity will comply with the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692 et seq. Borrowers may contact the CFPB at consumerfinance.gov/complaint for FDCPA-related complaints.</p>
          <p className="mt-2"><strong className="text-foreground">Credit Reporting:</strong> Late payments and defaults may be reported to national consumer reporting agencies (Equifax, Experian, TransUnion) in accordance with the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681 et seq.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 4 — Prepayment</h2>
          <p>The Borrower may prepay the entire outstanding principal balance and accrued interest in full at any time without prepayment penalty. No partial prepayments are accepted; prepayment must cover the full outstanding balance. Prepayment does not result in a refund of the origination fee, which is earned upon loan funding. Upon full prepayment, all Lender interests in the loan are extinguished.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 5 — Lender Rights and Acknowledgments</h2>
          <p>Each Lender's rights under this Agreement are proportional to their percentage of the funded loan principal. Each Lender expressly acknowledges that:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>This is an unsecured loan; the Lender has no collateral interest in any specific Borrower asset</li>
            <li>There is no guarantee of repayment; the Lender may lose the entire funded amount</li>
            <li>The Platform Operator is not a co-signer, guarantor, or insurer of this loan</li>
            <li>The Lender's sole recourse upon Default is through legal channels available to creditors under applicable state law</li>
            <li>Loans originated through the Platform are not FDIC-insured, NCUA-insured, or backed by any government entity</li>
            <li>There is no liquid secondary market for this loan obligation</li>
            <li>The Lender has made an independent lending decision without relying on any Platform representation regarding the Borrower's creditworthiness</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 6 — Equal Credit Opportunity Act (ECOA) Compliance</h2>
          <p>All lending and borrowing activity on the Platform must comply with the Equal Credit Opportunity Act (ECOA), 15 U.S.C. § 1691 et seq., and Regulation B (12 C.F.R. Part 1002). No person may be discriminated against in lending on the basis of race, color, religion, national origin, sex, marital status, age, receipt of public assistance income, or the exercise of rights under the Consumer Credit Protection Act. Any suspected ECOA violation may be reported to the CFPB at consumerfinance.gov/complaint.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 7 — Electronic Signatures and Record-Keeping</h2>
          <p>By clicking "Confirm," "Fund Loan," or "Post Loan Request" on the Platform, the Borrower and Lender(s) acknowledge that such action constitutes a legally binding electronic signature under the Electronic Signatures in Global and National Commerce Act (E-SIGN Act), 15 U.S.C. § 7001 et seq., the Uniform Electronic Transactions Act (UETA) as adopted in applicable states, and any other applicable electronic signature laws.</p>
          <p className="mt-2">The Platform maintains a digitally timestamped record of each Agreement, including: the user IDs of all parties, date and time of acceptance, loan terms accepted, IP address and device fingerprint of each party, and the full text of this Agreement as it existed at time of execution. You have the right to receive and retain a copy of this Agreement in paper or electronic form.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 8 — Usury Law Compliance</h2>
          <p>The interest rate applicable to each loan is set by the parties and must comply with the usury laws of the state in which the Borrower resides. The Platform does not guarantee that any stated interest rate is permissible in all jurisdictions. If a court of competent jurisdiction determines that the stated interest rate exceeds the maximum rate permitted by applicable law, the interest rate will be reduced to the maximum permissible rate, and any excess interest paid will be applied to reduce the outstanding principal.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 9 — Platform as Non-Party Intermediary</h2>
          <p>Sever Financial, LLC acts solely as a marketplace operator and technology intermediary. The Platform Operator is NOT a party to this Agreement, does not originate or fund loans, does not act as agent for either party, and is not responsible for collection of defaulted loans beyond the facilitation services described in the Terms of Service. All obligations under this Agreement run directly between the Borrower and Lender(s).</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 10 — Dispute Resolution</h2>
          <p>Any dispute between Borrower and Lender(s) arising from this Agreement shall first be submitted through the Platform's dispute resolution process. If unresolved, disputes shall be submitted to binding arbitration under the AAA Consumer Arbitration Rules, or if not applicable, to courts of competent jurisdiction in the state of the Borrower's residence. Disputes between users and Sever Financial, LLC are governed by the arbitration provision in the Terms of Service.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Article 11 — Governing Law</h2>
          <p>This Agreement is governed by the laws of the State of Delaware, without regard to conflict of law principles, except: (a) usury law compliance is governed by the Borrower's state of residence; (b) the E-SIGN Act and UETA govern electronic signature validity; (c) TILA, ECOA, FCRA, and FDCPA are governed by applicable federal law; and (d) mandatory state consumer protection provisions of the Borrower's state apply to the extent required by law.</p>
        </section>

        <section className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs text-primary font-bold uppercase tracking-wide mb-1">Electronic Acceptance Notice</p>
          <p className="text-xs mt-1 leading-relaxed">
            When a user clicks "Fund Loan" or submits a loan request on the Platform, they are providing an electronic signature on this Agreement with respect to that specific transaction. Prior to confirmation, the full TILA disclosures (including APR, Finance Charge, Amount Financed, Total of Payments, and Payment Schedule) specific to that loan will be displayed and must be reviewed. By proceeding, the user confirms they have read and understood all disclosures and agree to be legally bound by this Agreement.
          </p>
        </section>
      </div>
    </div>
  );
}
