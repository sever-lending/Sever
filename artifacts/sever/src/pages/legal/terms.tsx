export function Terms() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
      <div className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the Sever platform ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, do not use the Platform. Sever Financial, LLC ("Sever", "we", "us", or "our") reserves the right to modify these Terms at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Platform Description</h2>
            <p>Sever is a peer-to-peer lending marketplace that connects individual borrowers with individual lenders. Sever does not lend money, is not a bank, and does not provide financial advice. All loans are made directly between users. Sever acts solely as a technology intermediary and marketplace operator.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Eligibility</h2>
            <p>You must be at least 18 years of age and a legal resident of a jurisdiction where peer-to-peer lending is lawful. By using the Platform, you represent and warrant that you meet these requirements. Users are required to complete identity verification before participating in any lending or borrowing activity.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Fees and Revenue</h2>
            <p>Sever charges an origination fee of 1.5% of the total loan principal upon successful funding of a loan. Late payment fees apply at $5.00 plus 2% of the outstanding installment amount per occurrence, of which Sever retains 50%. All fees are disclosed prior to transaction completion and are non-refundable.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Risk Disclosure</h2>
            <p>Peer-to-peer lending involves substantial risk of loss. Lenders may lose some or all of their invested principal if borrowers default. Sever does not guarantee repayment of any loan. Past performance of loans facilitated through the Platform is not indicative of future results. You should only invest funds you can afford to lose entirely.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. User Obligations</h2>
            <p>Users agree to: (a) provide accurate, current, and complete information; (b) not use the Platform for any unlawful purpose; (c) not engage in fraudulent misrepresentation; (d) repay all borrowed amounts per the agreed loan schedule; (e) maintain the security of their account credentials.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, SEVER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE PLATFORM. SEVER'S TOTAL LIABILITY SHALL NOT EXCEED THE FEES PAID BY YOU TO SEVER IN THE THREE (3) MONTHS PRECEDING THE CLAIM.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Dispute Resolution</h2>
            <p>Any disputes arising from these Terms or use of the Platform shall be resolved through binding arbitration under the American Arbitration Association's Consumer Arbitration Rules. You waive any right to a jury trial or class action proceeding.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Governing Law</h2>
            <p>These Terms are governed by the laws of the State of Delaware, without regard to its conflict of law principles.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Contact</h2>
            <p>For questions about these Terms, contact us at: legal@sever.finance</p>
          </section>
        </div>
      </div>
    </div>
  );
}
