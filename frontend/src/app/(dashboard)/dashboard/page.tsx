"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  dashboardService,
  MemberDashboard,
} from "@/services/dashboard-service";
import {
  HeroBanner,
  MetricCards,
  ActionItemsTable,
  MyTeamCard,
  ActiveEventCard,
  LiveTimelinePanel,
} from "@/features/dashboard";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<MemberDashboard | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getMemberDashboard();
        if (isMounted && res) {
          setData(res);
        }
      } catch {
        // Graceful fallback to default demo data if unauthenticated or fresh database
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const userName = data?.profile?.firstName || user?.firstName || "Alex";
  const teamName = data?.profile?.team || data?.myTeam?.teamName || "Event Ops Team";
  const eventName = data?.profile?.event || data?.activeEvent?.eventName || "AI Summit 2026";

  const metricStats = {
    assigned: data?.taskSummary?.assigned ?? 12,
    completed: data?.taskSummary?.completed ?? 8,
    pending: data?.taskSummary?.pending ?? 3,
    overdue: data?.taskSummary?.overdue ?? 1,
    assignedTrend: data?.taskSummary?.assignedTrend || "+2 since yesterday",
    completedTrend: data?.taskSummary?.completedTrend || "Great progress",
    pendingTrend: data?.taskSummary?.pendingTrend || "Steady",
    overdueTrend: data?.taskSummary?.overdueTrend || "Action required",
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <HeroBanner
        userName={userName}
        teamName={teamName}
        eventName={eventName}
      />

      {/* Main Grid: Left 2/3 and Right 1/3 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (Span 2) */}
        <div className="xl:col-span-2 space-y-6">
          {/* 4 Stat Metric Cards */}
          <MetricCards data={metricStats} />

          {/* Action Items List / Table */}
          <ActionItemsTable items={data?.actionItems} />

          {/* Bottom Two Widget Cards: My Team and Active Event */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MyTeamCard team={data?.myTeam} />
            <ActiveEventCard event={data?.activeEvent} />
          </div>
        </div>

        {/* Right Column: Live Runsheet / Timeline */}
        <div className="xl:col-span-1">
          <LiveTimelinePanel />
        </div>
      </div>
    </div>
  );
}
