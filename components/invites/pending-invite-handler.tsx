'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAndAcceptPendingInvite } from '@/lib/invites/client';
import { toast } from 'sonner';

/**
 * Client component that checks for and accepts pending organization invitations
 * after user logs in or signs up. Should be included in authenticated pages.
 */
export function PendingInviteHandler() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const handlePendingInvite = async () => {
      if (checked) return;

      try {
        const result = await checkAndAcceptPendingInvite();

        if (result.accepted && result.organizationId) {
          toast.success(`You've been added to ${result.organizationName}!`);
          // Small delay to let the user see the toast
          setTimeout(() => {
            router.push(`/app/organization/${result.organizationId}`);
          }, 1500);
        } else if (result.error) {
          console.error('Failed to accept pending invite:', result.error);
        }
      } catch (error) {
        console.error('Error handling pending invite:', error);
      } finally {
        setChecked(true);
      }
    };

    handlePendingInvite();
  }, [checked, router]);

  // This component doesn't render anything
  return null;
}
