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

interface RecipientInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export function RecipientInput({ value, onChange, placeholder, id }: RecipientInputProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch contacts on mount
  useEffect(() => {
    fetchContacts();
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

  // Extract the current partial input after the last comma
  const getCurrentInput = (fullValue: string): string => {
    const lastComma = fullValue.lastIndexOf(',');
    if (lastComma === -1) {
      return fullValue.trim();
    }
    return fullValue.substring(lastComma + 1).trim();
  };

  // Filter contacts based on input
  useEffect(() => {
    const currentInput = getCurrentInput(value);
    setInputValue(currentInput);

    if (currentInput.length >= 2) {
      const filtered = contacts.filter((contact) => {
        const name = `${contact.givenName || ''} ${contact.surname || ''}`.trim().toLowerCase();
        const email = contact.emails?.[0]?.email?.toLowerCase() || '';
        const company = contact.companyName?.toLowerCase() || '';
        const search = currentInput.toLowerCase();

        return name.includes(search) || email.includes(search) || company.includes(search);
      }).slice(0, 10); // Limit to 10 suggestions

      setFilteredContacts(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
      setFilteredContacts([]);
    }
  }, [value, contacts]);

  const getContactName = (contact: Contact): string => {
    if (contact.givenName || contact.surname) {
      return `${contact.givenName || ''} ${contact.surname || ''}`.trim();
    }
    return contact.emails?.[0]?.email || 'Unknown';
  };

  const getContactEmail = (contact: Contact): string => {
    return contact.emails?.[0]?.email || '';
  };

  const selectContact = (contact: Contact) => {
    const email = getContactEmail(contact);
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
      setSelectedIndex((prev) => Math.min(prev + 1, filteredContacts.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredContacts.length > 0) {
      e.preventDefault();
      selectContact(filteredContacts[selectedIndex]);
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
      {showSuggestions && filteredContacts.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-64 overflow-auto"
        >
          {filteredContacts.map((contact, index) => {
            const name = getContactName(contact);
            const email = getContactEmail(contact);

            return (
              <button
                key={contact.id}
                type="button"
                className={cn(
                  'w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b last:border-b-0',
                  index === selectedIndex && 'bg-accent'
                )}
                onClick={() => selectContact(contact)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{name}</div>
                    <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {email}
                    </div>
                    {contact.companyName && (
                      <div className="text-xs text-muted-foreground">{contact.companyName}</div>
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
