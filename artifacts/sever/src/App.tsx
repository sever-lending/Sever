import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@workspace/replit-auth-web";
import { useGetMyProfile, getGetMyProfileQueryKey } from "@workspace/api-client-react";
import { useState } from "react";

// Layout & UI
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { UsernameSetupModal } from "@/components/username-setup-modal";

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
import { Admin } from "@/pages/admin/index";
import { AdminLogin } from "@/pages/admin-login";
import { KYC } from "@/pages/kyc";
import { Terms } from "@/pages/legal/terms";
import { Privacy } from "@/pages/legal/privacy";
import { Disclaimer } from "@/pages/legal/disclaimer";
import { LoanContract } from "@/pages/legal/contract";
import { Tutorial } from "@/pages/tutorial";
import { Messages } from "@/pages/messages";
import { Support } from "@/pages/support";
import { Updates } from "@/pages/updates";
import { AgeGateModal } from "@/components/age-gate-modal";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function UsernamePrompt() {
  const { user } = useAuth();
  const { data: profile } = useGetMyProfile({ query: { queryKey: getGetMyProfileQueryKey(), enabled: !!user } });
  const [dismissed, setDismissed] = useState(false);
  const showModal = !!user && !!profile && profile.username === null && !dismissed;
  return <UsernameSetupModal open={showModal} onClose={() => setDismissed(true)} />;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/lenders" component={Lenders} />
        <Route path="/tutorial" component={Tutorial} />
        
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
        <Route path="/messages">
          <ProtectedRoute><Messages /></ProtectedRoute>
        </Route>
        <Route path="/messages/:userId">
          {params => <ProtectedRoute><Messages initialUserId={params.userId} /></ProtectedRoute>}
        </Route>

        <Route path="/admin" component={Admin} />
        <Route path="/admin-login" component={AdminLogin} />

        <Route path="/kyc">
          <ProtectedRoute><KYC /></ProtectedRoute>
        </Route>

        <Route path="/support" component={Support} />
        <Route path="/updates" component={Updates} />

        <Route path="/legal/terms" component={Terms} />
        <Route path="/legal/privacy" component={Privacy} />
        <Route path="/legal/disclaimer" component={Disclaimer} />
        <Route path="/legal/contract" component={LoanContract} />

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
          <UsernamePrompt />
          <AgeGateModal />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
