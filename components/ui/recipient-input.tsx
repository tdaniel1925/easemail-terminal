'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  givenName?: string;
  surname?: string;
  emails: { email: string }[];
  companyName?: string;
}

interface RecentRecipient {
  email: string;
  name?: string;
  count: number;
}

interface Suggestion {
  type: 'contact' | 'recent';
  email: string;
  name: string;
  company?: string;
  frequency?: number;
}

interface RecipientInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export function RecipientInput({ value, onChange, placeholder, id }: RecipientInputProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [recentRecipients, setRecentRecipients] = useState<RecentRecipient[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch contacts and recent recipients on mount
  useEffect(() => {
    fetchContacts();
    fetchRecentRecipients();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      if (response.ok && data.contacts) {
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    }
  };

  const fetchRecentRecipients = async () => {
    try {
      const response = await fetch('/api/recipients/recent');
      const data = await response.json();
      if (response.ok && data.recipients) {
        setRecentRecipients(data.recipients);
      }
    } catch (error) {
      console.error('Failed to fetch recent recipients:', error);
    }
  };

  // Extract the current partial input after the last comma
  const getCurrentInput = (fullValue: string): string => {
    const lastComma = fullValue.lastIndexOf(',');
    if (lastComma === -1) {
      return fullValue.trim();
    }
    return fullValue.substring(lastComma + 1).trim();
  };

  // Filter contacts and recent recipients based on input
  useEffect(() => {
    const currentInput = getCurrentInput(value);
    setInputValue(currentInput);

    if (currentInput.length >= 2) {
      const search = currentInput.toLowerCase();
      const suggestions: Suggestion[] = [];

      // Add matching contacts
      contacts.forEach((contact) => {
        const name = `${contact.givenName || ''} ${contact.surname || ''}`.trim();
        const email = contact.emails?.[0]?.email || '';
        const company = contact.companyName || '';

        if (
          name.toLowerCase().includes(search) ||
          email.toLowerCase().includes(search) ||
          company.toLowerCase().includes(search)
        ) {
          suggestions.push({
            type: 'contact',
            email,
            name: name || email,
            company,
          });
        }
      });

      // Add matching recent recipients (excluding those already in contacts)
      const contactEmails = new Set(contacts.map(c => c.emails?.[0]?.email?.toLowerCase()).filter(Boolean));

      recentRecipients.forEach((recipient) => {
        const email = recipient.email.toLowerCase();
        const name = recipient.name || recipient.email;

        if (
          !contactEmails.has(email) &&
          (name.toLowerCase().includes(search) || email.includes(search))
        ) {
          suggestions.push({
            type: 'recent',
            email: recipient.email,
            name: name,
            frequency: recipient.count,
          });
        }
      });

      // Sort: contacts first, then by frequency
      suggestions.sort((a, b) => {
        if (a.type === 'contact' && b.type === 'recent') return -1;
        if (a.type === 'recent' && b.type === 'contact') return 1;
        if (a.type === 'recent' && b.type === 'recent') {
          return (b.frequency || 0) - (a.frequency || 0);
        }
        return 0;
      });

      const limited = suggestions.slice(0, 10);
      setFilteredSuggestions(limited);
      setShowSuggestions(limited.length > 0);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [value, contacts, recentRecipients]);

  const selectSuggestion = (suggestion: Suggestion) => {
    const email = suggestion.email;
    const lastComma = value.lastIndexOf(',');

    let newValue: string;
    if (lastComma === -1) {
      newValue = email;
    } else {
      newValue = value.substring(0, lastComma + 1) + ' ' + email;
    }

    onChange(newValue);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredSuggestions.length > 0) {
      e.preventDefault();
      selectSuggestion(filteredSuggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-64 overflow-auto"
        >
          {filteredSuggestions.map((suggestion, index) => {
            return (
              <button
                key={`${suggestion.type}-${suggestion.email}`}
                type="button"
                className={cn(
                  'w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b last:border-b-0',
                  index === selectedIndex && 'bg-accent'
                )}
                onClick={() => selectSuggestion(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {suggestion.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm flex items-center gap-2">
                      {suggestion.name}
                      {suggestion.type === 'contact' && (
                        <Badge variant="secondary" className="text-xs">Contact</Badge>
                      )}
                      {suggestion.type === 'recent' && suggestion.frequency && suggestion.frequency > 5 && (
                        <Badge variant="outline" className="text-xs">Frequent</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {suggestion.email}
                    </div>
                    {suggestion.company && (
                      <div className="text-xs text-muted-foreground">{suggestion.company}</div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
