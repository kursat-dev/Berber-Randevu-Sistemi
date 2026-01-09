import BookingForm from '@/components/booking/BookingForm';

export default function HomePage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                        Online Randevu
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Hemen randevunuzu oluşturun, onayını bekleyin
                    </p>
                </div>

                {/* Booking Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12">
                    <BookingForm />
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>📞 Sorularınız için: +90 555 123 45 67</p>
                    <p className="mt-2">📍 Adres: Örnek Mah. Berber Sok. No:1, İstanbul</p>
                </div>
            </div>
        </main>
    );
}
