import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@workspace/replit-auth-web";

// Layout & UI
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";

// Pages
import { Landing } from "@/pages/landing";
import { Dashboard } from "@/pages/dashboard";
import { Marketplace } from "@/pages/marketplace";
import { LoanDetail } from "@/pages/loan-detail";
import { Borrow } from "@/pages/borrow";
import { Portfolio } from "@/pages/portfolio";
import { Wallet } from "@/pages/wallet";
import { Profile } from "@/pages/profile";
import { Lenders } from "@/pages/lenders";
import { Admin } from "@/pages/admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/lenders" component={Lenders} />
        
        <Route path="/dashboard">
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        </Route>
        <Route path="/marketplace">
          <ProtectedRoute><Marketplace /></ProtectedRoute>
        </Route>
        <Route path="/loans/:id">
          {params => <ProtectedRoute><LoanDetail id={params.id} /></ProtectedRoute>}
        </Route>
        <Route path="/borrow">
          <ProtectedRoute><Borrow /></ProtectedRoute>
        </Route>
        <Route path="/portfolio">
          <ProtectedRoute><Portfolio /></ProtectedRoute>
        </Route>
        <Route path="/wallet">
          <ProtectedRoute><Wallet /></ProtectedRoute>
        </Route>
        <Route path="/profile">
          <ProtectedRoute><Profile /></ProtectedRoute>
        </Route>

        <Route path="/admin" component={Admin} />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
