'use strict';
// 1. ADD THIS LINE AT THE VERY TOP
require('dotenv').config({ path: '../.env' }); 

// 2. Import the database models
const db = require('../models');

async function seedDatabase() {
  try {
    console.log('--- Starting Seeder ---');

    // 2. Sync the database (Only do this for your fresh npa_db)
    // This creates the tables if they don't exist
    await db.sequelize.sync({ force: false }); 
    console.log('✅ Database connected and tables verified.');

    // 3. Create MUBS Organization first so we have an ID for the user
    const [mubs] = await db.Organization.findOrCreate({
      where: { code: 'MUBS' },
      defaults: {
        name: 'Makerere University Business School',
        type: 'Academic Institution'
      }
    });
    console.log(`✅ Organization MUBS verified (ID: ${mubs.id})`);

    // 4. Create the Users
    // NOTE: individualHooks: true is critical so the User model hashes the password
    await db.User.bulkCreate([
      {
        name: 'NPA Administrator',
        email: 'admin@npa.go.ug',
        password: 'Admin@123', 
        role: 'npa_admin',
        organization_id: null
      },
      {
        name: 'MUBS Planning Officer',
        email: 'planner@mubs.ac.ug',
        password: 'Admin@123', 
        role: 'organization_admin',
        organization_id: mubs.id
      }
    ], { 
      ignoreDuplicates: true, // Prevents errors if you run the seed twice
      individualHooks: true   // Forces the bcrypt hashing in User.js to run
    });

    console.log('✅ Seeding Complete! Users created.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
}

seedDatabase();