-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('Draft', 'Planning', 'Active', 'Completed', 'Cancelled', 'Archived');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('Pending', 'Accepted', 'Rejected', 'Expired');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('Pending', 'InProgress', 'OnHold', 'Completed', 'Cancelled', 'Overdue');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('Low', 'Medium', 'High', 'Critical');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('Assigned', 'InProgress', 'Completed');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TaskAssigned', 'TaskUpdated', 'TaskCompleted', 'DeadlineReminder', 'TaskOverdue', 'TeamInvitation', 'EventInvitation', 'GeneralAnnouncement');
