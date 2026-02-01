import { Link } from "react-router-dom";
import { Scissors, Clock, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

const Home = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-primary text-primary-foreground overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-40 h-40 border-2 border-primary-foreground rounded-full" />
          <div className="absolute bottom-20 right-20 w-60 h-60 border-2 border-primary-foreground rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-primary-foreground rounded-full" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full mb-6">
              <Scissors className="w-4 h-4" />
              <span className="text-sm font-medium">Profesyonel Berberlik Hizmeti</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl mb-6 tracking-wider">
              STİLİNİZE<br />DOKUNUYORUZ
            </h1>
            
            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Uzman berberlerimiz ile saç ve sakal bakımınızı güvenle bize bırakın. 
              Online randevu ile zaman kaybetmeden hizmet alın.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/randevu">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6 font-medium group">
                  Randevu Al
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href="tel:+905551234567">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 font-medium border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Bizi Arayın
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="font-display text-4xl md:text-5xl mb-4">HİZMETLERİMİZ</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              İhtiyacınıza göre hizmet seçin ve randevunuzu oluşturun.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Saç Traşı */}
            <div className="group bg-card border border-border rounded-lg p-8 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Scissors className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl mb-3">SAÇ TRAŞI</h3>
              <p className="text-muted-foreground mb-4">
                Modern kesim teknikleri ile istediğiniz saç modeli.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>~45 dakika</span>
              </div>
            </div>

            {/* Saç + Sakal */}
            <div className="group bg-card border border-border rounded-lg p-8 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Scissors className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl mb-3">SAÇ + SAKAL</h3>
              <p className="text-muted-foreground mb-4">
                Komple bakım paketi ile hem saç hem sakal düzenleme.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>~1 saat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl mb-4">NEDEN BİZ?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl mb-2">UZMAN EKIP</h3>
              <p className="text-muted-foreground text-sm">
                Yılların deneyimine sahip profesyonel berberler.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl mb-2">KOLAY RANDEVU</h3>
              <p className="text-muted-foreground text-sm">
                Online randevu sistemi ile bekleme yok.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl mb-2">KALİTELİ HİZMET</h3>
              <p className="text-muted-foreground text-sm">
                En iyi ürünler ve hijyenik ortam.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl mb-6">HEMEN RANDEVU ALIN</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Birkaç adımda randevunuzu oluşturun ve bekleme derdi olmadan hizmet alın.
          </p>
          <Link to="/randevu">
            <Button size="lg" className="text-lg px-8 py-6 font-medium group">
              Randevu Oluştur
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
