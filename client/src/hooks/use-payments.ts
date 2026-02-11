import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertPayment } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function usePayments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const paymentsQuery = useQuery({
    queryKey: [api.payments.list.path],
    queryFn: async () => {
      const res = await fetch(api.payments.list.path);
      if (!res.ok) throw new Error("Failed to fetch payments");
      return api.payments.list.responses[200].parse(await res.json());
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: InsertPayment) => {
      const res = await fetch(api.payments.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to record payment");
      return api.payments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.payments.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
      toast({ title: "Success", description: "Payment recorded successfully" });
    },
  });

  return { paymentsQuery, createPaymentMutation };
}
