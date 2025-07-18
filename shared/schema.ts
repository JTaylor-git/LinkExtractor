import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  startUrl: text("start_url").notNull(),
  depth: integer("depth").default(2),
  exportFormats: text("export_formats").array().default([]),
  status: text("status").notNull().default("created"), // created, running, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scrapeJobs = pgTable("scrape_jobs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  status: text("status").notNull().default("queued"), // queued, running, completed, failed
  totalUrls: integer("total_urls").default(0),
  processedUrls: integer("processed_urls").default(0),
  failedUrls: integer("failed_urls").default(0),
  resultPath: text("result_path"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scrapedData = pgTable("scraped_data", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => scrapeJobs.id),
  url: text("url").notNull(),
  title: text("title"),
  content: text("content"),
  extractedData: jsonb("extracted_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  startUrl: true,
  depth: true,
  exportFormats: true,
});

export const insertScrapeJobSchema = createInsertSchema(scrapeJobs).pick({
  projectId: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertScrapeJob = z.infer<typeof insertScrapeJobSchema>;
export type ScrapeJob = typeof scrapeJobs.$inferSelect;
export type ScrapedData = typeof scrapedData.$inferSelect;
