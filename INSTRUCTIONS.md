# 📘 ScrollOS Local Setup Instructions

> **Complete guide to set up and run ScrollOS (News360) on your local machine**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (5 Minutes)](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [OAuth Configuration](#oauth-configuration)
5. [Database Setup](#database-setup)
6. [Redis Setup](#redis-setup)
7. [Environment Variables](#environment-variables)
8. [Running the Application](#running-the-application)
9. [Troubleshooting](#troubleshooting)
10. [Development Workflow](#development-workflow)

---

## ✅ Prerequisites

Before starting, ensure you have the following installed:

| Software | Version | Check Command | Download Link |
|----------|---------|---------------|---------------|
| **Node.js** | 18.0+ | `node --version` | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.0+ | `npm --version` | Comes with Node.js |
| **Git** | Latest | `git --version` | [git-scm.com](https://git-scm.com/) |
| **PostgreSQL** | 14+ (Optional*) | `psql --version` | [Neon](https://neon.tech) (recommended) |

*\*PostgreSQL: You can use a cloud service like Neon instead of local installation*

---

## 🚀 Quick Start

If you want to get started quickly (recommended for first-time setup):

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/newsletter-product.git
cd newsletter-product

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Edit .env.local with your credentials
# At minimum, set:
#   - DATABASE_URL (from Neon)
#   - UPSTASH_REDIS_REST_URL (from Upstash)
#   - UPSTASH_REDIS_REST_TOKEN (from Upstash)
#   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)

# 5. Run database migrations
npm run db:migrate

# 6. Start development server
npm run dev
```

**✅ Application will be running at: http://localhost:3000**

---

## 📦 Detailed Setup

### Step 1: Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/yourusername/newsletter-product.git

# OR using SSH (if you have SSH keys configured)
git clone git@github.com:yourusername/newsletter-product.git

# Navigate to project directory
cd newsletter-product
```

### Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# This will install:
# - Next.js 15
# - React 19
# - Drizzle ORM
# - NextAuth.js
# - Upstash Redis
# - and all other dependencies
```

**Expected output:**
```
added 342 packages in 45s
```

---

## 🗄️ Database Setup

### Option 1: Neon (Recommended - Free & Easy)

Neon is a serverless PostgreSQL platform with a generous free tier.

**Step 1**: Go to [neon.tech](https://neon.tech)

**Step 2**: Sign up with GitHub/Google

**Step 3**: Create a new project
- Project name: `scrollos-dev`
- Region: Choose closest to you
- PostgreSQL version: 15 (or latest)

**Step 4**: Copy the connection string
```
Click "Connection Details" → Copy the connection string
It looks like: postgresql://username:password@hostname/database
```

**Step 5**: Add to `.env.local`
```env
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
```

### Option 2: Local PostgreSQL

If you prefer running PostgreSQL locally:

**Install PostgreSQL:**
```bash
# macOS (using Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download from: https://www.postgresql.org/download/windows/
```

**Create Database:**
```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE newsletter_db;

# Create user (optional)
CREATE USER newsletter_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE newsletter_db TO newsletter_user;

# Exit
\q
```

**Add to `.env.local`:**
```env
DATABASE_URL="postgresql://newsletter_user:your_password@localhost:5432/newsletter_db"
```

### Run Migrations

```bash
# Apply all database migrations
npm run db:migrate

# Expected output:
# ✓ Applying migration 0000_email_accounts.sql
# ✓ Applying migration 0001_dry_red_wolf.sql
# ... (all migrations)
# ✓ Migrations complete!
```

### View Database (Optional)

Drizzle Studio provides a visual interface for your database:

```bash
npm run db:studio

# Opens at: https://local.drizzle.studio
```

---

## 🔴 Redis Setup (Upstash)

Redis is used for caching and real-time sync progress tracking.

### Step 1: Create Upstash Account

Go to [upstash.com](https://upstash.com) and sign up (free tier available).

### Step 2: Create Redis Database

1. Click "Create Database"
2. Name: `scrollos-cache`
3. Type: Regional (choose closest region)
4. Eviction: No eviction (recommended)
5. Click "Create"

### Step 3: Get Connection Details

1. Go to database details
2. Scroll to "REST API" section
3. Copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Step 4: Add to `.env.local`

```env
UPSTASH_REDIS_REST_URL="https://your-db-name.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AYkAASQgN...your-token"
```

---

## 🔐 OAuth Configuration

To sync emails, you need OAuth credentials from Gmail and/or Outlook.

**Note**: You can skip this initially - authentication will work, you just won't be able to sync emails.

### Gmail OAuth Setup

**Step 1**: Go to [Google Cloud Console](https://console.cloud.google.com/)

**Step 2**: Create a new project (or select existing)
- Project name: `ScrollOS Dev`
- Click "Create"

**Step 3**: Enable Gmail API
1. Go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click "Enable"

**Step 4**: Create OAuth credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Configure consent screen (if prompted):
   - User type: External
   - App name: ScrollOS
   - User support email: your email
   - Developer contact: your email
4. Application type: Web application
5. Name: `ScrollOS Local Dev`
6. Authorized redirect URIs:
   ```
   http://localhost:3000/api/email/callback
   ```
7. Click "Create"

**Step 5**: Copy credentials
- Copy `Client ID` and `Client Secret`

**Step 6**: Add to `.env.local`
```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/email/callback"
```

### Outlook OAuth Setup

**Step 1**: Go to [Azure Portal](https://portal.azure.com/)

**Step 2**: Navigate to "Azure Active Directory" → "App registrations"

**Step 3**: Click "New registration"
- Name: `ScrollOS Dev`
- Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
- Redirect URI:
  - Platform: Web
  - URI: `http://localhost:3000/api/email/callback`
- Click "Register"

**Step 4**: Copy Application (client) ID

**Step 5**: Create client secret
1. Go to "Certificates & secrets"
2. Click "New client secret"
3. Description: `ScrollOS Dev Secret`
4. Expires: 24 months
5. Click "Add"
6. **Copy the value immediately** (you won't see it again)

**Step 6**: Add API permissions
1. Go to "API permissions"
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Select "Delegated permissions"
5. Add these permissions:
   - `Mail.Read`
   - `User.Read`
   - `offline_access`
6. Click "Add permissions"
7. Click "Grant admin consent" (if you have admin access)

**Step 7**: Add to `.env.local`
```env
OUTLOOK_CLIENT_ID="your-application-id"
OUTLOOK_CLIENT_SECRET="your-client-secret"
OUTLOOK_REDIRECT_URI="http://localhost:3000/api/email/callback"
```

---

## 🔑 Environment Variables

### Complete `.env.local` Template

Create a `.env.local` file in the project root with the following:

```env
# ====================
# DATABASE
# ====================
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"

# ====================
# REDIS (UPSTASH)
# ====================
UPSTASH_REDIS_REST_URL="https://your-db.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"

# ====================
# AUTHENTICATION
# ====================
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# ====================
# GOOGLE OAUTH (Gmail)
# ====================
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/email/callback"

# Google Auth (for NextAuth.js Google provider)
GOOGLE_AUTH_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_AUTH_CLIENT_SECRET="GOCSPX-your-secret"

# ====================
# MICROSOFT OAUTH (Outlook)
# ====================
OUTLOOK_CLIENT_ID="your-azure-app-id"
OUTLOOK_CLIENT_SECRET="your-client-secret"
OUTLOOK_REDIRECT_URI="http://localhost:3000/api/email/callback"

# ====================
# GITHUB OAUTH (Optional)
# ====================
GITHUB_CLIENT_ID="your-github-oauth-id"
GITHUB_CLIENT_SECRET="your-github-secret"

# ====================
# EMAIL SERVICE (For password reset emails)
# ====================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="ScrollOS <noreply@scrollos.com>"

# ====================
# OPTIONAL
# ====================
NODE_ENV="development"
LOG_LEVEL="info"
```

### Generate NEXTAUTH_SECRET

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Gmail App Password (for SMTP)

If using Gmail for password reset emails:

1. Go to [Google Account](https://myaccount.google.com/)
2. Security → 2-Step Verification (must be enabled)
3. App passwords → Generate
4. Select "Mail" and "Other"
5. Name: `ScrollOS SMTP`
6. Copy the 16-character password
7. Add to `SMTP_PASS` in `.env.local`

---

## 🏃 Running the Application

### Development Mode

```bash
# Start development server with hot reload
npm run dev

# Application runs at:
# http://localhost:3000
```

**What happens:**
- Next.js starts on port 3000
- Hot Module Replacement (HMR) enabled
- TypeScript compilation on-the-fly
- API routes available at `/api/*`

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start

# Runs at: http://localhost:3000
```

### Other Useful Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Fix linting issues
npm run lint:fix

# Database commands
npm run db:push          # Push schema changes without migrations
npm run db:migrate       # Run migrations
npm run db:studio        # Open Drizzle Studio (database UI)
npm run reset-db         # Reset database (⚠️ deletes all data)

# Run TypeScript scripts
npm run tsx <script>     # Example: npm run tsx scripts/seed-db.ts
```

---

## 🐛 Troubleshooting

### Issue: Port 3000 already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or run on different port
PORT=3001 npm run dev
```

### Issue: Database connection failed

**Error**: `Error: connect ECONNREFUSED`

**Solution**:
1. Check `DATABASE_URL` is correct
2. Ensure PostgreSQL is running:
   ```bash
   # Check status
   pg_isready
   
   # Start PostgreSQL (macOS)
   brew services start postgresql@15
   ```
3. Test connection:
   ```bash
   psql $DATABASE_URL
   ```

### Issue: Redis connection failed

**Error**: `Error: Upstash Redis environment variables missing`

**Solution**:
1. Verify `.env.local` has:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
2. Check Upstash dashboard for correct values
3. Ensure no trailing spaces in `.env.local`

### Issue: OAuth redirect mismatch

**Error**: `redirect_uri_mismatch` when connecting email

**Solution**:
1. Check redirect URI in Google/Azure console matches exactly:
   ```
   http://localhost:3000/api/email/callback
   ```
2. No trailing slash
3. HTTP (not HTTPS) for localhost
4. Port must match (default: 3000)

### Issue: Migrations fail

**Error**: `Migration failed: relation already exists`

**Solution**:
```bash
# Reset database and re-run migrations
npm run reset-db
npm run db:migrate
```

### Issue: Module not found errors

**Error**: `Cannot find module '@/lib/...'`

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Issue: Environment variables not loading

**Solution**:
1. Ensure file is named `.env.local` (not `.env`)
2. Restart dev server after changing `.env.local`
3. No quotes around values needed (they're added automatically)
4. Check for typos in variable names

---

## 💻 Development Workflow

### 1. Create a new feature

```bash
# Create a new branch
git checkout -b feature/your-feature-name

# Make changes...

# Run type checking
npm run type-check

# Run linting
npm run lint

# Commit changes
git add .
git commit -m "feat: your feature description"

# Push to remote
git push origin feature/your-feature-name
```

### 2. Database changes

```bash
# After modifying lib/schema.ts

# Generate migration
npx drizzle-kit generate:pg

# Apply migration
npm run db:migrate

# Verify changes
npm run db:studio
```

### 3. Testing email sync

```bash
# 1. Sign up for an account
# 2. Go to Settings → Email
# 3. Connect Gmail or Outlook
# 4. Click "Sync Newsletters"
# 5. Watch the progress bar in real-time
```

### 4. Debugging

**Using VS Code debugger:**

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

**Console logging:**

```typescript
// Add debug logs
console.log('📧 Email data:', emailData);
console.log('✅ Newsletter saved:', newsletter.id);
console.error('❌ Error:', error);
```

---

## 📚 Additional Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Gmail API Docs](https://developers.google.com/gmail/api)
- [Microsoft Graph API Docs](https://learn.microsoft.com/en-us/graph/api/overview)

### Project-Specific Docs

- [Main README](./README.md) - Project overview and features
- [Database Schema](./lib/schema.ts) - Full schema definitions
- [API Routes](./app/api/) - API endpoint implementations

### Getting Help

If you encounter issues not covered here:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Search [GitHub Issues](https://github.com/yourusername/newsletter-product/issues)
3. Create a new issue with:
   - Error message (full stack trace)
   - Steps to reproduce
   - Environment (OS, Node version, etc.)
   - `.env.local` (with sensitive values removed)

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Application runs at http://localhost:3000
- [ ] Can access signup page (`/auth/signup`)
- [ ] Can create an account
- [ ] Can log in
- [ ] Database tables exist (check with `npm run db:studio`)
- [ ] Redis connection works (check logs for errors)
- [ ] Can connect Gmail account (if OAuth configured)
- [ ] Can connect Outlook account (if OAuth configured)
- [ ] Email sync works (newsletters appear after sync)
- [ ] Can create categories
- [ ] Can filter newsletters
- [ ] Reading pane displays newsletter content

---

## 🎉 You're All Set!

You should now have ScrollOS running locally. Happy coding!

**Next Steps:**
- Explore the codebase
- Try syncing some newsletters
- Create custom categories
- Set up newsletter rules
- Customize the UI

**Questions?** Open an issue or reach out to rakshit@scrollos.com

---

**Last Updated:** December 2024 | **Version:** 1.0.0


