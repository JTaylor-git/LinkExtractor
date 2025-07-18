import fs from 'fs';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';

export interface ProxyConfig {
  mode: 'none' | 'scraperapi' | 'crawlbase' | 'custom';
  apiKey?: string;
  listFile?: string;
}

export class ProxyManager {
  private proxies: string[] = [];
  private index = 0;
  private config: ProxyConfig;

  constructor(config: ProxyConfig) {
    this.config = config;
    this.loadProxies();
  }

  private loadProxies() {
    if (this.config.mode === 'custom' && this.config.listFile) {
      if (!fs.existsSync(this.config.listFile)) {
        throw new Error(`Proxy list file not found: ${this.config.listFile}`);
      }
      const content = fs.readFileSync(this.config.listFile, 'utf-8');
      this.proxies = content.trim().split('\n').filter(line => line.trim());
    } else if (this.config.mode === 'scraperapi') {
      if (!this.config.apiKey) {
        throw new Error('ScraperAPI requires an API key');
      }
      this.proxies = [`http://api.scraperapi.com?api_key=${this.config.apiKey}&url=`];
    } else if (this.config.mode === 'crawlbase') {
      if (!this.config.apiKey) {
        throw new Error('Crawlbase requires an API key');
      }
      this.proxies = [`https://api.crawlbase.com?token=${this.config.apiKey}&url=`];
    }
  }

  getNextProxy(): string | null {
    if (this.proxies.length === 0) return null;
    
    const proxy = this.proxies[this.index];
    this.index = (this.index + 1) % this.proxies.length;
    return proxy;
  }

  createAgent() {
    const proxy = this.getNextProxy();
    if (!proxy) return undefined;
    
    if (proxy.startsWith('https://')) {
      return new HttpsProxyAgent(proxy);
    } else {
      return new HttpProxyAgent(proxy);
    }
  }
}