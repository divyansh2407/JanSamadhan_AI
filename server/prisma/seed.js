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
    description: 'Open manholes, uncovered trenches, structural safety hazards, and dark alleys.',
    icon: 'ShieldAlert',
  },
  {
    name: 'Public Infrastructure',
    description: 'Damaged municipal schools, public toilets, broken boundary walls, and parks.',
    icon: 'Building2',
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
