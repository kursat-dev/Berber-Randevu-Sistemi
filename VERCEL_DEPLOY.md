# Vercel Deployment Guide

## 1. Environment Variables

Vercel dashboard'da şu environment variable'ları ekleyin:

### Production Environment Variables:
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - JWT token için secret key (güçlü bir string kullanın)

### Optional (Admin User için):
- `ADMIN_EMAIL` - Admin kullanıcı email'i (default: admin@berber.com)
- `ADMIN_PASSWORD` - Admin kullanıcı şifresi (default: admin123)

## 2. Build Settings

Vercel otomatik olarak algılayacak, ama manuel ayarlamak isterseniz:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## 3. Deploy Adımları

1. GitHub'a push edin (veya Vercel CLI ile):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. Vercel Dashboard'da:
   - New Project → GitHub repo'nuzu seçin
   - Environment Variables ekleyin (yukarıdaki listeye göre)
   - Deploy butonuna tıklayın

3. Veya Vercel CLI ile:
   ```bash
   npm i -g vercel
   vercel
   ```

## 4. Admin User Oluşturma

Deploy sonrası admin kullanıcı oluşturmak için:

**Local'de:**
```bash
npm run create-admin
```

**Vercel'de (Production):**
Vercel Functions kullanarak bir API endpoint oluşturabilirsiniz veya MongoDB Compass ile manuel olarak oluşturabilirsiniz.

## 5. Notlar

- `server.js` dosyası sadece local development için. Production'da Vercel serverless functions kullanılacak.
- `vercel.json` dosyası zaten yapılandırılmış.
- API route'ları `/api/*` altında otomatik olarak çalışacak.

