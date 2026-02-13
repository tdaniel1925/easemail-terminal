'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountEmail: string;
  onConfirm: () => void | Promise<void>;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  accountEmail,
  onConfirm,
}: DeleteAccountDialogProps) {
  const [emailInput, setEmailInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    console.log('Delete confirm clicked');
    if (emailInput !== accountEmail) {
      console.log('Email input does not match:', emailInput, 'vs', accountEmail);
      return;
    }

    console.log('Starting deletion...');
    setIsDeleting(true);
    try {
      await onConfirm();
      console.log('Deletion completed');
    } catch (error) {
      console.error('Error during deletion:', error);
    } finally {
      setIsDeleting(false);
      setEmailInput('');
    }
  };

  const handleCancel = () => {
    console.log('Delete cancelled');
    setEmailInput('');
    onOpenChange(false);
  };

  const isValid = emailInput === accountEmail;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-xl">Delete Email Account</DialogTitle>
          </div>
          <DialogDescription className="text-base space-y-3 pt-2">
            <p className="font-semibold text-foreground">
              You are about to delete <span className="text-destructive">{accountEmail}</span>
            </p>
            <p>This action will permanently delete:</p>
            <ul className="list-disc list-inside space-y-1 text-sm pl-2">
              <li>All emails synced from this account</li>
              <li>Draft emails created from this account</li>
              <li>Scheduled emails from this account</li>
              <li>Snoozed emails from this account</li>
              <li>Account-specific settings and preferences</li>
            </ul>
            <p className="text-sm text-muted-foreground italic">
              Note: Emails will be removed from the app only. Your original emails in {accountEmail} will not be affected.
            </p>
            <p className="font-semibold text-foreground pt-2">
              This action cannot be undone.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="email-confirm" className="text-sm font-medium">
            Type <span className="font-mono text-destructive">{accountEmail}</span> to confirm
          </Label>
          <Input
            id="email-confirm"
            type="email"
            placeholder="Enter email address"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isValid && !isDeleting) {
                handleConfirm();
              }
            }}
            className="mt-2"
            autoComplete="off"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid || isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
