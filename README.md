# Berber Randevu Sistemi

Modern, production-ready barber appointment booking system built with Next.js, MongoDB, and deployed on Vercel.

## Features

### Customer Features
- 📅 **Online Booking**: Select date, time, and service with real-time availability
- 💰 **Dynamic Pricing**: See service prices and total cost before booking
- 📱 **Mobile-First Design**: Fully responsive for all devices
- ⏰ **Smart Time Slots**: Automatic generation based on working hours
- 🔒 **Spam Protection**: reCAPTCHA v3 integration

### Admin Features
- 🔐 **Secure Login**: JWT-based authentication
- ✅ **Appointment Management**: Approve or reject bookings
- 📊 **Filtering**: View appointments by status and date
- 👥 **Customer Information**: Full booking details at a glance

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes (Serverless)
- **Database**: MongoDB Atlas
- **Authentication**: JWT (jsonwebtoken, bcryptjs)
- **Deployment**: Vercel
- **Bot Protection**: Google reCAPTCHA v3

## Quick Start

### 1. Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier works)
- Google reCAPTCHA v3 keys (optional for development)

### 2. Installation

\`\`\`bash
cd berber-randevu-sistemi
npm install
\`\`\`

### 3. Environment Setup

Copy the example environment file:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` and add your configuration:

\`\`\`env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/barber-booking?retryWrites=true&w=majority

# JWT secret (use a random string for production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# reCAPTCHA v3 keys (get from https://www.google.com/recaptcha/admin)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
\`\`\`

### 4. Seed Initial Data

Run the seeding script to populate services, working hours, and admin user:

\`\`\`bash
npx ts-node scripts/seed.ts
\`\`\`

This will create:
- 5 sample services (Saç Kesimi, Sakal Tıraşı, etc.)
- Working hours configuration (Monday-Saturday, 09:00-19:00)
- Admin user: `admin` / `admin123` ⚠️ **CHANGE IN PRODUCTION!**

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit:
- **Customer booking**: http://localhost:3000
- **Admin login**: http://localhost:3000/admin/login

## Project Structure

\`\`\`
src/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── appointments/       # Booking CRUD + availability
│   │   ├── auth/               # Admin login & verify
│   │   ├── services/           # Service management
│   │   └── working-hours/      # Shop hours
│   ├── admin/                  # Admin panel pages
│   │   ├── login/
│   │   └── dashboard/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Customer booking page
│   └── globals.css             # Global styles
├── components/
│   ├── booking/                # Customer booking components
│   ├── admin/                  # Admin components
│   └── ui/                     # Reusable UI components
├── lib/                        # Utility functions
│   ├── mongodb.ts              # DB connection
│   ├── jwt.ts                  # Authentication
│   ├── recaptcha.ts            # Bot protection
│   └── utils.ts                # Helpers
├── models/                     # Mongoose schemas
│   ├── Appointment.ts
│   ├── Service.ts
│   ├── Admin.ts
│   └── WorkingHours.ts
└── types/                      # TypeScript interfaces
\`\`\`

## Key Features Explained

### Time-Collision Prevention

The system prevents double-bookings using a **compound unique index** on MongoDB:

\`\`\`typescript
AppointmentSchema.index({ date: 1, timeSlot: 1 }, { unique: true });
\`\`\`

This ensures atomic enforcement at the database level, preventing race conditions even with concurrent requests.

### Working Hours

- Configurable per day of the week
- Supports break times
- Automatically generates available time slots
- Past time slots are automatically disabled

### Security

- JWT tokens expire after 7 days
- Password hashing with bcrypt (10 rounds)
- reCAPTCHA score threshold: 0.5
- Admin routes protected by middleware

## Deployment to Vercel

### 1. Push to GitHub

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
\`\`\`

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables (same as `.env.local`)
4. Deploy!

### 3. Configure MongoDB Atlas

Make sure to whitelist Vercel's IP addresses or use `0.0.0.0/0` (allow from anywhere) for serverless functions.

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/appointments` | Create booking | reCAPTCHA |
| `GET` | `/api/appointments` | List appointments | Optional |
| `GET` | `/api/appointments/availability` | Get available slots | No |
| `PATCH` | `/api/appointments/[id]/status` | Approve/reject | JWT |
| `GET` | `/api/services` | List active services | No |
| `GET` | `/api/working-hours` | Get shop hours | No |
| `POST` | `/api/auth/login` | Admin login | No |
| `GET` | `/api/auth/verify` | Verify JWT | JWT |

## Future Enhancements (Designed for, not implemented)

- 📞 SMS/phone call confirmation via n8n webhook
- 🔔 Reminder notifications
- 👥 Multi-barber support
- 💳 Subscription & billing tiers
- 📊 Analytics dashboard
- 📧 Email notifications

## Production Checklist

Before going live:

- [ ] Change default admin password
- [ ] Update MongoDB Atlas whitelist
- [ ] Generate strong JWT_SECRET
- [ ] Configure reCAPTCHA for production domain
- [ ] Enable MongoDB backups
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure custom domain on Vercel

## License

This is a commercial MVP project. All rights reserved.

## Support

For questions or issues, contact: admin@berber.com

---

**Built with ❤️ for barbers everywhere**
