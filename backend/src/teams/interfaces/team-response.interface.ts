export interface TeamLeaderUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhotoUrl?: string | null;
}

export interface TeamLeaderInfo {
  teamMembershipId: string;
  eventMemberId: string;
  user: TeamLeaderUser;
}

export interface TeamListItem {
  teamId: string;
  eventId: string;
  teamName: string;
  description: string | null;
  leaderMembershipId: string | null;
  leaderName: string | null;
  leader: TeamLeaderInfo | null;
  memberCount: number;
  taskCount: number;
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

export interface TeamDetailsResponse {
  teamId: string;
  eventId: string;
  teamName: string;
  description: string | null;
  leaderMembershipId: string | null;
  leaderName: string | null;
  leader: TeamLeaderInfo | null;
  event: EventInfoSummary;
  memberCount: number;
  taskCount: number;
  createdAt: Date;
  updatedAt: Date;
}
