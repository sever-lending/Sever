import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useChangeUsername, getGetMyProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AtSign, Shield } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function UsernameSetupModal({ open, onClose }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useChangeUsername({
    mutation: {
      onSuccess: () => {
        toast({ title: "Username set!", description: `You are now @${value} on Sever.` });
        queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
        onClose();
      },
      onError: (err: any) => {
        setError(err?.error ?? "Failed to set username. Please try again.");
      },
    },
  });

  const validate = (v: string) => /^[a-zA-Z0-9_]{3,30}$/.test(v);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate(value)) {
      setError("3-30 characters, letters, numbers and underscores only.");
      return;
    }
    mutation.mutate({ data: { username: value } });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-none border-primary/30">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <AtSign className="h-5 w-5 text-primary" />
            <DialogTitle className="font-mono uppercase tracking-tight">Choose your username</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Your username keeps you anonymous on loans and in chats. Pick one now — you can change it later in your profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="username" className="font-mono uppercase text-xs tracking-wider">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">@</span>
              <Input
                id="username"
                className="pl-7 font-mono rounded-none"
                placeholder="satoshi_nakamoto"
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(null); }}
                maxLength={30}
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-destructive font-mono">{error}</p>}
            <p className="text-xs text-muted-foreground">3–30 characters · letters, numbers, underscores</p>
          </div>

          <div className="flex items-start gap-2 p-3 bg-muted/40 border border-border text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
            <span>Your username replaces your real name everywhere on the platform for privacy.</span>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="ghost" className="flex-1 rounded-none font-mono" onClick={onClose}>
              Skip for now
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-none font-mono font-bold"
              disabled={mutation.isPending || !value}
            >
              {mutation.isPending ? "Setting..." : "Set username"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
