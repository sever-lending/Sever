export function Disclaimer() {
  const effectiveDate = "May 1, 2025";
  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Legal Disclaimer & Risk Disclosure</h1>
      <p className="text-muted-foreground text-sm mb-1">Effective Date: {effectiveDate}</p>
      <p className="text-muted-foreground text-sm mb-8">
        Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-5 mb-8">
        <p className="text-sm font-bold text-destructive uppercase tracking-wide mb-2">IMPORTANT — READ CAREFULLY BEFORE USING THIS PLATFORM</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This disclaimer contains important legal information regarding the risks associated with peer-to-peer lending, the regulatory status of Sever Lending, LLC, and the limitations of our services. By using this Platform, you confirm that you have read and understood this entire Disclaimer. If you do not agree, do not use the Platform.
        </p>
      </div>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">1. Not a Bank or Licensed Financial Institution</h2>
          <p>Sever Lending, LLC is a Delaware-registered technology company and marketplace operator. It is NOT:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>A bank or credit union insured by the FDIC or NCUA</li>
            <li>A licensed money transmitter or payment processor (payment processing is provided by Stripe, Inc.)</li>
            <li>A licensed mortgage broker or consumer lending company</li>
            <li>A broker-dealer registered with FINRA or the SEC</li>
            <li>A registered investment adviser under the Investment Advisers Act of 1940</li>
            <li>A futures commission merchant registered with the CFTC</li>
          </ul>
          <p className="mt-2">Sever does not hold, manage, invest, or guarantee any user funds. All financial transactions occur directly between users through the Platform's infrastructure.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">2. Not a Securities Offering</h2>
          <p>Participation in loan transactions through this Platform does not constitute the purchase or sale of a security as defined under the Securities Act of 1933 or the Securities Exchange Act of 1934. Sever has not registered any offering with the U.S. Securities and Exchange Commission (SEC) or any state securities regulator. Nothing on this Platform constitutes an offer to sell or a solicitation of an offer to buy any security. If a court or regulator determines that any activity on this Platform constitutes a securities transaction, Sever reserves the right to immediately suspend or modify such activity to achieve compliance.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">3. Investment Risk — Lender Disclosures</h2>
          <p>By participating as a lender, you expressly acknowledge and represent that:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Loans are <strong className="text-foreground">NOT insured</strong> by the FDIC, NCUA, or any federal or state government agency</li>
            <li>You may lose <strong className="text-foreground">the entire principal amount</strong> of any loan you fund</li>
            <li>Sever makes no representations or warranties regarding the creditworthiness, financial condition, or repayment ability of any borrower</li>
            <li>Trust scores and creditworthiness indicators are informational tools, not guarantees</li>
            <li>Past loan performance on the Platform does not predict future results</li>
            <li>You are solely responsible for all lending decisions</li>
            <li>You should only invest funds you can afford to lose entirely</li>
            <li>Diversification across multiple loans does not eliminate risk of loss</li>
            <li>There is no secondary market for loans originated on this Platform; your funds may be illiquid for the full loan term</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">4. Borrower Disclosures</h2>
          <p>By participating as a borrower, you acknowledge that:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>You are entering into a legally binding loan agreement with one or more individual lenders</li>
            <li>You are obligated to repay the full principal plus interest per the agreed schedule</li>
            <li>Default or late payment may result in collection action by lenders or their assigns, including civil litigation</li>
            <li>Your payment history may be reported to national consumer credit reporting agencies (Equifax, Experian, TransUnion), which may affect your credit score</li>
            <li>A 1.5% origination fee (or 1.0% for Premium members) will be deducted from the disbursed amount</li>
            <li>Late fees apply after a 3-day grace period: $5.00 plus 2% of the outstanding installment</li>
            <li>Three or more consecutive missed payments may result in the entire remaining balance becoming immediately due</li>
            <li>Providing false financial information is prohibited and may constitute fraud under federal and state law</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">5. No Financial, Legal, or Tax Advice</h2>
          <p>Nothing on this Platform constitutes financial advice, investment advice, legal advice, or tax advice. All content is provided for informational and operational purposes only. Loan rates, terms, and trust scores displayed on the Platform are informational and do not constitute recommendations. You should consult a qualified and licensed financial adviser, attorney, or tax professional before making any lending, borrowing, or investment decision. Sever is not responsible for any financial, legal, or tax consequences arising from your use of the Platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">6. State Regulatory Compliance</h2>
          <p>Peer-to-peer lending is subject to regulation at the state level. Requirements vary significantly by state and may include: consumer lending license requirements, usury law caps on interest rates, specific disclosure obligations, and prohibited practices. Sever attempts to comply with applicable state laws; however, it is your sole responsibility to determine whether your participation is lawful in your state. The Platform may be unavailable or restricted in states where our operations would require a state license we do not currently hold. Residents of any such restricted state are not permitted to use lending or borrowing features of the Platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">7. Credit Reporting Disclosure</h2>
          <p>Borrower repayment data — including timely payments, late payments, and defaults — may be furnished to consumer reporting agencies. This reporting is conducted in accordance with the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681 et seq. You have the right to dispute inaccurate information in your credit report directly with the credit reporting agencies. Contact us at compliance@sever.finance for any FCRA-related concerns.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">8. Fair Debt Collection</h2>
          <p>In the event of default, any collection activity will be conducted in compliance with the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692 et seq. Sever does not engage in abusive, deceptive, or unfair collection practices. If you believe collection practices violate the FDCPA, you may file a complaint with the CFPB at consumerfinance.gov/complaint or the FTC at reportfraud.ftc.gov.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">9. Dispute Waiver and Arbitration</h2>
          <p>You waive any right to bring or participate in any class, collective, or representative action against Sever. You agree to resolve all disputes through binding individual arbitration under the AAA Consumer Arbitration Rules, as set forth in full in the Terms of Service. You may opt out of arbitration within 30 days of first accepting the Terms by written notice to legal@sever.finance.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">10. Third-Party Services</h2>
          <p>The Platform integrates third-party services including Stripe (payment processing), identity verification providers, and Google AdSense (advertising). Your use of these services is subject to their respective terms and privacy policies. Sever is not responsible for the actions, policies, or data practices of these third parties.</p>
        </section>

        <section className="border-t border-border pt-6">
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            By using the Sever Platform, you confirm that you have read, understood, and agree to this Legal Disclaimer and Risk Disclosure in its entirety. This disclaimer does not limit rights you may have under applicable federal or state consumer protection laws. For complaints, contact the CFPB at consumerfinance.gov/complaint or call 1-855-411-2372.
          </p>
        </section>
      </div>
    </div>
  );
}
