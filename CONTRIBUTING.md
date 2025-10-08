# 🤝 Contributing to ScrollOS

First off, thank you for considering contributing to ScrollOS! It's people like you that make ScrollOS such a great tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Testing Guidelines](#testing-guidelines)
- [Community](#community)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to rakshit@scrollos.com.

---

## 🎯 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/yourusername/newsletter-product/issues) to avoid duplicates.

**When reporting a bug, include:**

- **Clear title** - Descriptive and specific
- **Steps to reproduce** - Numbered steps to reproduce the issue
- **Expected behavior** - What you expected to happen
- **Actual behavior** - What actually happened
- **Screenshots** - If applicable
- **Environment details**:
  - OS (macOS 13.0, Windows 11, Ubuntu 22.04)
  - Node.js version (`node --version`)
  - Browser & version
  - Database (Neon/local PostgreSQL)

**Example bug report:**

```markdown
**Bug**: Email sync fails with Gmail after 100 newsletters

**Steps to reproduce:**
1. Connect Gmail account
2. Click "Sync Newsletters"
3. Wait for 100+ newsletters to process
4. Sync stops with error

**Expected**: All newsletters should sync successfully

**Actual**: Sync fails with "Rate limit exceeded" error

**Environment:**
- macOS 13.5
- Node 20.9.0
- Chrome 119
- Database: Neon PostgreSQL

**Screenshots:**
[Attach error screenshot]
```

### ✨ Suggesting Enhancements

Enhancement suggestions are tracked as [GitHub issues](https://github.com/yourusername/newsletter-product/issues).

**When suggesting an enhancement, include:**

- **Clear use case** - Why is this needed?
- **Proposed solution** - How should it work?
- **Alternatives considered** - Other approaches you've thought about
- **Additional context** - Mockups, examples from other apps

**Example enhancement:**

```markdown
**Feature**: Bulk newsletter export to PDF

**Use case:** Users want to save newsletters offline for reading on e-readers

**Proposed solution:**
- Add "Export to PDF" button in newsletter list
- Allow selecting multiple newsletters
- Generate single PDF with all newsletters
- Include table of contents

**Alternatives:**
- Export as EPUB (better for e-readers)
- Export as HTML archive

**Mockup:**
[Attach UI mockup if available]
```

### 💻 Contributing Code

**Good first issues** are labeled with [`good first issue`](https://github.com/yourusername/newsletter-product/labels/good%20first%20issue).

**Steps:**

1. Fork the repository
2. Create a branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write tests (if applicable)
5. Run tests and linting
6. Commit with conventional commits
7. Push to your fork
8. Open a Pull Request

---

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Neon account)
- Upstash Redis account

### Setup Steps

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/newsletter-product.git
cd newsletter-product

# 2. Add upstream remote
git remote add upstream https://github.com/yourusername/newsletter-product.git

# 3. Install dependencies
npm install

# 4. Copy environment file
cp .env.example .env.local

# 5. Set up database
npm run db:migrate

# 6. Start development server
npm run dev
```

**See [INSTRUCTIONS.md](./INSTRUCTIONS.md) for detailed setup.**

### Syncing with Upstream

```bash
# Fetch latest changes
git fetch upstream

# Merge into your main branch
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

---

## 📏 Coding Standards

### TypeScript

- ✅ Use TypeScript strict mode
- ✅ Define proper types (avoid `any`)
- ✅ Use interfaces for object shapes
- ✅ Export types from components

**Good:**
```typescript
interface Newsletter {
  id: number;
  title: string;
  sender: string;
  isRead: boolean;
}

async function getNewsletter(id: number): Promise<Newsletter> {
  const newsletter = await db.query.newsletters.findFirst({
    where: eq(newsletters.id, id)
  });
  
  if (!newsletter) {
    throw new Error('Newsletter not found');
  }
  
  return newsletter;
}
```

**Bad:**
```typescript
// ❌ Using 'any'
async function getNewsletter(id: any): Promise<any> {
  const newsletter = await db.query.newsletters.findFirst({
    where: eq(newsletters.id, id)
  });
  return newsletter;
}
```

### React Components

- ✅ Use functional components with hooks
- ✅ Extract reusable logic to custom hooks
- ✅ Use meaningful component names
- ✅ Keep components focused (single responsibility)

**Good:**
```typescript
interface NewsletterCardProps {
  newsletter: Newsletter;
  onSelect: (id: number) => void;
}

export function NewsletterCard({ newsletter, onSelect }: NewsletterCardProps) {
  const handleClick = () => {
    onSelect(newsletter.id);
  };

  return (
    <div onClick={handleClick} className="p-4 hover:bg-gray-50">
      <h3 className="font-semibold">{newsletter.title}</h3>
      <p className="text-sm text-gray-600">{newsletter.sender}</p>
    </div>
  );
}
```

### CSS/Tailwind

- ✅ Use Tailwind utility classes
- ✅ Extract repeated patterns to components
- ✅ Use design tokens from `lib/styles/design-tokens.ts`
- ✅ Follow responsive design (mobile-first)

**Good:**
```tsx
<div className="flex flex-col gap-4 md:flex-row md:gap-6">
  <Button variant="primary" size="lg">
    Sync Newsletters
  </Button>
</div>
```

### File Naming

- ✅ Components: `PascalCase.tsx` (e.g., `NewsletterCard.tsx`)
- ✅ Utilities: `kebab-case.ts` (e.g., `email-service.ts`)
- ✅ Hooks: `use-*.ts` (e.g., `use-toast.ts`)
- ✅ API routes: `route.ts` (Next.js convention)

### Code Organization

```typescript
// 1. Imports
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/use-toast';

// 2. Types/Interfaces
interface Props {
  userId: number;
}

// 3. Constants
const MAX_NEWSLETTERS = 100;

// 4. Component
export function InboxPage({ userId }: Props) {
  // 4a. Hooks
  const [newsletters, setNewsletters] = useState([]);
  
  // 4b. Effects
  useEffect(() => {
    fetchNewsletters();
  }, [userId]);
  
  // 4c. Event handlers
  const handleSync = async () => {
    // ...
  };
  
  // 4d. Render
  return (
    <div>{/* ... */}</div>
  );
}

// 5. Helper functions (if not exported)
function formatDate(date: Date): string {
  // ...
}
```

---

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(inbox): add bulk archive functionality` |
| `fix` | Bug fix | `fix(sync): resolve token refresh issue` |
| `docs` | Documentation | `docs(readme): update setup instructions` |
| `style` | Formatting, missing semicolons | `style(button): fix alignment` |
| `refactor` | Code restructuring | `refactor(email-service): extract detection logic` |
| `perf` | Performance improvement | `perf(search): add database indexes` |
| `test` | Adding tests | `test(auth): add 2FA unit tests` |
| `chore` | Maintenance | `chore(deps): update dependencies` |

### Scopes

Common scopes in this project:
- `inbox` - Inbox page and components
- `sync` - Email synchronization
- `auth` - Authentication
- `db` - Database
- `api` - API routes
- `ui` - UI components

### Examples

**Good commits:**
```bash
feat(inbox): add keyboard navigation (J/K keys)

- Add event listeners for J/K keys
- Navigate to next/previous newsletter
- Update selected state

Closes #42

---

fix(sync): handle expired OAuth tokens

- Check token expiry before API calls
- Auto-refresh tokens if expired
- Add retry logic for failed syncs

Fixes #38

---

docs(contributing): add commit message guidelines

- Add conventional commit examples
- Document commit types and scopes
- Add references to specification
```

**Bad commits:**
```bash
# ❌ Too vague
fix: bug

# ❌ No type
added new feature

# ❌ Not descriptive
update code
```

---

## 🔄 Pull Request Process

### Before Submitting

1. **Update from upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**
   ```bash
   npm run type-check
   npm run lint
   npm test
   ```

3. **Self-review your code**
   - Remove console.logs and debugging code
   - Check for commented-out code
   - Ensure proper error handling
   - Add comments for complex logic

### PR Template

When you create a PR, our template will guide you. Include:

**Description:**
- What does this PR do?
- Why is this change needed?
- Link to related issue(s)

**Type of change:**
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

**Testing:**
- [ ] I have tested this locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

**Screenshots (if applicable):**

### Review Process

1. **Automated checks** must pass:
   - TypeScript compilation
   - ESLint
   - Build succeeds

2. **Maintainer review**:
   - Code quality
   - Alignment with project goals
   - Test coverage

3. **Feedback loop**:
   - Address reviewer comments
   - Push new commits to same branch
   - Re-request review when ready

4. **Merge**:
   - Maintainer will squash and merge
   - Your contribution will be in the next release! 🎉

---

## 📂 Project Structure

Understanding the project structure helps you know where to make changes:

```
newsletter-product/
├── app/
│   ├── api/              # API routes (add new endpoints here)
│   ├── inbox/            # Inbox page (main UI)
│   ├── settings/         # Settings pages
│   └── auth/             # Authentication pages
├── components/
│   ├── ui/               # Reusable UI components (buttons, inputs)
│   ├── layout/           # Layout components (header, sidebar)
│   └── auth/             # Auth-specific components
├── lib/
│   ├── services/         # Business logic (email-service.ts)
│   ├── db.ts             # Database connection
│   ├── schema.ts         # Database schema (Drizzle ORM)
│   └── utils.ts          # Utility functions
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
```

**Where to add:**
- New API endpoint → `app/api/your-feature/route.ts`
- New page → `app/your-page/page.tsx`
- New component → `components/ui/YourComponent.tsx`
- Database table → `lib/schema.ts` + migration
- Business logic → `lib/services/your-service.ts`

---

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Writing Tests

**Unit tests** for utilities and services:

```typescript
// lib/utils.test.ts
import { formatDate } from './utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('Jan 15, 2024');
  });

  it('should handle invalid dates', () => {
    expect(() => formatDate(null)).toThrow('Invalid date');
  });
});
```

**Component tests** with React Testing Library:

```typescript
// components/NewsletterCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { NewsletterCard } from './NewsletterCard';

describe('NewsletterCard', () => {
  const mockNewsletter = {
    id: 1,
    title: 'Test Newsletter',
    sender: 'test@example.com'
  };

  it('should render newsletter title', () => {
    render(<NewsletterCard newsletter={mockNewsletter} />);
    expect(screen.getByText('Test Newsletter')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<NewsletterCard newsletter={mockNewsletter} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByText('Test Newsletter'));
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
```

### Test Coverage

We aim for:
- **80%+ coverage** overall
- **100% coverage** for critical paths (auth, email sync, data integrity)
- **Focus on** business logic, edge cases, error handling

---

## 🎨 Design Guidelines

### UI/UX Principles

1. **Consistency** - Use existing components before creating new ones
2. **Accessibility** - WCAG 2.1 AA compliant
3. **Responsiveness** - Mobile-first design
4. **Performance** - Optimize images, lazy load when possible

### Accessibility Checklist

- [ ] Semantic HTML elements (`<button>`, `<nav>`, `<main>`)
- [ ] Keyboard navigation support
- [ ] ARIA labels where needed
- [ ] Sufficient color contrast (4.5:1 for text)
- [ ] Focus indicators visible
- [ ] Screen reader testing

### Component Checklist

Before submitting a new component:

- [ ] TypeScript types defined
- [ ] Props interface documented
- [ ] Responsive design implemented
- [ ] Dark mode supported
- [ ] Accessibility tested
- [ ] Storybook story added (if applicable)

---

## 📚 Resources

### Learning Materials

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Project-Specific

- [Architecture Overview](./README.md#architecture)
- [Setup Instructions](./INSTRUCTIONS.md)
- [API Documentation](#) (coming soon)

---

## 🌟 Recognition

Contributors are recognized in:
- [README.md Contributors Section](./README.md#contributors)
- Release notes for their merged PRs
- Our [Contributors Page](#) (coming soon)

---

## ❓ Questions?

- **GitHub Discussions**: [Ask a question](https://github.com/yourusername/newsletter-product/discussions)
- **Discord**: [Join our community](#) (coming soon)
- **Email**: rakshit@scrollos.com

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).

---

**Thank you for making ScrollOS better! 🚀**

Every contribution, no matter how small, makes a difference. We appreciate your time and effort!

