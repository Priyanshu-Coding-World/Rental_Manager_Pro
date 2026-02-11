import { Link, useLocation } from "wouter";
import { LayoutDashboard, Building2, Users, FileSignature, Receipt, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/tenants", label: "Tenants", icon: Users },
  { href: "/leases", label: "Leases", icon: FileSignature },
  { href: "/payments", label: "Payments", icon: Receipt },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  return (
    <div className="flex flex-col h-full w-64 bg-slate-900 text-slate-100 p-4 border-r border-slate-800">
      <div className="flex items-center gap-3 px-2 py-6 mb-4">
        <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-bold font-display tracking-tight text-white">
          RentFlow
        </h1>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-medium" 
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}>
              <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 mt-auto border-t border-slate-800">
        <button 
          onClick={() => logoutMutation.mutate()}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
