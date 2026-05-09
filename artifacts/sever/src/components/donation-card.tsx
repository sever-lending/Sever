import { useState } from "react";
import { Heart, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AMOUNTS = [3, 5, 10, 25];

export function DonationCard() {
  const [selected, setSelected] = useState(5);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleDonate() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/donation-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selected }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
      setLoading(false);
    }
  }

  return (
    <div className="relative mt-4 rounded-none border border-dashed border-primary/30 bg-primary/5 p-5 overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-primary/5 -translate-y-8 translate-x-8 pointer-events-none" />
      <div className="flex items-start gap-3 mb-3">
        <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/15 shrink-0">
          <Coffee className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight mb-0.5">Support Sever</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Servers, security audits, and compliance don't come free. Every donation goes directly toward keeping Sever online, fast, and improving.
          </p>
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        {AMOUNTS.map((amt) => (
          <button
            key={amt}
            onClick={() => setSelected(amt)}
            className={`flex-1 py-1.5 text-xs font-bold rounded border transition-all ${
              selected === amt
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            ${amt}
          </button>
        ))}
      </div>
      <Button
        size="sm"
        className="w-full h-8 text-xs gap-1.5 font-bold"
        onClick={handleDonate}
        disabled={loading}
      >
        <Heart className="h-3.5 w-3.5" />
        {loading ? "Redirecting..." : `Donate $${selected}`}
      </Button>
    </div>
  );
}
