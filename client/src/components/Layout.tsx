import { Link, useLocation } from "wouter";
import { Zap, Globe, Folder, Layers, FileText, Settings, User, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Globe },
    { path: "/projects", label: "Projects", icon: Folder },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/templates", label: "Templates", icon: Layers },
    { path: "/logs", label: "Logs", icon: FileText },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-shodan-bg">
      {/* Sidebar */}
      <nav className="w-64 bg-shodan-surface border-r border-shodan-surface/50 fixed h-full z-10">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-shodan-accent to-shodan-accent2 rounded-lg flex items-center justify-center neon-glow">
              <Zap className="w-6 h-6 text-shodan-bg" />
            </div>
            <h1 className="text-2xl font-bold text-shodan-text">Clippr</h1>
          </div>
          
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <li key={item.path}>
                  <Link href={item.path}>
                    <span className={cn(
                      "sidebar-item flex items-center space-x-3 p-3 rounded-lg text-shodan-text/60 hover:text-shodan-text cursor-pointer",
                      isActive && "active text-shodan-text bg-shodan-accent/10"
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
              <div className="w-10 h-10 bg-gradient-to-br from-shodan-success to-shodan-accent2 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-shodan-bg" />
              </div>
              <div>
                <div className="font-medium text-shodan-text">Demo User</div>
                <div className="text-sm text-shodan-text/60">Free Plan</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 bg-shodan-bg">
        {children}
      </main>
    </div>
  );
}
