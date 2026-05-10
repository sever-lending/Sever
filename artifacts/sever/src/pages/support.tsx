import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageSquarePlus, CheckCircle2, DollarSign } from "lucide-react";

const PRESET_AMOUNTS = [5, 25, 50, 100];

export function Support() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [selectedAmount, setSelectedAmount] = useState<number | null>(25);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [donating, setDonating] = useState(false);
  const [justDonated, setJustDonated] = useState(false);

  useEffect(() => {
    if (location.includes("donated=1")) {
      setJustDonated(true);
    }
  }, [location]);

  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to submit");
      }
      setSubmitted(true);
      setName(""); setEmail(""); setSubject(""); setMessage("");
    } catch (err: any) {
      toast({ title: "Couldn't send message", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDonate() {
    const amount = isCustom ? parseFloat(customAmount) : selectedAmount;
    if (!amount || amount < 1 || !isFinite(amount)) {
      toast({ title: "Invalid amount", description: "Please enter a positive amount of at least $1.", variant: "destructive" });
      return;
    }
    setDonating(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/stripe/donation-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to start checkout");
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err: any) {
      toast({ title: "Couldn't start checkout", description: err.message, variant: "destructive" });
    } finally {
      setDonating(false);
    }
  }

  const effectiveAmount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount ?? 0;

  return (
    <div className="container py-10 px-4 md:px-6 mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support & Feedback</h1>
        <p className="text-muted-foreground mt-2">Have a question, idea, or just want to say something? We read everything.</p>
      </div>

      {justDonated && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/10 px-5 py-4 text-primary">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Thank you for your support!</p>
            <p className="text-sm text-primary/80">Your contribution goes directly toward keeping Sever running and improving.</p>
          </div>
        </div>
      )}

      {/* Feedback / Questions box */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-primary" />
            Questions & Suggestions
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Ask anything or share an idea. Your feedback goes directly to the team.
          </p>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <p className="font-semibold text-lg">Got it — thank you!</p>
              <p className="text-sm text-muted-foreground">Your message has been received. We'll take a look.</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setSubmitted(false)}>
                Send another
              </Button>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              {!user && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fb-name">Name <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input
                      id="fb-name"
                      placeholder="Your name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fb-email">Email <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input
                      id="fb-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      maxLength={200}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="fb-subject">Subject <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="fb-subject"
                  placeholder="e.g. Feature request, Bug report, Question…"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fb-message">Message <span className="text-destructive">*</span></Label>
                <Textarea
                  id="fb-message"
                  placeholder="Tell us what's on your mind…"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  maxLength={2000}
                  rows={5}
                  required
                />
                <p className="text-xs text-muted-foreground text-right">{message.length}/2000</p>
              </div>
              <Button type="submit" disabled={submitting || message.trim().length < 5} className="w-full sm:w-auto">
                {submitting ? "Sending…" : "Send Message"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Donation box */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Support the Platform
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Sever is independently run. Contributions go directly toward server costs, development, and making the platform better for everyone.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-3">
            {PRESET_AMOUNTS.map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => { setSelectedAmount(amt); setIsCustom(false); setCustomAmount(""); }}
                className={`px-5 py-2.5 rounded-lg border text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  !isCustom && selectedAmount === amt
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50 text-foreground"
                }`}
              >
                ${amt}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setIsCustom(true); setSelectedAmount(null); }}
              className={`px-5 py-2.5 rounded-lg border text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isCustom
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 text-foreground"
              }`}
            >
              Custom
            </button>
          </div>

          {isCustom && (
            <div className="space-y-1.5">
              <Label htmlFor="custom-amount">Custom amount (USD)</Label>
              <div className="relative max-w-[180px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <Input
                  id="custom-amount"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="0"
                  value={customAmount}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === "" || (parseFloat(val) >= 0)) setCustomAmount(val);
                  }}
                  className="pl-7"
                />
              </div>
              {customAmount && parseFloat(customAmount) < 1 && (
                <p className="text-xs text-destructive">Minimum donation is $1.</p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={handleDonate}
              disabled={donating || effectiveAmount < 1}
              className="gap-2"
            >
              <DollarSign className="h-4 w-4" />
              {donating
                ? "Opening checkout…"
                : effectiveAmount >= 1
                  ? `Contribute $${effectiveAmount % 1 === 0 ? effectiveAmount : effectiveAmount.toFixed(2)}`
                  : "Select an amount"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Payments processed securely via Stripe. Contributions are non-refundable and not tax-deductible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
