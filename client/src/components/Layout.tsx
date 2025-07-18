import { Link, useLocation } from "wouter";
import { Zap, Globe, Folder, Layers, FileText, Settings, User, BarChart3, Package, Menu, X, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  // Show sidebar on desktop, hide on mobile by default
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/projects", label: "Projects", icon: Folder },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/plugins", label: "Plugins", icon: Package },
    { path: "/globe", label: "Globe", icon: Globe },
    { path: "/templates", label: "Templates", icon: Layers },
    { path: "/logs", label: "Logs", icon: FileText },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-shodan-bg">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <nav className={cn(
        "bg-shodan-surface border-r border-shodan-surface/50 flex flex-col transition-all duration-300 z-50",
        isMobile ? "fixed inset-y-0 left-0" : "relative",
        sidebarOpen ? "w-64 translate-x-0" : isMobile ? "w-64 -translate-x-full" : "w-0 -translate-x-full"
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-shodan-accent to-shodan-accent2 rounded-lg flex items-center justify-center neon-glow">
                <Zap className="w-6 h-6 text-shodan-bg" />
              </div>
              <h1 className="text-2xl font-bold text-shodan-text">Clippr</h1>
            </div>
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-shodan-accent/10 text-shodan-text"
              >
                <X className="w-5 h-5" />
              </button>
            )}
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
        
        <div className="mt-auto p-6">
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        {isMobile && (
          <div className="bg-shodan-surface border-b border-shodan-surface/50 p-4 flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-shodan-accent/10 text-shodan-text"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-shodan-accent to-shodan-accent2 rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-shodan-bg" />
              </div>
              <span className="text-lg font-bold text-shodan-text">Clippr</span>
            </div>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        )}

        <main className={cn(
          "flex-1 overflow-auto bg-shodan-bg",
          isMobile ? "p-4" : "p-8"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
