# 💈 Berber Randevu Sistemi

Modern, production-ready barber appointment booking system built with Next.js and MongoDB. A complete SaaS solution for barbershops to manage online appointments with real-time availability and admin approval workflow.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)

## ✨ Features

### For Customers
- 📅 **Online Booking**: Real-time appointment scheduling with instant availability
- 💰 **Transparent Pricing**: See service costs upfront before booking
- 📱 **Mobile-First**: Fully responsive design optimized for all devices
- ⏰ **Smart Scheduling**: Automatic time slot generation based on business hours
- 🔒 **Spam Protection**: reCAPTCHA v3 integration for security

### For Business Owners
- 🔐 **Secure Admin Panel**: JWT-based authentication
- ✅ **Approval Workflow**: Review and approve/reject appointments
- 📊 **Advanced Filtering**: View appointments by status and date
- 👥 **Customer Management**: Complete booking details and contact information
- 📈 **Scalable Architecture**: Built on serverless infrastructure

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), React, TailwindCSS |
| **Backend** | Next.js API Routes (Serverless) |
| **Database** | MongoDB Atlas |
| **Authentication** | JWT + bcrypt |
| **Deployment** | Vercel |
| **Security** | reCAPTCHA v3 |

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- MongoDB Atlas account ([sign up free](https://www.mongodb.com/cloud/atlas))
- Google reCAPTCHA v3 keys ([get keys](https://www.google.com/recaptcha/admin))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd berber-randevu-sistemi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your credentials:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
   ```

4. **Seed the database**
   ```bash
   npx ts-node scripts/seed.ts
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
berber-randevu-sistemi/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API endpoints
│   │   ├── admin/             # Admin panel pages
│   │   └── page.tsx           # Customer booking page
│   ├── components/            # React components
│   │   ├── booking/           # Customer-facing components
│   │   ├── admin/             # Admin panel components
│   │   └── ui/                # Reusable UI components
│   ├── lib/                   # Utility functions
│   ├── models/                # MongoDB schemas
│   └── types/                 # TypeScript definitions
├── scripts/                   # Database seeding scripts
└── public/                    # Static assets
```

## 🔑 Key Features Explained

### Collision-Free Booking System

The system uses MongoDB's compound unique index to prevent double-bookings at the database level:

```typescript
AppointmentSchema.index({ date: 1, timeSlot: 1 }, { unique: true });
```

This ensures atomic enforcement, preventing race conditions even with concurrent requests.

### Dynamic Time Slot Generation

- Configurable schedules for each day of the week
- Support for break times (e.g., lunch breaks)
- Automatic generation of available time slots
- Past time slots are automatically disabled

### Security & Best Practices

- JWT tokens with configurable expiration
- Password hashing with bcrypt (10 rounds)
- reCAPTCHA v3 with score-based validation
- Environment-based configuration
- TypeScript for type safety

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/appointments` | Create new booking | reCAPTCHA |
| `GET` | `/api/appointments` | List all appointments | Optional |
| `GET` | `/api/appointments/availability` | Get available time slots | No |
| `PATCH` | `/api/appointments/[id]/status` | Approve/reject appointment | JWT Required |
| `GET` | `/api/services` | List active services | No |
| `GET` | `/api/working-hours` | Get business hours | No |
| `POST` | `/api/auth/login` | Admin authentication | No |
| `GET` | `/api/auth/verify` | Verify JWT token | JWT Required |

## 🌐 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel dashboard
4. Deploy!

The application is optimized for serverless deployment and will scale automatically.

### MongoDB Atlas Configuration

For serverless functions, configure MongoDB Atlas to:
- Whitelist Vercel's IP ranges, or
- Allow access from anywhere (`0.0.0.0/0`) with strong authentication

## 🔮 Future Roadmap

The system is architected to support:

- 📞 SMS/Email notifications via webhook
- 🔔 Appointment reminders
- 👥 Multi-barber support
- 💳 Subscription billing
- 📊 Analytics dashboard
- 📧 Customer email communications

## 📋 Production Checklist

Before deploying to production:

- [ ] Update default admin credentials
- [ ] Configure production MongoDB whitelist
- [ ] Generate strong JWT_SECRET
- [ ] Set up reCAPTCHA for production domain
- [ ] Enable MongoDB automatic backups
- [ ] Configure error monitoring (e.g., Sentry)
- [ ] Set up custom domain

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For questions or support, please open an issue in the GitHub repository.

---

<div align="center">
  <strong>Built with ❤️ for modern barbershops</strong>
  <br />
  <sub>Powered by Next.js, TypeScript, and MongoDB</sub>
</div>
