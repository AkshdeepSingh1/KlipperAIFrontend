import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, LayoutDashboard, User } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LogoSingle from "@/assets/logo-single.svg";

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = isAuthenticated
    ? [
      { href: "/dashboard", label: "Studio", icon: LayoutDashboard },
      { href: "/profile", label: "Profile", icon: User },
    ]
    : [];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src={LogoSingle} alt="AutoTube Logo" className="h-8 w-auto" />
          <span className="text-xl tracking-tight text-foreground">
            Auto<span style={{ color: "#549BEE" }}>Tube</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive(link.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <Button 
              variant="ghost" 
              onClick={logout}
              className="hover:bg-primary/10 hover:text-primary focus-visible:ring-0 focus-visible:ring-offset-0 border-none outline-none"
            >
              Logout
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button variant="gradient">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-b border-border/50"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                    }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <Button 
                  variant="ghost" 
                  onClick={logout} 
                  className="justify-start hover:bg-primary/10 hover:text-primary focus-visible:ring-0 focus-visible:ring-offset-0 border-none outline-none"
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="gradient" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
