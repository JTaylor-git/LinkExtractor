import { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),
  role: text("role").default("member"), // admin, owner, member, viewer
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  teamId: integer("team_id").references(() => teams.id),
  name: text("name").notNull(),
  description: text("description"),
  startUrl: text("start_url").notNull(),
  depth: integer("depth").default(2),
  exportFormats: text("export_formats").array().default([]),
  status: text("status").notNull().default("created"), // created, running, completed, failed
  visibility: text("visibility").default("private"), // private, team, public
  // Proxy configuration
  proxyMode: text("proxy_mode").default("none"), // none, scraperapi, crawlbase, custom
  proxyApiKey: text("proxy_api_key"),
  proxyListFile: text("proxy_list_file"),
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

// Teams and Organizations
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").references(() => users.id),
  planType: text("plan_type").default("free"), // free, pro, enterprise
  maxMembers: integer("max_members").default(5),
  maxProjects: integer("max_projects").default(10),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team membership with roles
export const teamMembers = pgTable("team_members", {
  teamId: integer("team_id").references(() => teams.id),
  userId: integer("user_id").references(() => users.id),
  role: text("role").default("member"), // owner, admin, member, viewer
  permissions: jsonb("permissions"), // Custom permissions override
  joinedAt: timestamp("joined_at").defaultNow(),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  pk: primaryKey({ columns: [table.teamId, table.userId] }),
}));

// Project collaborators
export const projectCollaborators = pgTable("project_collaborators", {
  projectId: integer("project_id").references(() => projects.id),
  userId: integer("user_id").references(() => users.id),
  role: text("role").default("viewer"), // owner, editor, viewer
  permissions: jsonb("permissions"), // project-specific permissions
  addedAt: timestamp("added_at").defaultNow(),
  addedBy: integer("added_by").references(() => users.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.projectId, table.userId] }),
}));

// Activity logs for audit trail
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  teamId: integer("team_id").references(() => teams.id),
  projectId: integer("project_id").references(() => projects.id),
  action: text("action").notNull(), // create, update, delete, access, etc.
  resourceType: text("resource_type").notNull(), // project, team, user, etc.
  resourceId: integer("resource_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invitations system
export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  teamId: integer("team_id").references(() => teams.id),
  projectId: integer("project_id").references(() => projects.id),
  role: text("role").notNull(),
  permissions: jsonb("permissions"),
  token: text("token").notNull().unique(),
  invitedBy: integer("invited_by").references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  acceptedBy: integer("accepted_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  projects: many(projects),
  ownedTeams: many(teams),
  teamMemberships: many(teamMembers),
  projectCollaborations: many(projectCollaborators),
  activityLogs: many(activityLogs),
  sentInvitations: many(invitations, { relationName: "invitedBy" }),
  acceptedInvitations: many(invitations, { relationName: "acceptedBy" }),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  owner: one(users, { fields: [teams.ownerId], references: [users.id] }),
  members: many(teamMembers),
  projects: many(projects),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, { fields: [teamMembers.teamId], references: [teams.id] }),
  user: one(users, { fields: [teamMembers.userId], references: [users.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, { fields: [projects.userId], references: [users.id] }),
  team: one(teams, { fields: [projects.teamId], references: [teams.id] }),
  jobs: many(scrapeJobs),
  collaborators: many(projectCollaborators),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const projectCollaboratorsRelations = relations(projectCollaborators, ({ one }) => ({
  project: one(projects, { fields: [projectCollaborators.projectId], references: [projects.id] }),
  user: one(users, { fields: [projectCollaborators.userId], references: [users.id] }),
  addedByUser: one(users, { fields: [projectCollaborators.addedBy], references: [users.id] }),
}));

export const scrapeJobsRelations = relations(scrapeJobs, ({ one, many }) => ({
  project: one(projects, { fields: [scrapeJobs.projectId], references: [projects.id] }),
  data: many(scrapedData),
}));

export const scrapedDataRelations = relations(scrapedData, ({ one }) => ({
  job: one(scrapeJobs, { fields: [scrapedData.jobId], references: [scrapeJobs.id] }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
  team: one(teams, { fields: [activityLogs.teamId], references: [teams.id] }),
  project: one(projects, { fields: [activityLogs.projectId], references: [projects.id] }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, { fields: [invitations.teamId], references: [teams.id] }),
  project: one(projects, { fields: [invitations.projectId], references: [projects.id] }),
  invitedBy: one(users, { fields: [invitations.invitedBy], references: [users.id], relationName: "invitedBy" }),
  acceptedBy: one(users, { fields: [invitations.acceptedBy], references: [users.id], relationName: "acceptedBy" }),
}));

// Schema definitions
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  avatar: true,
});

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  description: true,
  planType: true,
  maxMembers: true,
  maxProjects: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).pick({
  teamId: true,
  userId: true,
  role: true,
  permissions: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  startUrl: true,
  depth: true,
  exportFormats: true,
  visibility: true,
  proxyMode: true,
  proxyApiKey: true,
  proxyListFile: true,
});

export const insertProjectCollaboratorSchema = createInsertSchema(projectCollaborators).pick({
  projectId: true,
  userId: true,
  role: true,
  permissions: true,
});

export const insertScrapeJobSchema = createInsertSchema(scrapeJobs).pick({
  projectId: true,
  status: true,
});

export const insertInvitationSchema = createInsertSchema(invitations).pick({
  email: true,
  teamId: true,
  projectId: true,
  role: true,
  permissions: true,
  expiresAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  userId: true,
  teamId: true,
  projectId: true,
  action: true,
  resourceType: true,
  resourceId: true,
  details: true,
  ipAddress: true,
  userAgent: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertProjectCollaborator = z.infer<typeof insertProjectCollaboratorSchema>;
export type InsertScrapeJob = z.infer<typeof insertScrapeJobSchema>;
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type User = typeof users.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectCollaborator = typeof projectCollaborators.$inferSelect;
export type ScrapeJob = typeof scrapeJobs.$inferSelect;
export type ScrapedData = typeof scrapedData.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
