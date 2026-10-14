async function runMigrations(client) {
  console.log('Running database migrations...');

  // Users table
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      full_name VARCHAR(150),
      nic VARCHAR(50) UNIQUE,
      phone VARCHAR(50),
      email VARCHAR(255),
      password TEXT NOT NULL,
      role VARCHAR(32) DEFAULT 'user',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Incremental user schema alterations
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(150);`);
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS nic VARCHAR(50);`);
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`);
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);`);
  await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS users_nic_unique ON users(LOWER(nic)) WHERE nic IS NOT NULL;`);

  // Admin users table
  await client.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(32) DEFAULT 'admin',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Gallery posts table
  await client.query(`
    CREATE TABLE IF NOT EXISTS gallery_posts (
      id VARCHAR(64) PRIMARY KEY,
      image_src TEXT NOT NULL,
      aspect_ratio VARCHAR(32) DEFAULT '4:3',
      likes_count INT DEFAULT 0,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await client.query(`ALTER TABLE gallery_posts ADD COLUMN IF NOT EXISTS description TEXT;`);

  // Gallery likes table
  await client.query(`
    CREATE TABLE IF NOT EXISTS gallery_likes (
      id SERIAL PRIMARY KEY,
      post_id VARCHAR(64) REFERENCES gallery_posts(id) ON DELETE CASCADE,
      client_id VARCHAR(128) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(post_id, client_id)
    );
  `);

  // Gallery comments table
  await client.query(`
    CREATE TABLE IF NOT EXISTS gallery_comments (
      id VARCHAR(64) PRIMARY KEY,
      post_id VARCHAR(64) REFERENCES gallery_posts(id) ON DELETE CASCADE,
      author VARCHAR(100) NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // System settings table
  await client.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(64) PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Imported members table
  await client.query(`
    CREATE TABLE IF NOT EXISTS imported_members (
      id SERIAL PRIMARY KEY,
      member_number VARCHAR(100),
      full_name VARCHAR(255) NOT NULL,
      nic VARCHAR(50),
      phone VARCHAR(50),
      imported_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Eligible voters table
  await client.query(`
    CREATE TABLE IF NOT EXISTS eligible_voters (
      id SERIAL PRIMARY KEY,
      voter_number VARCHAR(100),
      full_name VARCHAR(255) NOT NULL,
      nic VARCHAR(50),
      division VARCHAR(100),
      uploaded_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Businesses table
  await client.query(`
    CREATE TABLE IF NOT EXISTS businesses (
      id SERIAL PRIMARY KEY,
      key VARCHAR(64) UNIQUE NOT NULL,
      title_si VARCHAR(255) NOT NULL,
      title_en VARCHAR(255) NOT NULL,
      manager VARCHAR(150),
      hotline VARCHAR(50),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // News & Announcements table
  await client.query(`
    CREATE TABLE IF NOT EXISTS news_announcements (
      id SERIAL PRIMARY KEY,
      title_si VARCHAR(255) NOT NULL,
      title_en VARCHAR(255) NOT NULL,
      description_si TEXT NOT NULL,
      description_en TEXT NOT NULL,
      image_url TEXT,
      category VARCHAR(64) DEFAULT 'general',
      badge_text_si VARCHAR(100),
      badge_text_en VARCHAR(100),
      is_pinned BOOLEAN DEFAULT false,
      is_published BOOLEAN DEFAULT true,
      published_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('✓ Database migrations completed.');
}

module.exports = { runMigrations };
