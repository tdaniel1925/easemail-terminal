'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserCircle, Search, Plus, Mail, Phone, Building, Tag, Star, MoreVertical, RefreshCw, Loader2, Edit, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contacts');
      const data = await response.json();

      if (data.contacts) {
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
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
            <Button variant="outline" onClick={fetchContacts} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
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
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contacts
                .filter(contact => {
                  const name = getContactName(contact).toLowerCase();
                  const email = getContactEmail(contact).toLowerCase();
                  const company = (contact.companyName || '').toLowerCase();
                  const query = searchQuery.toLowerCase();
                  return name.includes(query) || email.includes(query) || company.includes(query);
                })
                .map((contact) => {
                  const name = getContactName(contact);
                  const email = getContactEmail(contact);
                  const phone = getContactPhone(contact);

                  return (
                    <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={contact.pictureUrl || undefined} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">{name}</CardTitle>
                              </div>
                              {contact.companyName && (
                                <CardDescription className="flex items-center gap-1 mt-1">
                                  <Building className="h-3 w-3" />
                                  {contact.companyName}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Contact
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
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
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${email}`} className="text-primary hover:underline truncate">
                              {email}
                            </a>
                          </div>
                        )}
                        {phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${phone}`} className="hover:underline">
                              {phone}
                            </a>
                          </div>
                        )}
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Mail className="mr-2 h-3 w-3" />
                            Email
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>

            {/* Empty State */}
            {contacts.filter(contact => {
              const name = getContactName(contact).toLowerCase();
              const email = getContactEmail(contact).toLowerCase();
              const company = (contact.companyName || '').toLowerCase();
              const query = searchQuery.toLowerCase();
              return name.includes(query) || email.includes(query) || company.includes(query);
            }).length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <UserCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No contacts found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery ? 'Try a different search term' : contacts.length === 0 ? 'No contacts synced from your email account yet' : 'Get started by adding your first contact'}
                </p>
                {!searchQuery && (
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Contact
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </ScrollArea>
    </div>
  );
}
