# API Integration Specification Document

## 1. Overview
The RunSheet frontend communicates with the NestJS REST API backend. All HTTP requests pass through the centralized API client (`src/services/api/api-client.ts`). Direct `fetch()` calls inside UI components are forbidden.

---

## 2. API Base URL
The API base URL is resolved dynamically from environment variables:
`NEXT_PUBLIC_API_URL` (defaulting to `http://localhost:3000` in local environment).

---

## 3. Error Normalization (`ApiError`)
The backend returns error responses structured by `HttpExceptionFilter`:

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid credentials",
  "timestamp": "2026-08-20T22:23:28.000Z",
  "path": "/auth/login"
}
```

The frontend normalizes HTTP errors into an `ApiError` instance with:
- `statusCode`: HTTP status code (400, 401, 403, 404, 409, 422, 429, 500)
- `message`: User-friendly error message
- `details`: Detailed validation messages or error context
- `timestamp`: Server timestamp

---

## 4. Module API Services Reference

| Module | Service File | Key Methods | Backend Controller |
| :--- | :--- | :--- | :--- |
| **Auth** | `auth-service.ts` | `login`, `register`, `getProfile`, `logout` | `AuthController` |
| **Events** | `event-service.ts` | `createEvent`, `getMyEvents`, `getEventDetails`, `updateEvent`, `updateEventStatus`, `deleteEvent` | `EventController` |
| **Invitations** | `invitation-service.ts` | `inviteUser`, `getEventInvitations`, `getMyInvitations`, `acceptInvitation`, `rejectInvitation` | `InvitationController` |
| **Event Members** | `event-member-service.ts` | `getEventMembers`, `searchMembers`, `getMyMembership`, `removeMember` | `EventMemberController` |
| **Teams** | `team-service.ts` | `createTeam`, `getTeamsByEvent`, `getMyTeam`, `updateTeam`, `assignTeamLeader`, `deleteTeam` | `TeamController` |
| **Team Memberships** | `team-membership-service.ts` | `addMemberToTeam`, `getTeamMembers`, `transferMember`, `removeMember`, `getUnassignedMembers` | `TeamMembershipController` |
| **Tasks** | `task-service.ts` | `createTask`, `getTeamTasks`, `getEventTasks`, `searchTasks`, `updateTaskStatus`, `deleteTask` | `TaskController` |
| **Task Assignments** | `task-assignment-service.ts` | `assignMemberToTask`, `getMyAssignedTasks`, `updateAssignmentStatus`, `removeAssignment` | `TaskAssignmentController` |
| **Notifications** | `notification-service.ts` | `getMyNotifications`, `markAllAsRead`, `sendGeneralAnnouncement`, `markAsRead` | `NotificationController` |
| **Dashboard** | `dashboard-service.ts` | `getMemberDashboard`, `getMyTasks`, `getOrganizerDashboard`, `getEventStatistics`, `getTimeline` | `DashboardController` |
| **Users** | `user-service.ts` | `getProfile` | `UsersController` |
