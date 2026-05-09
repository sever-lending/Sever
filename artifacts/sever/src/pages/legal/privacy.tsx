export function Privacy() {
  const effectiveDate = "May 1, 2025";
  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
      <div className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-1">Effective Date: {effectiveDate}</p>
        <p className="text-muted-foreground text-sm mb-8">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <p className="text-sm text-muted-foreground mb-8">
          Sever Lending, LLC ("Sever," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, share, and protect your personal information in connection with our peer-to-peer lending marketplace (the "Platform"). This policy applies to U.S. residents and is designed to comply with applicable federal and state privacy laws, including the Gramm-Leach-Bliley Act (GLB Act), the California Consumer Privacy Act (CCPA/CPRA), and other applicable regulations.
        </p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>We collect the following categories of personal information:</p>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li><strong className="text-foreground">Identity Information:</strong> Full legal name, date of birth, Social Security Number or ITIN, government-issued ID documents, and facial biometric data collected during KYC verification via our third-party identity verification provider.</li>
              <li><strong className="text-foreground">Contact Information:</strong> Email address, phone number, and mailing address.</li>
              <li><strong className="text-foreground">Financial Information:</strong> Bank account details, payment card information (processed by Stripe, Inc.), wallet balances, loan amounts, repayment history, and credit-related information.</li>
              <li><strong className="text-foreground">Device and Usage Data:</strong> IP address, device type and identifiers, browser type and version, operating system, pages visited, features used, session duration, and referral URLs.</li>
              <li><strong className="text-foreground">Transaction Data:</strong> Loan applications, funding activity, repayment records, and all financial transactions through the Platform.</li>
              <li><strong className="text-foreground">Communications:</strong> Messages, support requests, and other communications submitted to us.</li>
              <li><strong className="text-foreground">Inferred Data:</strong> Creditworthiness indicators, trust scores, and risk assessments derived from the above data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>We use your personal information to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Operate, maintain, and improve the Platform</li>
              <li>Verify your identity and comply with KYC/AML obligations under the Bank Secrecy Act and USA PATRIOT Act</li>
              <li>Facilitate loan applications, funding, and repayment processing</li>
              <li>Calculate and display trust scores and creditworthiness indicators</li>
              <li>Communicate service updates, account notices, and legally required disclosures</li>
              <li>Detect, investigate, and prevent fraudulent transactions and other illegal activity</li>
              <li>Comply with legal obligations, including reporting to FinCEN, IRS (1099 reporting), and other regulators</li>
              <li>Deliver personalized content and, where permitted, targeted advertising</li>
              <li>Enforce our Terms of Service and protect our legal rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Gramm-Leach-Bliley Act (GLB Act) Notice</h2>
            <p>As a company that facilitates financial transactions, we are subject to the privacy provisions of the Gramm-Leach-Bliley Act (15 U.S.C. § 6801 et seq.). We limit the collection and use of nonpublic personal information (NPI) about you to the minimum necessary. We maintain physical, electronic, and procedural safeguards that comply with federal regulations to guard your NPI. We do not sell your NPI to third parties for their marketing purposes. You have the right to opt out of certain sharing as described below.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Information Sharing and Disclosure</h2>
            <p>We do not sell your personal information for money. We may share your information in the following circumstances:</p>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li><strong className="text-foreground">With Other Users:</strong> Limited profile information (display name, trust score, tier) is visible to other Platform users to facilitate loan matching. Your full identity is not disclosed to other users.</li>
              <li><strong className="text-foreground">Service Providers:</strong> We share data with vendors who assist us in operating the Platform, including Stripe (payment processing), identity verification providers, cloud hosting providers, and analytics services, all under data processing agreements requiring them to protect your data.</li>
              <li><strong className="text-foreground">Credit Reporting:</strong> Loan repayment history may be reported to consumer credit reporting agencies. Late payments and defaults may negatively impact your credit score.</li>
              <li><strong className="text-foreground">Legal Compliance:</strong> We disclose information to law enforcement, courts, regulatory agencies (including FinCEN, IRS, CFPB, and state regulators), and other third parties when required by applicable law, subpoena, court order, or to protect our legal rights.</li>
              <li><strong className="text-foreground">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction, subject to applicable law.</li>
              <li><strong className="text-foreground">With Your Consent:</strong> We may share your information for other purposes with your explicit consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Advertising and Analytics</h2>
            <p>The Platform may display third-party advertisements served by Google AdSense and other advertising networks. These ad partners may use cookies, web beacons, and other tracking technologies to collect information about your use of the Platform and other websites to deliver targeted advertisements. We do not control the data collection practices of these third parties.</p>
            <p className="mt-2">You may opt out of personalized advertising through:</p>
            <ul className="list-disc ml-6 mt-1 space-y-1">
              <li>Google's Ad Settings at adssettings.google.com</li>
              <li>The Digital Advertising Alliance opt-out at optout.aboutads.info</li>
              <li>The Network Advertising Initiative opt-out at optout.networkadvertising.org</li>
              <li>Your browser's privacy settings or an ad-blocking extension</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Cookies and Tracking Technologies</h2>
            <p>We use cookies, local storage, and similar technologies for session authentication, security, preference storage, and analytics. Essential cookies are required for the Platform to function. You may disable non-essential cookies through your browser settings, but this may affect Platform functionality. Our cookie practices comply with applicable law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Data Security</h2>
            <p>We implement industry-standard security measures, including: TLS encryption for all data in transit; AES-256 encryption for sensitive data at rest; access controls and role-based permissions; regular security audits and penetration testing; and incident response procedures. No method of electronic transmission or storage is 100% secure. In the event of a data breach affecting your personal information, we will notify you as required by applicable state breach notification laws (including the requirements of all 50 states) and federal law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Data Retention</h2>
            <p>We retain account and financial transaction records for a minimum of seven (7) years following account closure, as required by the Bank Secrecy Act and IRS regulations. Identity verification records are retained as required by AML compliance obligations. We delete or anonymize other personal data that is no longer necessary for the purposes described in this Policy, subject to legal retention requirements.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. California Privacy Rights (CCPA/CPRA)</h2>
            <p>California residents have the following rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong className="text-foreground">Right to Know:</strong> Request disclosure of the categories and specific pieces of personal information we have collected about you.</li>
              <li><strong className="text-foreground">Right to Delete:</strong> Request deletion of your personal information, subject to legal exceptions (such as retention required for ongoing loan obligations or legal compliance).</li>
              <li><strong className="text-foreground">Right to Correct:</strong> Request correction of inaccurate personal information.</li>
              <li><strong className="text-foreground">Right to Opt Out of Sale/Sharing:</strong> We do not sell your personal information. You may opt out of sharing for cross-context behavioral advertising.</li>
              <li><strong className="text-foreground">Right to Limit Use of Sensitive Personal Information:</strong> You may limit our use of sensitive personal information (such as SSN and biometric data) to what is necessary to provide the Platform.</li>
              <li><strong className="text-foreground">Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your CCPA rights.</li>
            </ul>
            <p className="mt-2">To exercise these rights, contact us at privacy@sever.finance or submit a request through the Platform. We will respond within 45 days. We may need to verify your identity before processing requests.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Children's Privacy (COPPA)</h2>
            <p>The Platform is not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13. Users must be at least 18 years old to register. If we become aware that we have collected personal information from a child under 13, we will promptly delete it. If you believe we have inadvertently collected such information, please contact privacy@sever.finance.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Your General Privacy Rights</h2>
            <p>All U.S. users have the right to: access your personal data; correct inaccurate data; request account closure (subject to retention requirements); receive a copy of your data in a portable format; and withdraw consent where processing is consent-based. To exercise any of these rights, contact privacy@sever.finance.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by email or prominent notice on the Platform at least 30 days before the changes take effect. Your continued use of the Platform after changes take effect constitutes acceptance of the revised Policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">13. Contact</h2>
            <div className="space-y-1">
              <p>Privacy Officer: privacy@sever.finance</p>
              <p>CCPA Requests: privacy@sever.finance (subject line: "CCPA Request")</p>
              <p>CFPB Complaints: consumerfinance.gov/complaint</p>
              <p>FTC Complaints: reportfraud.ftc.gov</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
