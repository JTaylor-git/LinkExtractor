import { storage } from "../storage";
import { scrapeWebsite } from "./scraper";
import { ScrapeJob } from "@shared/schema";

export interface ScheduledTask {
  id: string;
  projectId: number;
  cronExpression: string;
  isActive: boolean;
  lastRun?: Date;
  nextRun: Date;
  watchForChanges: boolean;
  lastContentHash?: string;
}

export class SchedulerService {
  private tasks: Map<string, ScheduledTask> = new Map();
  private intervalId?: NodeJS.Timeout;

  constructor() {
    this.startScheduler();
  }

  private startScheduler() {
    // Check for scheduled tasks every minute
    this.intervalId = setInterval(() => {
      this.checkScheduledTasks();
    }, 60000);
  }

  private async checkScheduledTasks() {
    const now = new Date();
    
    for (const [taskId, task] of this.tasks) {
      if (task.isActive && task.nextRun <= now) {
        try {
          await this.executeTask(task);
          this.updateNextRun(task);
        } catch (error) {
          console.error(`Error executing scheduled task ${taskId}:`, error);
        }
      }
    }
  }

  private async executeTask(task: ScheduledTask) {
    console.log(`Executing scheduled task for project ${task.projectId}`);
    
    const project = await storage.getProject(task.projectId);
    if (!project) {
      console.error(`Project ${task.projectId} not found for scheduled task`);
      return;
    }

    // Create a new scrape job for the scheduled task
    const job = await storage.createScrapeJob({
      projectId: task.projectId,
      status: "queued",
      progress: 0,
      startedAt: new Date(),
    });

    // Start the scraping process
    await scrapeWebsite(project, job.id);
    
    // If watching for changes, compare with last content hash
    if (task.watchForChanges) {
      // This would need to be implemented based on your scraping results
      // For now, we'll just log it
      console.log(`Checking for changes in project ${task.projectId}`);
    }

    task.lastRun = new Date();
  }

  private updateNextRun(task: ScheduledTask) {
    // Simple implementation - for a real scheduler, use a cron parser
    const now = new Date();
    switch (task.cronExpression) {
      case "0 */1 * * *": // Every hour
        task.nextRun = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case "0 */6 * * *": // Every 6 hours
        task.nextRun = new Date(now.getTime() + 6 * 60 * 60 * 1000);
        break;
      case "0 0 * * *": // Daily at midnight
        task.nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case "0 0 * * 0": // Weekly on Sunday
        task.nextRun = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        // Default to daily
        task.nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  public scheduleTask(projectId: number, cronExpression: string, watchForChanges: boolean = false): string {
    const taskId = `task_${projectId}_${Date.now()}`;
    const now = new Date();
    
    const task: ScheduledTask = {
      id: taskId,
      projectId,
      cronExpression,
      isActive: true,
      nextRun: now,
      watchForChanges,
    };

    this.updateNextRun(task);
    this.tasks.set(taskId, task);
    
    console.log(`Scheduled task ${taskId} for project ${projectId} with cron ${cronExpression}`);
    return taskId;
  }

  public cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (task) {
      task.isActive = false;
      this.tasks.delete(taskId);
      return true;
    }
    return false;
  }

  public getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId);
  }

  public getAllTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  public getTasksForProject(projectId: number): ScheduledTask[] {
    return Array.from(this.tasks.values()).filter(task => task.projectId === projectId);
  }

  public destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

// Export a singleton instance
export const scheduler = new SchedulerService();