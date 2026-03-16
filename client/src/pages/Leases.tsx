import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useLeases } from "@/hooks/use-leases";
import { useProperties } from "@/hooks/use-properties";
import { useTenants } from "@/hooks/use-tenants";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Calendar, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeaseSchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

type LeaseFormValues = z.infer<typeof insertLeaseSchema>;

export default function Leases() {
  const { leasesQuery, createLeaseMutation } = useLeases();
  const { propertiesQuery } = useProperties();
  const { tenantsQuery } = useTenants();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<LeaseFormValues>({
    resolver: zodResolver(insertLeaseSchema),
    defaultValues: {
      propertyId: 0,
      tenantId: 0,
      isActive: true,
      rentAmount: 0,
      startDate: "",
      endDate: "",
    }
  });

  const onSubmit = (data: LeaseFormValues) => {
    createLeaseMutation.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
      }
    });
  };

  // Helper to find names
  const getPropertyName = (id: number) => propertiesQuery.data?.find(p => p.id === id)?.name || "Unknown";
  const getTenantName = (id: number) => tenantsQuery.data?.find(t => t.id === id)?.name || "Unknown";

  const availableProperties = propertiesQuery.data?.filter(p => p.status === 'Available');

  return (
    <Layout>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-display text-slate-900">Lease Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20">
              <Plus className="mr-2 h-4 w-4" /> New Lease
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Lease Agreement</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="propertyId">Property</Label>
                <Select onValueChange={(val) => form.setValue("propertyId", parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProperties?.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name} (${Number(p.rentAmount)}/mo)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tenantId">Tenant</Label>
                <Select onValueChange={(val) => form.setValue("tenantId", parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenantsQuery.data?.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input type="date" id="startDate" {...form.register("startDate")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input type="date" id="endDate" {...form.register("endDate")} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rentAmount">Agreed Rent Amount</Label>
                <Input type="number" id="rentAmount" {...form.register("rentAmount", { valueAsNumber: true })} />
              </div>

              <Button type="submit" className="w-full mt-4" disabled={createLeaseMutation.isPending}>
                {createLeaseMutation.isPending ? "Creating..." : "Create Lease"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Rent Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leasesQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Loading leases...</TableCell>
              </TableRow>
            ) : leasesQuery.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No active leases</TableCell>
              </TableRow>
            ) : (
              leasesQuery.data?.map((lease) => (
                <TableRow key={lease.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium">{getPropertyName(lease.propertyId)}</TableCell>
                  <TableCell>{getTenantName(lease.tenantId)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(lease.startDate), 'MMM d, yyyy')} - {format(new Date(lease.endDate), 'MMM d, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>${Number(lease.rentAmount).toLocaleString()}/mo</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      lease.isActive 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {lease.isActive ? "Active" : "Expired"}
                    </span>
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
