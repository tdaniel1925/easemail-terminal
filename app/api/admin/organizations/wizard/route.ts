import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/resend';
import { getWelcomeEmailHtml } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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
      .single();

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
        // Create new user via Supabase Auth
        const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
          email: userToCreate.email,
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

        // Create user record in public.users table
        const { error: userInsertError } = await supabase
          .from('users')
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

    // Step 2: Create organization
    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: organization.name,
        domain: organization.domain || null,
        description: organization.description || null,
        plan: organization.plan || 'PRO',
        seats: seats,
        billing_cycle: billingCycle,
        next_billing_date: nextBillingDate.toISOString().split('T')[0],
        mrr: mrr,
        arr: arr,
        uses_master_api_key: api_key?.uses_master_key !== false,
        created_by: user.id,
      })
      .select()
      .single();

    if (orgError) {
      console.error('Error creating organization:', orgError);
      return NextResponse.json(
        { error: 'Failed to create organization' },
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

    const { error: memberError } = await supabase
      .from('organization_members')
      .insert(memberInserts);

    if (memberError) {
      console.error('Error adding users to organization:', memberError);
      // Organization was created, but member assignment failed
      // In production, you'd want to rollback or handle this
    }

    // Step 4: Handle API key setup
    if (!api_key?.uses_master_key && api_key?.key_value) {
      // Organization is providing their own API key
      const { data: apiKeyRecord, error: apiKeyError } = await supabase
        .from('api_keys')
        .insert({
          organization_id: newOrg.id,
          key_name: api_key.key_name || 'Primary OpenAI Key',
          key_value: api_key.key_value, // TODO: Encrypt this in production
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (apiKeyError) {
        console.error('Error creating API key:', apiKeyError);
      } else {
        // Update organization to reference this API key
        await supabase
          .from('organizations')
          .update({
            api_key_id: apiKeyRecord.id,
            uses_master_api_key: false,
          })
          .eq('id', newOrg.id);
      }
    }

    // Step 5: Create initial billing history record
    const { error: historyError } = await supabase
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

    // Step 6: Send welcome emails to all users
    console.log('Sending welcome emails to:', createdUsers.map(u => u.email).join(', '));

    for (const createdUser of createdUsers) {
      try {
        const html = getWelcomeEmailHtml({
          userName: createdUser.email.split('@')[0], // Use email prefix as fallback name
          userEmail: createdUser.email,
        });

        await sendEmail({
          to: createdUser.email,
          subject: 'Welcome to EaseMail! 🎉',
          html,
        });

        console.log('Welcome email sent to:', createdUser.email);
      } catch (emailError) {
        console.error('Failed to send welcome email to', createdUser.email, emailError);
        // Continue with other emails even if one fails
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
