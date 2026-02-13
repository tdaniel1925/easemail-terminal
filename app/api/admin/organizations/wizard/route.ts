// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/resend';
import { getOrgOwnerWelcomeEmailHtml, getOrgAdminWelcomeEmailHtml, getOrgMemberWelcomeEmailHtml, getBillingSetupEmailHtml } from '@/lib/email-templates';
import { encryptApiKey } from '@/lib/encryption/api-keys';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Create service client for admin operations
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Authenticate and verify super admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if super admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single() as { data: { is_super_admin: boolean } | null };

    if (!userData?.is_super_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Super admin only' },
        { status: 403 }
      );
    }

    // Parse request body
    const {
      organization,
      users,
      api_key,
    } = await request.json();

    // Validate required fields
    if (!organization?.name || !users || users.length === 0) {
      return NextResponse.json(
        { error: 'Organization name and at least one user are required' },
        { status: 400 }
      );
    }

    // Ensure at least one OWNER
    if (!users.some((u: any) => u.role === 'OWNER')) {
      return NextResponse.json(
        { error: 'At least one OWNER is required' },
        { status: 400 }
      );
    }

    // Calculate initial MRR/ARR based on seats
    const seats = organization.seats || 1;
    let mrr = 0;
    if (organization.plan !== 'FREE') {
      if (seats === 1) {
        mrr = 30;
      } else if (seats >= 2 && seats <= 10) {
        mrr = seats * 25;
      } else if (seats >= 11) {
        mrr = seats * 20;
      }
    }

    const billingCycle = organization.billing_cycle || 'monthly';
    const arr = billingCycle === 'annual' ? mrr * 10 : mrr * 12;

    // Set next billing date (30 days from now for monthly, 365 for annual)
    const nextBillingDate = new Date();
    if (billingCycle === 'annual') {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    } else {
      nextBillingDate.setDate(nextBillingDate.getDate() + 30);
    }

    // Step 1: Create all users
    const createdUsers: Array<{ id: string; email: string; role: string }> = [];

    for (const userToCreate of users) {
      try {
        // Create new user via Supabase Auth using service client with password
        const { data: newAuthUser, error: authError } = await serviceClient.auth.admin.createUser({
          email: userToCreate.email,
          password: userToCreate.password,
          email_confirm: true,
          user_metadata: {
            name: userToCreate.name,
          },
        });

        if (authError) {
          console.error('Error creating auth user:', authError, 'for', userToCreate.email);
          // Continue with other users
          continue;
        }

        // Create user record in public.users table using service client
        const { error: userInsertError } = await (serviceClient
          .from('users') as any)
          .insert({
            id: newAuthUser.user.id,
            email: userToCreate.email,
            name: userToCreate.name,
            is_super_admin: false,
          });

        if (userInsertError) {
          console.error('Error creating user record:', userInsertError);
          // Note: Auth user was created, but user record failed
          // In production, you'd want to handle this more gracefully
        }

        // Create user_preferences with onboarding completed (admin-created users skip onboarding)
        const { error: prefsInsertError } = await (serviceClient
          .from('user_preferences') as any)
          .insert({
            user_id: newAuthUser.user.id,
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
            ai_features_enabled: true,
            auto_categorize: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (prefsInsertError) {
          console.error('Error creating user_preferences record:', prefsInsertError);
        }

        // Create email accounts for this user (if provided)
        if (userToCreate.emailAccounts && userToCreate.emailAccounts.length > 0) {
          for (const emailAccount of userToCreate.emailAccounts) {
            try {
              await serviceClient.from('email_accounts').insert({
                user_id: newAuthUser.user.id,
                email: emailAccount.email,
                provider: emailAccount.provider,
                email_provider: emailAccount.provider,
                name: emailAccount.email.split('@')[0],
                is_primary: false,
                grant_id: null, // Will be set when user connects via OAuth
                needs_oauth_connection: true,
                added_by_admin: user.id,
                pre_configured_during_setup: true,
                metadata: { added_via: 'org_creation_wizard' },
              });
              console.log(`Added email account ${emailAccount.email} for user ${userToCreate.email}`);
            } catch (emailError) {
              console.error(`Error adding email account ${emailAccount.email}:`, emailError);
              // Continue with other email accounts
            }
          }
        }

        createdUsers.push({
          id: newAuthUser.user.id,
          email: userToCreate.email,
          role: userToCreate.role,
        });
      } catch (error) {
        console.error('Error creating user:', userToCreate.email, error);
        // Continue with other users
      }
    }

    if (createdUsers.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create any users' },
        { status: 500 }
      );
    }

    // Step 2: Create organization using service client
    // Generate slug from name
    const slug = organization.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const uniqueSlug = `${slug}-${Date.now()}`;

    const { data: newOrg, error: orgError } = await serviceClient
      .from('organizations')
      .insert({
        name: organization.name,
        slug: uniqueSlug,
        domain: organization.domain || null,
        plan: organization.plan || 'PRO',
        seats: seats,
        billing_email: organization.billing_email || createdUsers[0]?.email || user.email,
        billing_cycle: billingCycle,
        next_billing_date: nextBillingDate.toISOString().split('T')[0],
        mrr: mrr,
        arr: arr,
        uses_master_api_key: api_key?.uses_master_key !== false,
      })
      .select()
      .single();

    if (orgError) {
      console.error('Error creating organization:', orgError);
      console.error('Organization data attempted:', {
        name: organization.name,
        slug: uniqueSlug,
        domain: organization.domain || null,
        plan: organization.plan || 'PRO',
        seats: seats,
        billing_cycle: billingCycle,
        billing_email: organization.billing_email || createdUsers[0]?.email || user.email,
      });
      return NextResponse.json(
        {
          error: 'Failed to create organization',
          details: orgError.message || orgError,
          hint: orgError.hint || null
        },
        { status: 500 }
      );
    }

    // Step 3: Add all users to organization with their roles
    const memberInserts = createdUsers.map(createdUser => ({
      organization_id: newOrg.id,
      user_id: createdUser.id,
      role: createdUser.role,
      added_by: user.id,
    }));

    const { error: memberError } = await serviceClient
      .from('organization_members')
      .insert(memberInserts);

    if (memberError) {
      console.error('Error adding users to organization:', memberError);
      // Organization was created, but member assignment failed
      // In production, you'd want to rollback or handle this
    }

    // Step 4: Handle API key setup using service client
    if (!api_key?.uses_master_key && api_key?.key_value) {
      // Organization is providing their own API key
      try {
        // Encrypt the API key before storing
        const encryptedKey = await encryptApiKey(api_key.key_value);

        const { data: apiKeyRecord, error: apiKeyError } = await serviceClient
          .from('api_keys')
          .insert({
            organization_id: newOrg.id,
            key_name: api_key.key_name || 'Primary OpenAI Key',
            key_value: encryptedKey, // Encrypted using AES-256
            is_active: true,
            created_by: user.id,
          })
          .select()
          .single();

        if (apiKeyError) {
          console.error('Error creating API key:', apiKeyError);
        } else {
          console.log('✅ API key encrypted and stored securely');

          // Update organization to reference this API key
          await serviceClient
            .from('organizations')
            .update({
              api_key_id: apiKeyRecord.id,
              uses_master_api_key: false,
            })
            .eq('id', newOrg.id);
        }
      } catch (encryptError) {
        console.error('Failed to encrypt API key:', encryptError);
        // Continue without API key - org will use master key
      }
    }

    // Step 5: Create initial billing history record using service client
    const { error: historyError } = await serviceClient
      .from('billing_history')
      .insert({
        organization_id: newOrg.id,
        event_type: 'subscription_created',
        new_value: {
          plan: newOrg.plan,
          seats: newOrg.seats,
          billing_cycle: newOrg.billing_cycle,
          mrr: newOrg.mrr,
          arr: newOrg.arr,
        },
        amount: billingCycle === 'annual' ? arr : mrr,
        triggered_by: user.id,
      });

    if (historyError) {
      console.error('Error creating billing history:', historyError);
    }

    // Step 6: Send role-based welcome emails to all users
    console.log('Sending role-based welcome emails to:', createdUsers.map(u => u.email).join(', '));

    // Get the owner name for inviter field in admin/member emails
    const ownerUser = createdUsers.find(u => u.role === 'OWNER');
    const ownerUserDetails = users.find((u: any) => u.role === 'OWNER');
    const inviterName = ownerUserDetails?.name || ownerUser?.email.split('@')[0] || 'Organization Admin';

    for (const createdUser of createdUsers) {
      try {
        // Find user details from original request
        const userDetails = users.find((u: any) => u.email === createdUser.email);
        const userName = userDetails?.name || createdUser.email.split('@')[0];
        const userPassword = userDetails?.password;

        let html: string;
        let subject: string;

        // Send role-specific welcome email
        if (createdUser.role === 'OWNER') {
          html = getOrgOwnerWelcomeEmailHtml({
            userName,
            userEmail: createdUser.email,
            organizationName: newOrg.name,
            organizationId: newOrg.id,
            plan: newOrg.plan || 'PRO',
            seats: newOrg.seats || 1,
            temporaryPassword: userPassword, // Include password if provided
          });
          subject = `Welcome to ${newOrg.name} on EaseMail!`;
        } else if (createdUser.role === 'ADMIN') {
          html = getOrgAdminWelcomeEmailHtml({
            userName,
            userEmail: createdUser.email,
            organizationName: newOrg.name,
            organizationId: newOrg.id,
            inviterName,
            temporaryPassword: userPassword, // Include password if provided
          });
          subject = `You're Now an Admin of ${newOrg.name}`;
        } else {
          // MEMBER role
          html = getOrgMemberWelcomeEmailHtml({
            userName,
            userEmail: createdUser.email,
            organizationName: newOrg.name,
            organizationId: newOrg.id,
            inviterName,
            temporaryPassword: userPassword, // Include password for all new users
          });
          subject = `Welcome to ${newOrg.name} on EaseMail!`;
        }

        await sendEmail({
          to: createdUser.email,
          subject,
          html,
        });

        console.log(`${createdUser.role} welcome email sent to:`, createdUser.email);
      } catch (emailError) {
        console.error('Failed to send welcome email to', createdUser.email, emailError);
        // Continue with other emails even if one fails
      }
    }

    // Step 7: Send billing setup email to billing contact if provided
    if (organization.billing_email && organization.plan !== 'FREE') {
      try {
        console.log('Sending billing setup email to:', organization.billing_email);

        // Determine price per seat based on plan
        let pricePerSeat = 0;
        if (organization.plan === 'ENTERPRISE') {
          pricePerSeat = seats >= 11 ? 20 : 25;
        } else if (organization.plan === 'PRO') {
          pricePerSeat = seats >= 11 ? 20 : (seats >= 2 ? 25 : 30);
        }

        const billingContactUser = createdUsers.find(u => u.email === organization.billing_email);
        const billingContactName = billingContactUser
          ? (users.find((u: any) => u.email === organization.billing_email)?.name || organization.billing_email.split('@')[0])
          : organization.billing_email.split('@')[0];

        const billingHtml = getBillingSetupEmailHtml({
          userName: billingContactName,
          userEmail: organization.billing_email,
          organizationName: newOrg.name,
          organizationId: newOrg.id,
          plan: newOrg.plan,
          seats: newOrg.seats,
          pricePerSeat,
          billingCycle: newOrg.billing_cycle || 'monthly',
        });

        await sendEmail({
          to: organization.billing_email,
          subject: `Complete Your Billing Setup - ${newOrg.name}`,
          html: billingHtml,
        });

        console.log('Billing setup email sent to:', organization.billing_email);
      } catch (emailError) {
        console.error('Failed to send billing setup email:', emailError);
        // Don't fail the request if billing email fails
      }
    }

    console.log('Organization created:', {
      id: newOrg.id,
      name: newOrg.name,
      users: createdUsers.length,
      seats: newOrg.seats,
      mrr: newOrg.mrr,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      organization: {
        id: newOrg.id,
        name: newOrg.name,
        domain: newOrg.domain,
        plan: newOrg.plan,
        seats: newOrg.seats,
        billing_cycle: newOrg.billing_cycle,
        mrr: newOrg.mrr,
        arr: newOrg.arr,
      },
      users: createdUsers.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
      })),
      message: `Organization created successfully with ${createdUsers.length} user(s)`,
    });
  } catch (error) {
    console.error('Organization creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
