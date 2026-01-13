import BookingForm from '@/components/booking/BookingForm';
import Image from 'next/image';

export default function HomePage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-yellow-400 selection:text-black">
            {/* Hero Background */}
            <div className="fixed inset-0 z-0">
                <Image
                    src="/hero-bg.png"
                    alt="Barber Shop Hero"
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 hero-gradient" />
            </div>

            <div className="relative z-10">
                {/* Navigation/Header */}
                <header className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-black font-black text-xl italic">B</span>
                        </div>
                        <span className="text-2xl font-black tracking-tighter uppercase italic">
                            Berber<span className="text-yellow-500">Shop</span>
                        </span>
                    </div>
                </header>

                <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Side: Content */}
                    <div className="space-y-8">
                        <div className="inline-block px-4 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-sm font-bold tracking-wider uppercase">
                            Premium Erkek Bakımı
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight italic">
                            TARZINI <br />
                            <span className="text-yellow-500 text-glow">KEŞFET.</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                            Sadece bir tıraş değil, bir deneyim sunuyoruz. Uzman kadromuz ile stilinizi en üst seviyeye taşıyın.
                        </p>

                        <div className="grid grid-cols-3 gap-6 pt-8">
                            <div>
                                <div className="text-3xl font-black text-yellow-500">15+</div>
                                <div className="text-sm text-gray-400 uppercase tracking-widest">Tecrübe</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-yellow-500">5k+</div>
                                <div className="text-sm text-gray-400 uppercase tracking-widest">Müşteri</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-yellow-500">4.9</div>
                                <div className="text-sm text-gray-400 uppercase tracking-widest">Puan</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Booking Form */}
                    <div className="glass-card backdrop-blur-2xl">
                        <div className="mb-8">
                            <h2 className="text-3xl font-black italic mb-2">RANDEVU AL</h2>
                            <div className="h-1 w-20 bg-yellow-500"></div>
                        </div>
                        <BookingForm />
                    </div>
                </div>

                {/* Footer Info */}
                <footer className="mt-24 py-12 px-4 border-t border-white/10 glass">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="text-center md:text-left">
                            <p className="text-yellow-500 font-bold mb-2 uppercase tracking-widest">Lokasyon</p>
                            <p className="text-gray-300 text-lg">📍 Örnek Mah. Berber Sok. No:1, İstanbul</p>
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-yellow-500 font-bold mb-2 uppercase tracking-widest">İletişim</p>
                            <p className="text-gray-300 text-lg underline decoration-yellow-500/50">📞 +90 555 123 45 67</p>
                        </div>
                    </div>
                </footer>
            </div>
        </main>
    );
}
