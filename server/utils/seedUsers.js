/**
 * JanSamadhan – Seed Script for Testing Privileged Accounts
 * Generates verified test users for all 6 roles with documented credentials.
 * Run with: node server/utils/seedUsers.js
 */

const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

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
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in server/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for seeding...');

    for (const u of SEED_USERS) {
      const exists = await User.findOne({ email: u.email });
      if (exists) {
        console.log(`ℹ️  User already exists: ${u.email} (${u.role})`);
      } else {
        await User.create(u);
        console.log(`✅ Created test user: ${u.email} [${u.role}] (pwd: Password@123)`);
      }
    }

    console.log('\n✨ Seeding completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = { SEED_USERS, seed };
