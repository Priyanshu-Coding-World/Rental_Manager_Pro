import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { InsertLease } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useLeases() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const leasesQuery = useQuery({
    queryKey: [api.leases.list.path],
    queryFn: async () => {
      const res = await fetch(api.leases.list.path);
      if (!res.ok) throw new Error("Failed to fetch leases");
      return api.leases.list.responses[200].parse(await res.json());
    },
  });

  const createLeaseMutation = useMutation({
    mutationFn: async (data: InsertLease) => {
      const res = await fetch(api.leases.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create lease");
      return api.leases.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.leases.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.properties.list.path] }); // Properties status might change
      toast({ title: "Success", description: "Lease created successfully" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  return { leasesQuery, createLeaseMutation };
}
