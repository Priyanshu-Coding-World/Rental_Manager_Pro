import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useProperties } from "@/hooks/use-properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Home, Building, Building2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPropertySchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type PropertyFormValues = z.infer<typeof insertPropertySchema>;

export default function Properties() {
  const { propertiesQuery, createPropertyMutation, deletePropertyMutation } = useProperties();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(insertPropertySchema),
    defaultValues: {
      name: "",
      type: "Apartment",
      location: "",
      rentAmount: 0,
      status: "Available",
      description: "",
    }
  });

  const onSubmit = (data: PropertyFormValues) => {
    createPropertyMutation.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
      }
    });
  };

  const filteredProperties = propertiesQuery.data?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search properties..." 
            className="pl-9 bg-white" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20">
              <Plus className="mr-2 h-4 w-4" /> Add Property
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Property</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Property Name</Label>
                <Input id="name" {...form.register("name")} placeholder="e.g. Sunset Apartments 4B" />
                {form.formState.errors.name && <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select onValueChange={(val) => form.setValue("type", val)} defaultValue="Apartment">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rentAmount">Rent Amount</Label>
                  <Input 
                    type="number" 
                    id="rentAmount" 
                    {...form.register("rentAmount", { valueAsNumber: true })} 
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...form.register("location")} placeholder="e.g. 123 Main St, New York" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(val) => form.setValue("status", val)} defaultValue="Available">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Occupied">Occupied</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" {...form.register("description")} />
              </div>

              <Button type="submit" className="w-full mt-4" disabled={createPropertyMutation.isPending}>
                {createPropertyMutation.isPending ? "Creating..." : "Create Property"}
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
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Rent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {propertiesQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading properties...</TableCell>
              </TableRow>
            ) : filteredProperties?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No properties found</TableCell>
              </TableRow>
            ) : (
              filteredProperties?.map((property) => (
                <TableRow key={property.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-900">{property.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {property.type === 'Apartment' && <Building2 className="h-4 w-4 text-slate-400" />}
                      {property.type === 'House' && <Home className="h-4 w-4 text-slate-400" />}
                      {property.type === 'Commercial' && <Building className="h-4 w-4 text-slate-400" />}
                      {property.type}
                    </div>
                  </TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell>${Number(property.rentAmount).toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      property.status === 'Available' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : property.status === 'Occupied'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {property.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => {
                        if (confirm('Are you sure? This cannot be undone.')) {
                          deletePropertyMutation.mutate(property.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
