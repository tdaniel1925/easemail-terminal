'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  FileText,
  Search,
  Loader2,
  Download,
  Eye,
  DollarSign,
  Calendar,
  Building2,
} from 'lucide-react';

interface Invoice {
  id: string;
  organization_id: string;
  organization_name: string;
  amount: number;
  status: string;
  invoice_number: string;
  billing_period_start: string;
  billing_period_end: string;
  created_at: string;
  paid_at: string | null;
  due_date: string;
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = invoices.filter(
        (invoice) =>
          invoice.organization_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredInvoices(filtered);
    } else {
      setFilteredInvoices(invoices);
    }
  }, [searchQuery, invoices]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/invoices');
      const data = await response.json();

      if (response.ok && data.invoices) {
        setInvoices(data.invoices);
        setFilteredInvoices(data.invoices);
      } else {
        toast.error(data.error || 'Access denied');
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const handleDownload = (invoice: Invoice) => {
    // Generate simple text invoice
    const invoiceText = `
INVOICE

Invoice Number: ${invoice.invoice_number}
Organization: ${invoice.organization_name}
Amount: $${invoice.amount.toFixed(2)}
Status: ${invoice.status}

Billing Period:
From: ${new Date(invoice.billing_period_start).toLocaleDateString()}
To: ${new Date(invoice.billing_period_end).toLocaleDateString()}

Due Date: ${new Date(invoice.due_date).toLocaleDateString()}
${invoice.paid_at ? `Paid On: ${new Date(invoice.paid_at).toLocaleDateString()}` : ''}

Created: ${new Date(invoice.created_at).toLocaleDateString()}
    `.trim();

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.invoice_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Invoice downloaded');
  };

  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingRevenue = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0);

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
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter((inv) => inv.status === 'paid').length}
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
              placeholder="Search invoices by organization, invoice number, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
          <CardDescription>All system invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{invoice.invoice_number}</div>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Building2 className="h-3 w-3" />
                      {invoice.organization_name}
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </div>
                      {invoice.paid_at && (
                        <div>
                          Paid: {new Date(invoice.paid_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-bold">
                      <DollarSign className="h-4 w-4" />
                      {invoice.amount.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    title="View details"
                    onClick={() => handleViewDetails(invoice)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    title="Download"
                    onClick={() => handleDownload(invoice)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredInvoices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No invoices found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Invoice Number</div>
                  <div className="font-medium">{selectedInvoice.invoice_number}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div>{getStatusBadge(selectedInvoice.status)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Organization</div>
                  <div className="font-medium">{selectedInvoice.organization_name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="font-bold text-lg">${selectedInvoice.amount.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Billing Period</div>
                  <div className="font-medium">
                    {new Date(selectedInvoice.billing_period_start).toLocaleDateString()} - {new Date(selectedInvoice.billing_period_end).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Due Date</div>
                  <div className="font-medium">{new Date(selectedInvoice.due_date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Created</div>
                  <div className="font-medium">{new Date(selectedInvoice.created_at).toLocaleDateString()}</div>
                </div>
                {selectedInvoice.paid_at && (
                  <div>
                    <div className="text-sm text-muted-foreground">Paid On</div>
                    <div className="font-medium text-green-600">{new Date(selectedInvoice.paid_at).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
                <Button onClick={() => handleDownload(selectedInvoice)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
