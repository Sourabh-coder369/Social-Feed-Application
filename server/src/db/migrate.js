const fs = require('fs');
const path = require('path');
const db = require('./index');

async function runMigration() {
  try {
    console.log('Starting database migration...');

    // Ensure we're using the correct database
    await db.raw(`USE ${process.env.DB_NAME || 'socialfeed'}`);

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
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
