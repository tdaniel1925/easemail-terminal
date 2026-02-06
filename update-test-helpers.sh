#!/bin/bash

# Script to update helper functions in test files to use pre-seeded account

TEST_USER_CONST='// Pre-seeded test account to avoid rate limiting
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || '\''playwright-test@example.org'\'',
  password: process.env.TEST_USER_PASSWORD || '\''PlaywrightTest123!'\'',
  name: '\''Playwright Test User'\''
};'

NEW_HELPER='// Helper to login with the pre-seeded test user
async function createAndLoginUser(page: any) {
  await page.goto('\''/login'\'');
  await page.getByLabel(/email/i).fill(TEST_USER.email);
  await page.getByLabel(/password/i).fill(TEST_USER.password);
  await page.getByRole('\''button'\'', { name: /sign in/i }).click();
  await page.waitForURL(/\/app/, { timeout: 10000 });

  return { email: TEST_USER.email, password: TEST_USER.password };
}'

# Update files 04-09
for file in tests/04-email.spec.ts tests/05-ai-features.spec.ts tests/06-calendar.spec.ts tests/07-contacts.spec.ts tests/08-settings.spec.ts tests/09-help.spec.ts; do
  if [ -f "$file" ]; then
    echo "Updating $file..."

    # Create a backup
    cp "$file" "$file.bak"

    # Use awk to replace the helper function
    awk -v test_user="$TEST_USER_CONST" -v new_helper="$NEW_HELPER" '
    BEGIN { in_helper = 0; printed_new = 0 }
    /^\/\/ Helper to create and login a test user/ || /^\/\/ Helper function to create and login user/ {
      if (!printed_new) {
        print test_user
        print ""
        print new_helper
        printed_new = 1
      }
      in_helper = 1
      next
    }
    /^async function createAndLoginUser/ {
      in_helper = 1
      next
    }
    in_helper && /^}/ {
      in_helper = 0
      next
    }
    !in_helper { print }
    ' "$file.bak" > "$file"

    echo "Updated $file"
  fi
done

echo "Done updating test helper functions!"
