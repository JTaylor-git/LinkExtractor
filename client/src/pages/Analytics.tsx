import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Activity, Clock, Globe, AlertTriangle } from "lucide-react";

interface AnalyticsData {
  timeseries: Array<{ timestamp: string; count: number }>;
  domainLatency: Array<{ domain: string; avgLatency: number }>;
  resourceBreakdown: Array<{ type: string; count: number }>;
  errorHeatmap: Array<{ pattern: string; errors: number }>;
}

const COLORS = ['#00ff88', '#00d4ff', '#ff3366', '#ffaa00', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-red-400">Failed to load analytics data</div>
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-green-900/30 pb-6">
          <h1 className="text-4xl font-bold mb-2 text-green-400">
            Analytics Dashboard
          </h1>
          <p className="text-green-600">
            Comprehensive scraping performance metrics and insights
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900/50 border-green-900/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-400">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {analytics.timeseries.reduce((sum, item) => sum + item.count, 0)}
              </div>
              <p className="text-xs text-green-600">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-green-900/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-400">Avg Latency</CardTitle>
              <Clock className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {Math.round(analytics.domainLatency.reduce((sum, item) => sum + item.avgLatency, 0) / analytics.domainLatency.length)}ms
              </div>
              <p className="text-xs text-green-600">Across all domains</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-green-900/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-400">Active Domains</CardTitle>
              <Globe className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {analytics.domainLatency.length}
              </div>
              <p className="text-xs text-green-600">Currently monitored</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-green-900/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-400">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {analytics.errorHeatmap.reduce((sum, item) => sum + item.errors, 0)}
              </div>
              <p className="text-xs text-green-600">Total errors detected</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Requests Over Time */}
          <Card className="bg-gray-900/50 border-green-900/30">
            <CardHeader>
              <CardTitle className="text-green-400">Requests Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.timeseries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#065f46" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatTimestamp}
                    stroke="#22c55e"
                  />
                  <YAxis stroke="#22c55e" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #065f46',
                      color: '#22c55e'
                    }}
                    labelFormatter={(label) => formatTimestamp(label)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#00ff88" 
                    strokeWidth={2}
                    dot={{ fill: '#00ff88', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Domain Latency */}
          <Card className="bg-gray-900/50 border-green-900/30">
            <CardHeader>
              <CardTitle className="text-green-400">Domain Latency</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.domainLatency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#065f46" />
                  <XAxis 
                    dataKey="domain" 
                    stroke="#22c55e"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#22c55e" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #065f46',
                      color: '#22c55e'
                    }}
                  />
                  <Bar dataKey="avgLatency" fill="#00ff88" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Resource Breakdown */}
          <Card className="bg-gray-900/50 border-green-900/30">
            <CardHeader>
              <CardTitle className="text-green-400">Resource Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.resourceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.resourceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #065f46',
                      color: '#22c55e'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Error Heatmap */}
          <Card className="bg-gray-900/50 border-green-900/30">
            <CardHeader>
              <CardTitle className="text-green-400">Error Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.errorHeatmap}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#065f46" />
                  <XAxis 
                    dataKey="pattern" 
                    stroke="#22c55e"
                  />
                  <YAxis stroke="#22c55e" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #065f46',
                      color: '#22c55e'
                    }}
                  />
                  <Bar dataKey="errors" fill="#ff3366" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}