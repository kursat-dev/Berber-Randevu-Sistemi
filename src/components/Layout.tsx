import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Scissors, Phone, MapPin, Menu, X, User, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
                <Scissors className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl tracking-wider">BERBER</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}
              >
                Ana Sayfa
              </Link>
              <Link
                to="/randevu"
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/randevu') ? 'text-primary' : 'text-muted-foreground'}`}
              >
                Randevu Al
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="w-4 h-4" />
                      <span className="max-w-[150px] truncate">
                        {user.user_metadata?.ad
                          ? `${user.user_metadata.ad} ${user.user_metadata.soyad}`
                          : user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isAdmin && (
                      <>
                        <DropdownMenuItem onClick={() => navigate("/admin")}>
                          <Settings className="w-4 h-4 mr-2" />
                          Admin Panel
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Çıkış Yap
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to="/giris"
                  className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/giris') ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  Giriş Yap
                </Link>
              )}

              <Link to="/randevu">
                <Button size="sm">
                  Hemen Randevu Al
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-border animate-fade-in">
              <div className="flex flex-col gap-4">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium py-2 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  Ana Sayfa
                </Link>
                <Link
                  to="/randevu"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium py-2 ${isActive('/randevu') ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  Randevu Al
                </Link>

                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-sm font-medium py-2 text-muted-foreground"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="text-sm font-medium py-2 text-left text-muted-foreground"
                    >
                      Çıkış Yap
                    </button>
                  </>
                ) : (
                  <Link
                    to="/giris"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-medium py-2 ${isActive('/giris') ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    Giriş Yap
                  </Link>
                )}

                <Link to="/randevu" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">
                    Hemen Randevu Al
                  </Button>
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-foreground rounded-full flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-primary" />
                </div>
                <span className="font-display text-2xl tracking-wider">BERBER</span>
              </div>
              <p className="text-primary-foreground/70 text-sm">
                Profesyonel berberlik hizmetleri ile stilinizi tamamlayın.
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-display text-xl mb-4">İLETİŞİM</h3>
              <div className="space-y-3">
                <a href="tel:+905551234567" className="flex items-center gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">+90 555 123 45 67</span>
                </a>
                <div className="flex items-start gap-3 text-primary-foreground/80">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span className="text-sm">Atatürk Caddesi No: 123<br />Merkez / İstanbul</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-display text-xl mb-4">HIZLI ERİŞİM</h3>
              <div className="space-y-2">
                <Link to="/randevu" className="block text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Randevu Al
                </Link>
                <Link to="/giris" className="block text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Giriş Yap
                </Link>
                <Link to="/kayit" className="block text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Kayıt Ol
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
            <p className="text-sm text-primary-foreground/60">
              © 2025 Berber. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
