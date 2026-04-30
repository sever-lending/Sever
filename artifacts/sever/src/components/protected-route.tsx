import { useAuth } from "@workspace/replit-auth-web";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin border-y-2 border-primary rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <h2 className="text-3xl font-bold tracking-tighter mb-2">ACCESS DENIED.</h2>
        <p className="text-muted-foreground max-w-md mb-8 text-lg">
          You must be logged in to view this page. Join the network to lend or borrow on your terms.
        </p>
        <Button size="lg" onClick={login} className="font-bold tracking-tight">
          LOG IN TO CONTINUE
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
