'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Redirect if already logged in
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/book');
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Login attempt started...');
            const res = await api.post('/auth/signin', { email, password });
            console.log('API Success:', res.data);

            if (!res.data.token || !res.data.user) {
                throw new Error('Geçersiz sunucu yanıtı.');
            }

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            const role = res.data.user.role;
            console.log('User Role:', role);

            if (role === 'admin') {
                console.log('Redirecting to Admin...');
                router.push('/admin');
            } else {
                console.log('Redirecting to Book...');
                router.push('/book');
            }
        } catch (err: any) {
            console.error('Login detailed error:', err);
            const msg = err.response?.data?.message || err.message || 'Giriş başarısız.';
            setError(msg);
            alert('Hata: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center flex-1 py-12 px-4">
            <div className="w-full max-w-md space-y-8 border border-border p-8 rounded-xl bg-card/50 backdrop-blur-sm">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter">Giriş Yap</h1>
                    <p className="text-muted-foreground">Randevu almak için hesabınıza erişin</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="email">E-posta</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="ornek@email.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="password">Şifre</label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>

                    {error && <p className="text-destructive text-sm font-medium">{error}</p>}

                    <Button type="submit" className="w-full h-11" size="lg" disabled={loading}>
                        {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                    Hesabınız yok mu? <Link href="/register" className="underline hover:text-foreground transition-colors">Kayıt Ol</Link>
                </div>
            </div>
        </div>
    );
}
