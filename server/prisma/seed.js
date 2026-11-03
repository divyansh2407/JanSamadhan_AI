/**
 * JanSamadhan – Idempotent Database Seeding Script (Prisma ORM)
 * Populates initial civic problem categories and essential configurations.
 * Run with: npm run seed or npx prisma db seed
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const INITIAL_CATEGORIES = [
  {
    name: 'Roads and Infrastructure',
    description: 'Potholes, damaged pavements, bridge structural issues, and road cave-ins.',
    icon: 'Construction',
  },
  {
    name: 'Waste Management',
    description: 'Garbage dump overflow, illegal dumping, hazardous waste, and uncollected trash.',
    icon: 'Trash2',
  },
  {
    name: 'Water and Sanitation',
    description: 'Pipeline leakage, water contamination, sewage overflows, and drainage blockages.',
    icon: 'Droplets',
  },
  {
    name: 'Electricity and Streetlights',
    description: 'Dark streetlights, fallen electric poles, hanging cables, and power fluctuation hazards.',
    icon: 'Zap',
  },
  {
    name: 'Traffic and Transportation',
    description: 'Faulty traffic signals, missing road signs, dangerous intersections, and transit congestion.',
    icon: 'Car',
  },
  {
    name: 'Environment and Pollution',
    description: 'Industrial smoke, noise pollution, open burning of waste, and water body pollution.',
    icon: 'Leaf',
  },
  {
    name: 'Public Safety',
    description: 'Open manholes, uncovered trenches, structural safety hazards, and stray animal hazards.',
    icon: 'ShieldAlert',
  },
  {
    name: 'Other',
    description: 'General civic concerns not covered by predefined categories.',
    icon: 'HelpCircle',
  },
];

async function seed() {
  console.log('🌱 Starting JanSamadhan PostgreSQL Database Seeding…\n');

  try {
    // 1. Seed Problem Categories idempotently via upsert
    console.log('--- Seeding Civic Problem Categories ---');
    for (const cat of INITIAL_CATEGORIES) {
      const category = await prisma.problemCategory.upsert({
        where: { name: cat.name },
        update: {
          description: cat.description,
          icon: cat.icon,
          isActive: true,
        },
        create: {
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          isActive: true,
        },
      });
      console.log(`  ✅ Category: [${category.name}]`);
    }

    console.log('\n✨ Database seeding completed successfully and idempotently.');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed, INITIAL_CATEGORIES };

