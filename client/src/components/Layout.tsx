import { Link, useLocation } from "wouter";
import { Zap, Globe, Folder, Layers, FileText, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Globe },
    { path: "/projects", label: "Projects", icon: Folder },
    { path: "/templates", label: "Templates", icon: Layers },
    { path: "/logs", label: "Logs", icon: FileText },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[hsl(222,47%,11%)]">
      {/* Sidebar */}
      <nav className="w-64 bg-[hsl(217,33%,17%)] border-r border-[hsl(215,25%,27%)] fixed h-full z-10">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[hsl(188,95%,43%)] to-[hsl(185,82%,70%)] rounded-lg flex items-center justify-center neon-glow">
              <Zap className="w-6 h-6 text-[hsl(222,47%,11%)]" />
            </div>
            <h1 className="text-2xl font-bold text-white">Clippr</h1>
          </div>
          
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <li key={item.path}>
                  <Link href={item.path}>
                    <span className={cn(
                      "sidebar-item flex items-center space-x-3 p-3 rounded-lg text-[hsl(215,20%,65%)] hover:text-white cursor-pointer",
                      isActive && "active text-white"
                    )}>
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="absolute bottom-6 left-6 right-6">
          <div className="glassmorphism rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-white">Demo User</div>
                <div className="text-sm text-[hsl(215,20%,65%)]">Free Plan</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
