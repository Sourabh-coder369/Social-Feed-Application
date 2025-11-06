const fs = require('fs');
const path = require('path');
const db = require('./index');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Read and execute seed.sql
    const seedSQL = fs.readFileSync(
      path.join(__dirname, '../../sql/seed.sql'),
      'utf8'
    );

    // Remove comment-only lines and split by semicolon
    const cleanSQL = seedSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    // Split by semicolon and execute each statement
    const seedStatements = cleanSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`Executing ${seedStatements.length} INSERT statements...`);
    
    for (const statement of seedStatements) {
      if (statement) {
        await db.raw(statement);
      }
    }

    console.log('✓ Database seeded successfully!');
    
    // Display counts
    const userCount = await db('Users').count('* as count').first();
    const postCount = await db('Posts').count('* as count').first();
    const commentCount = await db('Comments').count('* as count').first();
    
    console.log('\nSeeded data summary:');
    console.log(`- Users: ${userCount.count}`);
    console.log(`- Posts: ${postCount.count}`);
    console.log(`- Comments: ${commentCount.count}`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
