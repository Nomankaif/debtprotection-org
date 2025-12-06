const mongoose = require('mongoose');
require('dotenv').config();

const Author = require('../models/Author');
const Article = require('../models/Article');

const seedData = async () => {
  try {
    // Connect to database
    const dbUrl = process.env.MONGO_DB_URL || 'mongodb://localhost:27017/student-relief-program';
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Author.deleteMany({});
    await Article.deleteMany({});
    console.log('Cleared existing data');

    // Create sample authors
    const authors = await Author.create([
      {
        name: 'John Doe',
        bio: 'Technology journalist with 10+ years of experience in covering AI and machine learning.'
      },
      {
        name: 'Jane Smith',
        bio: 'Political correspondent and investigative journalist focusing on government transparency.'
      },
      {
        name: 'Mike Johnson',
        bio: 'Sports writer covering major league baseball and basketball.'
      }
    ]);
    console.log('Created sample authors');

    // Create sample articles
    const articles = await Article.create([
      {
        title: 'Understanding Debt Management Strategies',
        excerpt: 'Learn effective strategies to manage and reduce your debt with proven methods for financial control.',
        content: '<h2>Breaking News</h2><p>Learn effective strategies to manage and reduce your debt. These proven methods can help you regain financial control and work toward a debt-free future.</p><h2>Debt Consolidation</h2><p>Consolidating multiple debts into a single payment can simplify your finances and potentially lower your interest rates.</p><h2>Budgeting Basics</h2><p>Creating a realistic budget is the foundation of successful debt management. Track your income and expenses to identify areas for improvement.</p>',
        author: 'Sarah Martinez',
        imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
        categories: ['Debt Management'],
        status: 'Published'
      },
      {
        title: 'Financial Planning for Your Future',
        excerpt: 'Essential financial planning strategies for achieving your long-term goals and building wealth.',
        content: '<h2>Overview</h2><p>Financial planning is essential for achieving your long-term goals. Whether you\'re saving for retirement, a home, or education, a solid plan makes all the difference.</p><h2>Setting Financial Goals</h2><p>Define clear, measurable financial goals and create a roadmap to achieve them.</p><h2>Investment Strategies</h2><p>Learn about different investment options and how to build a diversified portfolio.</p>',
        author: 'Michael Chen',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop',
        categories: ['Financial Planning'],
        status: 'Published'
      },
      {
        title: 'How to Improve Your Credit Score',
        excerpt: 'Discover proven methods to boost your credit score and unlock better financial opportunities.',
        content: '<h2>Credit Score Basics</h2><p>Your credit score affects your ability to get loans, credit cards, and even housing. Understanding how it works is the first step to improvement.</p><h2>Payment History</h2><p>Making on-time payments is the most important factor in your credit score. Set up automatic payments to never miss a due date.</p><h2>Credit Utilization</h2><p>Keep your credit card balances low relative to your credit limits to maintain a healthy credit score.</p>',
        author: 'Dr. Jennifer Williams',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
        categories: ['Credit Scores'],
        status: 'Published'
      },
      {
        title: 'Legal Rights for Debt Protection',
        excerpt: 'Know your legal rights when dealing with debt collectors and creditors under federal law.',
        content: '<h2>Know Your Rights</h2><p>Understanding your legal rights is crucial when dealing with debt collectors and creditors. Federal and state laws protect consumers from unfair practices.</p><h2>Fair Debt Collection Practices Act</h2><p>The FDCPA limits what debt collectors can do when collecting debts. Learn about your protections under this important law.</p><h2>When to Seek Legal Help</h2><p>Sometimes professional legal advice is necessary. Know when to consult with a debt attorney.</p>',
        author: 'Robert Taylor',
        imageUrl: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&h=600&fit=crop',
        categories: ['Legal Advice'],
        status: 'Published'
      },
      {
        title: 'Debt Settlement vs Bankruptcy',
        excerpt: 'Compare debt settlement and bankruptcy options to make the best decision for your financial situation.',
        content: '<h2>Understanding Your Options</h2><p>When facing overwhelming debt, it\'s important to understand all available options including debt settlement and bankruptcy.</p><h2>Debt Settlement</h2><p>Debt settlement involves negotiating with creditors to pay less than the full amount owed. Learn the pros and cons.</p><h2>Bankruptcy Protection</h2><p>Bankruptcy can provide a fresh start, but it has long-term consequences. Understand the different types and their implications.</p>',
        author: 'Lisa Anderson',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop',
        categories: ['Legal Advice'],
        status: 'Published'
      },
      {
        title: 'Creating an Emergency Fund',
        excerpt: 'Build a financial safety net with an emergency fund to protect against unexpected expenses.',
        content: '<h2>Why You Need an Emergency Fund</h2><p>An emergency fund provides a financial safety net for unexpected expenses and helps prevent new debt.</p><h2>How Much to Save</h2><p>Financial experts recommend saving 3-6 months of living expenses in an easily accessible account.</p><h2>Building Your Fund</h2><p>Start small and automate your savings to build your emergency fund over time.</p>',
        author: 'David Kim',
        imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop',
        categories: ['Financial Planning'],
        status: 'Published'
      },
      {
        title: 'Negotiating with Creditors',
        excerpt: 'Learn effective strategies for communicating with creditors and negotiating better payment terms.',
        content: '<h2>Communication is Key</h2><p>Don\'t avoid your creditors. Proactive communication can lead to better payment arrangements and solutions.</p><h2>Hardship Programs</h2><p>Many creditors offer hardship programs that can temporarily reduce payments or interest rates.</p><h2>Getting Agreements in Writing</h2><p>Always get any payment arrangements or settlements in writing before making payments.</p>',
        author: 'Amanda Rodriguez',
        imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&h=600&fit=crop',
        categories: ['Debt Management'],
        status: 'Published'
      },
      {
        title: 'Understanding Credit Reports',
        excerpt: 'Everything you need to know about credit reports, how to read them, and dispute errors.',
        content: '<h2>What\'s in Your Credit Report</h2><p>Your credit report contains detailed information about your credit history, including accounts, payment history, and inquiries.</p><h2>Checking Your Report</h2><p>You\'re entitled to a free credit report from each bureau annually. Review them regularly for errors.</p><h2>Disputing Errors</h2><p>If you find errors on your credit report, you have the right to dispute them. Learn the proper process.</p>',
        author: 'Tech Education Team',
        imageUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=600&fit=crop',
        categories: ['Credit Scores'],
        status: 'Published'
      }
    ]);
    console.log('Created sample articles');

    console.log('✅ Database seeded successfully!');
    console.log(`Created ${authors.length} authors and ${articles.length} articles`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

seedData();