import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Kayit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    telefon: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ad || !formData.soyad || !formData.telefon || !formData.email || !formData.password) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Hata",
        description: "Şifre en az 6 karakter olmalıdır.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await signUp(formData.email, formData.password, {
      ad: formData.ad,
      soyad: formData.soyad,
      telefon: formData.telefon,
    });
    
    if (error) {
      toast({
        title: "Kayıt Hatası",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    toast({
      title: "Kayıt Başarılı",
      description: "E-posta adresinize doğrulama linki gönderildi. Lütfen e-postanızı kontrol edin.",
    });
    
    navigate("/giris");
    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl md:text-5xl mb-2">KAYIT OL</h1>
            <p className="text-muted-foreground">
              Yeni bir hesap oluşturun
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 shadow-card">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ad">Ad</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="ad"
                      placeholder="Adınız"
                      className="pl-10"
                      value={formData.ad}
                      onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="soyad">Soyad</Label>
                  <Input
                    id="soyad"
                    placeholder="Soyadınız"
                    value={formData.soyad}
                    onChange={(e) => setFormData({ ...formData, soyad: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="telefon">Telefon Numarası</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="telefon"
                    type="tel"
                    placeholder="05XX XXX XX XX"
                    className="pl-10"
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">E-posta</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Şifre</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">En az 6 karakter</p>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Zaten hesabınız var mı?{" "}
                <Link to="/giris" className="text-primary font-medium hover:underline">
                  Giriş Yap
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Kayit;
