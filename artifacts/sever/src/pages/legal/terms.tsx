export function Terms() {
  const effectiveDate = "May 1, 2025";
  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
      <div className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-1">Effective Date: {effectiveDate}</p>
        <p className="text-muted-foreground text-sm mb-8">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 mb-8">
          <p className="text-sm font-semibold text-yellow-400">IMPORTANT NOTICE</p>
          <p className="text-sm text-muted-foreground mt-1">
            Sever is a technology marketplace, NOT a bank, licensed lender, broker-dealer, or investment adviser.
            Loans are made directly between users. All lending and borrowing activities carry risk of loss.
            This platform is available only to U.S. residents aged 18 or older.
          </p>
        </div>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the Sever platform, mobile application, or any related services (collectively, the "Platform"), you agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and our Risk Disclaimer. If you do not agree to all Terms, you must immediately cease use of the Platform. Sever Financial, LLC ("Sever," "we," "us," or "our") reserves the right to modify these Terms at any time upon notice posted to the Platform. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Nature of Platform — Not a Bank or Lender</h2>
            <p>Sever is a peer-to-peer lending marketplace and technology intermediary. Sever does not:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Originate, fund, guarantee, or underwrite any loan</li>
              <li>Act as a bank, credit union, or licensed money transmitter</li>
              <li>Provide investment advice, broker-dealer services, or securities offerings</li>
              <li>Hold user funds in trust or as a custodian</li>
              <li>Guarantee repayment of any loan listed on the Platform</li>
            </ul>
            <p className="mt-2">All loan agreements are entered into solely between the Borrower and Lender(s). Sever facilitates matching, payment processing through third-party processors, and record-keeping only.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Eligibility Requirements</h2>
            <p>To use the Platform, you must:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Be at least 18 years of age</li>
              <li>Be a legal resident of the United States</li>
              <li>Reside in a state where peer-to-peer lending activity is lawful (see Section 4)</li>
              <li>Have a valid Social Security Number or ITIN for identity verification</li>
              <li>Successfully complete KYC/AML identity verification</li>
              <li>Maintain a valid U.S. bank account or payment method</li>
              <li>Not be prohibited from financial transactions under U.S. law, including OFAC sanctions lists</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. State Restrictions and Regulatory Compliance</h2>
            <p>Peer-to-peer lending activity is subject to state-level consumer lending and usury laws. The Platform may restrict or limit participation by residents of certain states. It is your sole responsibility to verify that your participation is lawful in your state. Residents of states where peer-to-peer lending is prohibited or requires specific state licensing are not permitted to use the Platform. Sever makes no representation that the Platform is available or appropriate for all U.S. jurisdictions. Interest rates on all loans are set by the parties and must comply with applicable state usury laws; Sever does not guarantee any particular rate is permissible in your state.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Identity Verification (KYC/AML)</h2>
            <p>Sever is required to collect and verify your identity to comply with the Bank Secrecy Act (BSA), the USA PATRIOT Act, and applicable Anti-Money Laundering (AML) regulations. You agree to provide accurate, complete, and current identity information. We use third-party identity verification services. We may report suspicious activity to FinCEN or other applicable authorities as required by law. Provision of false information is a federal crime under 18 U.S.C. § 1001.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Fees and Revenue</h2>
            <p>The following fees apply:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong className="text-foreground">Origination Fee:</strong> 1.5% of the funded principal (1.0% for Premium members), deducted from disbursement. This is a one-time fee charged when a loan is fully funded.</li>
              <li><strong className="text-foreground">Late Payment Fee:</strong> $5.00 plus 2% of the outstanding installment per occurrence, assessed after a 3-day grace period. Sever retains 50% of late fees collected.</li>
              <li><strong className="text-foreground">Premium Subscription:</strong> $9.99/month, billed through the applicable app store or payment processor, subject to the subscriber's separate agreement with that processor. Cancel anytime.</li>
            </ul>
            <p className="mt-2">All fees are disclosed prior to transaction completion and are non-refundable. Fees disclosed in the loan listing constitute Truth in Lending Act (TILA) disclosures for the transaction.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Truth in Lending Act (TILA) Disclosures</h2>
            <p>Sever facilitates disclosure of TILA-required information for each loan transaction, including: Annual Percentage Rate (APR), Finance Charge, Amount Financed, Total of Payments, and Payment Schedule. These disclosures are presented to both Borrower and Lender before any transaction is confirmed. Borrowers have the right to receive accurate cost-of-credit disclosures under 15 U.S.C. § 1638.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Equal Credit Opportunity (ECOA)</h2>
            <p>Sever and all users of this Platform are prohibited from discriminating against any loan applicant on the basis of race, color, religion, national origin, sex, marital status, age (provided the applicant has capacity to contract), the fact that all or part of the applicant's income derives from public assistance, or the fact that the applicant has in good faith exercised any right under the Consumer Credit Protection Act, in accordance with the Equal Credit Opportunity Act (ECOA), 15 U.S.C. § 1691 et seq. If you believe you have been discriminated against, you may contact the Consumer Financial Protection Bureau (CFPB) at consumerfinance.gov/complaint.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Risk Disclosure</h2>
            <p>Peer-to-peer lending involves substantial risk. You expressly acknowledge that:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Loans are NOT insured by the FDIC, NCUA, or any government agency</li>
              <li>Lenders may lose the entire principal amount invested</li>
              <li>Sever does not guarantee repayment of any loan</li>
              <li>Borrower creditworthiness assessments are not guarantees</li>
              <li>Past loan performance is not indicative of future results</li>
              <li>You should only invest funds you can afford to lose entirely</li>
              <li>Sever is not a registered investment adviser under the Investment Advisers Act of 1940</li>
              <li>Participation on this Platform does not constitute a securities transaction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. User Obligations</h2>
            <p>You agree to: (a) provide accurate, current, and complete information at all times; (b) not use the Platform for any unlawful purpose, including money laundering or terrorist financing; (c) not engage in fraudulent misrepresentation or identity fraud; (d) repay all borrowed amounts per the agreed loan schedule; (e) maintain the security of your account credentials and notify us immediately of any unauthorized access; (f) not circumvent any technical or security measures of the Platform; (g) not use automated means to access the Platform without authorization.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Intellectual Property</h2>
            <p>All content, trademarks, service marks, logos, and intellectual property on the Platform are owned by or licensed to Sever. You are granted a limited, non-exclusive, non-transferable license to use the Platform for personal, non-commercial purposes. You may not copy, reproduce, distribute, or create derivative works from any Platform content without express written permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SEVER, ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING FROM: (A) YOUR USE OF OR INABILITY TO USE THE PLATFORM; (B) ANY LOAN DEFAULT OR LOSS OF FUNDS; (C) ANY UNAUTHORIZED ACCESS TO YOUR ACCOUNT; (D) ANY THIRD-PARTY CONDUCT ON THE PLATFORM. SEVER'S TOTAL CUMULATIVE LIABILITY SHALL NOT EXCEED THE GREATER OF (I) THE FEES PAID BY YOU TO SEVER IN THE THREE (3) MONTHS PRECEDING THE CLAIM OR (II) $100. SOME STATES DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR LIABILITY FOR INCIDENTAL DAMAGES, SO THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">13. Indemnification</h2>
            <p>You agree to defend, indemnify, and hold harmless Sever and its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in connection with: your use of the Platform; your violation of these Terms; your violation of any third-party rights; or any inaccurate information you provide.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">14. Dispute Resolution — Binding Arbitration</h2>
            <p>PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS.</p>
            <p className="mt-2">Any dispute, claim, or controversy arising out of or relating to these Terms or the Platform shall be resolved by binding individual arbitration administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules, except that either party may seek injunctive or other equitable relief in a court of competent jurisdiction to prevent unauthorized use of intellectual property or for emergency relief.</p>
            <p className="mt-2"><strong className="text-foreground">CLASS ACTION WAIVER:</strong> YOU WAIVE ANY RIGHT TO BRING OR PARTICIPATE IN ANY CLASS, COLLECTIVE, OR REPRESENTATIVE ACTION. All claims must be brought on an individual basis.</p>
            <p className="mt-2"><strong className="text-foreground">OPT-OUT RIGHT:</strong> You may opt out of this arbitration agreement by sending written notice to legal@sever.finance within 30 days of first accepting these Terms. If you opt out, disputes will be resolved in courts of competent jurisdiction in Delaware.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">15. CFPB Rights</h2>
            <p>As a consumer, you have the right to submit complaints about financial products and services to the Consumer Financial Protection Bureau (CFPB). You may submit a complaint at consumerfinance.gov/complaint or by calling 1-855-411-2372. Sever will respond to CFPB inquiries as required by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">16. Termination</h2>
            <p>Sever may suspend or terminate your account at any time for violation of these Terms, suspicious or fraudulent activity, failure to complete KYC verification, or for any other reason at our discretion. Upon termination, outstanding loan obligations remain enforceable. You may close your account by contacting support, subject to resolution of any outstanding loan balances.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">17. Governing Law</h2>
            <p>These Terms are governed by the laws of the State of Delaware, without regard to conflict of law principles, except that the Federal Arbitration Act governs all arbitration provisions. Where state-specific consumer protection laws apply (including CFPB rules), those laws supplement these Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">18. Contact and Complaints</h2>
            <div className="space-y-1">
              <p>Legal: legal@sever.finance</p>
              <p>Privacy: privacy@sever.finance</p>
              <p>Support: support@sever.finance</p>
              <p>Compliance: compliance@sever.finance</p>
              <p className="mt-2">CFPB Complaints: consumerfinance.gov/complaint | 1-855-411-2372</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
