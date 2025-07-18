import { apiRequest } from "./queryClient";

export interface Project {
  id: number;
  name: string;
  startUrl: string;
  depth: number;
  exportFormats: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScrapeJob {
  id: number;
  projectId: number;
  status: string;
  totalUrls: number;
  processedUrls: number;
  failedUrls: number;
  resultPath?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  startUrl: string;
  depth: number;
  exportFormats: string[];
}

export const api = {
  // Projects
  async getProjects(): Promise<Project[]> {
    const response = await apiRequest("GET", "/api/projects");
    return response.json();
  },

  async createProject(data: CreateProjectData): Promise<Project> {
    const response = await apiRequest("POST", "/api/projects", data);
    return response.json();
  },

  async getProject(id: number): Promise<Project> {
    const response = await apiRequest("GET", `/api/projects/${id}`);
    return response.json();
  },

  async updateProject(id: number, data: Partial<Project>): Promise<Project> {
    const response = await apiRequest("PUT", `/api/projects/${id}`, data);
    return response.json();
  },

  async deleteProject(id: number): Promise<void> {
    await apiRequest("DELETE", `/api/projects/${id}`);
  },

  // Scrape Jobs
  async getProjectJobs(projectId: number): Promise<ScrapeJob[]> {
    const response = await apiRequest("GET", `/api/projects/${projectId}/jobs`);
    return response.json();
  },

  async startScrape(projectId: number): Promise<ScrapeJob> {
    const response = await apiRequest("POST", `/api/projects/${projectId}/scrape`, {});
    return response.json();
  },

  async getJob(id: number): Promise<ScrapeJob> {
    const response = await apiRequest("GET", `/api/jobs/${id}`);
    return response.json();
  },

  async downloadJobResults(id: number): Promise<void> {
    const response = await fetch(`/api/jobs/${id}/download`);
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scrape-results-${id}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  },

  // Stats
  async getStats() {
    const response = await apiRequest("GET", "/api/stats");
    return response.json();
  },
};
