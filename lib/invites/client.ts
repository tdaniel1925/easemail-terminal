/**
 * Client-side utility for handling organization invite acceptance after signup/login
 */

export async function checkAndAcceptPendingInvite(): Promise<{
  accepted: boolean;
  organizationId?: string;
  organizationName?: string;
  error?: string;
}> {
  const pendingToken = localStorage.getItem('pendingInviteToken');

  if (!pendingToken) {
    return { accepted: false };
  }

  try {
    const response = await fetch('/api/invites/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: pendingToken }),
    });

    const data = await response.json();

    if (response.ok) {
      // Clear the pending token
      localStorage.removeItem('pendingInviteToken');
      return {
        accepted: true,
        organizationId: data.organizationId,
        organizationName: data.organizationName,
      };
    } else {
      // Clear the token if it's invalid
      if (response.status === 404 || response.status === 400) {
        localStorage.removeItem('pendingInviteToken');
      }
      return { accepted: false, error: data.error };
    }
  } catch (error) {
    console.error('Error accepting pending invite:', error);
    return { accepted: false, error: 'Failed to accept invitation' };
  }
}

export function getPendingInviteToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pendingInviteToken');
}

export function clearPendingInviteToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('pendingInviteToken');
}
