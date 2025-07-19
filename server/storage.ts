import { 
  users, 
  projects, 
  scrapeJobs, 
  scrapedData,
  type User, 
  type InsertUser,
  type Project,
  type InsertProject,
  type ScrapeJob,
  type InsertScrapeJob,
  type ScrapedData
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUser(userId: number): Promise<Project[]>;
  createProject(project: InsertProject & { userId: number }): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  
  // Scrape job operations
  getScrapeJob(id: number): Promise<ScrapeJob | undefined>;
  getScrapeJobsByProject(projectId: number): Promise<ScrapeJob[]>;
  createScrapeJob(job: InsertScrapeJob): Promise<ScrapeJob>;
  updateScrapeJob(id: number, updates: Partial<ScrapeJob>): Promise<ScrapeJob>;
  
  // Scraped data operations
  getScrapedDataByJob(jobId: number): Promise<ScrapedData[]>;
  createScrapedData(data: Omit<ScrapedData, 'id' | 'createdAt'>): Promise<ScrapedData>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectsByUser(userId: number): Promise<Project[]> {
    return await db.select().from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));
  }

  async createProject(project: InsertProject & { userId: number }): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getScrapeJob(id: number): Promise<ScrapeJob | undefined> {
    const [job] = await db.select().from(scrapeJobs).where(eq(scrapeJobs.id, id));
    return job || undefined;
  }

  async getScrapeJobsByProject(projectId: number): Promise<ScrapeJob[]> {
    return await db.select().from(scrapeJobs)
      .where(eq(scrapeJobs.projectId, projectId))
      .orderBy(desc(scrapeJobs.createdAt));
  }

  async createScrapeJob(job: InsertScrapeJob): Promise<ScrapeJob> {
    const [newJob] = await db
      .insert(scrapeJobs)
      .values(job)
      .returning();
    return newJob;
  }

  async updateScrapeJob(id: number, updates: Partial<ScrapeJob>): Promise<ScrapeJob> {
    const [updatedJob] = await db
      .update(scrapeJobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(scrapeJobs.id, id))
      .returning();
    return updatedJob;
  }

  async getScrapedDataByJob(jobId: number): Promise<ScrapedData[]> {
    return await db.select().from(scrapedData)
      .where(eq(scrapedData.jobId, jobId))
      .orderBy(desc(scrapedData.createdAt));
  }

  async createScrapedData(data: Omit<ScrapedData, 'id' | 'createdAt'>): Promise<ScrapedData> {
    const [newData] = await db
      .insert(scrapedData)
      .values(data)
      .returning();
    return newData;
  }
}

export const storage = new DatabaseStorage();
