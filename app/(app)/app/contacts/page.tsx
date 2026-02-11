'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserCircle, Search, Plus, Mail, Phone, Building, MoreVertical, RefreshCw, Loader2, Edit, Trash2, MessageSquare, X, AlertTriangle, Globe, Linkedin } from 'lucide-react';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';
import { useRouter } from 'next/navigation';
import { formatPhoneNumber, toTitleCase, toSentenceCase, isValidEmail, isValidPhone } from '@/lib/utils/contact-formatting';

export default function ContactsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [proceedWithoutContact, setProceedWithoutContact] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    givenName: '',
    surname: '',
    email: '',
    phone: '',
    companyName: '',
    notes: '',
    website: '',
    linkedIn: '',
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async (bustCache = false) => {
    try {
      setLoading(true);
      // Add cache-busting parameter to force fresh data after mutations
      const url = bustCache ? `/api/contacts?t=${Date.now()}` : '/api/contacts';
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.contacts) {
        setContacts(data.contacts);
      } else {
        console.error('Fetch contacts error:', data);
        toast.error(data.error || 'Failed to load contacts');
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = () => {
    setFormData({
      givenName: '',
      surname: '',
      email: '',
      phone: '',
      companyName: '',
      notes: '',
      website: '',
      linkedIn: '',
    });
    setShowWarning(false);
    setProceedWithoutContact(false);
    setShowAddDialog(true);
  };

  const handleEditContact = (contact: any) => {
    setSelectedContact(contact);
    setFormData({
      givenName: contact.givenName || '',
      surname: contact.surname || '',
      email: contact.emails?.[0]?.email || '',
      phone: contact.phoneNumbers?.[0]?.number || '',
      companyName: contact.companyName || '',
      notes: contact.notes || '',
      website: contact.webPages?.[0]?.url || '',
      linkedIn: contact.imAddresses?.[0]?.address || '',
    });
    setShowWarning(false);
    setProceedWithoutContact(false);
    setShowEditDialog(true);
  };

  const handleDeleteContact = (contact: any) => {
    setSelectedContact(contact);
    setShowDeleteDialog(true);
  };

  const handleViewContact = (contact: any) => {
    setSelectedContact(contact);
    setShowDetailDialog(true);
  };

  const handleSubmitAdd = async () => {
    // Check if user has provided either email or phone
    const hasEmail = formData.email && formData.email.trim();
    const hasPhone = formData.phone && formData.phone.trim();

    // Show warning if no contact method and user hasn't confirmed
    if (!hasEmail && !hasPhone && !proceedWithoutContact) {
      setShowWarning(true);
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          givenName: toTitleCase(formData.givenName),
          surname: toTitleCase(formData.surname),
          emails: formData.email ? [formData.email] : [],
          phoneNumbers: formData.phone ? [formatPhoneNumber(formData.phone)] : [],
          companyName: toTitleCase(formData.companyName),
          notes: toSentenceCase(formData.notes),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Contact added successfully');
        setShowAddDialog(false);
        setShowWarning(false);
        setProceedWithoutContact(false);
        // Bust cache to show new contact immediately
        fetchContacts(true);
      } else {
        console.error('Add contact API error:', data);
        toast.error(data.error || 'Failed to add contact');
      }
    } catch (error) {
      console.error('Add contact error:', error);
      toast.error('Failed to add contact');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedContact) return;

    // Check if user has provided either email or phone
    const hasEmail = formData.email && formData.email.trim();
    const hasPhone = formData.phone && formData.phone.trim();

    // Show warning if no contact method and user hasn't confirmed
    if (!hasEmail && !hasPhone && !proceedWithoutContact) {
      setShowWarning(true);
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/contacts/${selectedContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          givenName: toTitleCase(formData.givenName),
          surname: toTitleCase(formData.surname),
          emails: formData.email ? [formData.email] : [],
          phoneNumbers: formData.phone ? [formatPhoneNumber(formData.phone)] : [],
          companyName: toTitleCase(formData.companyName),
          notes: toSentenceCase(formData.notes),
          webPages: formData.website ? [{ url: formData.website }] : [],
          imAddresses: formData.linkedIn ? [{ address: formData.linkedIn }] : [],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Contact updated successfully');
        setShowEditDialog(false);
        setShowWarning(false);
        setProceedWithoutContact(false);
        // Bust cache to show updated contact immediately
        fetchContacts(true);
      } else {
        console.error('Update contact API error:', data);
        toast.error(data.error || 'Failed to update contact');
      }
    } catch (error) {
      console.error('Update contact error:', error);
      toast.error('Failed to update contact');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedContact) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/contacts/${selectedContact.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Contact deleted successfully');
        setShowDeleteDialog(false);
        // Bust cache to remove deleted contact immediately
        fetchContacts(true);
      } else {
        const data = await response.json();
        console.error('Delete contact API error:', data);
        toast.error(data.error || 'Failed to delete contact');
      }
    } catch (error) {
      console.error('Delete contact error:', error);
      toast.error('Failed to delete contact');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailContact = (email: string) => {
    // Navigate to inbox with compose mode and pre-fill email
    router.push(`/app/inbox?compose=true&to=${encodeURIComponent(email)}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getContactName = (contact: any) => {
    if (contact.givenName || contact.surname) {
      return `${contact.givenName || ''} ${contact.surname || ''}`.trim();
    }
    return contact.emails?.[0]?.email || 'Unknown';
  };

  const getContactEmail = (contact: any) => {
    return contact.emails?.[0]?.email || '';
  };

  const getContactPhone = (contact: any) => {
    return contact.phoneNumbers?.[0]?.number || '';
  };

  const filteredContacts = contacts.filter(contact => {
    const name = getContactName(contact).toLowerCase();
    const email = getContactEmail(contact).toLowerCase();
    const company = (contact.companyName || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query) || company.includes(query);
  });

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="mb-4">
          <BackButton href="/app/inbox" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Contacts</h1>
            <p className="text-muted-foreground mt-1">Manage your contacts and connections ({contacts.length})</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchContacts(true)} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleAddContact}>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Contacts Grid */}
      <ScrollArea className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map((contact) => {
                const name = getContactName(contact);
                const email = getContactEmail(contact);
                const phone = getContactPhone(contact);

                return (
                  <Card
                    key={contact.id}
                    className="hover:shadow-lg transition-all duration-200 hover:border-primary/50 cursor-pointer"
                    onClick={() => handleViewContact(contact)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 ring-2 ring-border">
                            <AvatarImage src={contact.pictureUrl || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-primary-foreground text-base font-bold">
                              {getInitials(name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg font-bold">{name}</CardTitle>
                            </div>
                            {contact.companyName && (
                              <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                                <Building className="h-3 w-3" />
                                {contact.companyName}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => email && handleEmailContact(email)}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditContact(contact)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Contact
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteContact(contact)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-primary" />
                          <a href={`mailto:${email}`} className="text-primary hover:underline truncate font-medium">
                            {email}
                          </a>
                        </div>
                      )}
                      {phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-primary" />
                          <a href={`tel:${phone}`} className="hover:underline font-medium">
                            {phone}
                          </a>
                        </div>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            email && handleEmailContact(email);
                          }}
                          disabled={!email}
                        >
                          <Mail className="mr-1 h-3 w-3" />
                          Email
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditContact(contact);
                          }}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredContacts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-96 text-center p-12">
                <UserCircle className="h-24 w-24 text-muted-foreground mb-6 opacity-50" />
                <h3 className="font-bold text-2xl mb-3">No contacts found</h3>
                <p className="text-base text-muted-foreground mb-6 max-w-md">
                  {searchQuery
                    ? 'Try a different search term'
                    : contacts.length === 0
                      ? 'Contacts are synced from your email account. You can also add contacts manually.'
                      : 'Get started by adding your first contact'
                  }
                </p>
                {!searchQuery && (
                  <Button size="lg" onClick={handleAddContact}>
                    <Plus className="mr-2 h-5 w-5" />
                    Add Contact
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </ScrollArea>

      {/* Add Contact Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>
              Add a new contact to your address book
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="givenName">First Name</Label>
                <Input
                  id="givenName"
                  value={formData.givenName}
                  onChange={(e) => setFormData({ ...formData, givenName: e.target.value })}
                  onBlur={(e) => setFormData({ ...formData, givenName: toTitleCase(e.target.value) })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Last Name</Label>
                <Input
                  id="surname"
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  onBlur={(e) => setFormData({ ...formData, surname: toTitleCase(e.target.value) })}
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onBlur={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                placeholder="1-555-123-4567"
              />
            </div>

            {/* Professional Information */}
            <div className="space-y-2">
              <Label htmlFor="companyName">Company</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                onBlur={(e) => setFormData({ ...formData, companyName: toTitleCase(e.target.value) })}
                placeholder="Acme Inc."
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                onBlur={(e) => setFormData({ ...formData, notes: toSentenceCase(e.target.value) })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>

          {/* Inline Warning - appears just above buttons */}
          {showWarning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-yellow-900">No email or phone number</p>
                <p className="text-xs text-yellow-700 mt-0.5">
                  Add at least one contact method or click "Save Anyway" to proceed.
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 mt-2 text-xs text-yellow-800 hover:text-yellow-900 hover:bg-yellow-100"
                  onClick={() => {
                    setShowWarning(false);
                    setProceedWithoutContact(true);
                    handleSubmitAdd();
                  }}
                >
                  Save Anyway
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAdd} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update contact information
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-givenName">First Name</Label>
                <Input
                  id="edit-givenName"
                  value={formData.givenName}
                  onChange={(e) => setFormData({ ...formData, givenName: e.target.value })}
                  onBlur={(e) => setFormData({ ...formData, givenName: toTitleCase(e.target.value) })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-surname">Last Name</Label>
                <Input
                  id="edit-surname"
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  onBlur={(e) => setFormData({ ...formData, surname: toTitleCase(e.target.value) })}
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onBlur={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                placeholder="1-555-123-4567"
              />
            </div>

            {/* Professional Information */}
            <div className="space-y-2">
              <Label htmlFor="edit-companyName">Company</Label>
              <Input
                id="edit-companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                onBlur={(e) => setFormData({ ...formData, companyName: toTitleCase(e.target.value) })}
                placeholder="Acme Inc."
              />
            </div>

            {/* Online Presence */}
            <div className="space-y-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-linkedIn">LinkedIn</Label>
              <Input
                id="edit-linkedIn"
                value={formData.linkedIn}
                onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                placeholder="linkedin.com/in/username or just username"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                onBlur={(e) => setFormData({ ...formData, notes: toSentenceCase(e.target.value) })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>

          {/* Inline Warning - appears just above buttons */}
          {showWarning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-yellow-900">No email or phone number</p>
                <p className="text-xs text-yellow-700 mt-0.5">
                  Add at least one contact method or click "Save Anyway" to proceed.
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 mt-2 text-xs text-yellow-800 hover:text-yellow-900 hover:bg-yellow-100"
                  onClick={() => {
                    setShowWarning(false);
                    setProceedWithoutContact(true);
                    handleSubmitEdit();
                  }}
                >
                  Save Anyway
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Contact
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Contact
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedContact ? getContactName(selectedContact) : 'this contact'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Contact
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Detail View Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Contact Details</DialogTitle>
            <DialogDescription>
              View complete contact information
            </DialogDescription>
          </DialogHeader>

          {selectedContact && (
            <div className="space-y-6 py-4">
              {/* Profile Section */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="h-20 w-20 ring-2 ring-border">
                  <AvatarImage src={selectedContact.pictureUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-primary-foreground text-xl font-bold">
                    {getInitials(getContactName(selectedContact))}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{getContactName(selectedContact)}</h3>
                  {selectedContact.companyName && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <Building className="h-4 w-4" />
                      {selectedContact.companyName}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                {getContactEmail(selectedContact) && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                      <a
                        href={`mailto:${getContactEmail(selectedContact)}`}
                        className="text-primary hover:underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {getContactEmail(selectedContact)}
                      </a>
                    </div>
                  </div>
                )}

                {getContactPhone(selectedContact) && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Phone</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                      <a
                        href={`tel:${getContactPhone(selectedContact)}`}
                        className="hover:underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {getContactPhone(selectedContact)}
                      </a>
                    </div>
                  </div>
                )}

                {selectedContact.webPages && selectedContact.webPages.length > 0 && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Website</Label>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                      <a
                        href={selectedContact.webPages[0].url || selectedContact.webPages[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {selectedContact.webPages[0].url || selectedContact.webPages[0]}
                      </a>
                    </div>
                  </div>
                )}

                {selectedContact.imAddresses && selectedContact.imAddresses.length > 0 && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">LinkedIn</Label>
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-primary flex-shrink-0" />
                      <a
                        href={selectedContact.imAddresses[0].address || selectedContact.imAddresses[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {selectedContact.imAddresses[0].address || selectedContact.imAddresses[0]}
                      </a>
                    </div>
                  </div>
                )}

                {selectedContact.notes && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Notes</Label>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm whitespace-pre-wrap">{selectedContact.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    const email = getContactEmail(selectedContact);
                    if (email) {
                      handleEmailContact(email);
                      setShowDetailDialog(false);
                    }
                  }}
                  disabled={!getContactEmail(selectedContact)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetailDialog(false);
                    handleEditContact(selectedContact);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Contact
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
