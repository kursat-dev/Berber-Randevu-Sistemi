import { Instagram, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-primary text-primary-foreground py-12 mt-auto">
            <div className="container mx-auto px-4 text-center">
                <h3 className="text-2xl font-bold tracking-tighter mb-4">BERBER</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Modern saç kesimi ve sakal tasarımı için profesyonel hizmet.
                </p>

                <div className="flex justify-center gap-6 mb-8">
                    <a href="#" className="hover:text-white transition-colors text-white/70"><Instagram className="w-6 h-6" /></a>
                    <a href="#" className="hover:text-white transition-colors text-white/70"><Twitter className="w-6 h-6" /></a>
                    <a href="#" className="hover:text-white transition-colors text-white/70"><Facebook className="w-6 h-6" /></a>
                </div>

                <p className="text-sm text-zinc-500">
                    &copy; {new Date().getFullYear()} Berber Randevu Sistemi. Tüm hakları saklıdır.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
