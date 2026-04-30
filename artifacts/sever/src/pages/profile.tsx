import { useState, useEffect } from "react";
import { 
  useGetMyProfile, 
  useUpdateMyProfile,
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
import { ShieldCheck, UserCircle, Save } from "lucide-react";

export function Profile() {
  const { data: profile, isLoading } = useGetMyProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio || "");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ data: { displayName, bio } });
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
