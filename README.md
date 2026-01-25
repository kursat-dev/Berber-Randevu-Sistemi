# Berber Randevu Sistemi

Modern, siyah & beyaz konseptli, full-stack berber randevu sistemi. Next.js, Tailwind CSS ve Express/MongoDB kullanılarak geliştirilmiştir.

## Özellikler

-   **Modern Tasarım**: Minimalist siyah & beyaz arayüz.
-   **Kullanıcı Sistemi**: Kayıt ve Giriş (JWT Authentication).
-   **Randevu Sistemi**:
    -   Tarih ve Saat seçimi (08:30 - 20:00).
    -   Pazar günleri kapalı kontrolü.
    -   Dolu saatlerin engellenmesi.
-   **Admin Paneli**:
    -   Randevu yönetimi (Onayla/Reddet).
    -   Ayarlar (Çalışma saatleri, Dükkan durumu).

## Kurulum

### Gereksinimler
-   Node.js (v18+)
-   MongoDB Veritabanı (URI)

### Adımlar

1.  **Backend Kurulumu**
    ```bash
    cd server
    npm install
    cp .env.example .env
    # .env dosyasını MongoDB URI ve JWT Secret ile güncelleyin
    npm start
    ```

2.  **Frontend Kurulumu**
    ```bash
    cd client
    npm install
    npm run dev
    ```

3.  **Tarayıcıda Açın**
    `http://localhost:3000` adresine gidin.

## Dağıtım (Deploy)

Bu proje **Vercel** üzerine dağıtım için hazırdır. Kök dizindeki `vercel.json` dosyası, `server` klasörünü Serverless Function olarak, `client` klasörünü ise Next.js uygulaması olarak yapılandırır.

1.  GitHub'a pushlayın.
2.  Vercel'de yeni proje oluşturun.
3.  Environment Variables ekleyin:
    -   `MONGODB_URI`
    -   `JWT_SECRET`
