# 📧 News360 - Modern Newsletter Management Platform

A sophisticated newsletter management application built with Next.js 15, TypeScript, and modern web technologies. News360 helps you organize, read, and manage newsletters from multiple email accounts with intelligent categorization and powerful filtering capabilities.

![News360 Dashboard](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.44.2-orange?style=for-the-badge)

## ✨ Features

### 🔐 Authentication & Security
- **Secure Authentication**: Email/password authentication with bcrypt hashing
- **Two-Factor Authentication**: TOTP-based 2FA with backup codes
- **Session Management**: JWT-based sessions with secure token handling
- **Password Reset**: Secure password reset flow with email verification

### 📧 Email Integration
- **Multi-Provider Support**: Connect Gmail and Outlook accounts
- **OAuth 2.0 Integration**: Secure OAuth flow for email providers
- **Automatic Sync**: Background synchronization with configurable intervals
- **Smart Newsletter Detection**: AI-powered newsletter identification using:
  - Content pattern analysis
  - Sender domain recognition
  - Email structure analysis
  - Newsletter service detection (Mailchimp, Substack, etc.)

### 📚 Newsletter Management
- **Smart Categorization**: Automatic categorization based on sender, subject, and content
- **Custom Categories**: Create and manage personal categories with color coding
- **Advanced Filtering**: Powerful filtering system with:
  - Full-text search across content, subjects, and senders
  - Read/unread status filtering
  - Starred/unstarred filtering
  - Date range filtering (today, week, month)
  - Category-based filtering
  - Multi-sort options (date, sender, subject)
- **Bulk Operations**: Archive, star, and categorize multiple newsletters
- **Whitelist Management**: Whitelist specific domains and email addresses

### 📖 Reading Experience
- **Multiple Reading Modes**:
  - **Normal Mode**: Standard reading interface
  - **Focus Mode**: Distraction-free reading with minimal UI
  - **Fullscreen Mode**: Immersive reading experience
- **Customizable Typography**: Adjustable font size, line height, and reading width
- **Reading Progress**: Track reading progress with visual indicators
- **Keyboard Shortcuts**: Comprehensive keyboard navigation
- **Reading Themes**: Light, dark, and sepia themes

### 🎨 User Interface
- **Modern Design**: Clean, intuitive interface inspired by modern email clients
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Dark Mode Support**: Automatic theme switching with system preference detection
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **Customizable Appearance**: Personalize colors, spacing, and layout preferences

### 🔍 Advanced Features
- **Newsletter Rules**: Create custom rules for automatic categorization and actions
- **Pagination System**: 
  - Traditional pagination with page numbers
  - Load more mode for continuous scrolling
  - Smart loading states and error handling
- **Real-time Sync**: Live synchronization status with progress indicators
- **Export Functionality**: Export newsletters and user data
- **Notification System**: Configurable email and browser notifications

## 📖 User Guide

### 🚀 Getting Started

#### 1. Creating Your Account
1. **Visit the Signup Page**: Navigate to `/signup` or click "Sign Up" on the homepage
2. **Enter Your Details**: Provide your email address and create a secure password
3. **Verify Your Email**: Check your inbox for a verification email and click the link
4. **Complete Setup**: You'll be redirected to the main dashboard

#### 2. Connecting Your Email Accounts
1. **Navigate to Settings**: Click the settings icon in the header or go to `/settings/email`
2. **Add Email Account**: Click "Connect Email Account"
3. **Choose Provider**: Select Gmail or Outlook
4. **Authorize Access**: Follow the OAuth flow to grant News360 access to your emails
5. **Configure Sync**: Set sync frequency and enable/disable automatic syncing

#### 3. Setting Up Categories
1. **Go to Categories**: Navigate to `/settings/categories` or use the sidebar
2. **Create Categories**: Click "Add Category" to create custom categories
3. **Customize Colors**: Choose colors for easy visual identification
4. **Set Rules**: Create automatic categorization rules based on sender, subject, or content

### 📧 Managing Your Inbox

#### Understanding the Interface
- **Sidebar**: Navigation between folders (Inbox, Starred, Bin) and categories
- **Newsletter List**: Main area showing all newsletters with preview information
- **Reading Pane**: Right panel for reading selected newsletters
- **Header**: Search bar, account switcher, and sync status

#### Basic Navigation
- **Click on newsletters** to read them in the reading pane
- **Use the sidebar** to switch between different views
- **Search bar** for finding specific newsletters
- **Filter button** for advanced filtering options

#### Reading Newsletters
1. **Select a Newsletter**: Click on any newsletter in the list
2. **Reading Pane Opens**: The newsletter content appears in the right panel
3. **Reading Controls**: Use the toolbar for navigation and actions
4. **Keyboard Navigation**: Use J/K or arrow keys to move between newsletters

### 🔍 Advanced Filtering

#### Using the Filter System
1. **Open Filters**: Click the filter icon in the header
2. **Search**: Enter keywords to search across content, subjects, and senders
3. **Status Filters**: Filter by read/unread or starred/unstarred status
4. **Date Range**: Select time periods (today, this week, this month)
5. **Categories**: Choose specific categories to include
6. **Sorting**: Sort by date, sender, or subject in ascending/descending order

#### Filter Tips
- **Combine Filters**: Use multiple filters together for precise results
- **Clear Filters**: Click "Clear All" to reset all filters
- **Save Common Filters**: Frequently used filter combinations are remembered
- **Quick Search**: Use the main search bar for instant results

### 📖 Reading Experience

#### Reading Modes
1. **Normal Mode**: Standard interface with full toolbar and navigation
2. **Focus Mode**: Distraction-free reading with minimal UI elements
3. **Fullscreen Mode**: Immersive reading experience across the entire screen

#### Typography Controls
- **Font Size**: Adjust text size using + and - buttons or keyboard shortcuts
- **Line Height**: Modify spacing between lines for better readability
- **Reading Width**: Control the maximum width of text for optimal reading
- **Theme**: Switch between light, dark, and sepia themes

#### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `J` or `→` | Next newsletter |
| `K` or `←` | Previous newsletter |
| `S` | Toggle star |
| `E` | Archive newsletter |
| `R` | Toggle reading mode |
| `F` | Toggle fullscreen |
| `+` / `-` | Increase/decrease font size |
| `0` | Reset font size |
| `?` | Show keyboard shortcuts |
| `/` | Focus search |
| `Esc` | Close modals, exit fullscreen |

### 🏷️ Organization Features

#### Categories
1. **Create Categories**: Go to Settings > Categories and click "Add Category"
2. **Assign Colors**: Choose distinctive colors for easy identification
3. **Automatic Categorization**: Set up rules for automatic category assignment
4. **Manual Assignment**: Right-click newsletters to assign categories manually

#### Starring and Archiving
- **Star Newsletters**: Click the star icon to mark important newsletters
- **Archive Newsletters**: Use the archive button to move newsletters to the bin
- **Bulk Actions**: Select multiple newsletters for batch operations
- **Restore**: Recover archived newsletters from the bin

#### Newsletter Rules
1. **Create Rules**: Go to Settings > Rules to set up automatic actions
2. **Define Conditions**: Set criteria based on sender, subject, or content
3. **Choose Actions**: Automatically categorize, star, or move newsletters
4. **Test Rules**: Preview how rules will affect your newsletters

### ⚙️ Settings and Preferences

#### Account Settings
- **Profile Information**: Update your name, email, and profile picture
- **Password Management**: Change your password and enable two-factor authentication
- **Account Security**: Review login history and manage active sessions

#### Reading Preferences
- **Default Reading Mode**: Set your preferred reading mode
- **Typography Settings**: Configure default font size, line height, and width
- **Theme Preferences**: Choose light, dark, or system theme
- **Auto-mark as Read**: Enable automatic marking of newsletters as read

#### Appearance Settings
- **Theme**: Choose between light, dark, and system themes
- **Accent Color**: Customize the primary color of the interface
- **Layout Options**: Adjust sidebar visibility and compact mode
- **Animations**: Enable or disable interface animations

#### Notification Settings
- **Email Notifications**: Configure email alerts for new newsletters
- **Browser Notifications**: Enable desktop notifications
- **Quiet Hours**: Set times when notifications are disabled
- **Digest Options**: Choose daily or weekly digest emails

### 🔄 Email Account Management

#### Adding Multiple Accounts
1. **Go to Email Settings**: Navigate to Settings > Email
2. **Add Account**: Click "Connect Email Account" for each provider
3. **Authorize Access**: Complete OAuth flow for each account
4. **Configure Sync**: Set individual sync settings for each account

#### Sync Management
- **Manual Sync**: Click the sync button to manually refresh newsletters
- **Auto Sync**: Enable automatic background synchronization
- **Sync Frequency**: Set how often accounts should sync (hourly, daily, etc.)
- **Sync Status**: Monitor sync progress and troubleshoot issues

#### Whitelist Management
1. **Domain Whitelist**: Add trusted domains for newsletter import
2. **Email Whitelist**: Whitelist specific email addresses
3. **Import Control**: Choose which emails to import as newsletters
4. **Filter Settings**: Configure automatic filtering rules

### 📊 Advanced Features

#### Newsletter Analytics
- **Reading Statistics**: Track your reading habits and progress
- **Category Distribution**: See how newsletters are distributed across categories
- **Sync History**: Monitor email account synchronization
- **Storage Usage**: Check how much space your newsletters are using

#### Export and Backup
1. **Export Newsletters**: Download newsletters in various formats
2. **Data Backup**: Export your account data for safekeeping
3. **Import Options**: Import newsletters from other services
4. **Account Migration**: Transfer data between accounts

#### Keyboard Navigation
- **Global Shortcuts**: Use keyboard shortcuts throughout the application
- **Reading Shortcuts**: Navigate and control reading experience
- **Search Shortcuts**: Quick access to search and filtering
- **Custom Shortcuts**: Configure your own keyboard shortcuts

### 🛠️ Troubleshooting

#### Common Issues

**Sync Problems**
- Check your internet connection
- Verify email account credentials
- Review sync settings and frequency
- Check for API rate limits

**Reading Issues**
- Clear browser cache and cookies
- Try different reading modes
- Check font size and theme settings
- Disable browser extensions that might interfere

**Performance Issues**
- Reduce the number of newsletters loaded
- Use pagination instead of load more mode
- Clear browser cache
- Check available system resources

#### Getting Help
1. **Check Documentation**: Review this user guide and FAQ
2. **Contact Support**: Use the help section in settings
3. **Report Issues**: Submit bug reports through the feedback form
4. **Community**: Join discussions for tips and solutions

### 🎯 Best Practices

#### Organization Tips
- **Use Categories**: Create meaningful categories for different types of newsletters
- **Regular Cleanup**: Archive old newsletters to keep your inbox manageable
- **Star Important**: Use starring to mark newsletters you want to revisit
- **Set Rules**: Create automatic rules to reduce manual organization

#### Reading Efficiency
- **Keyboard Shortcuts**: Learn and use keyboard shortcuts for faster navigation
- **Reading Mode**: Use focus mode for distraction-free reading
- **Batch Processing**: Process newsletters in batches rather than one by one
- **Search Regularly**: Use search to find specific content quickly

#### Email Management
- **Whitelist Wisely**: Only whitelist trusted sources to avoid spam
- **Monitor Sync**: Regularly check sync status and troubleshoot issues
- **Backup Data**: Export important newsletters and settings regularly
- **Update Settings**: Review and update preferences as your needs change

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4.0 with custom design system
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with custom credentials provider
- **Email Integration**: Gmail API, Microsoft Graph API
- **UI Components**: Radix UI primitives with custom components
- **State Management**: React hooks with custom state management
- **Deployment**: Vercel-ready with optimized build configuration

### Database Schema
```sql
-- Core tables
newsletters (id, userId, emailAccountId, title, sender, subject, content, isRead, isStarred, isArchived, categoryId, receivedAt, ...)
users (id, email, password, twoFactorSecret, twoFactorEnabled, ...)
emailAccounts (id, userId, provider, email, accessToken, refreshToken, ...)
categories (id, userId, name, color, icon, isSystem, ...)

-- Authentication tables
accounts, sessions, verificationTokens, passwordResets

-- Configuration tables
userPreferences, newsletterRules, userNewsletterDomainWhitelist, userNewsletterEmailWhitelist
```

### Project Structure
```
newsletter-product/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── inbox/             # Main inbox interface
│   └── settings/          # User settings pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   └── auth/             # Authentication components
├── lib/                  # Core utilities and services
│   ├── db.ts            # Database connection
│   ├── auth.ts          # Authentication configuration
│   ├── schema.ts        # Database schema
│   └── services/        # Business logic services
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
└── drizzle/             # Database migrations
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Gmail/Outlook API credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/newsletter-product.git
   cd newsletter-product
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/newsletter_db"
   
   # Authentication
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Email Providers
   GMAIL_CLIENT_ID="your-gmail-client-id"
   GMAIL_CLIENT_SECRET="your-gmail-client-secret"
   OUTLOOK_CLIENT_ID="your-outlook-client-id"
   OUTLOOK_CLIENT_SECRET="your-outlook-client-secret"
   
   # Email Service
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```

4. **Set up the database**
   ```bash
   # Run migrations
   npm run db:migrate
   
   # (Optional) Reset database
   npm run reset-db
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Setup

1. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE newsletter_db;
   ```

2. **Run migrations**
   ```bash
   npm run db:migrate
   ```

3. **View database with Drizzle Studio**
   ```bash
   npm run db:studio
   ```

## 🔧 Configuration

### Email Provider Setup

#### Gmail API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:3000/api/email/callback`
6. Copy Client ID and Client Secret to environment variables

#### Outlook API
1. Go to [Microsoft Azure Portal](https://portal.azure.com/)
2. Register a new application
3. Add Microsoft Graph API permissions (Mail.Read)
4. Create client secret
5. Add redirect URI: `http://localhost:3000/api/email/callback`
6. Copy Application ID and Client Secret to environment variables

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | Yes |
| `NEXTAUTH_URL` | Base URL of your application | Yes |
| `GMAIL_CLIENT_ID` | Gmail OAuth client ID | Yes |
| `GMAIL_CLIENT_SECRET` | Gmail OAuth client secret | Yes |
| `OUTLOOK_CLIENT_ID` | Outlook OAuth client ID | Yes |
| `OUTLOOK_CLIENT_SECRET` | Outlook OAuth client secret | Yes |
| `SMTP_HOST` | SMTP server host | Yes |
| `SMTP_PORT` | SMTP server port | Yes |
| `SMTP_USER` | SMTP username | Yes |
| `SMTP_PASS` | SMTP password | Yes |

## 📱 Usage

### First Time Setup
1. **Create Account**: Sign up with your email address
2. **Connect Email**: Add your Gmail or Outlook account
3. **Configure Categories**: Create custom categories for organization
4. **Set Preferences**: Customize reading and appearance settings

### Daily Usage
1. **View Inbox**: Browse newsletters in the main inbox
2. **Filter & Search**: Use advanced filters to find specific newsletters
3. **Read**: Click on newsletters to read in the reading pane
4. **Organize**: Star, archive, or categorize newsletters
5. **Sync**: Monitor sync status and manage email accounts

### Keyboard Shortcuts
- `J` / `→` - Next newsletter
- `K` / `←` - Previous newsletter
- `S` - Toggle star
- `E` - Archive newsletter
- `R` - Toggle reading mode
- `F` - Toggle fullscreen
- `+` / `-` - Increase/decrease font size
- `0` - Reset font size
- `?` - Show keyboard shortcuts
- `/` - Focus search
- `Esc` - Close modals, exit fullscreen

## 🛠️ Development

### Available Scripts
```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:push         # Push schema changes
npm run db:migrate      # Run migrations
npm run db:studio       # Open Drizzle Studio
npm run reset-db        # Reset database

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting issues
npm run format          # Format code with Prettier
npm run type-check      # TypeScript type checking
```

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Standardized commit messages

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel Deployment
1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Environment**: Add all environment variables
3. **Deploy**: Vercel will automatically deploy on push to main branch

### Manual Deployment
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up production database**
   ```bash
   npm run db:migrate
   ```

3. **Start the server**
   ```bash
   npm start
   ```

### Environment Variables for Production
Ensure all environment variables are set in your production environment:
- Database connection string
- Authentication secrets
- Email provider credentials
- SMTP configuration

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for hosting and deployment
- **Tailwind CSS** for the utility-first CSS framework
- **Drizzle ORM** for type-safe database operations
- **Radix UI** for accessible component primitives

## 📞 Support

- **Documentation**: [Wiki](https://github.com/yourusername/newsletter-product/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/newsletter-product/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/newsletter-product/discussions)
- **Email**: support@news360.com

---

**Made with ❤️ by the News360 Team**

## Redis Setup

This app uses Redis for caching and real-time features (sync progress, onboarding state, etc).

### Local Development
- Install Redis locally: https://redis.io/download
- Start Redis: `redis-server`
- The app will connect to `redis://localhost:6379` by default.

### Production
- Set the `REDIS_URL` environment variable to your Redis instance URL.
- Example: `REDIS_URL=redis://username:password@host:port`

### Usage
- Redis is used for:
  - Caching onboarding state
  - Caching categories and stats
  - Storing sync progress for real-time updates

No manual setup is needed beyond running Redis and setting the environment variable.
