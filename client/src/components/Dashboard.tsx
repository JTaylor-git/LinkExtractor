import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Clock, X, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glassmorphism">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-[hsl(215,25%,27%)] rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-[hsl(215,25%,27%)] rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsCards = [
    {
      title: "Active Jobs",
      value: stats?.activeJobs || 0,
      icon: Play,
      color: "emerald",
      trend: "+12%",
      trendIcon: TrendingUp,
    },
    {
      title: "Queued",
      value: stats?.queuedJobs || 0,
      icon: Clock,
      color: "amber",
      trend: "-5%",
      trendIcon: TrendingDown,
    },
    {
      title: "Failed",
      value: stats?.failedJobs || 0,
      icon: X,
      color: "red",
      trend: "+2%",
      trendIcon: TrendingUp,
    },
    {
      title: "QPS",
      value: stats?.qps || 0,
      icon: Zap,
      color: "cyan",
      trend: "+8%",
      trendIcon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trendIcon;
        
        return (
          <Card key={card.title} className="glassmorphism hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[hsl(215,20%,65%)] text-sm">{card.title}</p>
                  <p className="text-2xl font-bold text-white">
                    {typeof card.value === 'number' && card.title === 'QPS' 
                      ? `${(card.value / 1000).toFixed(1)}K` 
                      : card.value}
                  </p>
                </div>
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center",
                  card.color === "emerald" && "bg-emerald-500",
                  card.color === "amber" && "bg-amber-500",
                  card.color === "red" && "bg-red-500",
                  card.color === "cyan" && "bg-[hsl(188,95%,43%)]"
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className={cn(
                "mt-4 flex items-center text-sm",
                card.trend.startsWith("+") && card.color !== "red" && "text-emerald-400",
                card.trend.startsWith("-") && "text-amber-400",
                card.trend.startsWith("+") && card.color === "red" && "text-red-400"
              )}>
                <TrendIcon className="w-4 h-4 mr-1" />
                {card.trend} from last hour
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
