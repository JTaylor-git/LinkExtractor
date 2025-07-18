import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

interface ClippyAssistantProps {
  onStartWizard: () => void;
}

export default function ClippyAssistant({ onStartWizard }: ClippyAssistantProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [message, setMessage] = useState("Hi! I'm Clippy, your scraping assistant. Ready to start your first project?");

  const hints = [
    "Hi! I'm Clippy, your scraping assistant. Ready to start your first project?",
    "Click 'Start Wizard' to begin your scraping journey!",
    "I can help you configure your scraping settings step by step.",
    "Don't forget to select your export formats - I recommend starting with JSON!",
    "Need help? I'm here to guide you through the process!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(hints[Math.floor(Math.random() * hints.length)]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleStepTo = (step: number) => {
    const stepMessages = {
      1: "Enter the site URL above",
      2: "Set depth & file filters",
      3: "Click ▶ Run to start scraping",
      4: "All done—download your data!"
    };
    setMessage(stepMessages[step as keyof typeof stepMessages] || "Let me know if you need help!");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-float">
      <Card className="glassmorphism max-w-xs shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[hsl(188,95%,43%)] to-[hsl(185,82%,70%)] rounded-full flex items-center justify-center neon-glow">
              {/* Clippy character representation */}
              <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                <div className="w-3 h-6 bg-gray-600 rounded-full"></div>
              </div>
            </div>
            <div className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 text-[hsl(215,20%,65%)] hover:text-white"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="bg-[hsl(215,25%,27%)] rounded-lg p-3 mb-3 mt-2">
                <p className="text-sm text-white">{message}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  className="bg-[hsl(188,95%,43%)] hover:bg-[hsl(186,85%,57%)] text-[hsl(222,47%,11%)] font-medium"
                  onClick={onStartWizard}
                >
                  Start Wizard
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-[hsl(215,25%,27%)] border-[hsl(215,25%,27%)] text-white hover:bg-[hsl(215,20%,35%)]"
                  onClick={() => setIsVisible(false)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
