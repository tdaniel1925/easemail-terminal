import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const connectionString = `postgresql://postgres.bfswjaswmfwvpwvrsqdb:ttandSellaBella1234@aws-0-us-west-2.pooler.supabase.com:5432/postgres`;

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function fixTestUserPrefs() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Update all existing test users to have onboarding_completed = true
    console.log('🔄 Updating existing test users to mark onboarding as completed...');

    const updateResult = await client.query(`
      UPDATE user_preferences
      SET
        onboarding_completed = true,
        onboarding_completed_at = NOW(),
        updated_at = NOW()
      FROM users
      WHERE user_preferences.user_id = users.id
        AND users.email LIKE 'test-%@example.com'
        AND user_preferences.onboarding_completed = false;
    `);

    console.log(`✅ Updated ${updateResult.rowCount} test user preferences\n`);

    // Modify the trigger to set onboarding_completed = true for test users
    console.log('🔄 Updating trigger to mark test users as onboarding completed...');

    await client.query(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Create user record
        INSERT INTO public.users (id, email, name)
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
        )
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          name = COALESCE(EXCLUDED.name, public.users.name);

        -- Create user_preferences record
        -- Test users bypass onboarding, regular users must complete it
        INSERT INTO public.user_preferences (
          user_id,
          onboarding_completed,
          onboarding_completed_at,
          ai_features_enabled,
          auto_categorize,
          created_at,
          updated_at
        )
        VALUES (
          NEW.id,
          -- Set to true for test users, false for regular users
          CASE
            WHEN NEW.email LIKE 'test-%@example.com' THEN true
            ELSE false
          END,
          CASE
            WHEN NEW.email LIKE 'test-%@example.com' THEN NOW()
            ELSE NULL
          END,
          true,
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT (user_id) DO NOTHING;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    console.log('✅ Trigger updated successfully!\n');

    // Verify the changes
    const verifyResult = await client.query(`
      SELECT
        u.email,
        up.onboarding_completed,
        up.onboarding_completed_at
      FROM users u
      JOIN user_preferences up ON u.id = up.user_id
      WHERE u.email LIKE 'test-%@example.com'
      ORDER BY u.created_at DESC
      LIMIT 5;
    `);

    if (verifyResult.rows.length > 0) {
      console.log('📊 Recent test users status:');
      verifyResult.rows.forEach(row => {
        console.log(`  - ${row.email}: onboarding_completed = ${row.onboarding_completed}`);
      });
    }

    console.log('\n✅ Done! Test users will now automatically have onboarding completed.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixTestUserPrefs();
