import { Router } from "express";
import { db } from "../../db";
import { invitations, teams, users, teamMembers, activityLogs } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// Accept invitation
router.post("/:token/accept", async (req, res) => {
  try {
    const { token } = req.params;
    const userId = 1; // TODO: Get from auth session

    // Find invitation
    const invitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.token, token),
          eq(invitations.acceptedAt, null)
        )
      )
      .limit(1);

    if (!invitation.length) {
      return res.status(404).json({ error: "Invitation not found or already accepted" });
    }

    const inv = invitation[0];

    // Check if invitation is expired
    if (new Date() > inv.expiresAt) {
      return res.status(400).json({ error: "Invitation has expired" });
    }

    // Check if user email matches invitation
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user.length || user[0].email !== inv.email) {
      return res.status(400).json({ error: "Email mismatch" });
    }

    // Add user to team if it's a team invitation
    if (inv.teamId) {
      // Check if user is already a member
      const existingMembership = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, inv.teamId),
            eq(teamMembers.userId, userId)
          )
        )
        .limit(1);

      if (existingMembership.length) {
        // Reactivate if inactive
        await db
          .update(teamMembers)
          .set({
            isActive: true,
            role: inv.role,
            permissions: inv.permissions,
            joinedAt: new Date(),
          })
          .where(
            and(
              eq(teamMembers.teamId, inv.teamId),
              eq(teamMembers.userId, userId)
            )
          );
      } else {
        // Create new membership
        await db.insert(teamMembers).values({
          teamId: inv.teamId,
          userId: userId,
          role: inv.role,
          permissions: inv.permissions,
          isActive: true,
        });
      }

      // Log activity
      await db.insert(activityLogs).values({
        userId: userId,
        teamId: inv.teamId,
        action: "join",
        resourceType: "team",
        resourceId: inv.teamId,
        details: { invitationId: inv.id, role: inv.role },
      });
    }

    // Mark invitation as accepted
    await db
      .update(invitations)
      .set({
        acceptedAt: new Date(),
        acceptedBy: userId,
      })
      .where(eq(invitations.id, inv.id));

    res.json({ message: "Invitation accepted successfully" });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    res.status(500).json({ error: "Failed to accept invitation" });
  }
});

// Decline invitation
router.post("/:token/decline", async (req, res) => {
  try {
    const { token } = req.params;

    // Find invitation
    const invitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.token, token),
          eq(invitations.acceptedAt, null)
        )
      )
      .limit(1);

    if (!invitation.length) {
      return res.status(404).json({ error: "Invitation not found or already processed" });
    }

    // Mark invitation as declined by setting acceptedAt to a special value
    await db
      .update(invitations)
      .set({
        acceptedAt: new Date(0), // Unix epoch to indicate decline
      })
      .where(eq(invitations.id, invitation[0].id));

    res.json({ message: "Invitation declined" });
  } catch (error) {
    console.error("Error declining invitation:", error);
    res.status(500).json({ error: "Failed to decline invitation" });
  }
});

// Get invitation details
router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await db
      .select({
        id: invitations.id,
        email: invitations.email,
        role: invitations.role,
        permissions: invitations.permissions,
        expiresAt: invitations.expiresAt,
        acceptedAt: invitations.acceptedAt,
        createdAt: invitations.createdAt,
        team: {
          id: teams.id,
          name: teams.name,
          description: teams.description,
          planType: teams.planType,
        },
        invitedBy: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          avatar: users.avatar,
        }
      })
      .from(invitations)
      .leftJoin(teams, eq(invitations.teamId, teams.id))
      .leftJoin(users, eq(invitations.invitedBy, users.id))
      .where(eq(invitations.token, token))
      .limit(1);

    if (!invitation.length) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    const inv = invitation[0];

    // Check if invitation is expired
    if (new Date() > inv.expiresAt) {
      return res.status(400).json({ error: "Invitation has expired" });
    }

    // Check if already accepted
    if (inv.acceptedAt) {
      return res.status(400).json({ error: "Invitation already processed" });
    }

    res.json({ data: inv });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    res.status(500).json({ error: "Failed to fetch invitation" });
  }
});

export default router;