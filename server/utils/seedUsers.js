/**
 * JanSamadhan – Seed Script for Testing Privileged Accounts (Prisma ORM)
 * Generates verified test users for all 6 roles with documented credentials.
 * Run with: node server/utils/seedUsers.js
 */

const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

const SEED_USERS = [
  {
    name: 'Aarav Sharma (Citizen)',
    email: 'citizen@jansamadhan.dev',
    phone: '+91 98765 43210',
    password: 'Password@123',
    role: 'CITIZEN',
    isVerified: true,
  },
  {
    name: 'Dr. Rajesh Verma (Official)',
    email: 'government@jansamadhan.dev',
    phone: '+91 98765 43211',
    password: 'Password@123',
    role: 'GOVERNMENT',
    isVerified: true,
  },
  {
    name: 'Prof. Ananya Sen (IIT Delhi)',
    email: 'university@jansamadhan.dev',
    phone: '+91 98765 43212',
    password: 'Password@123',
    role: 'UNIVERSITY',
    isVerified: true,
  },
  {
    name: 'Er. Vikram Malhotra (Urban Planner)',
    email: 'expert@jansamadhan.dev',
    phone: '+91 98765 43213',
    password: 'Password@123',
    role: 'EXPERT',
    isVerified: true,
  },
  {
    name: 'Priya Iyer (Smart Infra Corp)',
    email: 'industry@jansamadhan.dev',
    phone: '+91 98765 43214',
    password: 'Password@123',
    role: 'INDUSTRY',
    isVerified: true,
  },
  {
    name: 'JanSamadhan Root Administrator',
    email: 'admin@jansamadhan.dev',
    phone: '+91 98765 43215',
    password: 'Password@123',
    role: 'SUPER_ADMIN',
    isVerified: true,
  },
];

async function seed() {
  console.log('🌱 Seeding Test Accounts into PostgreSQL via Prisma…\n');

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password@123', salt);

    for (const u of SEED_USERS) {
      const user = await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          phone: u.phone,
          role: u.role,
          isVerified: u.isVerified,
        },
        create: {
          name: u.name,
          email: u.email,
          phone: u.phone,
          passwordHash,
          role: u.role,
          isVerified: u.isVerified,
        },
      });
      console.log(`  ✅ User: ${user.email} [${user.role}]`);
    }

    console.log('\n✨ Test account seeding completed successfully.');
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seed();
}

module.exports = { SEED_USERS, seed };
