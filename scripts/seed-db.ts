import { db } from '@/lib/db';
import { users, newsletters, categories, newsletterRules } from '@/lib/schema';
import { hash } from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create test user
    const hashedPassword = await hash('password123', 12);
    const [user] = await db
      .insert(users)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
      })
      .returning();

    console.log('✅ Created test user');

    // Create categories
    const categoryData = [
      { name: 'Tech News', color: '#3b82f6', icon: 'computer' },
      { name: 'Productivity', color: '#10b981', icon: 'clock' },
      { name: 'Design', color: '#f59e0b', icon: 'palette' },
      { name: 'Business', color: '#6366f1', icon: 'briefcase' },
      { name: 'Personal', color: '#ec4899', icon: 'heart' },
    ];

    const createdCategories = await db
      .insert(categories)
      .values(
        categoryData.map((cat) => ({
          userId: user.id,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          isSystem: true,
        }))
      )
      .returning();

    console.log('✅ Created categories');

    // Create newsletter rules
    const ruleData = [
      {
        name: 'Tech News Rule',
        condition: {
          type: 'sender',
          value: 'tech@newsletter.com',
        },
        action: {
          type: 'category',
          value: 'Tech News',
        },
      },
      {
        name: 'Productivity Rule',
        condition: {
          type: 'subject',
          value: 'productivity',
        },
        action: {
          type: 'category',
          value: 'Productivity',
        },
      },
      {
        name: 'High Priority Rule',
        condition: {
          type: 'content',
          value: 'urgent',
        },
        action: {
          type: 'priority',
          value: 5,
        },
      },
    ];

    await db
      .insert(newsletterRules)
      .values(
        ruleData.map((rule) => ({
          userId: user.id,
          name: rule.name,
          condition: rule.condition,
          action: rule.action,
          isActive: true,
        }))
      );

    console.log('✅ Created newsletter rules');

    // Create sample newsletters
    const newsletterData = [
      {
        title: 'Weekly Tech Digest',
        sender: 'Tech Newsletter',
        senderEmail: 'tech@newsletter.com',
        subject: 'Latest in AI and Machine Learning',
        content: 'This week we explore the latest developments in AI...',
        htmlContent: '<h1>Latest in AI and Machine Learning</h1><p>This week we explore...</p>',
        category: 'Tech News',
        priority: 3,
        folder: 'inbox',
        isRead: false,
        isStarred: true,
        tags: ['AI', 'Machine Learning'],
      },
      {
        title: 'Productivity Tips',
        sender: 'Productivity Pro',
        senderEmail: 'tips@productivity.com',
        subject: '10 Ways to Boost Your Productivity',
        content: 'Discover these amazing productivity hacks...',
        htmlContent: '<h1>10 Ways to Boost Your Productivity</h1><p>Discover these...</p>',
        category: 'Productivity',
        priority: 2,
        folder: 'inbox',
        isRead: true,
        isStarred: false,
        tags: ['Tips', 'Productivity'],
      },
      {
        title: 'Design Weekly',
        sender: 'Design Digest',
        senderEmail: 'design@newsletter.com',
        subject: 'UI/UX Trends for 2024',
        content: 'Stay ahead with these emerging design trends...',
        htmlContent: '<h1>UI/UX Trends for 2024</h1><p>Stay ahead with...</p>',
        category: 'Design',
        priority: 1,
        folder: 'inbox',
        isRead: false,
        isStarred: false,
        tags: ['Design', 'UI/UX'],
      },
      {
        title: 'Business Insights',
        sender: 'Business Weekly',
        senderEmail: 'news@business.com',
        subject: 'Market Analysis: Q1 2024',
        content: 'Urgent: Market trends show significant changes...',
        htmlContent: '<h1>Market Analysis: Q1 2024</h1><p>Urgent: Market trends...</p>',
        category: 'Business',
        priority: 5,
        folder: 'inbox',
        isRead: false,
        isStarred: true,
        tags: ['Business', 'Market'],
      },
      {
        title: 'Personal Growth',
        sender: 'Growth Mindset',
        senderEmail: 'growth@newsletter.com',
        subject: 'Mindfulness and Well-being',
        content: 'Take a moment to focus on your well-being...',
        htmlContent: '<h1>Mindfulness and Well-being</h1><p>Take a moment...</p>',
        category: 'Personal',
        priority: 2,
        folder: 'inbox',
        isRead: true,
        isStarred: false,
        tags: ['Wellness', 'Mindfulness'],
      },
    ];

    await db
      .insert(newsletters)
      .values(
        newsletterData.map((newsletter) => ({
          userId: user.id,
          ...newsletter,
        }))
      );

    console.log('✅ Created sample newsletters');
    console.log('🌱 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 