'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sendEmail } from '@/lib/resend';
import { getWelcomeEmailHtml } from '@/lib/email-templates';

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const name = formData.get('name') as string;

  const data = {
    email,
    password: formData.get('password') as string,
    options: {
      data: {
        name,
      },
    },
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // Send welcome email (don't block signup if this fails)
  try {
    const html = getWelcomeEmailHtml({ userName: name, userEmail: email });
    await sendEmail({
      to: email,
      subject: 'Welcome to EaseMail! 🎉',
      html,
    });
    console.log('Welcome email sent to:', email);
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
    // Continue with signup even if email fails
  }

  revalidatePath('/', 'layout');
  redirect('/auth/verify');
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/', 'layout');
  redirect('/app');
}

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect(`/?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function getUser() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}
