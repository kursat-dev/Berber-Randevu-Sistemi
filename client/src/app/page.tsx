import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 text-center bg-white overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-0 w-full h-1 bg-black animate-fade-in" />

      <div className="space-y-8 max-w-4xl relative z-10">
        <div className="space-y-2 animate-fade-in-up">
          <p className="text-sm font-bold tracking-[0.3em] uppercase opacity-50">EST. 2026</p>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none">
            LEGACY <br />
            <span className="text-white bg-black px-4 ml-[-1rem]">BARBER</span>
          </h1>
        </div>

        <div className="space-y-6 animate-fade-in-up animate-delay-200">
          <p className="text-xl md:text-2xl font-medium tracking-tight text-neutral-600 max-w-xl mx-auto leading-relaxed">
            Sıradan bir kesim değil, bir miras. <br />
            Modern teknikler, zamansız stil.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto pt-4">
            <Link href="/login" className="flex-1">
              <Button size="lg" className="w-full h-16 text-lg tracking-widest uppercase font-bold border-2 border-black rounded-none">Giriş Yap</Button>
            </Link>
            <Link href="/register" className="flex-1">
              <Button variant="outline" size="lg" className="w-full h-16 text-lg tracking-widest uppercase font-bold border-2 border-black rounded-none bg-transparent text-black transition-all hover:bg-black hover:text-white">Kayıt Ol</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Decorative Line */}
      <div className="absolute bottom-0 right-0 w-full h-1 bg-black animate-fade-in animate-delay-500" />
    </div>
  );
}
