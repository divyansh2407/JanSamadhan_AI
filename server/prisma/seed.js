/**
 * JanSamadhan – Idempotent Database Seeding Script (Prisma ORM)
 * Populates initial civic problem categories, cities, wards, and departments.
 * IMPORTANT: Strictly does NOT generate fake users or government accounts.
 * Run with: npm run seed or npx prisma db seed
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const INITIAL_CATEGORIES = [
  {
    name: 'Roads and Potholes',
    description: 'Potholes, damaged pavements, road cave-ins, and unfinished asphalt work.',
    icon: 'Construction',
  },
  {
    name: 'Garbage and Waste Management',
    description: 'Overflowing dumpsters, uncollected domestic waste, and illegal debris dumping.',
    icon: 'Trash2',
  },
  {
    name: 'Water Supply and Leakage',
    description: 'Pipeline bursts, low water pressure, contaminated supply, and leaking public taps.',
    icon: 'Droplets',
  },
  {
    name: 'Drainage and Sewage',
    description: 'Blocked stormwater drains, sewage overflow, broken manhole covers, and backflow.',
    icon: 'Waves',
  },
  {
    name: 'Electricity and Streetlights',
    description: 'Dark streetlights, leaning electric poles, sparking transformers, and dangling cables.',
    icon: 'Zap',
  },
  {
    name: 'Traffic and Transportation',
    description: 'Broken traffic lights, missing road signage, junction bottlenecks, and bus stop damage.',
    icon: 'Car',
  },
  {
    name: 'Air and Noise Pollution',
    description: 'Industrial emissions, open garbage burning, and excessive construction noise.',
    icon: 'Wind',
  },
  {
    name: 'Public Infrastructure',
    description: 'Damaged footbridges, municipal school buildings, cracked community walls, and barriers.',
    icon: 'Building2',
  },
  {
    name: 'Public Safety',
    description: 'Unlit dark corridors, open excavation trenches, abandoned structures, and stray hazards.',
    icon: 'ShieldAlert',
  },
  {
    name: 'Sanitation and Hygiene',
    description: 'Unhygienic public toilets, stagnant vector breeding pools, and open defecation spots.',
    icon: 'Sparkles',
  },
  {
    name: 'Parks and Public Spaces',
    description: 'Overgrown public parks, vandalized playground equipment, and damaged walking tracks.',
    icon: 'Trees',
  },
  {
    name: 'Other Civic Issues',
    description: 'Civic grievances not covered under standard municipal classifications.',
    icon: 'HelpCircle',
  },
];


async function seed() {
  console.log('🌱 Starting JanSamadhan PostgreSQL Database Seeding…\n');

  try {
    // 1. Seed Problem Categories idempotently via upsert
    console.log('--- 1. Seeding Civic Problem Categories ---');
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

    // 2. Seed Initial System Configuration (City, Wards, Departments)
    console.log('\n--- 2. Seeding Initial Municipal Configuration (Pune) ---');
    const city = await prisma.city.upsert({
      where: { corporationCode: 'PMC' },
      update: {
        name: 'Pune',
        state: 'Maharashtra',
        isActive: true,
      },
      create: {
        name: 'Pune',
        state: 'Maharashtra',
        corporationCode: 'PMC',
        isActive: true,
      },
    });
    console.log(`  ✅ Municipal Corporation: [${city.name} (${city.corporationCode})]`);

    // Wards
    const ward31 = await prisma.ward.upsert({
      where: {
        cityId_wardNumber: {
          cityId: city.id,
          wardNumber: 31,
        },
      },
      update: { name: 'Kothrud - Bavdhan' },
      create: {
        cityId: city.id,
        wardNumber: 31,
        name: 'Kothrud - Bavdhan',
      },
    });
    console.log(`  ✅ Ward: [Ward ${ward31.wardNumber} - ${ward31.name}]`);

    // Core Municipal Department
    const pwdDept = await prisma.department.upsert({
      where: { departmentCode: 'PWD_PMC' },
      update: {
        name: 'Public Works Department (Roads & Infrastructure)',
        city: 'Pune',
        state: 'Maharashtra',
        contactEmail: 'pwd@punecorporation.org',
        contactPhone: '9876543210',
        cityId: city.id,
        isActive: true,
      },
      create: {
        name: 'Public Works Department (Roads & Infrastructure)',
        departmentCode: 'PWD_PMC',
        city: 'Pune',
        state: 'Maharashtra',
        contactEmail: 'pwd@punecorporation.org',
        contactPhone: '9876543210',
        cityId: city.id,
        isActive: true,
      },
    });
    console.log(`  ✅ Department: [${pwdDept.name} (${pwdDept.departmentCode})]`);

    console.log('\n✨ Database seeding completed successfully and idempotently.');
    console.log('🔒 Note: In accordance with security mandates, ZERO mock users or admin accounts were created.');
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
