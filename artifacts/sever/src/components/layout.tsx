import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { LogOut, Home, LayoutDashboard, Store, HandCoins, Briefcase, Wallet, UserCircle, Users } from "lucide-react";
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
        { href: "/lenders", label: "Lenders", icon: Users },
      ]
    : [
        { href: "/", label: "Home", icon: Home },
        { href: "/lenders", label: "Lenders", icon: Users },
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
          </nav>
        </div>
      </footer>
    </div>
  );
}
