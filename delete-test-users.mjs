#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteTestUsers() {
  console.log('🗑️  Starting deletion of test/admin users...\n');

  try {
    // Find all users with test or admin in email
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .or('email.ilike.%test%,email.ilike.%admin%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching users:', error);
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.log('✅ No users found to delete');
      process.exit(0);
    }

    console.log(`Found ${users.length} users to delete\n`);
    console.log('=' .repeat(80));

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Delete each user
    for (const user of users) {
      try {
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', user.id);

        if (deleteError) {
          errorCount++;
          errors.push({ email: user.email, error: deleteError.message });
          console.log(`❌ Failed to delete ${user.email}: ${deleteError.message}`);
        } else {
          successCount++;
          process.stdout.write('.');

          // Print progress every 50 users
          if (successCount % 50 === 0) {
            console.log(` ${successCount}/${users.length}`);
          }
        }
      } catch (err) {
        errorCount++;
        errors.push({ email: user.email, error: err.message });
        console.log(`❌ Exception deleting ${user.email}: ${err.message}`);
      }
    }

    console.log('\n' + '=' .repeat(80));
    console.log('\n✅ DELETION COMPLETE!\n');
    console.log(`📊 Results:`);
    console.log(`  ✓ Successfully deleted: ${successCount} users`);
    console.log(`  ✗ Failed to delete: ${errorCount} users`);

    if (errors.length > 0 && errors.length <= 10) {
      console.log('\n⚠️  Errors:');
      errors.forEach(err => {
        console.log(`  - ${err.email}: ${err.error}`);
      });
    } else if (errors.length > 10) {
      console.log('\n⚠️  Errors (first 10):');
      errors.slice(0, 10).forEach(err => {
        console.log(`  - ${err.email}: ${err.error}`);
      });
      console.log(`  ... and ${errors.length - 10} more errors`);
    }

    console.log('\n🎉 Database cleanup completed!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

deleteTestUsers();
