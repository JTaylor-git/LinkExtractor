import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Check, Clock, Download } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  startUrl: z.string().url("Please enter a valid URL"),
  depth: z.number().min(1).max(10),
  exportFormats: z.array(z.string()).min(1, "Select at least one export format"),
});

type FormData = z.infer<typeof formSchema>;

interface ScrapeWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ScrapeWizard({ open, onOpenChange }: ScrapeWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [jobId, setJobId] = useState<number | null>(null);
  const [jobStatus, setJobStatus] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      startUrl: "",
      depth: 2,
      exportFormats: ["json"],
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setCurrentStep(3);
      startScraping(project.id);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const startScraping = async (projectId: number) => {
    try {
      const response = await apiRequest("POST", `/api/projects/${projectId}/scrape`, {});
      const job = await response.json();
      setJobId(job.id);
      setJobStatus("running");
      
      // Poll for job status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await apiRequest("GET", `/api/jobs/${job.id}`, undefined);
          const statusData = await statusResponse.json();
          setJobStatus(statusData.status);
          
          if (statusData.status === "completed" || statusData.status === "failed") {
            clearInterval(pollInterval);
            if (statusData.status === "completed") {
              setCurrentStep(4);
            }
          }
        } catch (error) {
          clearInterval(pollInterval);
          console.error("Error polling job status:", error);
        }
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start scraping",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (!jobId) return;
    
    try {
      const response = await fetch(`/api/jobs/${jobId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scrape-results-${jobId}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Success",
          description: "Download started successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download results",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: FormData) => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      createProjectMutation.mutate(data);
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setJobId(null);
    setJobStatus("");
    form.reset();
  };

  const handleClose = () => {
    resetWizard();
    onOpenChange(false);
  };

  const steps = [
    { step: 1, label: "URL", active: currentStep >= 1 },
    { step: 2, label: "Config", active: currentStep >= 2 },
    { step: 3, label: "Run", active: currentStep >= 3 },
    { step: 4, label: "Download", active: currentStep >= 4 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">New Scraping Project</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.step} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                step.active 
                  ? "bg-[hsl(188,95%,43%)] text-[hsl(222,47%,11%)]" 
                  : "bg-[hsl(215,25%,27%)] text-[hsl(215,20%,65%)]"
              )}>
                {step.step}
              </div>
              <span className={cn(
                "ml-2 font-medium",
                step.active ? "text-white" : "text-[hsl(215,20%,65%)]"
              )}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-[hsl(215,25%,27%)] mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="startUrl" className="text-white">Start URL</Label>
                <Input
                  id="startUrl"
                  type="url"
                  placeholder="https://example.com"
                  className="bg-[hsl(217,33%,17%)] border-[hsl(215,25%,27%)] text-white"
                  {...form.register("startUrl")}
                />
                {form.formState.errors.startUrl && (
                  <p className="text-red-400 text-sm mt-1">{form.formState.errors.startUrl.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="name" className="text-white">Project Name</Label>
                <Input
                  id="name"
                  placeholder="My Scraping Project"
                  className="bg-[hsl(217,33%,17%)] border-[hsl(215,25%,27%)] text-white"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-red-400 text-sm mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-[hsl(188,95%,43%)] hover:bg-[hsl(186,85%,57%)] text-[hsl(222,47%,11%)]"
                >
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label className="text-white">Crawl Depth</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Slider
                    value={[form.watch("depth")]}
                    onValueChange={(value) => form.setValue("depth", value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-[hsl(188,95%,43%)] font-medium">
                    {form.watch("depth")} levels
                  </span>
                </div>
              </div>
              
              <div>
                <Label className="text-white">Export Formats</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {["json", "csv", "geojson", "kml", "html", "xml"].map((format) => (
                    <div key={format} className="flex items-center space-x-2">
                      <Checkbox
                        id={format}
                        checked={form.watch("exportFormats").includes(format)}
                        onCheckedChange={(checked) => {
                          const current = form.watch("exportFormats");
                          if (checked) {
                            form.setValue("exportFormats", [...current, format]);
                          } else {
                            form.setValue("exportFormats", current.filter(f => f !== format));
                          }
                        }}
                      />
                      <Label htmlFor={format} className="text-[hsl(215,20%,65%)]">
                        .{format}
                      </Label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.exportFormats && (
                  <p className="text-red-400 text-sm mt-1">{form.formState.errors.exportFormats.message}</p>
                )}
              </div>
              
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="bg-[hsl(215,25%,27%)] border-[hsl(215,25%,27%)] text-white"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-[hsl(188,95%,43%)] hover:bg-[hsl(186,85%,57%)] text-[hsl(222,47%,11%)]"
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? "Creating..." : "Start Scraping"}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-white animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-white">Scraping in Progress</h3>
              <p className="text-[hsl(215,20%,65%)]">
                Your scraping job is running. Status: <span className="text-amber-400">{jobStatus}</span>
              </p>
              <div className="bg-[hsl(215,25%,27%)] rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Scraping Complete!</h3>
              <p className="text-[hsl(215,20%,65%)]">
                Your data has been successfully scraped and is ready for download.
              </p>
              <div className="flex justify-center space-x-3">
                <Button
                  onClick={handleDownload}
                  className="bg-[hsl(188,95%,43%)] hover:bg-[hsl(186,85%,57%)] text-[hsl(222,47%,11%)]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Results
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="bg-[hsl(215,25%,27%)] border-[hsl(215,25%,27%)] text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
