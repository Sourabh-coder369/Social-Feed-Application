const fs = require('fs');
const path = require('path');
const knex = require('knex');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
require('dotenv').config({ path: path.join(__dirname, '../..', envFile) });

async function runMigration() {
  // First, create a connection WITHOUT specifying database
  const adminDb = knex({
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      charset: 'utf8mb4',
      multipleStatements: true
    },
    pool: { min: 0, max: 1 }
  });

  // Then create a connection WITH the database
  const db = knex({
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'socialfeed',
      charset: 'utf8mb4',
      multipleStatements: true
    },
    pool: { min: 0, max: 5 }
  });

  try {
    console.log('Starting database migration...');
    console.log('Using database:', process.env.DB_NAME || 'socialfeed');
    console.log('Host:', process.env.DB_HOST || 'localhost');

    // Create database if it doesn't exist
    console.log('Ensuring database exists...');
    try {
      await adminDb.raw(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'socialfeed'}\``);
      console.log('✓ Database ensured');
    } catch (err) {
      console.log('Warning: Could not create database:', err.message);
    } finally {
      await adminDb.destroy();
    }

    // Wait a moment for database to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✓ Connected to database');

    // Read and execute schema.sql
    console.log('Creating tables from schema.sql...');
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, '../../sql/schema.sql'),
      'utf8'
    );
    
    // Remove comment-only lines and split by semicolon
    const cleanSQL = schemaSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    // Split by semicolon and execute each statement
    const schemaStatements = cleanSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of schemaStatements) {
      if (statement) {
        const preview = statement.replace(/\s+/g, ' ').substring(0, 60);
        console.log('Executing:', preview + '...');
        await db.raw(statement);
      }
    }
    
    // Verify tables were created
    const tables = await db.raw('SHOW TABLES');
    console.log('✓ Tables created successfully. Count:', tables[0].length);

    // Read and execute triggers.sql
    console.log('Creating triggers from triggers.sql...');
    const triggersSQL = fs.readFileSync(
      path.join(__dirname, '../../sql/triggers.sql'),
      'utf8'
    );
    // Remove DELIMITER statements and split by $$
    const cleanedTriggers = triggersSQL
      .replace(/DELIMITER \$\$/g, '')
      .replace(/DELIMITER ;/g, '')
      .trim();
    
    // Split by $$ and filter out empty statements
    const triggerStatements = cleanedTriggers
      .split('$$')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Execute each trigger
    for (const statement of triggerStatements) {
      if (statement) {
        await db.raw(statement);
      }
    }
    console.log('✓ Triggers created successfully');

    // Read and execute functions.sql
    console.log('Creating functions from functions.sql...');
    const functionsSQL = fs.readFileSync(
      path.join(__dirname, '../../sql/functions.sql'),
      'utf8'
    );
    // Remove DELIMITER statements and split by $$
    const cleanedFunctions = functionsSQL
      .replace(/DELIMITER \$\$/g, '')
      .replace(/DELIMITER ;/g, '')
      .trim();
    
    // Split by $$ and filter out empty statements
    const functionStatements = cleanedFunctions
      .split('$$')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Execute each function
    for (const statement of functionStatements) {
      if (statement) {
        await db.raw(statement);
      }
    }
    console.log('✓ Functions created successfully');

    // Read and execute procedures.sql
    console.log('Creating procedures from procedures.sql...');
    const proceduresSQL = fs.readFileSync(
      path.join(__dirname, '../../sql/procedures.sql'),
      'utf8'
    );
    // Remove DELIMITER statements and split by $$
    const cleanedProcedures = proceduresSQL
      .replace(/DELIMITER \$\$/g, '')
      .replace(/DELIMITER ;/g, '')
      .trim();
    
    // Split by $$ and filter out empty statements
    const procedureStatements = cleanedProcedures
      .split('$$')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Execute each procedure
    for (const statement of procedureStatements) {
      if (statement) {
        await db.raw(statement);
      }
    }
    console.log('✓ Procedures created successfully');

    console.log('Migration completed successfully!');
    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await db.destroy().catch(() => {});
    process.exit(1);
  }
}

runMigration();
