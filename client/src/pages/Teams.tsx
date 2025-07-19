import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Plus, 
  Settings, 
  Crown, 
  Shield, 
  User, 
  Eye,
  Mail,
  Calendar,
  Activity,
  UserPlus,
  MoreHorizontal
} from "lucide-react";

interface Team {
  id: number;
  name: string;
  description: string;
  planType: string;
  maxMembers: number;
  maxProjects: number;
  isActive: boolean;
  createdAt: string;
  role: string;
  memberCount: number;
  projectCount: number;
  owner: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
}

interface TeamMember {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: string;
  permissions: any;
  joinedAt: string;
  isActive: boolean;
  lastLoginAt: string;
}

export default function TeamsPage() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const [newTeamData, setNewTeamData] = useState({
    name: "",
    description: "",
    planType: "free",
    maxMembers: 5,
    maxProjects: 10,
  });
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "member",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch teams
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["/api/v1/teams"],
    queryFn: async () => {
      const response = await apiRequest("/api/v1/teams");
      return response.data;
    },
  });

  // Fetch team members
  const { data: teamMembers, isLoading: membersLoading } = useQuery({
    queryKey: ["/api/v1/teams", selectedTeam?.id, "members"],
    queryFn: async () => {
      if (!selectedTeam) return [];
      const response = await apiRequest(`/api/v1/teams/${selectedTeam.id}/members`);
      return response.data;
    },
    enabled: !!selectedTeam,
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/v1/teams", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Team created successfully",
      });
      setIsCreateTeamOpen(false);
      setNewTeamData({
        name: "",
        description: "",
        planType: "free",
        maxMembers: 5,
        maxProjects: 10,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/teams"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
    },
  });

  // Invite member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/v1/teams/${selectedTeam?.id}/invite`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
      setIsInviteMemberOpen(false);
      setInviteData({
        email: "",
        role: "member",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  // Update member role mutation
  const updateMemberMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      return await apiRequest(`/api/v1/teams/${selectedTeam?.id}/members/${userId}`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member role updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/teams", selectedTeam?.id, "members"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner": return <Crown className="h-4 w-4 text-yellow-400" />;
      case "admin": return <Shield className="h-4 w-4 text-blue-400" />;
      case "member": return <User className="h-4 w-4 text-green-400" />;
      case "viewer": return <Eye className="h-4 w-4 text-gray-400" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner": return "bg-yellow-900/20 text-yellow-400 border-yellow-800";
      case "admin": return "bg-blue-900/20 text-blue-400 border-blue-800";
      case "member": return "bg-green-900/20 text-green-400 border-green-800";
      case "viewer": return "bg-gray-900/20 text-gray-400 border-gray-800";
      default: return "bg-gray-900/20 text-gray-400 border-gray-800";
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case "free": return "bg-gray-900/20 text-gray-400 border-gray-800";
      case "pro": return "bg-blue-900/20 text-blue-400 border-blue-800";
      case "enterprise": return "bg-purple-900/20 text-purple-400 border-purple-800";
      default: return "bg-gray-900/20 text-gray-400 border-gray-800";
    }
  };

  if (teamsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading teams...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-[hsl(188,95%,43%)]" />
            Team Management
          </h1>
          <p className="text-[hsl(215,20%,65%)] mt-2">
            Manage your teams, members, and collaboration settings
          </p>
        </div>
        
        <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[hsl(188,95%,43%)] hover:bg-[hsl(186,85%,57%)] text-[hsl(222,47%,11%)] font-medium">
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="glassmorphism">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="team-name" className="text-white">Team Name</Label>
                <Input
                  id="team-name"
                  value={newTeamData.name}
                  onChange={(e) => setNewTeamData({ ...newTeamData, name: e.target.value })}
                  className="dark-input"
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <Label htmlFor="team-description" className="text-white">Description</Label>
                <Textarea
                  id="team-description"
                  value={newTeamData.description}
                  onChange={(e) => setNewTeamData({ ...newTeamData, description: e.target.value })}
                  className="dark-input"
                  placeholder="Enter team description"
                />
              </div>
              <div>
                <Label htmlFor="plan-type" className="text-white">Plan Type</Label>
                <Select value={newTeamData.planType} onValueChange={(value) => setNewTeamData({ ...newTeamData, planType: value })}>
                  <SelectTrigger className="dark-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glassmorphism">
                    <SelectItem value="free">Free (5 members, 10 projects)</SelectItem>
                    <SelectItem value="pro">Pro (25 members, 50 projects)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (Unlimited)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => createTeamMutation.mutate(newTeamData)}
                disabled={createTeamMutation.isPending}
                className="w-full bg-[hsl(188,95%,43%)] hover:bg-[hsl(186,85%,57%)] text-[hsl(222,47%,11%)] font-medium"
              >
                {createTeamMutation.isPending ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams Grid */}
      {teams && teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team: Team) => (
            <Card 
              key={team.id} 
              className={`glassmorphism cursor-pointer transition-all hover:border-[hsl(188,95%,43%)] ${
                selectedTeam?.id === team.id ? 'ring-2 ring-[hsl(188,95%,43%)]' : ''
              }`}
              onClick={() => setSelectedTeam(team)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-[hsl(188,95%,43%)]" />
                    {team.name}
                  </CardTitle>
                  <Badge variant="outline" className={getPlanColor(team.planType)}>
                    {team.planType}
                  </Badge>
                </div>
                <p className="text-sm text-[hsl(215,20%,65%)] mt-2">{team.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[hsl(215,20%,65%)]">Your Role</span>
                    <Badge variant="outline" className={getRoleColor(team.role)}>
                      {getRoleIcon(team.role)}
                      <span className="ml-1 capitalize">{team.role}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[hsl(215,20%,65%)]">Members</span>
                    <span className="text-sm text-white">{team.memberCount}/{team.maxMembers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[hsl(215,20%,65%)]">Projects</span>
                    <span className="text-sm text-white">{team.projectCount}/{team.maxProjects}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[hsl(215,20%,65%)]">Owner</span>
                    <span className="text-sm text-white">{team.owner?.username || 'Unknown'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glassmorphism">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-[hsl(215,25%,27%)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[hsl(215,20%,65%)]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No teams yet</h3>
            <p className="text-[hsl(215,20%,65%)] mb-6">
              Create your first team to start collaborating with others
            </p>
            <Button
              onClick={() => setIsCreateTeamOpen(true)}
              className="bg-[hsl(188,95%,43%)] hover:bg-[hsl(186,85%,57%)] text-[hsl(222,47%,11%)] font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Team Details */}
      {selectedTeam && (
        <Card className="bg-shodan-surface/50 border-shodan-accent/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-shodan-text flex items-center gap-2">
                  <Users className="h-5 w-5 text-shodan-accent" />
                  {selectedTeam.name} Members
                </CardTitle>
                <p className="text-shodan-text/60 mt-1">Manage team members and permissions</p>
              </div>
              {(selectedTeam.role === "owner" || selectedTeam.role === "admin") && (
                <Dialog open={isInviteMemberOpen} onOpenChange={setIsInviteMemberOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-shodan-accent/30 hover:bg-shodan-accent/10">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-shodan-surface border-shodan-accent/30">
                    <DialogHeader>
                      <DialogTitle className="text-shodan-text">Invite Team Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="invite-email" className="text-shodan-text">Email</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          value={inviteData.email}
                          onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                          className="bg-shodan-surface border-shodan-accent/30 text-shodan-text"
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="invite-role" className="text-shodan-text">Role</Label>
                        <Select value={inviteData.role} onValueChange={(value) => setInviteData({ ...inviteData, role: value })}>
                          <SelectTrigger className="bg-shodan-surface border-shodan-accent/30 text-shodan-text">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-shodan-surface border-shodan-accent/30">
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={() => inviteMemberMutation.mutate(inviteData)}
                        disabled={inviteMemberMutation.isPending}
                        className="w-full bg-shodan-accent hover:bg-shodan-accent/90 text-shodan-bg"
                      >
                        {inviteMemberMutation.isPending ? "Sending..." : "Send Invitation"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <div className="text-center py-8">
                <div className="text-shodan-text">Loading members...</div>
              </div>
            ) : (
              <div className="space-y-3">
                {teamMembers?.map((member: TeamMember) => (
                  <div key={member.userId} className="flex items-center justify-between p-3 rounded-lg bg-shodan-surface/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-shodan-accent to-shodan-accent2 rounded-full flex items-center justify-center">
                        <span className="text-shodan-bg font-semibold">
                          {member.firstName?.[0] || member.username[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-shodan-text">
                          {member.firstName && member.lastName 
                            ? `${member.firstName} ${member.lastName}` 
                            : member.username}
                        </div>
                        <div className="text-sm text-shodan-text/60">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-shodan-text/60">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </div>
                      {(selectedTeam.role === "owner" || selectedTeam.role === "admin") && member.role !== "owner" ? (
                        <Select 
                          value={member.role} 
                          onValueChange={(value) => updateMemberMutation.mutate({ userId: member.userId, role: value })}
                        >
                          <SelectTrigger className="w-32 bg-shodan-surface border-shodan-accent/30 text-shodan-text">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-shodan-surface border-shodan-accent/30">
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className={getRoleColor(member.role)}>
                          {getRoleIcon(member.role)}
                          <span className="ml-1 capitalize">{member.role}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}