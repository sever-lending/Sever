export function Disclaimer() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Legal Disclaimer & Risk Waiver</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 mb-8">
        <p className="text-sm font-semibold text-destructive">IMPORTANT: READ CAREFULLY BEFORE USING THIS PLATFORM</p>
        <p className="text-sm text-muted-foreground mt-1">This disclaimer contains important legal information about risk. Peer-to-peer lending involves the risk of total loss of capital.</p>
      </div>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Not a Financial Institution</h2>
          <p>Sever Financial, LLC is a technology company and marketplace operator, NOT a bank, broker-dealer, investment adviser, or licensed financial institution. Sever does not hold, manage, or invest funds on behalf of any user. The Platform facilitates direct peer-to-peer transactions between users only.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Investment Risk Waiver</h2>
          <p>By participating as a lender on this Platform, you expressly acknowledge and agree that:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Loans made through this Platform are NOT insured by the FDIC or any government agency</li>
            <li>You may lose the entire principal amount of any loan you fund</li>
            <li>Past loan performance does not predict future results</li>
            <li>Sever makes no representations regarding the creditworthiness of any borrower</li>
            <li>You are solely responsible for your lending decisions</li>
            <li>You should only invest funds that you can afford to lose entirely</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">No Financial Advice</h2>
          <p>Nothing on this Platform constitutes financial, investment, legal, or tax advice. All information is provided for informational purposes only. You should consult a qualified financial adviser before making any lending or borrowing decisions.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Regulatory Compliance</h2>
          <p>Peer-to-peer lending may be regulated or prohibited in certain jurisdictions. It is your sole responsibility to determine whether your participation in the Platform is lawful in your jurisdiction. Sever makes no representation that the Platform is appropriate or available for use in any particular location.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Borrower Waiver</h2>
          <p>By participating as a borrower, you acknowledge that: default on a loan may result in collection action; your credit profile and payment history may be reported to third-party services; late fees apply as described in the Terms of Service; and you are legally obligated to repay the full loan amount including interest per the loan agreement.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Dispute Waiver</h2>
          <p>You waive any right to bring class action claims against Sever and agree to resolve all disputes through binding individual arbitration as described in the Terms of Service.</p>
        </section>

        <section className="border-t border-border pt-6">
          <p className="text-xs text-muted-foreground/70">By using the Sever Platform, you confirm that you have read, understood, and agree to this Disclaimer and Risk Waiver in its entirety. If you do not agree, you must immediately cease using the Platform.</p>
        </section>
      </div>
    </div>
  );
}
