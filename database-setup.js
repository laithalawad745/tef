// ===== ملف database-setup.js =====
// احفظ هذا الملف في مجلد المشروع وشغله مرة واحدة

const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_qklx7KQyaWz4@ep-mute-mode-acy6siy6-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function setupDatabase() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔧 الاتصال بقاعدة البيانات...');
    
    // إنشاء جدول User
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        "botToken" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ تم إنشاء جدول User');

    // إنشاء جدول Channel
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Channel" (
        id TEXT PRIMARY KEY,
        "telegramId" TEXT NOT NULL,
        name TEXT NOT NULL,
        "userId" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("userId") REFERENCES "User"(id)
      );
    `);
    console.log('✅ تم إنشاء جدول Channel');

    // إنشاء جدول Member
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Member" (
        id TEXT PRIMARY KEY,
        "telegramId" TEXT NOT NULL,
        username TEXT,
        "firstName" TEXT,
        "lastName" TEXT,
        "channelId" TEXT NOT NULL,
        "kickDate" TIMESTAMP NOT NULL,
        "isActive" BOOLEAN DEFAULT true,
        "uniqueToken" TEXT,
        "inviteLink" TEXT,
        "hasJoined" BOOLEAN DEFAULT false,
        "tokenUsed" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("channelId") REFERENCES "Channel"(id)
      );
    `);
    console.log('✅ تم إنشاء جدول Member');

    // إنشاء فهارس للأداء
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_member_telegram_id ON "Member"("telegramId");
      CREATE INDEX IF NOT EXISTS idx_member_channel_id ON "Member"("channelId");
      CREATE INDEX IF NOT EXISTS idx_member_active ON "Member"("isActive");
      CREATE INDEX IF NOT EXISTS idx_channel_telegram_id ON "Channel"("telegramId");
    `);
    console.log('✅ تم إنشاء الفهارس');

    console.log('🎉 تم إعداد قاعدة البيانات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في إعداد قاعدة البيانات:', error);
  } finally {
    await pool.end();
  }
}

// تشغيل الإعداد
setupDatabase();