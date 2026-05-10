import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronDown, UserCheck, Wallet, FileText,
  ShieldCheck, TrendingUp, HandCoins, Lock, LifeBuoy,
  AlertTriangle, BadgePercent, ArrowRight, BookOpen,
  MessageSquarePlus, Zap, Star, ClipboardList,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
});

interface Article {
  q: string;
  a: string;
  tags?: string[];
}

interface Category {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  articles: Article[];
}

const CATEGORIES: Category[] = [
  {
    id: "account",
    label: "Account & Profile",
    icon: UserCheck,
    color: "text-sky-400",
    articles: [
      {
        q: "How do I create an account?",
        a: "Sign in using your Replit account — click 'GET STARTED' in the top-right corner. No email or credit card is required. Your account is created instantly on first login.",
        tags: ["signup", "login", "registration"],
      },
      {
        q: "How do I set my username?",
        a: "After signing in, you'll be prompted to choose a unique username. You can also update it at any time from the Profile page. Your username is public and shown to other users when you lend or borrow.",
      },
      {
        q: "What information is visible on my public profile?",
        a: "Other users can see your username, trust tier badge, trust score, and general lending/borrowing stats. Your wallet balance, transaction history, and personal details are private.",
      },
      {
        q: "Can I delete my account?",
        a: "Account deletion can be requested through the Support & Feedback page. If you have active loans or outstanding balances, those must be settled first. Contact us and we'll process your request.",
        tags: ["delete", "close account"],
      },
      {
        q: "I signed in but my profile seems empty — why?",
        a: "Profiles are created automatically on your first authenticated request. If things look empty, try refreshing the page. If you still see issues, contact support.",
      },
    ],
  },
  {
    id: "wallet",
    label: "Wallet & Payments",
    icon: Wallet,
    color: "text-primary",
    articles: [
      {
        q: "How do I add money to my wallet?",
        a: "Go to the Wallet page and click 'Add Funds'. You'll be redirected to a Stripe checkout page. Enter your card details and your balance is credited instantly after payment. There are no fees for deposits.",
        tags: ["deposit", "fund", "add money"],
      },
      {
        q: "How do I withdraw my wallet balance?",
        a: "You can request a withdrawal from the Wallet page. Only your uncommitted balance (money not currently in active loans) is available to withdraw. Withdrawals are processed within 1–3 business days.",
        tags: ["withdraw", "cash out"],
      },
      {
        q: "Why is part of my balance locked?",
        a: "When you fund a loan, that money is locked until the loan is fully repaid. Only your uncommitted wallet balance is available for withdrawals or new loans. The locked amount is shown separately on the Wallet page.",
      },
      {
        q: "Are there any fees for using the wallet?",
        a: "There are no deposit fees. Withdrawals are free. The only platform fees are the 1.5% origination fee on disbursed loans (paid by borrowers) and late fees on overdue installments.",
      },
      {
        q: "What payment methods are accepted?",
        a: "All major credit and debit cards are accepted via Stripe (Visa, Mastercard, Amex, Discover). ACH bank transfers may be available depending on your region.",
        tags: ["card", "credit card", "stripe"],
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. Sever never stores your card details. All payment data is handled by Stripe, which is PCI-DSS Level 1 certified — the highest level of payment security. We only store the result of each transaction.",
        tags: ["security", "card security", "pci"],
      },
    ],
  },
  {
    id: "lending",
    label: "Lending",
    icon: TrendingUp,
    color: "text-primary",
    articles: [
      {
        q: "How does lending work?",
        a: "Browse open loan requests on the Marketplace. Each listing shows the borrower's requested amount, interest rate, purpose, and funding progress. You can fund any portion of a loan — Sever supports partial funding. Once a loan reaches 100% funding, the repayment schedule begins and you receive monthly payments.",
        tags: ["how to lend", "lender guide"],
      },
      {
        q: "What returns can I expect?",
        a: "Borrowers set their own annual interest rate (APR) when posting a loan, typically ranging from 6% to 18%. Your return is proportional to the share you funded. A $200 stake in a $1,000 loan at 12% APR over 12 months would yield roughly $24 in interest — minus any defaults.",
        tags: ["interest", "return", "yield", "APR"],
      },
      {
        q: "What is partial funding?",
        a: "You don't have to fund an entire loan alone. Multiple lenders can contribute to the same loan simultaneously. Enter any amount from $10 up to the remaining unfunded balance. Repayments are distributed proportionally.",
      },
      {
        q: "What is the minimum amount I can lend?",
        a: "The minimum lending amount is $10 per loan. There's no maximum, as long as you have sufficient wallet balance and the unfunded portion of the loan is large enough.",
      },
      {
        q: "Can I withdraw money I've already lent?",
        a: "No. Once you fund a loan, that money is committed until the loan is fully repaid. You cannot recall a funded loan early. This is why you should only lend money you're comfortable having illiquid for the loan term.",
      },
      {
        q: "What happens to my money if a borrower defaults?",
        a: "If a loan defaults, any outstanding principal you haven't yet been repaid is written off as a loss. Sever does not guarantee repayment or offer a protection fund. Diversifying across many small loans significantly reduces the impact of any single default.",
        tags: ["default", "loss", "risk"],
      },
      {
        q: "Do I earn interest on overdue payments?",
        a: "Yes, partially. When a borrower pays late, they incur a late fee ($5 + 2% of the overdue installment). You receive 50% of that late fee, distributed pro-rata based on your share of the loan.",
        tags: ["late fee", "overdue"],
      },
      {
        q: "How do I track my lending performance?",
        a: "The Portfolio page shows every loan you've funded, its current status, funding amount, next due date, and projected total return. Your dashboard also shows a real-time overview of your total invested, returns earned, and active loan count.",
      },
    ],
  },
  {
    id: "borrowing",
    label: "Borrowing",
    icon: HandCoins,
    color: "text-amber-400",
    articles: [
      {
        q: "How do I request a loan?",
        a: "Go to the Borrow page, enter the amount ($100–$50,000), choose a repayment term (3–60 months), set the annual interest rate you're offering, and describe your purpose clearly. Your request goes live in the marketplace immediately.",
        tags: ["borrow", "request loan", "how to borrow"],
      },
      {
        q: "How long does it take to get funded?",
        a: "Funding time varies based on your trust score, interest rate, and loan size. Loans in the $500–$5,000 range with rates above 9% from verified borrowers typically fund within 24–48 hours. Larger or lower-rate loans may take longer.",
        tags: ["funding time", "how long"],
      },
      {
        q: "What is the origination fee?",
        a: "When your loan reaches 100% funding, Sever deducts a 1.5% origination fee from the disbursed amount. For example, a $1,000 loan would result in $985 deposited to your wallet. The fee is paid once at disbursement, not over the life of the loan.",
        tags: ["origination fee", "fee", "cost"],
      },
      {
        q: "How are monthly payments calculated?",
        a: "Sever uses standard amortizing loan math — each monthly installment is the same amount, covering both principal and interest. You can preview your exact installment before posting the loan using the calculator on the Borrow page.",
        tags: ["monthly payment", "installment", "amortization"],
      },
      {
        q: "What if I can't make a payment on time?",
        a: "Missing a payment triggers a late fee of $5 + 2% of the installment amount, which is added to your balance. It also reduces your trust score and may make future borrowing harder. If you're in difficulty, contact support early.",
        tags: ["missed payment", "late", "can't pay"],
      },
      {
        q: "Can I repay my loan early?",
        a: "Yes. You can make extra payments or pay off the remaining balance at any time from your Dashboard. There are no prepayment penalties on Sever.",
        tags: ["early repayment", "pay off", "prepay"],
      },
      {
        q: "What happens if my loan doesn't get fully funded?",
        a: "If your loan doesn't reach 100% funding, it stays open in the marketplace indefinitely until fully funded or you cancel it. No funds are disbursed on a partially funded loan. You can cancel an unfunded or partially funded loan at any time.",
      },
      {
        q: "Can I have multiple active loans?",
        a: "Yes, you can have multiple loans active simultaneously, subject to your trust tier limits. Higher tiers (Silver, Gold, Platinum) unlock higher concurrent loan limits.",
      },
    ],
  },
  {
    id: "trust",
    label: "Trust Score & Tiers",
    icon: Star,
    color: "text-amber-400",
    articles: [
      {
        q: "What is a trust score?",
        a: "The trust score is a number from 0 to 1,000 that represents your repayment reliability. It increases with every on-time payment and decreases when you pay late or default. Lenders use it to assess risk before funding your loan.",
        tags: ["trust score", "credit score", "reputation"],
      },
      {
        q: "What are the trust tiers?",
        a: "There are five tiers: Unverified (0–99), Bronze (100–299), Silver (300–499), Gold (500–749), and Platinum (750–1000). Higher tiers unlock better loan terms, faster funding, and higher loan limits. Tiers are determined by your score and KYC status.",
        tags: ["tier", "bronze", "silver", "gold", "platinum"],
      },
      {
        q: "How do I increase my trust score?",
        a: "Make all loan installments on time. Each on-time payment adds points to your score. There's no shortcut — consistent repayment is the only way. Completing KYC also helps by boosting lender confidence.",
      },
      {
        q: "How much does a late payment hurt my score?",
        a: "Late payments reduce your trust score significantly — more so than a single on-time payment raises it. A pattern of late payments can drop you multiple tiers, making future loans much harder to fund.",
      },
      {
        q: "What is KYC and how does it affect my tier?",
        a: "KYC (Know Your Customer) is identity verification — you upload a government-issued ID and a selfie. Completing KYC is required to progress beyond the Unverified tier, regardless of your score. It takes about 5 minutes.",
        tags: ["kyc", "identity", "verification", "id"],
      },
    ],
  },
  {
    id: "security",
    label: "Security & Privacy",
    icon: Lock,
    color: "text-emerald-400",
    articles: [
      {
        q: "Is Sever secure?",
        a: "Yes. All communications are encrypted via HTTPS/TLS. Payments are processed by Stripe (PCI-DSS Level 1). Passwords are never stored — authentication is handled by Replit's identity system. Session tokens are HttpOnly and never exposed to JavaScript.",
        tags: ["security", "safe", "encryption"],
      },
      {
        q: "Who can see my personal information?",
        a: "Only you and the Sever team can see your wallet balance, transaction history, and personal details. Other users only see your username, tier badge, and trust score. Your KYC documents are handled by our identity verification provider and never shared.",
        tags: ["privacy", "personal data", "gdpr"],
      },
      {
        q: "What happens if someone gains access to my account?",
        a: "Immediately contact support via the Support & Feedback page. We can suspend your account, investigate transactions, and take corrective action. Since authentication is via Replit, also secure your Replit account immediately.",
        tags: ["hacked", "account takeover", "compromise"],
      },
      {
        q: "Is my wallet balance insured?",
        a: "No. Sever is a marketplace platform, not a bank. Your wallet balance is not FDIC-insured or covered by any government protection scheme. Only deposit and lend funds you can afford to lose.",
        tags: ["insured", "fdic", "protection"],
      },
      {
        q: "How does Sever protect against fraud?",
        a: "KYC verification, rate limiting on all API endpoints, session-based authentication, and transaction monitoring all help reduce fraud risk. Suspicious activity is flagged and reviewed by the team.",
      },
    ],
  },
  {
    id: "fees",
    label: "Fees & Costs",
    icon: BadgePercent,
    color: "text-primary",
    articles: [
      {
        q: "What fees does Sever charge?",
        a: "There are two platform fees: (1) A 1.5% origination fee deducted from the loan amount when a loan is disbursed — paid by the borrower. (2) A late fee of $5 + 2% of the overdue installment when a payment is missed — split 50/50 between the platform and the loan's lenders.",
        tags: ["fees", "costs", "charges"],
      },
      {
        q: "Are there any lender fees?",
        a: "No. Lenders pay no fees on Sever. Your gross return is the interest rate set by the borrower, minus any losses from defaults. There are no management fees, withdrawal fees, or platform charges on the lender side.",
      },
      {
        q: "Are deposits and withdrawals free?",
        a: "Deposits via Stripe are free (no Sever fee, though Stripe may charge a small processing fee at high volumes). Wallet withdrawals are also free.",
      },
      {
        q: "Do I pay taxes on interest income?",
        a: "Interest earned through Sever may be taxable income depending on your jurisdiction. Sever does not provide tax advice. Consult a qualified tax professional about how P2P lending income is treated in your country.",
        tags: ["tax", "taxes", "income"],
      },
    ],
  },
  {
    id: "platform",
    label: "Platform & Legal",
    icon: ClipboardList,
    color: "text-muted-foreground",
    articles: [
      {
        q: "Is Sever a licensed lender or bank?",
        a: "No. Sever is a marketplace platform that connects individual lenders and borrowers. It is not a bank, credit union, or licensed lending institution. Loans are agreements between private parties.",
        tags: ["license", "regulated", "bank"],
      },
      {
        q: "Is P2P lending legal in my country?",
        a: "Regulations vary by jurisdiction. P2P lending is legal in most countries but may be subject to specific rules. It is your responsibility to understand and comply with the laws applicable to you. Sever currently serves users in the United States.",
        tags: ["legal", "regulations", "country"],
      },
      {
        q: "What is the Loan Agreement?",
        a: "Before funding a loan, lenders must accept a Loan Agreement that covers the risk acknowledgement, terms of the transaction, and KYC confirmation. This is a binding legal document. You can read the template at /legal/contract.",
        tags: ["loan agreement", "contract", "legal"],
      },
      {
        q: "Where can I read Sever's legal documents?",
        a: "All legal documents are available in the footer: Terms of Service (/legal/terms), Privacy Policy (/legal/privacy), Risk Disclaimer (/legal/disclaimer), and the Loan Agreement template (/legal/contract).",
        tags: ["terms", "privacy", "legal docs"],
      },
      {
        q: "How do I report a problem or appeal a decision?",
        a: "Use the Support & Feedback form at /support. Describe the issue clearly, including any relevant loan IDs, dates, and amounts. The team reviews all submissions and will respond as quickly as possible.",
        tags: ["report", "appeal", "dispute"],
      },
    ],
  },
];

function ArticleItem({ article }: { article: Article }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/30 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between py-3.5 text-left gap-4 group"
      >
        <span className="text-sm font-medium text-foreground/85 group-hover:text-foreground transition-colors leading-snug">
          {article.q}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 mt-0.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-muted-foreground leading-relaxed pr-4">{article.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Help() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const allArticles = useMemo(
    () => CATEGORIES.flatMap((c) => c.articles.map((a) => ({ ...a, category: c.id }))),
    []
  );

  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return null;
    return allArticles.filter(
      (a) =>
        a.q.toLowerCase().includes(q) ||
        a.a.toLowerCase().includes(q) ||
        a.tags?.some((t) => t.includes(q))
    );
  }, [query, allArticles]);

  const visibleCategories = activeCategory
    ? CATEGORIES.filter((c) => c.id === activeCategory)
    : CATEGORIES;

  const totalArticles = allArticles.length;

  return (
    <div className="w-full min-h-screen pb-24">
      {/* Hero + Search */}
      <div className="border-b border-border/40 bg-gradient-to-b from-primary/6 to-transparent">
        <div className="container max-w-3xl mx-auto px-4 py-14 text-center">
          <motion.div
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-5"
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            Help Center
          </motion.div>
          <motion.h1 {...fadeUp(0.06)} className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-3">
            How can we help?
          </motion.h1>
          <motion.p {...fadeUp(0.12)} className="text-muted-foreground text-base mb-8">
            {totalArticles} answers across {CATEGORIES.length} categories.
          </motion.p>
          <motion.div {...fadeUp(0.18)} className="relative max-w-lg mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search help articles…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value) setActiveCategory(null);
              }}
              className="pl-10 h-11 text-sm bg-card/80 border-border/60 focus:border-primary/60"
            />
          </motion.div>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-10">
        {/* Search results */}
        {searchResults !== null ? (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground">
                {searchResults.length === 0
                  ? "No results found."
                  : `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} for "${query}"`}
              </p>
              <button
                onClick={() => setQuery("")}
                className="text-xs text-primary hover:underline"
              >
                Clear search
              </button>
            </div>
            {searchResults.length > 0 ? (
              <div className="rounded-xl border border-border/40 bg-card/40 px-5 divide-y divide-border/20">
                {searchResults.map((a, i) => {
                  const cat = CATEGORIES.find((c) => c.id === a.category);
                  return (
                    <div key={i}>
                      {cat && (
                        <div className="pt-3 pb-0.5">
                          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 border-border/40 ${cat.color}`}>
                            {cat.label}
                          </Badge>
                        </div>
                      )}
                      <ArticleItem article={a} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-border/40 bg-card/30 p-10 text-center">
                <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-medium mb-1">No matches found</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Try different keywords, or browse the categories below.
                </p>
                <button
                  onClick={() => setQuery("")}
                  className="text-xs text-primary hover:underline"
                >
                  Browse all articles
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Category filter pills */}
            <motion.div {...fadeUp(0.1)} className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  activeCategory === null
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                All topics
              </button>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      activeCategory === cat.id
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    <Icon className={`h-3 w-3 ${cat.color}`} />
                    {cat.label}
                  </button>
                );
              })}
            </motion.div>

            {/* Article categories */}
            <div className="space-y-6">
              {visibleCategories.map((cat, ci) => {
                const Icon = cat.icon;
                return (
                  <motion.div key={cat.id} {...fadeUp(ci * 0.06)}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <Icon className={`h-4.5 w-4.5 h-4 w-4 shrink-0 ${cat.color}`} />
                      <h2 className="font-semibold text-sm text-foreground">{cat.label}</h2>
                      <span className="text-[11px] text-muted-foreground">
                        {cat.articles.length} articles
                      </span>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-card/40 px-5">
                      {cat.articles.map((article, ai) => (
                        <ArticleItem key={ai} article={article} />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* Bottom CTA strip */}
        <motion.div {...fadeUp(0.3)} className="mt-12 rounded-2xl border border-border/50 bg-card/40 p-8 text-center">
          <LifeBuoy className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-bold text-base mb-1">Still have questions?</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            Can't find what you're looking for? Send us a message and the team will get back to you.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/support">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                <MessageSquarePlus className="h-4 w-4" />
                Contact Support
              </button>
            </Link>
            <Link href="/tutorial">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border/60 text-sm font-medium hover:border-border hover:text-foreground text-muted-foreground transition-colors">
                <BookOpen className="h-4 w-4" />
                Read the Full Guide
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
