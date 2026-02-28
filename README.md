# 💈 Berber Randevu Sistemi

Modern ve şık bir berber randevu yönetim sistemi. Müşterilerin kolayca randevu almasını sağlarken, işletme sahiplerine tüm süreci yönetebilecekleri güçlü bir yönetim paneli sunar.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Headless-47A248?logo=mongodb&logoColor=white)

---

## 🚀 Özellikler

### 👤 Müşteriler İçin
- **Kolay Randevu Alma**: Kullanıcı dostu arayüz ile tarih ve saat seçimi.
- **Hizmet Seçimi**: Farklı berber hizmetleri arasından seçim yapabilme.
- **Dolu Saat Kontrolü**: Seçilen tarihteki dolu saatleri otomatik görme.
- **Responsive Tasarım**: Mobil ve masaüstü cihazlarda kusursuz deneyim.

### 🛡️ Yönetim Paneli (Admin)
- **Randevu Takibi**: Tüm randevuları listeleyebilme ve filtreleme.
- **Durum Güncelleme**: Randevuları onaylama, iptal etme veya tamamlama.
- **Güvenli Giriş**: JWT tabanlı yönetici kimlik doğrulaması.

---

## 🏗️ Mimari ve Veri Akışı

### High-Level Architecture
Uygulama, modern bir SPA (Single Page Application) olarak tasarlanmıştır. Backend, Vercel Serverless Function'lar üzerinde çalışarak ölçeklenebilirlik sağlar.

```mermaid
graph TD
    subgraph Client ["Client Side (Browser)"]
        UI[React UI]
        Router[React Router]
        State[React Hooks / State]
    end

    subgraph Server ["Serverless Backend (Vercel)"]
        API[Express App / API Routes]
        Auth[Auth Controller]
        Apt[Appointment Controller]
    end

    subgraph Database ["Data Storage"]
        Mongo[(MongoDB Atlas)]
    end

    User((User)) -->|Interacts| UI
    UI -->|Navigates| Router
    UI -->|HTTP Requests| API
    
    API -->|Validate| Auth
    API -->|CRUD Ops| Apt
    
    Apt -->|Query/Update| Mongo
    Auth -->|User Check| Mongo
```

### Randevu Oluşturma Akışı
Kullanıcının randevu alma sürecindeki veri akışı ve çakışma kontrolü aşağıdaki gibidir:

```mermaid
sequenceDiagram
    participant U as Kullanıcı
    participant FE as Frontend (React)
    participant API as API (Express)
    participant DB as MongoDB

    Note over U, FE: Tarih Seçimi
    U->>FE: Bir tarih seçer
    FE->>API: GET /api/appointments?date=YYYY-MM-DD
    API->>DB: find({ tarih: date, durum: !=iptal })
    DB-->>API: Dolu Saatleri Döndür
    API-->>FE: [10:00, 14:30, ...]
    FE->>U: Dolu saatleri pasif göster

    Note over U, FE: Randevu Onayı
    U->>FE: Saat ve Hizmet Seçer -> "Randevu Al"
    FE->>API: POST /api/appointments
    
    rect rgb(240, 240, 240)
        Note right of API: Çakışma Kontrolü (Critical Section)
        API->>DB: findOne({ tarih, saat, durum: !=iptal })
        alt Saat doluysa
            DB-->>API: Kayıt bulundu
            API-->>FE: 409 Conflict "Saat Dolu"
            FE-->>U: Hata Mesajı Göster
        else Saat boşsa
            DB-->>API: null
            API->>DB: create({ ...details })
            DB-->>API: Yeni Kayıt
            API-->>FE: 201 Created
            FE-->>U: Başarılı Mesajı & Yönlendirme
        end
    end
```

---

## 🛠️ Teknolojiler

| Alan | Teknoloji | Açıklama |
|------|-----------|----------|
| **Frontend** | React, TypeScript | Tip güvenli UI geliştirme |
| **Build Tool** | Vite | Hızlı geliştirme ve build süreci |
| **Styling** | TailwindCSS, Shadcn UI | Modern ve hızlı stil yapısı |
| **Backend** | Node.js, Express | Serverless uyumlu REST API |
| **Database** | MongoDB, Mongoose | Esnek veri modelleme |
| **Auth** | JWT (JSON Web Tokens) | Güvenli oturum yönetimi |
| **Deploy** | Vercel | Frontend ve Backend hosting |

---

## 💻 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin.

### 1. Ön Gereksinimler
- Node.js (v18 veya üzeri)
- MongoDB Connection String (MongoDB Atlas önerilir)

### 2. Repoyu Klonlayın
```bash
git clone https://github.com/kursat-dev/Berber-Randevu-Sistemi
cd Berber-Randevu-Sistemi
```

### 3. Bağımlılıkları Yükleyin
```bash
npm install
```

### 4. Çevre Değişkenlerini Ayarlayın
Ana dizinde `.env.local` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
MONGODB_URI=mongodb+srv://<kullanici>:<sifre>@cluster.mongodb.net/berber-db
JWT_SECRET=cok-gizli-super-guvenli-anahtar
```

### 5. Projeyi Başlatın

**Frontend ve Backend'i birlikte çalıştırmak için (Önerilen):**
Bu komut `vercel dev` simülasyonunu kullanır.
```bash
npm run local
```

**Sadece Frontend'i çalıştırmak için:**
Backend API çalışmayacaktır, sadece UI geliştirmesi için uygundur.
```bash
npm run dev
```

---

## 📂 Proje Yapısı

```
berber-randevu-sistemi/
├── api/                # Backend API kodları (Vercel Serverless)
│   ├── auth/           # Kimlik doğrulama rotaları
│   ├── models/         # Mongoose veritabanı modelleri
│   ├── appointments.ts # Randevu işlemleri
│   └── db.ts           # Veritabanı bağlantısı
├── src/                # Frontend React uygulaması
│   ├── components/     # UI bileşenleri (Button, Input vs.)
│   ├── pages/          # Sayfalar (Giriş, Randevu, Admin vs.)
│   ├── lib/            # Yardımcı fonksiyonlar
│   ├── hooks/          # Custom React hooks
│   ├── App.tsx         # Ana uygulama bileşeni
│   └── main.tsx        # Giriş noktası
├── public/             # Statik dosyalar
└── ...config files     # Vite, Tailwind, TS yapılandırmaları
```

---

## 🔒 Lisans
Bu proje MIT lisansı ile lisanslanmıştır.
