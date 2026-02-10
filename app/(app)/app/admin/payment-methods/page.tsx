'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  CreditCard,
  Search,
  Loader2,
  Eye,
  Building2,
  Calendar,
  CheckCircle,
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  organization_id: string;
  organization_name: string;
  type: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export default function AdminPaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [filteredPaymentMethods, setFilteredPaymentMethods] = useState<PaymentMethod[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = paymentMethods.filter(
        (pm) =>
          pm.organization_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pm.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pm.last4.includes(searchQuery) ||
          pm.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPaymentMethods(filtered);
    } else {
      setFilteredPaymentMethods(paymentMethods);
    }
  }, [searchQuery, paymentMethods]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payment-methods');
      const data = await response.json();

      if (response.ok && data.payment_methods) {
        setPaymentMethods(data.payment_methods);
        setFilteredPaymentMethods(data.payment_methods);
      } else {
        toast.error(data.error || 'Access denied');
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const getBrandIcon = (brand: string) => {
    return <CreditCard className="h-10 w-10 text-muted-foreground" />;
  };

  const handleViewDetails = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setShowDetailsModal(true);
  };

  const isExpiringSoon = (pm: PaymentMethod) => {
    const now = new Date();
    const expDate = new Date(pm.exp_year, pm.exp_month - 1);
    const monthsUntilExpiry = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsUntilExpiry <= 2 && monthsUntilExpiry > 0;
  };

  const isExpired = (pm: PaymentMethod) => {
    const now = new Date();
    const expDate = new Date(pm.exp_year, pm.exp_month - 1);
    return expDate < now;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentMethods.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentMethods.filter((pm) => pm.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {paymentMethods.filter((pm) => isExpiringSoon(pm)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {paymentMethods.filter((pm) => isExpired(pm)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payment methods by organization, brand, or last 4 digits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods ({filteredPaymentMethods.length})</CardTitle>
          <CardDescription>All system payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPaymentMethods.map((pm) => (
              <div
                key={pm.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {getBrandIcon(pm.brand)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">
                        {pm.brand} •••• {pm.last4}
                      </div>
                      {pm.is_default && (
                        <Badge className="bg-blue-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                      {isExpired(pm) && (
                        <Badge className="bg-red-500">Expired</Badge>
                      )}
                      {!isExpired(pm) && isExpiringSoon(pm) && (
                        <Badge className="bg-yellow-500">Expiring Soon</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Building2 className="h-3 w-3" />
                      {pm.organization_name}
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Exp: {pm.exp_month.toString().padStart(2, '0')}/{pm.exp_year}
                      </div>
                      <div className="capitalize">{pm.type}</div>
                      <div>Added: {new Date(pm.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    title="View details"
                    onClick={() => handleViewDetails(pm)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredPaymentMethods.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No payment methods found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Details Modal */}
      {selectedPaymentMethod && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Payment Method Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {getBrandIcon(selectedPaymentMethod.brand)}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg">
                    {selectedPaymentMethod.brand} •••• {selectedPaymentMethod.last4}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedPaymentMethod.type}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Organization</div>
                  <div className="font-medium">{selectedPaymentMethod.organization_name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Expiry</div>
                  <div className="font-medium">
                    {String(selectedPaymentMethod.exp_month).padStart(2, '0')}/{selectedPaymentMethod.exp_year}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div>
                    {selectedPaymentMethod.is_active ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Default</div>
                  <div>
                    {selectedPaymentMethod.is_default ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-muted-foreground">Added On</div>
                  <div className="font-medium">{new Date(selectedPaymentMethod.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
