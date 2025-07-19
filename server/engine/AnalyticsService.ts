export interface TimePoint { 
  timestamp: string; 
  count: number; 
}

export interface DomainLatency { 
  domain: string; 
  avgLatency: number; 
}

export interface ResourceBreakdown { 
  type: string; 
  count: number; 
}

export interface ErrorHeat { 
  pattern: string; 
  errors: number; 
}

export interface AnalyticsData {
  timeseries: TimePoint[];
  domainLatency: DomainLatency[];
  resourceBreakdown: ResourceBreakdown[];
  errorHeatmap: ErrorHeat[];
}

export class AnalyticsService {
  static getAnalytics(): AnalyticsData {
    // Generate realistic-looking analytics data
    const now = Date.now();
    const timeseries = Array.from({ length: 24 }).map((_, i) => ({
      timestamp: new Date(now - (23 - i) * 3600_000).toISOString(),
      count: Math.floor(Math.random() * 100) + 20
    }));

    const domains = ['example.com', 'api.github.com', 'news.ycombinator.com', 'stackoverflow.com'];
    const domainLatency = domains.map(d => ({
      domain: d,
      avgLatency: parseFloat((Math.random() * 1000 + 200).toFixed(1))
    }));

    const types = ['html', 'json', 'image', 'css', 'js', 'xml'];
    const resourceBreakdown = types.map(t => ({
      type: t,
      count: Math.floor(Math.random() * 500) + 50
    }));

    const patterns = ['/api/v1/', '/static/', '/assets/', '/404', '/500'];
    const errorHeatmap = patterns.map(p => ({
      pattern: p,
      errors: Math.floor(Math.random() * 25)
    }));

    return { timeseries, domainLatency, resourceBreakdown, errorHeatmap };
  }
}