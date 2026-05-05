export function Privacy() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
      <div className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>We collect: (a) <strong className="text-foreground">Account Information</strong> — name, email, and identity data provided during registration and KYC verification; (b) <strong className="text-foreground">Financial Information</strong> — loan amounts, repayment history, and wallet balances; (c) <strong className="text-foreground">Usage Data</strong> — pages visited, features used, device type, and IP address; (d) <strong className="text-foreground">Communications</strong> — messages between users and with our support team.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>We use collected information to: operate and improve the Platform; verify your identity (KYC/AML compliance); process loan applications and repayments; communicate important account and service updates; detect and prevent fraud; comply with legal obligations; and deliver personalized content and advertisements.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Information Sharing</h2>
            <p>We do not sell your personal information. We share data with: (a) lenders or borrowers as necessary to facilitate a loan transaction; (b) identity verification and payment processing partners; (c) law enforcement when required by law; (d) service providers who assist us in operating the Platform under data processing agreements.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Advertising</h2>
            <p>The Platform may display third-party advertisements. Ad partners may use cookies and tracking technologies to deliver targeted advertisements. You may opt out of personalized advertising through your browser settings or through industry opt-out tools such as the Digital Advertising Alliance (DAA).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Data Security</h2>
            <p>We implement industry-standard security measures including encryption in transit (TLS), encrypted storage of sensitive data, and access controls. No method of transmission over the Internet is 100% secure. We cannot guarantee absolute security of your data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Your Rights</h2>
            <p>You have the right to: access your personal data; correct inaccurate data; request deletion of your account (subject to legal retention requirements); withdraw consent where processing is consent-based; and file a complaint with your local data protection authority.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Retention</h2>
            <p>We retain account and financial data for a minimum of 7 years following account closure to comply with financial regulations and tax requirements.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Contact</h2>
            <p>For privacy inquiries: privacy@sever.finance</p>
          </section>
        </div>
      </div>
    </div>
  );
}
