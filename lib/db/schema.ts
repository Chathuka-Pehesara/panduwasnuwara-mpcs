// Database schema definitions for reference
export const SCHEMA_DEFINITIONS = {
  users: `
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
  `,
  adminUsers: `
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(32) DEFAULT 'admin',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  galleryPosts: `
    CREATE TABLE IF NOT EXISTS gallery_posts (
      id VARCHAR(64) PRIMARY KEY,
      image_src TEXT NOT NULL,
      aspect_ratio VARCHAR(32) DEFAULT '4:3',
      likes_count INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  galleryLikes: `
    CREATE TABLE IF NOT EXISTS gallery_likes (
      id SERIAL PRIMARY KEY,
      post_id VARCHAR(64) REFERENCES gallery_posts(id) ON DELETE CASCADE,
      client_id VARCHAR(128) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(post_id, client_id)
    );
  `,
  galleryComments: `
    CREATE TABLE IF NOT EXISTS gallery_comments (
      id VARCHAR(64) PRIMARY KEY,
      post_id VARCHAR(64) REFERENCES gallery_posts(id) ON DELETE CASCADE,
      author VARCHAR(100) NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  settings: `
    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(64) PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  importedMembers: `
    CREATE TABLE IF NOT EXISTS imported_members (
      id SERIAL PRIMARY KEY,
      member_number VARCHAR(100),
      full_name VARCHAR(255) NOT NULL,
      nic VARCHAR(50),
      phone VARCHAR(50),
      imported_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  eligibleVoters: `
    CREATE TABLE IF NOT EXISTS eligible_voters (
      id SERIAL PRIMARY KEY,
      voter_number VARCHAR(100),
      full_name VARCHAR(255) NOT NULL,
      nic VARCHAR(50),
      division VARCHAR(100),
      uploaded_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  membershipApplications: `
    CREATE TABLE IF NOT EXISTS membership_applications (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE SET NULL,
      full_name_si VARCHAR(255) NOT NULL,
      full_name_en VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      postal_address TEXT NOT NULL,
      nic VARCHAR(50) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255),
      certified_form_photo TEXT NOT NULL,
      status VARCHAR(32) DEFAULT 'pending',
      admin_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  businesses: `
    CREATE TABLE IF NOT EXISTS businesses (
      id SERIAL PRIMARY KEY,
      key VARCHAR(64) UNIQUE NOT NULL,
      title_si VARCHAR(255) NOT NULL,
      title_en VARCHAR(255) NOT NULL,
      tagline_si TEXT,
      tagline_en TEXT,
      category_si VARCHAR(100),
      category_en VARCHAR(100),
      description_si TEXT,
      description_en TEXT,
      manager VARCHAR(150),
      location TEXT,
      hotline VARCHAR(50),
      image_src TEXT,
      is_new BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      display_order INT DEFAULT 0,
      services JSONB DEFAULT '[]'::jsonb,
      services_en JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  newsAnnouncements: `
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
  `,
  inquiries: `
    CREATE TABLE IF NOT EXISTS inquiries (
      id SERIAL PRIMARY KEY,
      business_key VARCHAR(64) NOT NULL,
      business_name VARCHAR(150) NOT NULL,
      user_id INT REFERENCES users(id) ON DELETE SET NULL,
      user_name VARCHAR(150) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255),
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(32) DEFAULT 'unread',
      reply_message TEXT,
      replied_at TIMESTAMPTZ,
      admin_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  businessServices: `
    CREATE TABLE IF NOT EXISTS business_services (
      id SERIAL PRIMARY KEY,
      business_key VARCHAR(64) NOT NULL,
      title_si VARCHAR(255) NOT NULL,
      title_en VARCHAR(255) NOT NULL,
      desc_si TEXT,
      desc_en TEXT,
      features_si JSONB DEFAULT '[]'::jsonb,
      features_en JSONB DEFAULT '[]'::jsonb,
      display_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  fuelPrices: `
    CREATE TABLE IF NOT EXISTS fuel_prices (
      id VARCHAR(32) PRIMARY KEY,
      name_en VARCHAR(100) NOT NULL,
      name_si VARCHAR(100) NOT NULL,
      price_per_liter NUMERIC(10, 2) NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  guestSessions: `
    CREATE TABLE IF NOT EXISTS guest_sessions (
      session_id VARCHAR(64) PRIMARY KEY,
      last_seen TIMESTAMPTZ DEFAULT NOW()
    );
  `
};

export async function initDatabaseSchema(): Promise<void> {
  // Schema is already provisioned in Supabase.
  // Instant no-op to prevent query roundtrips and delay.
  return Promise.resolve();
}

