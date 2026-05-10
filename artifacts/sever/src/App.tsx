import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@workspace/replit-auth-web";
import { useGetMyProfile, getGetMyProfileQueryKey } from "@workspace/api-client-react";
import { useState, useEffect, useRef } from "react";

// Layout & UI
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { UsernameSetupModal } from "@/components/username-setup-modal";
import { PremiumModal } from "@/components/premium-modal";

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
import { GettingStarted } from "@/pages/getting-started";
import { Help } from "@/pages/help";
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

// Handles returning from Stripe premium checkout — detects ?premium_session_id= in the URL,
// confirms the purchase with the API, then refreshes the profile and clears the query param.
function PremiumConfirmHandler() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  const confirmed = useRef(false);

  useEffect(() => {
    if (!user || confirmed.current) return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("premium_session_id");
    if (!sessionId) return;
    confirmed.current = true;

    fetch(`${import.meta.env.BASE_URL}api/stripe/confirm-premium`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          qc.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
          // Mark as shown so the upsell modal doesn't reappear
          localStorage.setItem(`sever_premium_shown_${user.id}`, "1");
          // Strip query params from URL
          const clean = window.location.pathname;
          setLocation(clean, { replace: true });
        }
      })
      .catch(() => {});
  }, [user, qc, setLocation]);

  return null;
}

function PremiumUpsell() {
  const { user } = useAuth();
  const { data: profile } = useGetMyProfile({
    query: { queryKey: getGetMyProfileQueryKey(), enabled: !!user },
  });
  const [open, setOpen] = useState(false);
  const shown = useRef(false);

  useEffect(() => {
    if (!user || !profile || shown.current) return;
    if (profile.isPremium) return; // already premium
    const key = `sever_premium_shown_${user.id}`;
    if (localStorage.getItem(key)) return; // already dismissed
    shown.current = true;
    // Small delay so the page content loads first
    const t = setTimeout(() => setOpen(true), 1800);
    return () => clearTimeout(t);
  }, [user, profile]);

  function handleClose() {
    setOpen(false);
    if (user) localStorage.setItem(`sever_premium_shown_${user.id}`, "1");
  }

  function handleSuccess() {
    setOpen(false);
    if (user) localStorage.setItem(`sever_premium_shown_${user.id}`, "1");
  }

  return <PremiumModal open={open} onClose={handleClose} onSuccess={handleSuccess} />;
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

        <Route path="/getting-started" component={GettingStarted} />
        <Route path="/help" component={Help} />
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
          <PremiumConfirmHandler />
          <PremiumUpsell />
          <AgeGateModal />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
