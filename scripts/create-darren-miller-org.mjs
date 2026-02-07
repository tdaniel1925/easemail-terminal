// Script to create Darren Miller Law Firm organization
import 'dotenv/config';

const API_URL = process.env.API_URL || 'https://www.easemail.app';

const organizationData = {
  organization: {
    name: 'Darren Miller Law Firm',
    domain: 'dmillerlaw.com',
    plan: 'ENTERPRISE',
    seats: 15,
    billing_email: 'marcela@dmillerlaw.com',
    billing_cycle: 'monthly',
  },
  users: [
    {
      name: 'David Romero',
      email: 'david@dmillerlaw.com',
      password: 'p@ssword1',
      role: 'OWNER',
    },
    {
      name: 'Marcela',
      email: 'marcela@dmillerlaw.com',
      password: 'p@ssword1', // She can change this later
      role: 'ADMIN', // Admin role for billing management
    },
  ],
  api_key: {
    uses_master_key: true, // Use EaseMail's master API key
  },
};

async function createOrganization() {
  console.log('\n🏢 Creating Darren Miller Law Firm Organization');
  console.log('='.repeat(60));
  console.log('Organization:', organizationData.organization.name);
  console.log('Plan:', organizationData.organization.plan);
  console.log('Seats:', organizationData.organization.seats);
  console.log('Domain:', organizationData.organization.domain);
  console.log('Billing Contact:', organizationData.organization.billing_email);
  console.log('\nUsers:');
  organizationData.users.forEach(user => {
    console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
  });
  console.log('='.repeat(60));

  try {
    console.log('\n📤 Sending request to admin wizard API...');

    const response = await fetch(`${API_URL}/api/admin/organizations/wizard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In production, you'd need to authenticate as super admin
        // For now, this assumes you're logged in via browser session
      },
      body: JSON.stringify(organizationData),
      credentials: 'include', // Include cookies for auth
    });

    const result = await response.json();

    if (response.ok) {
      console.log('\n✅ Organization created successfully!');
      console.log('\n📋 Organization Details:');
      console.log('   ID:', result.organization.id);
      console.log('   Name:', result.organization.name);
      console.log('   Plan:', result.organization.plan);
      console.log('   Seats:', result.organization.seats);
      console.log('   MRR:', `$${result.organization.mrr}`);
      console.log('   ARR:', `$${result.organization.arr}`);

      console.log('\n👥 Users Created:');
      result.users.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
        console.log(`     User ID: ${user.id}`);
      });

      console.log('\n📧 Emails Sent:');
      console.log('   ✓ David Romero: Owner welcome email with login credentials');
      console.log('   ✓ Marcela: Admin welcome email');
      console.log('   ✓ Marcela: Billing setup email');

      console.log('\n🔐 Login Credentials:');
      console.log('   David: david@dmillerlaw.com / p@ssword1');
      console.log('   Marcela: marcela@dmillerlaw.com / p@ssword1');
      console.log('   ⚠️  Both users should change their passwords immediately');

      console.log('\n🔗 Next Steps:');
      console.log('   1. David logs in at https://easemail.app/login');
      console.log('   2. Change password at https://easemail.app/app/settings/security');
      console.log('   3. Connect email accounts at https://easemail.app/app/connect');
      console.log('   4. Marcela sets up billing at https://easemail.app/app/settings/billing');

      console.log('\n✨ Done!');

      return result;
    } else {
      console.error('\n❌ Failed to create organization');
      console.error('Status:', response.status);
      console.error('Error:', result.error);
      console.error('Details:', result.details || 'No additional details');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
createOrganization();
