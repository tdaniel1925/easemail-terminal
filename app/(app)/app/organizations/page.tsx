import { redirect } from 'next/navigation';

/**
 * Redirect page for plural organizations URL
 * Redirects /app/organizations -> /app/organization
 */
export default function OrganizationsRedirect() {
  redirect('/app/organization');
}
