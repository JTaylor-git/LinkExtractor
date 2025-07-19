import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, RefreshCw, Trash2, Eye } from "lucide-react";
import ScrapeWizard from "@/components/ScrapeWizard";
import { formatDistanceToNow } from "date-fns";

export default function Projects() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  
  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects"],
    refetchInterval: 5000,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-500 text-white">Completed</Badge>;
      case "running":
        return <Badge className="bg-amber-500 text-white">Running</Badge>;
      case "failed":
        return <Badge className="bg-red-500 text-white">Failed</Badge>;
      default:
        return <Badge className="bg-[hsl(215,25%,27%)] text-white">Created</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">Projects</h2>
          <Button className="bg-[hsl(188,95%,43%)] hover:bg-[hsl(186,85%,57%)] text-[hsl(222,47%,11%)]">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glassmorphism">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-[hsl(215,25%,27%)] rounded"></div>
                  <div className="h-4 bg-[hsl(215,25%,27%)] rounded w-3/4"></div>
                  <div className="h-8 bg-[hsl(215,25%,27%)] rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Projects</h2>
          <p className="text-[hsl(215,20%,65%)]">Manage your scraping projects and view results</p>
        </div>
        <Button
          onClick={() => setIsWizardOpen(true)}
          className="bg-[hsl(188,95%,43%)] hover:bg-[hsl(186,85%,57%)] text-[hsl(222,47%,11%)] font-medium hover-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <Card key={project.id} className="glassmorphism hover-glow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-white mb-2">
                      {project.name}
                    </CardTitle>
                    <p className="text-sm text-[hsl(215,20%,65%)]">
                      {new URL(project.startUrl).hostname}
                    </p>
                  </div>
                  {getStatusBadge(project.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[hsl(215,20%,65%)]">Depth:</span>
                    <span className="text-white">{project.depth} levels</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[hsl(215,20%,65%)]">Formats:</span>
                    <span className="text-white">{project.exportFormats?.join(", ") || "json"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[hsl(215,20%,65%)]">Created:</span>
                    <span className="text-white">
                      {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between pt-3 border-t border-[hsl(215,25%,27%)]">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[hsl(188,95%,43%)] hover:text-[hsl(186,85%,57%)]"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {project.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[hsl(188,95%,43%)] hover:text-[hsl(186,85%,57%)]"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      {project.status === "failed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[hsl(188,95%,43%)] hover:text-[hsl(186,85%,57%)]"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glassmorphism">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-[hsl(215,25%,27%)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-[hsl(215,20%,65%)]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-[hsl(215,20%,65%)] mb-6">
              Create your first scraping project to get started
            </p>
            <Button
              onClick={() => setIsWizardOpen(true)}
              className="bg-[hsl(188,95%,43%)] hover:bg-[hsl(186,85%,57%)] text-[hsl(222,47%,11%)] font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}

      <ScrapeWizard open={isWizardOpen} onOpenChange={setIsWizardOpen} />
    </div>
  );
}
