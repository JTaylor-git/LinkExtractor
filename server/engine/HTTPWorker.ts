import fetch, { RequestInit } from 'node-fetch';
import { ProxyManager } from './ProxyManager';

export interface Job {
  url: string;
}

export interface WorkerInterface {
  fetch(job: Job): Promise<string>;
  close?(): Promise<void>;
}

export class HTTPWorker implements WorkerInterface {
  constructor(private proxyManager?: ProxyManager) {}

  async fetch(job: Job): Promise<string> {
    let url = job.url;
    let requestOptions: RequestInit = {};
    
    if (this.proxyManager) {
      const proxy = this.proxyManager.getNextProxy();
      if (proxy) {
        // ScraperAPI/Crawlbase require prefixing the URL
        if (proxy.includes('scraperapi.com') || proxy.includes('crawlbase.com')) {
          url = proxy + encodeURIComponent(job.url);
        } else {
          // For custom proxies, use the agent
          const agent = this.proxyManager.createAgent();
          if (agent) {
            requestOptions.agent = agent;
          }
        }
      }
    }

    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  }
}