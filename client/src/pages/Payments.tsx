import { useState } from "react";
import { Layout } from "@/components/Layout";
import { usePayments } from "@/hooks/use-payments";
import { useLeases } from "@/hooks/use-leases";
import { useProperties } from "@/hooks/use-properties";
import { useTenants } from "@/hooks/use-tenants";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPaymentSchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

type PaymentFormValues = z.infer<typeof insertPaymentSchema>;

export default function Payments() {
  const { paymentsQuery, createPaymentMutation } = usePayments();
  const { leasesQuery } = useLeases();
  const { propertiesQuery } = useProperties();
  const { tenantsQuery } = useTenants();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(insertPaymentSchema),
    defaultValues: {
      leaseId: 0,
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      status: "Pending",
    }
  });

  const onSubmit = (data: PaymentFormValues) => {
    createPaymentMutation.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
      }
    });
  };

  // Helper to format lease display
  const getLeaseDisplay = (leaseId: number) => {
    const lease = leasesQuery.data?.find(l => l.id === leaseId);
    if (!lease) return "Unknown Lease";
    
    const prop = propertiesQuery.data?.find(p => p.id === lease.propertyId);
    const tenant = tenantsQuery.data?.find(t => t.id === lease.tenantId);
    
    return `${prop?.name} - ${tenant?.name}`;
  };

  return (
    <Layout>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-display text-slate-900">Payments</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20">
              <Plus className="mr-2 h-4 w-4" /> Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="leaseId">Lease Agreement</Label>
                <Select onValueChange={(val) => form.setValue("leaseId", parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lease" />
                  </SelectTrigger>
                  <SelectContent>
                    {leasesQuery.data?.filter(l => l.isActive).map((l) => (
                      <SelectItem key={l.id} value={l.id.toString()}>
                        {getLeaseDisplay(l.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input type="number" id="amount" {...form.register("amount", { valueAsNumber: true })} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paymentDate">Date</Label>
                <Input type="date" id="paymentDate" {...form.register("paymentDate")} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(val) => form.setValue("status", val)} defaultValue="Pending">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full mt-4" disabled={createPaymentMutation.isPending}>
                {createPaymentMutation.isPending ? "Recording..." : "Record Payment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Lease</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentsQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">Loading payments...</TableCell>
              </TableRow>
            ) : paymentsQuery.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No payments recorded</TableCell>
              </TableRow>
            ) : (
              paymentsQuery.data?.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-slate-50/50">
                  <TableCell className="text-slate-500 font-medium">
                    {format(new Date(payment.paymentDate), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{getLeaseDisplay(payment.leaseId)}</TableCell>
                  <TableCell className="font-semibold">${Number(payment.amount).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {payment.status === 'Paid' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {payment.status === 'Pending' && <Clock className="h-4 w-4 text-amber-500" />}
                      {payment.status === 'Overdue' && <AlertCircle className="h-4 w-4 text-red-500" />}
                      <span className={
                        payment.status === 'Paid' ? 'text-green-700' : 
                        payment.status === 'Pending' ? 'text-amber-700' : 'text-red-700'
                      }>
                        {payment.status}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
