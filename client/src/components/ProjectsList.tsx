import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Clock, X, Download, RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProjectsList() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects"],
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="text-white">Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-[hsl(215,25%,27%)] rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-5 h-5 text-white" />;
      case "running":
        return <Clock className="w-5 h-5 text-white animate-spin" />;
      case "failed":
        return <X className="w-5 h-5 text-white" />;
      default:
        return <Clock className="w-5 h-5 text-white" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500";
      case "running":
        return "bg-amber-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-[hsl(215,25%,27%)]";
    }
  };

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

  return (
    <Card className="glassmorphism">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">Recent Projects</CardTitle>
          <Button variant="ghost" size="sm" className="text-[hsl(188,95%,43%)] hover:text-[hsl(186,85%,57%)]">
            <ExternalLink className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects && projects.length > 0 ? (
            projects.slice(0, 3).map((project: any) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 bg-[hsl(217,33%,17%)] rounded-lg border border-[hsl(215,25%,27%)] hover:border-[hsl(188,95%,43%)] transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    getStatusColor(project.status)
                  )}>
                    {getStatusIcon(project.status)}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{project.name}</h4>
                    <p className="text-sm text-[hsl(215,20%,65%)]">
                      {new URL(project.startUrl).hostname} • Depth: {project.depth}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(project.status)}
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
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-[hsl(215,20%,65%)]">No projects yet. Create your first project!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
