#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

const AVI_EMAIL = 'avmichaca@dmillerlaw.com';
const AVI_ID = '6fd1d024-aad4-4bcc-8697-3ed1b0da3473';
const AVI_NAME = 'Avimael Michaca';

async function resetAviPassword() {
  console.log('🔐 Generating new password for Avi...\n');

  try {
    // Generate a secure temporary password
    const temporaryPassword = randomBytes(12).toString('hex'); // 24 characters

    console.log('✅ New password generated');
    console.log(`📧 Password: ${temporaryPassword}\n`);

    // Update password in Supabase Auth
    console.log('⏳ Updating password in Supabase Auth...');

    const { data, error } = await supabase.auth.admin.updateUserById(
      AVI_ID,
      { password: temporaryPassword }
    );

    if (error) {
      console.error('❌ Failed to update password:', error);
      return;
    }

    console.log('✅ Password updated in database\n');

    // Send welcome email with password
    console.log('📨 Sending welcome email with login credentials...');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Your EaseMail Login Credentials</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f0f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f4f8; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color: #e8f0fe; padding: 40px; text-align: center; border-bottom: 3px solid #5b8def;">
              <div style="display: inline-block; background-color: #5b8def; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-size: 28px; font-weight: 800;">
                EaseMail
              </div>
              <h1 style="color: #1e3a8a; font-size: 32px; font-weight: bold; margin: 20px 0;">Welcome to EaseMail!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #111827; font-size: 16px; margin: 0 0 20px 0;">
                Hi ${AVI_NAME},
              </p>

              <p style="color: #111827; font-size: 16px; margin: 0 0 30px 0;">
                Your account has been set up! Here are your login credentials:
              </p>

              <!-- Login Credentials -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="padding: 24px; background-color: #dbeafe; border-radius: 12px; border: 2px solid #5b8def;">
                    <h3 style="color: #1e3a8a; font-size: 18px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">🔐 Your Login Credentials</h3>

                    <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
                      <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0; font-weight: 600;">Email:</p>
                      <p style="color: #111827; font-size: 16px; margin: 0; font-family: monospace;">${AVI_EMAIL}</p>
                    </div>

                    <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                      <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px 0; font-weight: 600;">Temporary Password:</p>
                      <p style="color: #1e3a8a; font-size: 18px; font-weight: 700; margin: 0; font-family: monospace;">${temporaryPassword}</p>
                    </div>

                    <div style="background-color: #fef3c7; padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                      <p style="color: #92400e; font-size: 13px; margin: 0;">
                        <strong>⚠️ Important:</strong> Please change this password after your first login.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Login Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://easemail.app/login" style="display: inline-block; background-color: #5b8def; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Log In Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #475569; font-size: 14px; margin: 30px 0 0 0;">
                Need help? Contact support at support@easemail.com
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 2px solid #e8f0fe;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                © 2026 EaseMail. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailResult = await resend.emails.send({
      from: 'EaseMail <noreply@easemail.app>',
      to: AVI_EMAIL,
      subject: 'Your EaseMail Login Credentials 🔐',
      html: html,
    });

    if (emailResult.error) {
      console.error('❌ Failed to send email:', emailResult.error);
      console.log('\n💡 Manual password to share with Avi:');
      console.log(`   Email: ${AVI_EMAIL}`);
      console.log(`   Password: ${temporaryPassword}`);
      return;
    }

    console.log('✅ Email sent successfully!');
    console.log(`   Email ID: ${emailResult.data?.id}\n`);

    console.log('🎉 SUCCESS!');
    console.log(`\nAvi can now log in at: https://easemail.app/login`);
    console.log(`Email: ${AVI_EMAIL}`);
    console.log(`Password: ${temporaryPassword}`);
    console.log(`\n⚠️  Make sure to tell Avi to change the password after first login!`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

resetAviPassword();
