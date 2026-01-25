'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        phone: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        // Redirect if already logged in
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/book');
        }
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await api.post('/auth/signup', formData);
            // Auto login on signup (assuming backend returns token, which it does)
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            router.push('/book');

        } catch (err: any) {
            setError(err.response?.data?.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
        }
    };

    return (
        <div className="flex justify-center items-center flex-1 py-12 px-4">
            <div className="w-full max-w-md space-y-8 border border-border p-8 rounded-xl bg-card/50 backdrop-blur-sm">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter">Kayıt Ol</h1>
                    <p className="text-muted-foreground">Randevu almak için hesap oluşturun</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="name">Ad</label>
                            <input
                                id="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="surname">Soyad</label>
                            <input
                                id="surname"
                                type="text"
                                required
                                value={formData.surname}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="phone">Telefon</label>
                        <input
                            id="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="email">E-posta</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="ornek@email.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="password">Şifre</label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>

                    {error && <p className="text-destructive text-sm font-medium">{error}</p>}

                    <Button type="submit" className="w-full h-11" size="lg">Kayıt Ol</Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                    Zaten hesabınız var mı? <Link href="/login" className="underline hover:text-foreground transition-colors">Giriş Yap</Link>
                </div>
            </div>
        </div>
    );
}
