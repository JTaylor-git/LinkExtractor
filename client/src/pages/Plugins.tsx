import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, 
  Trash2, 
  Power, 
  PowerOff, 
  Star, 
  Search, 
  Tag, 
  User,
  Package,
  TrendingUp,
  Shield,
  Zap,
  Settings,
  RefreshCw,
  ExternalLink,
  Upload
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: 'scraper' | 'processor' | 'exporter' | 'analyzer' | 'utility';
  tags: string[];
  enabled: boolean;
  installedAt: Date;
  lastUpdated: Date;
  homepage?: string;
  repository?: string;
  icon?: string;
  screenshots?: string[];
  rating?: number;
  downloadCount?: number;
  size?: number;
}

interface PluginRegistry {
  plugins: Plugin[];
  featured: string[];
  categories: Array<{
    id: string;
    name: string;
    description: string;
    count: number;
  }>;
}

const categoryIcons = {
  scraper: Package,
  processor: Settings,
  exporter: Upload,
  analyzer: TrendingUp,
  utility: Zap
};

const categoryColors = {
  scraper: 'bg-blue-900/20 text-blue-400 border-blue-800',
  processor: 'bg-purple-900/20 text-purple-400 border-purple-800',
  exporter: 'bg-green-900/20 text-green-400 border-green-800',
  analyzer: 'bg-yellow-900/20 text-yellow-400 border-yellow-800',
  utility: 'bg-orange-900/20 text-orange-400 border-orange-800'
};

export default function Plugins() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("browse");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: registryResponse, isLoading: registryLoading } = useQuery<{ data: PluginRegistry }>({
    queryKey: ['/api/v1/plugins/registry'],
  });

  const { data: installedResponse, isLoading: installedLoading } = useQuery<{ data: Plugin[] }>({
    queryKey: ['/api/v1/plugins/installed'],
  });

  const { data: pluginStatsResponse } = useQuery<{ data: any }>({
    queryKey: ['/api/v1/plugins/stats'],
  });

  const registry = registryResponse?.data;
  const installedPlugins = installedResponse?.data;
  const pluginStats = pluginStatsResponse?.data;

  const installMutation = useMutation({
    mutationFn: async (pluginId: string) => {
      await apiRequest('/api/v1/plugins/install', {
        method: 'POST',
        body: { pluginId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/plugins/installed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/plugins/stats'] });
      toast({ title: "Plugin installed successfully", variant: "default" });
    },
    onError: (error) => {
      toast({ title: "Failed to install plugin", description: error.message, variant: "destructive" });
    },
  });

  const uninstallMutation = useMutation({
    mutationFn: async (pluginId: string) => {
      await apiRequest(`/api/v1/plugins/${pluginId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/plugins/installed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/plugins/stats'] });
      toast({ title: "Plugin uninstalled successfully", variant: "default" });
    },
    onError: (error) => {
      toast({ title: "Failed to uninstall plugin", description: error.message, variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ pluginId, action }: { pluginId: string; action: 'enable' | 'disable' }) => {
      await apiRequest(`/api/v1/plugins/${pluginId}/${action}`, {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/plugins/installed'] });
      toast({ title: "Plugin updated successfully", variant: "default" });
    },
    onError: (error) => {
      toast({ title: "Failed to update plugin", description: error.message, variant: "destructive" });
    },
  });

  const filteredPlugins = registry?.plugins.filter(plugin => {
    const matchesSearch = !searchQuery || 
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || plugin.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const isPluginInstalled = (pluginId: string) => {
    return installedPlugins?.some(p => p.id === pluginId);
  };

  const renderPluginCard = (plugin: Plugin, isInstalled: boolean = false) => {
    const CategoryIcon = categoryIcons[plugin.category];
    const categoryColor = categoryColors[plugin.category];

    return (
      <Card key={plugin.id} className="bg-gray-900/50 border-green-900/30 hover:border-green-700/50 transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${categoryColor}`}>
                <CategoryIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg text-green-400">{plugin.name}</CardTitle>
                <p className="text-sm text-green-600">v{plugin.version} by {plugin.author}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {plugin.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-green-400">{plugin.rating}</span>
                </div>
              )}
              {plugin.downloadCount && (
                <div className="flex items-center space-x-1">
                  <Download className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400">{plugin.downloadCount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-green-300">{plugin.description}</p>
          
          <div className="flex flex-wrap gap-2">
            {plugin.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs border-green-800 text-green-400">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              {plugin.homepage && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-400 border-green-800 hover:bg-green-900/30"
                  onClick={() => window.open(plugin.homepage, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Info
                </Button>
              )}
              {plugin.repository && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-400 border-green-800 hover:bg-green-900/30"
                  onClick={() => window.open(plugin.repository, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Code
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {isInstalled ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleMutation.mutate({ 
                      pluginId: plugin.id, 
                      action: plugin.enabled ? 'disable' : 'enable' 
                    })}
                    disabled={toggleMutation.isPending}
                    className={plugin.enabled ? 
                      "text-yellow-400 border-yellow-700 hover:bg-yellow-900/30" : 
                      "text-green-400 border-green-800 hover:bg-green-900/30"
                    }
                  >
                    {plugin.enabled ? <PowerOff className="h-4 w-4 mr-1" /> : <Power className="h-4 w-4 mr-1" />}
                    {plugin.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => uninstallMutation.mutate(plugin.id)}
                    disabled={uninstallMutation.isPending}
                    className="text-red-400 border-red-800 hover:bg-red-900/30"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Uninstall
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => installMutation.mutate(plugin.id)}
                  disabled={installMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-black font-bold"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Install
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (registryLoading || installedLoading) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">Loading plugins...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-green-900/30 pb-6">
          <h1 className="text-4xl font-bold mb-2 text-green-400">Plugin Ecosystem</h1>
          <p className="text-green-600">Extend Clippr with powerful plugins and integrations</p>
        </div>

        {/* Stats Cards */}
        {pluginStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gray-900/50 border-green-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Total Plugins</p>
                    <p className="text-2xl font-bold text-green-400">{pluginStats?.total || 0}</p>
                  </div>
                  <Package className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-green-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Enabled</p>
                    <p className="text-2xl font-bold text-green-400">{pluginStats?.enabled || 0}</p>
                  </div>
                  <Power className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-green-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Available</p>
                    <p className="text-2xl font-bold text-green-400">{registry?.plugins?.length || 0}</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-green-900/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Categories</p>
                    <p className="text-2xl font-bold text-green-400">{registry?.categories?.length || 0}</p>
                  </div>
                  <Tag className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 border-green-900/30">
            <TabsTrigger value="browse" className="data-[state=active]:bg-green-900/50 data-[state=active]:text-green-400">
              Browse Plugins
            </TabsTrigger>
            <TabsTrigger value="installed" className="data-[state=active]:bg-green-900/50 data-[state=active]:text-green-400">
              Installed ({installedPlugins?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-green-900/50 data-[state=active]:text-green-400">
              Featured
            </TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                <Input
                  placeholder="Search plugins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-green-900/30 text-green-400 placeholder-green-600"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px] bg-gray-900/50 border-green-900/30 text-green-400">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-green-900/30">
                  <SelectItem value="all">All Categories</SelectItem>
                  {registry?.categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPlugins.map(plugin => renderPluginCard(plugin, isPluginInstalled(plugin.id)))}
            </div>
          </TabsContent>

          {/* Installed Tab */}
          <TabsContent value="installed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {installedPlugins?.map(plugin => renderPluginCard(plugin, true)) || (
                <div className="col-span-full text-center text-green-600 py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No plugins installed yet</p>
                  <p className="text-sm">Browse available plugins to get started</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Featured Tab */}
          <TabsContent value="featured" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {registry?.plugins
                .filter(plugin => registry.featured.includes(plugin.id))
                .map(plugin => renderPluginCard(plugin, isPluginInstalled(plugin.id)))
              }
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}