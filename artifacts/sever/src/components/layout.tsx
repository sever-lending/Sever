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
            <Link href="/" className="flex items-center space-x-2">
              <img src={LOGO_URL} alt="Sever" className="h-9 w-auto" />
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
          <div className="flex flex-1 items-center justify-end space-x-4">
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
                  <Button size="sm" onClick={login} className="font-bold tracking-tight">
                    LOG IN
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
    </div>
  );
}
