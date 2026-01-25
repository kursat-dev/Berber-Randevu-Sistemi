import Link from 'next/link';
import { Scissors } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                    <Scissors className="w-6 h-6" />
                    <span>BERBER</span>
                </Link>

                {/* Simplified for single-flow: No menu links, just brand. */}
            </div>
        </nav>
    );
};

export default Navbar;
