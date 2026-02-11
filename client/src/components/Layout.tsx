import { Sidebar } from "./Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, isLoadingUser } = useAuth();

  useEffect(() => {
    if (!isLoadingUser && !user) {
      setLocation("/auth");
    }
  }, [user, isLoadingUser, setLocation]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        <header className="h-16 border-b bg-white flex items-center px-8 justify-between">
          <h2 className="text-xl font-semibold text-slate-800">
            {location === "/dashboard" ? "Dashboard" : 
             location.slice(1).charAt(0).toUpperCase() + location.slice(2)}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              Welcome back, <span className="font-medium text-slate-900">{user.username}</span>
            </span>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <ScrollArea className="flex-1 p-8">
          <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {children}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
