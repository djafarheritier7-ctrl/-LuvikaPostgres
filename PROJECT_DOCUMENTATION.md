# LUVIKA Project Documentation

## Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Frontend Architecture](#frontend-architecture)
- [Security Features](#security-features)
- [Deployment](#deployment)
- [Development Guidelines](#development-guidelines)

## Overview

LUVIKA is a comprehensive digital business card and networking platform that combines NFC technology, QR codes, and modern web technologies to revolutionize how professionals connect and share information.

### Key Features
- **Smart NFC Business Cards**: Physical NFC cards that link to digital profiles
- **QR Code Generation**: Dynamic QR codes for profiles, events, and products
- **Profile Management**: Complete user profile system with customization options
- **Event Management**: Create and manage events with QR-based check-in
- **Subscription System**: Multi-tier subscription plans (Basic, Professional, Business)
- **Analytics Dashboard**: Real-time statistics and engagement tracking
- **Multi-language Support**: French, English, Lingala, Spanish, and more
- **Real-time Updates**: Live profile updates and notifications

## Technology Stack

### Frontend
- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism effects
- **State Management**: React Context + useState
- **Animations**: Framer Motion
- **Icons**: Lucide React + React Icons
- **Internationalization**: Next Intl
- **UI Components**: Custom component library

### Backend
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth with JWT
- **Storage**: Supabase Storage (avatars, covers, product images)
- **Functions**: Supabase Edge Functions
- **Real-time**: Supabase Realtime subscriptions

### DevOps
- **Hosting**: Vercel (recommended)
- **Database**: Supabase
- **CI/CD**: GitHub Actions (implied)
- **Package Manager**: npm

## Project Structure

```
luvika/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [locale]/          # Internationalized routes
│   │   ├── admin/             # Admin dashboard
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── documentation/     # Documentation page
│   │   ├── events/            # Event pages
│   │   ├── u/                 # User profile routes
│   │   └── [locale]/public/   # Public pages
│   ├── components/            # React components
│   │   ├── admin/            # Admin-specific components
│   │   ├── cards/            # Profile card components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── events/           # Event-related components
│   │   ├── home/             # Homepage components
│   │   ├── layout/           # Layout components
│   │   ├── nfc/              # NFC-related components
│   │   ├── pricing/          # Pricing components
│   │   ├── profile/          # Profile components
│   │   ├── system/           # System components
│   │   └── ui/               # Reusable UI components
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   │   ├── auth/            # Authentication utilities
│   │   ├── companies.ts     # Company management
│   │   ├── notify.ts        # Notification system
│   │   ├── supabase/        # Supabase utilities
│   │   └── utils/           # General utilities
│   ├── types/               # TypeScript type definitions
│   └── i18n.ts              # Internationalization setup
├── messages/                # Translation files
├── public/                  # Static assets
├── supabase/               # Supabase configuration
├── components/             # Legacy components (being migrated)
├── lib/                    # Legacy libraries (being migrated)
└── scripts/                # Development scripts
```

## Database Schema

### Core Tables

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  cover_url TEXT,
  bio_short TEXT,
  bio_long TEXT,
  job_title TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  instagram TEXT,
  tiktok TEXT,
  linkedin TEXT,
  snapchat TEXT,
  telegram TEXT,
  github TEXT,
  gitlab TEXT,
  behance TEXT,
  dribbble TEXT,
  calendly TEXT,
  portfolio_url TEXT,
  cv_url TEXT,
  nickname TEXT,
  pronouns TEXT,
  birth_day INTEGER,
  birth_month INTEGER,
  birth_year INTEGER,
  city TEXT,
  country TEXT,
  timezone TEXT,
  availability TEXT,
  skills TEXT[],
  professional_status TEXT,
  website TEXT,
  address TEXT,
  theme JSONB,
  is_public BOOLEAN DEFAULT true,
  sections_visibility JSONB,
  accepts_contact_requests BOOLEAN DEFAULT false,
  hide_birth_year BOOLEAN DEFAULT false,
  disable_birthday_icon BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### events
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  location TEXT,
  created_by UUID REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT true,
  qr_code TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  plan_type TEXT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### nfc_cards
```sql
CREATE TABLE nfc_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  card_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### scans
```sql
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  scan_type TEXT NOT NULL, -- 'nfc' or 'qr'
  scanned_by TEXT, -- anonymous identifier
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Authentication
- `POST /api/auth/sign-in` - User authentication
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/update-password` - Password update
- `POST /api/logout` - User logout

### Profile Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/contact-toggle` - Toggle contact requests
- `POST /api/profile/contact-toggle/report-card` - Report lost card

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/events/[eventId]` - Get event details
- `POST /api/events/[eventId]/check-in` - Event check-in
- `POST /api/events/[eventId]/scan` - Event QR scan
- `POST /api/events/[eventId]/archive` - Archive event

### Analytics
- `GET /api/analytics` - Get user analytics
- `GET /api/analytics/daily` - Daily statistics

### NFC
- `POST /api/nfc/register` - Register NFC card
- `POST /api/nfc/activate` - Activate NFC card
- `POST /api/nfc/[id]/block` - Block NFC card

### Admin
- `GET /api/admin/users` - List users
- `POST /api/admin/users/[id]/ban` - Ban user
- `POST /api/admin/users/[id]/unban` - Unban user
- `GET /api/admin/subscriptions` - List subscriptions
- `POST /api/admin/subscriptions/[id]/activate` - Activate subscription
- `POST /api/admin/subscriptions/[id]/deactivate` - Deactivate subscription

## Frontend Architecture

### Component Structure

#### Layout Components
- `Header` - Main navigation with user menu
- `Footer` - Site footer with links and social media
- `Navbar` - Primary navigation
- `InstallModal` - PWA installation prompt
- `CookieBanner` - Cookie consent management

#### UI Components
- `Button` - Custom button with variants
- `Card` - Glassmorphism card component
- `Input` - Styled input fields
- `Modal` - Reusable modal component
- `Toast` - Notification system

#### Business Components
- `ProfileCard3D` - 3D animated profile card
- `NfcWriter` - NFC writing functionality
- `EventForm` - Event creation form
- `PricingPlans` - Subscription plan display

#### System Components
- `Loading` - Loading spinners and states
- `NetworkWatcher` - Connection status monitoring
- `ClientProviders` - Context providers wrapper

### State Management

The application uses a combination of:
- **React Context** for global state (user authentication, notifications)
- **useState/useEffect** for component-level state
- **Supabase Realtime** for live data updates

### Styling Architecture

- **Tailwind CSS** for utility-first styling
- **Custom CSS** for animations and effects
- **Glassmorphism** design pattern
- **Responsive design** with mobile-first approach
- **Dark theme** with accent colors

## Security Features

### Authentication & Authorization
- **JWT Authentication** with Supabase
- **Row Level Security (RLS)** on all database tables
- **Password strength validation**
- **Email verification** required
- **2FA (Two-Factor Authentication)** enabled by default

### Data Protection
- **Input validation** on all forms
- **SQL injection prevention** via parameterized queries
- **XSS protection** with proper escaping
- **CORS protection** configured
- **Rate limiting** on API endpoints

### Privacy Features
- **GDPR compliance** with cookie management
- **Data encryption** at rest and in transit
- **User consent** for data collection
- **Anonymous tracking** for scans

## Deployment

### Requirements
- Node.js 18+
- Supabase project
- Vercel account (recommended)
- Environment variables configured

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Deployment Steps
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Deploy to Vercel or your preferred platform
5. Run database migrations
6. Configure Supabase settings

### Supabase Configuration
- Enable email authentication
- Configure storage buckets
- Set up RLS policies
- Create database functions
- Configure webhooks

## Development Guidelines

### Code Style
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Conventional commits** for git history

### Best Practices
- **Component reusability** - Create reusable components
- **Type safety** - Use TypeScript interfaces and types
- **Error handling** - Implement proper error boundaries
- **Performance** - Optimize images and lazy load components
- **Accessibility** - Follow WCAG guidelines

### Testing
- **Unit tests** for utility functions
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows

### Git Workflow
- **Feature branches** for new features
- **Pull requests** for code review
- **Main branch** protected
- **Semantic versioning** for releases

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Submit a pull request

## Support

For support and questions:
- Check the [documentation](/documentation)
- Create an issue on GitHub
- Contact the development team

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

- **Developer**: Nestor Phaku
- **Email**: phakunestor@gmail.com
- **Website**: https://luvika.me
- **Location**: Kinshasa, RDC