import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, LayoutTemplate, BookOpen } from "lucide-react";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import ProjectsList from "@/components/ProjectsList";
import ClippyAssistant from "@/components/ClippyAssistant";
import ScrapeWizard from "@/components/ScrapeWizard";

export default function Home() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const systemStatus = [
    { name: "Scraping Engine", status: "Online", color: "emerald" },
    { name: "Proxy Pool", status: "98% Available", color: "emerald" },
    { name: "Database", status: "Healthy", color: "emerald" },
    { name: "Queue", status: "Active", color: "amber" },
  ];

  return (
    <Layout>
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
            <p className="text-[hsl(215,20%,65%)]">Monitor your scraping operations and manage projects</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="glassmorphism rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-white">System Online</span>
              </div>
            </div>
            <Button
              onClick={() => setIsWizardOpen(true)}
              className="bg-[hsl(188,95%,43%)] hover:bg-[hsl(186,85%,57%)] text-[hsl(222,47%,11%)] font-medium hover-glow"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Scrape
            </Button>
          </div>
        </div>
      </header>

      <Dashboard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <ProjectsList />
        </div>
        
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setIsWizardOpen(true)}
                className="w-full bg-[hsl(188,95%,43%)] hover:bg-[hsl(186,85%,57%)] text-[hsl(222,47%,11%)] font-medium hover-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
              <Button
                variant="outline"
                className="w-full bg-[hsl(215,25%,27%)] border-[hsl(215,25%,27%)] text-white hover:bg-[hsl(215,20%,35%)]"
              >
                <LayoutTemplate className="w-4 h-4 mr-2" />
                Browse Templates
              </Button>
              <Button
                variant="outline"
                className="w-full bg-[hsl(215,25%,27%)] border-[hsl(215,25%,27%)] text-white hover:bg-[hsl(215,20%,35%)]"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Documentation
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemStatus.map((system) => (
                  <div key={system.name} className="flex items-center justify-between">
                    <span className="text-[hsl(215,20%,65%)]">{system.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        system.color === "emerald" ? "bg-emerald-500" : "bg-amber-500"
                      }`}></div>
                      <span className={`text-sm ${
                        system.color === "emerald" ? "text-emerald-400" : "text-amber-400"
                      }`}>
                        {system.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ClippyAssistant onStartWizard={() => setIsWizardOpen(true)} />
      <ScrapeWizard open={isWizardOpen} onOpenChange={setIsWizardOpen} />
    </Layout>
  );
}
