import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertTenant } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useTenants() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const tenantsQuery = useQuery({
    queryKey: [api.tenants.list.path],
    queryFn: async () => {
      const res = await fetch(api.tenants.list.path);
      if (!res.ok) throw new Error("Failed to fetch tenants");
      return api.tenants.list.responses[200].parse(await res.json());
    },
  });

  const createTenantMutation = useMutation({
    mutationFn: async (data: InsertTenant) => {
      const res = await fetch(api.tenants.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create tenant");
      return api.tenants.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tenants.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
      toast({ title: "Success", description: "Tenant registered successfully" });
    },
  });

  const deleteTenantMutation = useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tenants.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete tenant");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tenants.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
      toast({ title: "Success", description: "Tenant removed" });
    },
  });

  return { tenantsQuery, createTenantMutation, deleteTenantMutation };
}
