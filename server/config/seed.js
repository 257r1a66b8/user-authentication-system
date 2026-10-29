import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './db.js';
import User from '../models/User.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Seeding demo database...');
    await connectDB();

    const demoEmail = 'student.demo@example.com';
    const existing = await User.findOne({ email: demoEmail });

    if (existing) {
      console.log(`ℹ️ Demo user already exists: ${demoEmail}`);
    } else {
      const user = await User.create({
        name: 'Demo Student',
        email: demoEmail,
        password: 'Password123!',
        role: 'user'
      });
      console.log('✅ Demo user seeded successfully:');
      console.log(`   Email:    ${user.email}`);
      console.log('   Password: Password123!');
      console.log('   Role:     user');
    }

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
