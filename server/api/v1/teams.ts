import { Router } from "express";
import { z } from "zod";
import { db } from "../../db";
import { teams, teamMembers, users, projects, invitations, activityLogs } from "@shared/schema";
import { eq, and, or } from "drizzle-orm";
import { nanoid } from "nanoid";

const router = Router();

// Get all teams for current user
router.get("/", async (req, res) => {
  try {
    const userId = 1; // TODO: Get from auth session
    
    const userTeams = await db
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
        planType: teams.planType,
        maxMembers: teams.maxMembers,
        maxProjects: teams.maxProjects,
        isActive: teams.isActive,
        createdAt: teams.createdAt,
        role: teamMembers.role,
        memberCount: teams.maxMembers, // TODO: Calculate actual member count
        projectCount: teams.maxProjects, // TODO: Calculate actual project count
        owner: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          avatar: users.avatar,
        }
      })
      .from(teams)
      .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
      .leftJoin(users, eq(teams.ownerId, users.id))
      .where(
        or(
          eq(teams.ownerId, userId),
          and(eq(teamMembers.userId, userId), eq(teamMembers.isActive, true))
        )
      );

    res.json({ data: userTeams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

// Get team by ID
router.get("/:id", async (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    const userId = 1; // TODO: Get from auth session

    const team = await db
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
        planType: teams.planType,
        maxMembers: teams.maxMembers,
        maxProjects: teams.maxProjects,
        isActive: teams.isActive,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
        owner: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          avatar: users.avatar,
        }
      })
      .from(teams)
      .leftJoin(users, eq(teams.ownerId, users.id))
      .where(eq(teams.id, teamId))
      .limit(1);

    if (!team.length) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Check if user has access to this team
    const membership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId),
          eq(teamMembers.isActive, true)
        )
      )
      .limit(1);

    if (!membership.length && team[0].owner.id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ data: team[0] });
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ error: "Failed to fetch team" });
  }
});

// Create new team
router.post("/", async (req, res) => {
  try {
    const userId = 1; // TODO: Get from auth session
    const { name, description, planType, maxMembers, maxProjects } = req.body;

    const newTeam = await db
      .insert(teams)
      .values({
        name,
        description,
        ownerId: userId,
        planType: planType || "free",
        maxMembers: maxMembers || 5,
        maxProjects: maxProjects || 10,
      })
      .returning();

    // Add owner as team member
    await db.insert(teamMembers).values({
      teamId: newTeam[0].id,
      userId: userId,
      role: "owner",
      isActive: true,
    });

    // Log activity
    await db.insert(activityLogs).values({
      userId: userId,
      teamId: newTeam[0].id,
      action: "create",
      resourceType: "team",
      resourceId: newTeam[0].id,
      details: { teamName: name },
    });

    res.status(201).json({ data: newTeam[0] });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ error: "Failed to create team" });
  }
});

// Update team
router.put("/:id", async (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    const userId = 1; // TODO: Get from auth session
    const { name, description, planType, maxMembers, maxProjects } = req.body;

    // Check if user is owner or admin
    const membership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId),
          eq(teamMembers.isActive, true)
        )
      )
      .limit(1);

    if (!membership.length || !["owner", "admin"].includes(membership[0].role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updatedTeam = await db
      .update(teams)
      .set({
        name,
        description,
        planType,
        maxMembers,
        maxProjects,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, teamId))
      .returning();

    // Log activity
    await db.insert(activityLogs).values({
      userId: userId,
      teamId: teamId,
      action: "update",
      resourceType: "team",
      resourceId: teamId,
      details: { changes: { name, description, planType, maxMembers, maxProjects } },
    });

    res.json({ data: updatedTeam[0] });
  } catch (error) {
    console.error("Error updating team:", error);
    res.status(500).json({ error: "Failed to update team" });
  }
});

// Get team members
router.get("/:id/members", async (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    const userId = 1; // TODO: Get from auth session

    // Check if user has access to this team
    const membership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId),
          eq(teamMembers.isActive, true)
        )
      )
      .limit(1);

    if (!membership.length) {
      return res.status(403).json({ error: "Access denied" });
    }

    const members = await db
      .select({
        userId: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        avatar: users.avatar,
        role: teamMembers.role,
        permissions: teamMembers.permissions,
        joinedAt: teamMembers.joinedAt,
        isActive: teamMembers.isActive,
        lastLoginAt: users.lastLoginAt,
      })
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.userId, users.id))
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.isActive, true)
        )
      );

    res.json({ data: members });
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ error: "Failed to fetch team members" });
  }
});

// Invite member to team
router.post("/:id/invite", async (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    const userId = 1; // TODO: Get from auth session
    const { email, role, permissions } = req.body;

    // Check if user has permission to invite
    const membership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId),
          eq(teamMembers.isActive, true)
        )
      )
      .limit(1);

    if (!membership.length || !["owner", "admin"].includes(membership[0].role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if user is already in team
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length) {
      const existingMembership = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.userId, existingUser[0].id)
          )
        )
        .limit(1);

      if (existingMembership.length) {
        return res.status(400).json({ error: "User is already a team member" });
      }
    }

    // Create invitation
    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await db
      .insert(invitations)
      .values({
        email,
        teamId,
        role: role || "member",
        permissions,
        token,
        invitedBy: userId,
        expiresAt,
      })
      .returning();

    // Log activity
    await db.insert(activityLogs).values({
      userId: userId,
      teamId: teamId,
      action: "invite",
      resourceType: "team",
      resourceId: teamId,
      details: { email, role, invitationId: invitation[0].id },
    });

    res.status(201).json({ data: invitation[0] });
  } catch (error) {
    console.error("Error creating invitation:", error);
    res.status(500).json({ error: "Failed to create invitation" });
  }
});

// Update member role
router.put("/:id/members/:userId", async (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    const targetUserId = parseInt(req.params.userId);
    const currentUserId = 1; // TODO: Get from auth session
    const { role, permissions } = req.body;

    // Check if current user has permission to update roles
    const membership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, currentUserId),
          eq(teamMembers.isActive, true)
        )
      )
      .limit(1);

    if (!membership.length || !["owner", "admin"].includes(membership[0].role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Update member role
    const updatedMember = await db
      .update(teamMembers)
      .set({
        role,
        permissions,
      })
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, targetUserId)
        )
      )
      .returning();

    // Log activity
    await db.insert(activityLogs).values({
      userId: currentUserId,
      teamId: teamId,
      action: "update_role",
      resourceType: "team_member",
      resourceId: targetUserId,
      details: { role, permissions, targetUserId },
    });

    res.json({ data: updatedMember[0] });
  } catch (error) {
    console.error("Error updating member role:", error);
    res.status(500).json({ error: "Failed to update member role" });
  }
});

// Remove member from team
router.delete("/:id/members/:userId", async (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    const targetUserId = parseInt(req.params.userId);
    const currentUserId = 1; // TODO: Get from auth session

    // Check if current user has permission to remove members
    const membership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, currentUserId),
          eq(teamMembers.isActive, true)
        )
      )
      .limit(1);

    if (!membership.length || !["owner", "admin"].includes(membership[0].role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Can't remove team owner
    const targetMembership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, targetUserId)
        )
      )
      .limit(1);

    if (targetMembership.length && targetMembership[0].role === "owner") {
      return res.status(400).json({ error: "Cannot remove team owner" });
    }

    // Remove member
    await db
      .update(teamMembers)
      .set({
        isActive: false,
      })
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, targetUserId)
        )
      );

    // Log activity
    await db.insert(activityLogs).values({
      userId: currentUserId,
      teamId: teamId,
      action: "remove_member",
      resourceType: "team_member",
      resourceId: targetUserId,
      details: { targetUserId },
    });

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
});

// Get team activity logs
router.get("/:id/activity", async (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    const userId = 1; // TODO: Get from auth session

    // Check if user has access to this team
    const membership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId),
          eq(teamMembers.isActive, true)
        )
      )
      .limit(1);

    if (!membership.length) {
      return res.status(403).json({ error: "Access denied" });
    }

    const activities = await db
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        resourceType: activityLogs.resourceType,
        resourceId: activityLogs.resourceId,
        details: activityLogs.details,
        createdAt: activityLogs.createdAt,
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          avatar: users.avatar,
        }
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .where(eq(activityLogs.teamId, teamId))
      .orderBy(activityLogs.createdAt);

    res.json({ data: activities });
  } catch (error) {
    console.error("Error fetching team activity:", error);
    res.status(500).json({ error: "Failed to fetch team activity" });
  }
});

export default router;