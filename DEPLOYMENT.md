# Deployment Guide - Berber Randevu Sistemi

## 🚀 Vercel Deployment

### 1. GitHub'a Push

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Vercel Dashboard'da Project Oluşturma

1. [Vercel Dashboard](https://vercel.com/dashboard) → **New Project**
2. GitHub repository'nizi seçin
3. **Import** butonuna tıklayın

### 3. Environment Variables Ayarlama

Vercel Dashboard → Project Settings → Environment Variables:

**Production, Preview, Development için ekleyin:**

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Önemli:** 
- `MONGODB_URI`: MongoDB Atlas connection string'iniz
- `JWT_SECRET`: Güçlü bir secret key (en az 32 karakter)

### 4. Build Settings (Otomatik Algılanır)

Vercel otomatik olarak algılar, ama kontrol edin:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 5. Deploy

1. **Deploy** butonuna tıklayın
2. Build tamamlanana kadar bekleyin
3. Deployment URL'inizi alın

### 6. Admin Kullanıcı Oluşturma (Production)

Production'da admin kullanıcı oluşturmak için:

**Seçenek 1: MongoDB Compass ile**
1. MongoDB Compass ile bağlanın
2. `users` collection'ına gidin
3. Yeni document ekleyin:
```json
{
  "email": "admin@berber.com",
  "password_hash": "<bcrypt hash>",
  "role": "admin",
  "metadata": {
    "ad": "Admin",
    "soyad": "User"
  }
}
```

**Seçenek 2: API Endpoint ile (Gelecekte eklenebilir)**

**Seçenek 3: Local'de script çalıştırıp production DB'ye bağlanın**
```bash
# .env.local'de production MONGODB_URI'yi kullanın
npm run create-admin
```

## 📝 Notlar

- `server.js` dosyası **sadece local development** için. Production'da Vercel serverless functions kullanılır.
- API route'ları `/api/*` altında otomatik olarak çalışır.
- `vercel.json` dosyası zaten yapılandırılmış.

## 🔧 Troubleshooting

### Build Hatası
- Node.js version kontrol edin (Vercel otomatik algılar)
- Dependencies eksikse `package.json` kontrol edin

### API Route'ları Çalışmıyor
- Environment variables doğru mu kontrol edin
- MongoDB Atlas IP whitelist'e `0.0.0.0/0` ekleyin (veya Vercel IP'lerini)

### Admin Kullanıcı Giriş Yapamıyor
- MongoDB'de admin kullanıcı var mı kontrol edin
- `role: "admin"` field'ı doğru mu kontrol edin

## 🌐 Custom Domain (Opsiyonel)

1. Vercel Dashboard → Project Settings → Domains
2. Domain'inizi ekleyin
3. DNS ayarlarını yapın

