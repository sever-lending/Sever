import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { LogOut, Home, LayoutDashboard, Store, HandCoins, Briefcase, Wallet, UserCircle, Users, BookOpen, MessageSquare } from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";

const LOGO_URL = `${import.meta.env.BASE_URL}sever-logo.png`;

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated, login, logout, isLoading } = useAuth();
  const [location] = useLocation();

  const navLinks = isAuthenticated
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/marketplace", label: "Marketplace", icon: Store },
        { href: "/borrow", label: "Borrow", icon: HandCoins },
        { href: "/portfolio", label: "Portfolio", icon: Briefcase },
        { href: "/wallet", label: "Wallet", icon: Wallet },
        { href: "/messages", label: "Messages", icon: MessageSquare },
        { href: "/lenders", label: "Lenders", icon: Users },
      ]
    : [
        { href: "/", label: "Home", icon: Home },
        { href: "/lenders", label: "Lenders", icon: Users },
        { href: "/tutorial", label: "Guide", icon: BookOpen },
      ];

  return (
    <div className="min-h-[100dvh] flex flex-col w-full bg-background text-foreground selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center w-full px-4 md:px-6">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center gap-2.5">
              <img src={LOGO_URL} alt="Sever" className="h-8 w-auto" />
              <span className="font-bold text-lg tracking-tight hidden sm:inline">
                SEVER<span className="text-primary">.</span>
              </span>
            </Link>
            <nav className="hidden md:flex gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center text-sm font-medium transition-colors hover:text-foreground/80 ${
                    location === link.href ? "text-foreground" : "text-foreground/60"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            {!isLoading && (
              <nav className="flex items-center space-x-2">
                {isAuthenticated ? (
                  <>
                    <NotificationBell />
                    <Link href="/profile" className="hidden md:flex items-center justify-center p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <UserCircle className="h-5 w-5" />
                    </Link>
                    <Button variant="outline" size="sm" onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={login} className="font-bold tracking-tight px-5">
                    GET STARTED
                  </Button>
                )}
              </nav>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="border-t border-border/40 bg-background py-6 px-4 md:px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="Sever" className="h-5 w-auto opacity-60" />
            <span className="font-semibold">SEVER.</span>
            <span>© {new Date().getFullYear()} Sever Lending, LLC. All rights reserved.</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/legal/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/legal/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/legal/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
            <Link href="/legal/contract" className="hover:text-foreground transition-colors">Loan Agreement</Link>
            <span className="h-3 w-px bg-border/60 hidden sm:block" />
            <a href="https://apps.apple.com/app/sever-lending/id0000000000" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11"/></svg>
              App Store
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.severlending.sever" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor"><path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z"/></svg>
              Google Play
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
