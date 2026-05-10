import { useState, useEffect } from "react";
import { 
  useGetMyProfile, 
  useUpdateMyProfile,
  useChangeUsername,
  getGetMyProfileQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatMoney } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, UserCircle, Save, AtSign, Crown, ExternalLink, CalendarDays } from "lucide-react";

export function Profile() {
  const { data: profile, isLoading } = useGetMyProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/stripe/portal-session`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: "Error", description: data.error ?? "Could not open subscription management.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not open subscription management.", variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio || "");
      setUsernameInput(profile.username ?? "");
    }
  }, [profile]);

  const updateMutation = useUpdateMyProfile({
    mutation: {
      onSuccess: () => {
        toast({ title: "Profile updated", description: "Your profile changes have been saved." });
        queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Update failed", description: err.error || "An error occurred.", variant: "destructive" });
      }
    }
  });

  const usernameMutation = useChangeUsername({
    mutation: {
      onSuccess: () => {
        toast({ title: "Username updated!", description: `You are now @${usernameInput} on Sever.` });
        queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
        setUsernameError(null);
      },
      onError: (err: any) => {
        setUsernameError(err?.error ?? "Failed to set username.");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ data: { displayName, bio } });
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError(null);
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(usernameInput)) {
      setUsernameError("3-30 characters, letters, numbers, underscores only.");
      return;
    }
    usernameMutation.mutate({ data: { username: usernameInput } });
  };

  if (isLoading) {
    return (
      <div className="container py-8 px-4 md:px-6 mx-auto max-w-4xl space-y-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container py-8 px-4 md:px-6 mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tighter mb-2">Profile.</h1>
        <p className="text-muted-foreground">Manage your identity and view your track record.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card border-border rounded-none shadow-none">
            <form onSubmit={handleUsernameSubmit}>
              <CardHeader className="border-b border-border">
                <CardTitle className="font-mono uppercase tracking-widest text-base flex items-center gap-2">
                  <AtSign className="h-4 w-4 text-primary" />
                  Username
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your username keeps you anonymous across loans and chats. Shown as <span className="text-primary font-mono">@username</span>.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs uppercase font-mono text-muted-foreground">Username</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">@</span>
                    <Input
                      id="username"
                      className="pl-7 font-mono rounded-none"
                      value={usernameInput}
                      onChange={(e) => { setUsernameInput(e.target.value); setUsernameError(null); }}
                      maxLength={30}
                      placeholder="your_handle"
                    />
                  </div>
                  {usernameError && <p className="text-xs text-destructive font-mono">{usernameError}</p>}
                  <p className="text-xs text-muted-foreground">3–30 characters · letters, numbers, underscores</p>
                </div>
                <Button
                  type="submit"
                  className="w-full sm:w-auto rounded-none font-bold tracking-tight"
                  disabled={usernameMutation.isPending || !usernameInput}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {usernameMutation.isPending ? "SAVING..." : "SAVE USERNAME"}
                </Button>
              </CardContent>
            </form>
          </Card>

          <Card className="bg-card border-border rounded-none shadow-none">
            <form onSubmit={handleSubmit}>
              <CardHeader className="border-b border-border">
                <CardTitle className="font-mono uppercase tracking-widest text-base flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Public Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-xs uppercase font-mono text-muted-foreground">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={60}
                    required
                    className="font-mono rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-xs uppercase font-mono text-muted-foreground">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={280}
                    placeholder="Tell the community about yourself..."
                    className="min-h-[120px] font-mono rounded-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">{bio.length}/280</p>
                </div>
                <Button 
                  type="submit"
                  className="w-full sm:w-auto rounded-none font-bold tracking-tight"
                  disabled={updateMutation.isPending || !displayName}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateMutation.isPending ? "SAVING..." : "SAVE CHANGES"}
                </Button>
              </CardContent>
            </form>
          </Card>

          <Card className="bg-card border-border rounded-none shadow-none">
            <CardHeader className="border-b border-border">
              <CardTitle className="font-mono uppercase tracking-widest text-base">Lifetime Statistics</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
                <div className="p-6 text-center space-y-2">
                  <div className="text-xs uppercase font-mono text-muted-foreground">Loans Funded</div>
                  <div className="font-bold font-mono text-2xl">{profile.loansFunded}</div>
                </div>
                <div className="p-6 text-center space-y-2">
                  <div className="text-xs uppercase font-mono text-muted-foreground">Loans Borrowed</div>
                  <div className="font-bold font-mono text-2xl">{profile.loansBorrowed}</div>
                </div>
                <div className="p-6 text-center space-y-2">
                  <div className="text-xs uppercase font-mono text-muted-foreground">Total Lent</div>
                  <div className="font-bold font-mono text-xl text-primary">{formatMoney(profile.totalLent)}</div>
                </div>
                <div className="p-6 text-center space-y-2">
                  <div className="text-xs uppercase font-mono text-muted-foreground">Total Borrowed</div>
                  <div className="font-bold font-mono text-xl">{formatMoney(profile.totalBorrowed)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Premium Status Card */}
          <Card className={`border rounded-none shadow-none ${profile.isPremium ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}>
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
              <CardTitle className="font-mono uppercase tracking-widest text-base flex items-center gap-2">
                <Crown className={`h-4 w-4 ${profile.isPremium ? "text-yellow-400" : "text-muted-foreground"}`} />
                Premium
              </CardTitle>
              {profile.isPremium && (
                <Badge className="bg-primary/20 text-primary border-primary/30 font-mono text-xs uppercase tracking-widest">
                  Active
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {profile.isPremium ? (
                <>
                  <div className="space-y-3 text-sm font-mono">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="h-4 w-4 shrink-0" />
                      <span className="text-xs uppercase">Auto-renews</span>
                    </div>
                    <div className="text-primary font-bold text-lg">
                      {profile.premiumUntil
                        ? new Date(profile.premiumUntil).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                        : "Active"}
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground font-mono">
                    <div className="flex items-center gap-2">✓ 0.75% origination fee (half price)</div>
                    <div className="flex items-center gap-2">✓ $100K loan limit</div>
                    <div className="flex items-center gap-2">✓ Priority marketplace listing</div>
                    <div className="flex items-center gap-2">✓ Advanced analytics</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-none font-mono text-xs uppercase tracking-widest"
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                  >
                    <ExternalLink className="mr-2 h-3 w-3" />
                    {portalLoading ? "Opening..." : "Manage Subscription"}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                    Get half-price origination fees, 2× loan limits, priority listing, and advanced analytics.
                  </p>
                  <Button
                    className="w-full rounded-none font-bold tracking-tight bg-primary text-primary-foreground"
                    onClick={() => window.location.href = "/"}
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border rounded-none shadow-none sticky top-24">
            <CardHeader className="bg-muted/50 border-b border-border pb-4 flex flex-row items-center justify-between">
              <CardTitle className="font-mono uppercase tracking-widest text-base">Trust Score</CardTitle>
              <ShieldCheck className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="text-6xl font-bold font-mono tracking-tighter">{profile.trustScore}</div>
                <div className="text-xs text-muted-foreground font-mono uppercase">out of 1000</div>
              </div>

              <div className="flex justify-center">
                <Badge variant="outline" className="px-4 py-1 text-sm uppercase font-mono tracking-widest bg-primary/10 text-primary border-primary/20">
                  {profile.tier} TIER
                </Badge>
              </div>

              <div className="h-px w-full bg-border" />

              <div className="space-y-4 text-sm font-mono">
                <div className="flex justify-between items-center text-muted-foreground uppercase text-xs mb-2">
                  <span>Repayment History</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">On-Time Payments</span>
                  <span className="font-bold text-green-500">{profile.onTimePayments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Late Payments</span>
                  <span className={profile.latePayments > 0 ? "font-bold text-destructive" : "font-bold"}>{profile.latePayments}</span>
                </div>
              </div>
              
              <div className="bg-muted p-3 text-xs text-muted-foreground">
                Trust score is calculated automatically based on repayment reliability, volume, and tenure on the platform.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
