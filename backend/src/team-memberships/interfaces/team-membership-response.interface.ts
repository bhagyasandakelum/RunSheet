export interface TeamMemberListItem {
  teamMembershipId: string;
  eventMemberId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhotoUrl: string | null;
  joinedAt: Date;
  isLeader: boolean;
  eventMember?: {
    eventMemberId: string;
    user: {
      userId?: string;
      firstName: string;
      lastName: string;
      email: string;
      profilePhotoUrl: string | null;
    };
  };
  user?: {
    userId?: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePhotoUrl: string | null;
  };
}

export interface TeamMemberUserInfo {
  eventMemberId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profilePhotoUrl: string | null;
}

export interface TeamInfoSummary {
  teamId: string;
  teamName: string;
  description: string | null;
  eventId: string;
  leaderMembershipId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventInfoSummary {
  eventId: string;
  eventName: string;
  status: string;
  organizerId: string;
  venue?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface TeamMembershipDetailsResponse {
  teamMembershipId: string;
  team: TeamInfoSummary;
  event: EventInfoSummary;
  member: TeamMemberUserInfo;
  joinedAt: Date;
  assignedTaskCount: number;
  completedTaskCount: number;
}

export interface UnassignedMemberListItem {
  eventMemberId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhotoUrl: string | null;
  joinedAt: Date;
}

export interface MyTeamMembershipResponse {
  teamMembershipId: string;
  team: TeamInfoSummary;
  event: EventInfoSummary;
  isLeader: boolean;
  joinedAt: Date;
}

export interface TeamStatisticsResponse {
  teamName: string;
  memberCount: number;
  leaderName: string | null;
  activeTasks: number;
  completedTasks: number;
  pendingTasks: number;
}
