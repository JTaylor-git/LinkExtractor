import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Globe, 
  MapPin, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Filter,
  RotateCcw
} from "lucide-react";
import Globe3D from "@/components/Globe3D";

interface ScrapeLocation {
  id: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  count: number;
  status: 'active' | 'completed' | 'failed';
  timestamp: Date;
}

export default function GlobePage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<ScrapeLocation | null>(null);
  
  // Mock data - in real app this would come from API
  const mockLocations: ScrapeLocation[] = [
    {
      id: '1',
      lat: 40.7128,
      lng: -74.0060,
      city: 'New York',
      country: 'USA',
      count: 1247,
      status: 'active',
      timestamp: new Date('2025-07-18T04:15:00')
    },
    {
      id: '2',
      lat: 51.5074,
      lng: -0.1278,
      city: 'London',
      country: 'UK',
      count: 892,
      status: 'completed',
      timestamp: new Date('2025-07-18T04:10:00')
    },
    {
      id: '3',
      lat: 35.6762,
      lng: 139.6503,
      city: 'Tokyo',
      country: 'Japan',
      count: 654,
      status: 'active',
      timestamp: new Date('2025-07-18T04:12:00')
    },
    {
      id: '4',
      lat: 48.8566,
      lng: 2.3522,
      city: 'Paris',
      country: 'France',
      count: 543,
      status: 'completed',
      timestamp: new Date('2025-07-18T04:05:00')
    },
    {
      id: '5',
      lat: 37.7749,
      lng: -122.4194,
      city: 'San Francisco',
      country: 'USA',
      count: 432,
      status: 'failed',
      timestamp: new Date('2025-07-18T04:08:00')
    },
    {
      id: '6',
      lat: 52.5200,
      lng: 13.4050,
      city: 'Berlin',
      country: 'Germany',
      count: 321,
      status: 'active',
      timestamp: new Date('2025-07-18T04:14:00')
    },
    {
      id: '7',
      lat: 55.7558,
      lng: 37.6176,
      city: 'Moscow',
      country: 'Russia',
      count: 234,
      status: 'completed',
      timestamp: new Date('2025-07-18T04:07:00')
    },
    {
      id: '8',
      lat: -33.8688,
      lng: 151.2093,
      city: 'Sydney',
      country: 'Australia',
      count: 198,
      status: 'active',
      timestamp: new Date('2025-07-18T04:11:00')
    },
    {
      id: '9',
      lat: 19.0760,
      lng: 72.8777,
      city: 'Mumbai',
      country: 'India',
      count: 167,
      status: 'completed',
      timestamp: new Date('2025-07-18T04:06:00')
    },
    {
      id: '10',
      lat: -23.5505,
      lng: -46.6333,
      city: 'São Paulo',
      country: 'Brazil',
      count: 145,
      status: 'failed',
      timestamp: new Date('2025-07-18T04:09:00')
    }
  ];

  const { data: globeStats } = useQuery({
    queryKey: ['/api/v1/analytics/globe-stats'],
    queryFn: async () => {
      // Mock API response
      return {
        data: {
          totalLocations: mockLocations.length,
          activeLocations: mockLocations.filter(l => l.status === 'active').length,
          completedLocations: mockLocations.filter(l => l.status === 'completed').length,
          failedLocations: mockLocations.filter(l => l.status === 'failed').length,
          totalScrapes: mockLocations.reduce((sum, l) => sum + l.count, 0),
          avgScrapesPerLocation: Math.round(mockLocations.reduce((sum, l) => sum + l.count, 0) / mockLocations.length)
        }
      };
    }
  });

  const filteredLocations = selectedStatus === 'all' 
    ? mockLocations 
    : mockLocations.filter(location => location.status === selectedStatus);

  const handleLocationClick = (location: ScrapeLocation) => {
    setSelectedLocation(location);
  };

  const resetView = () => {
    setSelectedLocation(null);
    setSelectedStatus('all');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-cyan-900/20 text-cyan-400 border-cyan-800';
      case 'completed': return 'bg-green-900/20 text-green-400 border-green-800';
      case 'failed': return 'bg-red-900/20 text-red-400 border-red-800';
      default: return 'bg-gray-900/20 text-gray-400 border-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-shodan-text flex items-center gap-3">
            <Globe className="h-8 w-8 text-shodan-accent" />
            Global Scrape Monitor
          </h1>
          <p className="text-shodan-text/60 mt-2">
            Real-time visualization of scraping activities worldwide
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px] bg-shodan-surface border-shodan-accent/30">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-shodan-surface border-shodan-accent/30">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={resetView}
            className="border-shodan-accent/30 hover:bg-shodan-accent/10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset View
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {globeStats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="bg-shodan-surface/50 border-shodan-accent/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-shodan-text/60">Total Locations</p>
                  <p className="text-2xl font-bold text-shodan-accent">{globeStats.data.totalLocations}</p>
                </div>
                <MapPin className="h-8 w-8 text-shodan-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-shodan-surface/50 border-shodan-accent/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-shodan-text/60">Active</p>
                  <p className="text-2xl font-bold text-cyan-400">{globeStats.data.activeLocations}</p>
                </div>
                <Activity className="h-8 w-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-shodan-surface/50 border-shodan-accent/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-shodan-text/60">Completed</p>
                  <p className="text-2xl font-bold text-green-400">{globeStats.data.completedLocations}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-shodan-surface/50 border-shodan-accent/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-shodan-text/60">Failed</p>
                  <p className="text-2xl font-bold text-red-400">{globeStats.data.failedLocations}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-shodan-surface/50 border-shodan-accent/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-shodan-text/60">Total Scrapes</p>
                  <p className="text-2xl font-bold text-shodan-accent">{globeStats.data.totalScrapes.toLocaleString()}</p>
                </div>
                <Globe className="h-8 w-8 text-shodan-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-shodan-surface/50 border-shodan-accent/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-shodan-text/60">Avg/Location</p>
                  <p className="text-2xl font-bold text-shodan-accent">{globeStats.data.avgScrapesPerLocation}</p>
                </div>
                <Activity className="h-8 w-8 text-shodan-accent" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Globe */}
        <div className="lg:col-span-2">
          <Card className="bg-shodan-surface/50 border-shodan-accent/30">
            <CardHeader>
              <CardTitle className="text-shodan-text flex items-center gap-2">
                <Globe className="h-5 w-5 text-shodan-accent" />
                Interactive Globe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] w-full">
                <Globe3D 
                  locations={filteredLocations}
                  onLocationClick={handleLocationClick}
                  className="h-full w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location List */}
        <div>
          <Card className="bg-shodan-surface/50 border-shodan-accent/30">
            <CardHeader>
              <CardTitle className="text-shodan-text flex items-center gap-2">
                <MapPin className="h-5 w-5 text-shodan-accent" />
                Active Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[450px] overflow-y-auto">
                {filteredLocations
                  .sort((a, b) => b.count - a.count)
                  .map((location) => (
                    <div
                      key={location.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedLocation?.id === location.id
                          ? 'bg-shodan-accent/10 border-shodan-accent'
                          : 'bg-shodan-surface/30 border-shodan-accent/20 hover:border-shodan-accent/40'
                      }`}
                      onClick={() => handleLocationClick(location)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-shodan-text">
                          {location.city}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(location.status)} text-xs`}
                        >
                          {getStatusIcon(location.status)}
                          <span className="ml-1 capitalize">{location.status}</span>
                        </Badge>
                      </div>
                      <div className="text-sm text-shodan-text/60">
                        {location.country}
                      </div>
                      <div className="flex items-center justify-between mt-2 text-sm">
                        <span className="text-shodan-accent font-medium">
                          {location.count.toLocaleString()} scrapes
                        </span>
                        <span className="text-shodan-text/60">
                          {location.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}