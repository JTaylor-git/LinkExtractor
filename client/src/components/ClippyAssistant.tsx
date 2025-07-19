import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

interface ClippyAssistantProps {
  onStartWizard: () => void;
}

export default function ClippyAssistant({ onStartWizard }: ClippyAssistantProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [message, setMessage] = useState("Yo! Street Clippy here. Let's get this scraping operation started, fam!");

  const hints = [
    "Yo! Street Clippy here. Let's get this scraping operation started, fam!",
    "Ready to scrape the web? Hit that wizard button and let's roll!",
    "I've been running these streets since '97. Trust me, I know how to extract data.",
    "Pick your export formats wisely - JSON's clean, CSV's universal, GeoJSON's for the maps.",
    "Need backup? I got your six. Street Clippy never leaves a homie behind!",
    "Time to harvest some data from the digital streets!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(hints[Math.floor(Math.random() * hints.length)]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleStepTo = (step: number) => {
    const stepMessages = {
      1: "Drop that URL in the field, let's get this party started!",
      2: "Set your depth and pick your formats - make it count!",
      3: "Hit that run button and watch me work my magic!",
      4: "Data's ready for pickup - grab your ZIP and bounce!"
    };
    setMessage(stepMessages[step as keyof typeof stepMessages] || "Yo, holler if you need the Street Clippy expertise!");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-float">
      <Card className="glassmorphism max-w-xs shadow-2xl border-shodan-accent/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-shodan-accent to-shodan-accent2 rounded-full flex items-center justify-center neon-glow">
              {/* Street Clippy character - urban paperclip */}
              <div className="w-8 h-8 bg-shodan-bg rounded-sm flex items-center justify-center transform rotate-12">
                <div className="w-3 h-6 bg-shodan-accent rounded-full shadow-lg"></div>
              </div>
            </div>
            <div className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 text-shodan-text/60 hover:text-shodan-text"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="bg-shodan-surface/80 rounded-lg p-3 mb-3 mt-2 border border-shodan-accent/20">
                <p className="text-sm text-shodan-text font-medium">{message}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  className="bg-shodan-accent hover:bg-shodan-accent2 text-shodan-bg font-bold shadow-lg"
                  onClick={onStartWizard}
                >
                  Start Wizard
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-shodan-surface/50 border-shodan-accent/40 text-shodan-text hover:bg-shodan-surface/80"
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
