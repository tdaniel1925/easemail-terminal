'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Users, Key, CreditCard, Check, X, Plus, UserPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateOrganizationWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface UserToCreate {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  password: string;
  confirmPassword: string;
}

type WizardStep = 1 | 2 | 3 | 4;

export function CreateOrganizationWizard({ onComplete, onCancel }: CreateOrganizationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Organization Details
  const [orgDetails, setOrgDetails] = useState({
    name: '',
    domain: '',
    description: '',
  });

  // Step 2: Bulk Users
  const [users, setUsers] = useState<UserToCreate[]>([
    { id: '1', email: '', name: '', role: 'OWNER', password: '', confirmPassword: '' },
  ]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER'>('MEMBER');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserConfirmPassword, setNewUserConfirmPassword] = useState('');

  // Step 3: API Key Configuration
  const [apiKeyConfig, setApiKeyConfig] = useState({
    usesMasterKey: 'true', // 'true' or 'false'
    apiKeyName: '',
    apiKeyValue: '',
  });

  // Step 4: Billing Configuration
  const [billingConfig, setBillingConfig] = useState({
    plan: 'PRO',
    seats: 1,
    billingCycle: 'monthly',
  });

  // User management functions
  const addUser = () => {
    if (!newUserEmail.trim() || !newUserName.trim()) {
      toast.error('Email and name are required');
      return;
    }

    // Validate password
    if (!newUserPassword || newUserPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (newUserPassword !== newUserConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Check for duplicate emails
    if (users.some(u => u.email.toLowerCase() === newUserEmail.toLowerCase())) {
      toast.error('A user with this email already exists');
      return;
    }

    const newUser: UserToCreate = {
      id: Date.now().toString(),
      email: newUserEmail,
      name: newUserName,
      role: newUserRole,
      password: newUserPassword,
      confirmPassword: newUserConfirmPassword,
    };

    setUsers([...users, newUser]);
    setNewUserEmail('');
    setNewUserName('');
    setNewUserRole('MEMBER');
    setNewUserPassword('');
    setNewUserConfirmPassword('');
    toast.success('User added');
  };

  const removeUser = (id: string) => {
    if (users.length === 1) {
      toast.error('At least one user is required');
      return;
    }

    // Ensure there's at least one OWNER remaining
    const userToRemove = users.find(u => u.id === id);
    if (userToRemove?.role === 'OWNER') {
      const ownerCount = users.filter(u => u.role === 'OWNER').length;
      if (ownerCount === 1) {
        toast.error('At least one OWNER is required');
        return;
      }
    }

    setUsers(users.filter(u => u.id !== id));
  };

  const updateUserRole = (id: string, role: 'OWNER' | 'ADMIN' | 'MEMBER') => {
    setUsers(users.map(u => u.id === id ? { ...u, role } : u));
  };

  const calculateCost = () => {
    const seats = billingConfig.seats;
    let monthlyCost = 0;

    if (seats === 1) {
      monthlyCost = 30;
    } else if (seats >= 2 && seats <= 10) {
      monthlyCost = seats * 25;
    } else if (seats >= 11) {
      monthlyCost = seats * 20;
    }

    if (billingConfig.billingCycle === 'annual') {
      return { monthly: monthlyCost, annual: monthlyCost * 10, savings: monthlyCost * 2 };
    }

    return { monthly: monthlyCost, annual: monthlyCost * 12, savings: 0 };
  };

  const costs = calculateCost();

  const handleNext = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!orgDetails.name.trim()) {
        toast.error('Organization name is required');
        return;
      }
    } else if (currentStep === 2) {
      // Validate all users have email and name
      const invalidUsers = users.filter(u => !u.email.trim() || !u.name.trim());
      if (invalidUsers.length > 0) {
        toast.error('All users must have an email and name');
        return;
      }
      // Ensure at least one OWNER
      if (!users.some(u => u.role === 'OWNER')) {
        toast.error('At least one OWNER is required');
        return;
      }
      // Auto-set seats based on user count
      setBillingConfig(prev => ({ ...prev, seats: users.length }));
    } else if (currentStep === 3) {
      if (apiKeyConfig.usesMasterKey === 'false') {
        if (!apiKeyConfig.apiKeyName.trim()) {
          toast.error('API key name is required');
          return;
        }
        if (!apiKeyConfig.apiKeyValue.trim()) {
          toast.error('API key value is required');
          return;
        }
      }
    }

    setCurrentStep((prev) => (Math.min(prev + 1, 4) as WizardStep));
  };

  const handleBack = () => {
    setCurrentStep((prev) => (Math.max(prev - 1, 1) as WizardStep));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Validate all users have passwords and they match
      for (const user of users) {
        if (!user.password || user.password.length < 8) {
          toast.error(`Password for ${user.email} must be at least 8 characters`);
          setSubmitting(false);
          return;
        }
        if (user.password !== user.confirmPassword) {
          toast.error(`Passwords for ${user.email} do not match`);
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        // Organization details
        organization: {
          name: orgDetails.name,
          domain: orgDetails.domain || null,
          description: orgDetails.description || null,
          plan: billingConfig.plan,
          seats: billingConfig.seats,
          billing_cycle: billingConfig.billingCycle,
        },
        // Users (bulk) - include passwords
        users: users.map(u => ({
          email: u.email,
          name: u.name,
          role: u.role,
          password: u.password,
        })),
        // API key
        api_key: {
          uses_master_key: apiKeyConfig.usesMasterKey === 'true',
          key_name: apiKeyConfig.apiKeyName || null,
          key_value: apiKeyConfig.apiKeyValue || null,
        },
      };

      const response = await fetch('/api/admin/organizations/wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Organization created with ${users.length} user(s)!`);
        onComplete();
        // Reset form
        setCurrentStep(1);
        setOrgDetails({ name: '', domain: '', description: '' });
        setUsers([{ id: '1', email: '', name: '', role: 'OWNER', password: '', confirmPassword: '' }]);
        setApiKeyConfig({ usesMasterKey: 'true', apiKeyName: '', apiKeyValue: '' });
        setBillingConfig({ plan: 'PRO', seats: 1, billingCycle: 'monthly' });
      } else {
        toast.error(data.error || 'Failed to create organization');
      }
    } catch (error) {
      console.error('Organization creation error:', error);
      toast.error('Failed to create organization');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Organization Details', description: 'Basic information about the organization' },
    { number: 2, title: 'Add Team Members', description: 'Create multiple users at once' },
    { number: 3, title: 'API Configuration', description: 'Configure OpenAI API access' },
    { number: 4, title: 'Billing & Review', description: 'Set up subscription and review' },
  ];

  return (
    <div className="relative w-full">
      {/* Beautiful Gradient Background matching the design */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 opacity-95" style={{ borderRadius: '12px' }} />

      {/* Content Container */}
      <div className="relative z-10 p-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`
                    h-2 w-2 rounded-full transition-all duration-300
                    ${currentStep === step.number ? 'bg-white w-8' : 'bg-white/40'}
                  `}
                />
                {idx < steps.length - 1 && <div className="w-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* White Card Content */}
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-3xl mx-auto min-h-[500px] flex flex-col">
          {/* Step Title and Description */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 uppercase tracking-wider">
              <span>Step {currentStep} of {steps.length}</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-500 text-base">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {/* Step Content - Flex Grow */}
          <div className="flex-1 mb-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="orgName" className="text-sm font-medium text-gray-700">
                      Organization Name *
                    </Label>
                    <Input
                      id="orgName"
                      placeholder="Acme Corporation"
                      value={orgDetails.name}
                      onChange={(e) => setOrgDetails({ ...orgDetails, name: e.target.value })}
                      className="mt-2 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="domain" className="text-sm font-medium text-gray-700">
                      Domain (Optional)
                    </Label>
                    <Input
                      id="domain"
                      placeholder="acme.com"
                      value={orgDetails.domain}
                      onChange={(e) => setOrgDetails({ ...orgDetails, domain: e.target.value })}
                      className="mt-2 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the organization..."
                      value={orgDetails.description}
                      onChange={(e) => setOrgDetails({ ...orgDetails, description: e.target.value })}
                      rows={4}
                      className="mt-2 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                {/* User List */}
                <div className="space-y-4">
                  {users.map((user, idx) => (
                    <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700">User {idx + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUser(user.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600">Name *</Label>
                          <Input
                            placeholder="John Doe"
                            value={user.name}
                            onChange={(e) => setUsers(users.map(u => u.id === user.id ? { ...u, name: e.target.value } : u))}
                            className="h-10 border-gray-300 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Email *</Label>
                          <Input
                            type="email"
                            placeholder="john@acme.com"
                            value={user.email}
                            onChange={(e) => setUsers(users.map(u => u.id === user.id ? { ...u, email: e.target.value } : u))}
                            className="h-10 border-gray-300 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Password *</Label>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            value={user.password}
                            onChange={(e) => setUsers(users.map(u => u.id === user.id ? { ...u, password: e.target.value } : u))}
                            className="h-10 border-gray-300 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Confirm Password *</Label>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            value={user.confirmPassword}
                            onChange={(e) => setUsers(users.map(u => u.id === user.id ? { ...u, confirmPassword: e.target.value } : u))}
                            className={`h-10 border-gray-300 mt-1 ${user.password && user.confirmPassword && user.password !== user.confirmPassword ? 'border-red-500' : ''}`}
                          />
                          {user.password && user.confirmPassword && user.password !== user.confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Role *</Label>
                          <Select
                            value={user.role}
                            onValueChange={(value: 'OWNER' | 'ADMIN' | 'MEMBER') => updateUserRole(user.id, value)}
                          >
                            <SelectTrigger className="h-10 border-gray-300 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OWNER">Owner</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                              <SelectItem value="MEMBER">Member</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add User Form */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Add New User</h4>
                    <Button
                      onClick={addUser}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add User
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600">Name *</Label>
                      <Input
                        placeholder="John Doe"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="h-10 border-gray-300 mt-1"
                        onKeyPress={(e) => e.key === 'Enter' && addUser()}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Email *</Label>
                      <Input
                        type="email"
                        placeholder="john@acme.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="h-10 border-gray-300 mt-1"
                        onKeyPress={(e) => e.key === 'Enter' && addUser()}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Password *</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="h-10 border-gray-300 mt-1"
                        onKeyPress={(e) => e.key === 'Enter' && addUser()}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Confirm Password *</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={newUserConfirmPassword}
                        onChange={(e) => setNewUserConfirmPassword(e.target.value)}
                        className={`h-10 border-gray-300 mt-1 ${newUserPassword && newUserConfirmPassword && newUserPassword !== newUserConfirmPassword ? 'border-red-500' : ''}`}
                        onKeyPress={(e) => e.key === 'Enter' && addUser()}
                      />
                      {newUserPassword && newUserConfirmPassword && newUserPassword !== newUserConfirmPassword && (
                        <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Role *</Label>
                      <Select value={newUserRole} onValueChange={(value: 'OWNER' | 'ADMIN' | 'MEMBER') => setNewUserRole(value)}>
                        <SelectTrigger className="h-10 border-gray-300 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OWNER">Owner</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MEMBER">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Add multiple users at once. Press Enter or click "Add User" to add. At least one OWNER is required.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 flex items-start gap-2">
                    <Users className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>{users.length} user(s) will be created.</strong> Each user will be able to login with their email and the password you set.
                    </span>
                  </p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    API Key Source
                  </Label>
                  <Select
                    value={apiKeyConfig.usesMasterKey}
                    onValueChange={(value) => setApiKeyConfig({ ...apiKeyConfig, usesMasterKey: value })}
                  >
                    <SelectTrigger className="mt-2 h-12 text-base border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Use Master API Key (Billed)</SelectItem>
                      <SelectItem value="false">Organization Provides Own Key</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {apiKeyConfig.usesMasterKey === 'true' ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex gap-3">
                      <Key className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Master Key Selected</h4>
                        <p className="text-sm text-blue-700">
                          AI usage will be billed through your master OpenAI account. The organization can switch to their own key later from their settings.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="apiKeyName" className="text-sm font-medium text-gray-700">
                        API Key Name *
                      </Label>
                      <Input
                        id="apiKeyName"
                        placeholder="Production OpenAI Key"
                        value={apiKeyConfig.apiKeyName}
                        onChange={(e) => setApiKeyConfig({ ...apiKeyConfig, apiKeyName: e.target.value })}
                        className="mt-2 h-12 text-base border-gray-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="apiKeyValue" className="text-sm font-medium text-gray-700">
                        OpenAI API Key *
                      </Label>
                      <Input
                        id="apiKeyValue"
                        type="password"
                        placeholder="sk-..."
                        value={apiKeyConfig.apiKeyValue}
                        onChange={(e) => setApiKeyConfig({ ...apiKeyConfig, apiKeyValue: e.target.value })}
                        className="mt-2 h-12 text-base border-gray-300"
                      />
                      <p className="text-xs text-gray-500 mt-1.5">
                        The key will be encrypted and stored securely
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Plan</Label>
                    <Select
                      value={billingConfig.plan}
                      onValueChange={(value) => setBillingConfig({ ...billingConfig, plan: value })}
                    >
                      <SelectTrigger className="mt-2 h-12 text-base border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FREE">Free Plan</SelectItem>
                        <SelectItem value="PRO">Pro Plan</SelectItem>
                        <SelectItem value="BUSINESS">Business Plan</SelectItem>
                        <SelectItem value="ENTERPRISE">Enterprise Plan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {billingConfig.plan !== 'FREE' && (
                    <>
                      <div>
                        <Label htmlFor="seats" className="text-sm font-medium text-gray-700">
                          Number of Seats
                        </Label>
                        <Input
                          id="seats"
                          type="number"
                          min="1"
                          value={billingConfig.seats}
                          onChange={(e) =>
                            setBillingConfig({ ...billingConfig, seats: parseInt(e.target.value) || 1 })
                          }
                          className="mt-2 h-12 text-base border-gray-300"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1.5">
                          Automatically set to {users.length} based on users created
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">Billing Cycle</Label>
                        <Select
                          value={billingConfig.billingCycle}
                          onValueChange={(value) =>
                            setBillingConfig({ ...billingConfig, billingCycle: value })
                          }
                        >
                          <SelectTrigger className="mt-2 h-12 text-base border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="annual">Annual (Save 17%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>

                {/* Cost Summary */}
                {billingConfig.plan !== 'FREE' && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 space-y-3">
                    <h4 className="font-semibold text-gray-900 mb-3">Cost Summary</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price per seat/month:</span>
                      <span className="font-semibold text-gray-900">
                        ${billingConfig.seats === 1 ? '30.00' : billingConfig.seats >= 11 ? '20.00' : '25.00'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Number of seats:</span>
                      <span className="font-semibold text-gray-900">{billingConfig.seats}</span>
                    </div>
                    <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Monthly Total:</span>
                      <span className="text-2xl font-bold text-blue-600">${costs.monthly.toFixed(2)}/mo</span>
                    </div>
                    {billingConfig.billingCycle === 'annual' && (
                      <>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Annual savings:</span>
                          <span className="font-semibold">${costs.savings.toFixed(2)}/year</span>
                        </div>
                        <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Annual Total:</span>
                          <span className="text-2xl font-bold text-blue-600">
                            ${costs.annual.toFixed(2)}/year
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Review Summary */}
                <div className="border border-gray-200 rounded-lg p-6 space-y-3 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-3">Review & Confirm</h4>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Organization:</span>
                      <span className="font-medium text-gray-900">{orgDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Users:</span>
                      <span className="font-medium text-gray-900">{users.length} user(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">API Key:</span>
                      <Badge variant={apiKeyConfig.usesMasterKey === 'true' ? 'secondary' : 'default'} className="font-medium">
                        {apiKeyConfig.usesMasterKey === 'true' ? 'Master Key' : 'Own Key'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <Badge className="font-medium">{billingConfig.plan}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            {currentStep > 1 ? (
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={submitting}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                Back
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={onCancel}
                disabled={submitting}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                Cancel
              </Button>
            )}

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 h-11 text-base font-medium shadow-lg shadow-blue-500/30"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 h-11 text-base font-medium shadow-lg shadow-blue-500/30"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Create Organization
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
