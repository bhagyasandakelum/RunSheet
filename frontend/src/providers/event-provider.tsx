"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { eventService } from "@/services/event-service";
import { teamMembershipService } from "@/services/team-membership-service";
import { useAuth } from "@/hooks/use-auth";
import { getAuthToken } from "@/lib/auth/cookies";
import { Event } from "@/types/common/entities";

export interface EventContextType {
  events: Event[];
  selectedEventId: string | null;
  selectedEvent: Event | null;
  userTeamName: string | null;
  isOrganizer: boolean;
  isLoading: boolean;
  setSelectedEventId: (eventId: string) => void;
  refreshEvents: (preferredEventId?: string) => Promise<Event[]>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("runsheet_selected_event_id");
    }
    return null;
  });
  const [userTeamName, setUserTeamName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshEvents = useCallback(async (preferredEventId?: string): Promise<Event[]> => {
    const token = getAuthToken();
    if (!token && !isAuthenticated) {
      setEvents([]);
      setSelectedEventIdState(null);
      setUserTeamName(null);
      setIsLoading(false);
      return [];
    }

    try {
      setIsLoading(true);
      const data = await eventService.getMyEvents();
      const eventList = Array.isArray(data) ? data : [];
      setEvents(eventList);

      if (eventList.length > 0) {
        const targetId = preferredEventId;

        // 1. If preferred ID was requested and exists in list, pick it
        if (targetId && eventList.some((e) => e.eventId === targetId)) {
          setSelectedEventIdState(targetId);
          if (typeof window !== "undefined") {
            localStorage.setItem("runsheet_selected_event_id", targetId);
          }
          return eventList;
        }

        // 2. Check current state / saved ID in localStorage
        const savedId = typeof window !== "undefined" ? localStorage.getItem("runsheet_selected_event_id") : null;
        if (savedId && eventList.some((e) => e.eventId === savedId)) {
          setSelectedEventIdState(savedId);
          return eventList;
        }

        // 3. Pick the active event
        const activeEvt = eventList.find(
          (e) => (e.status as string) === "Active"
        );
        if (activeEvt) {
          setSelectedEventIdState(activeEvt.eventId);
          if (typeof window !== "undefined") {
            localStorage.setItem("runsheet_selected_event_id", activeEvt.eventId);
          }
          return eventList;
        }

        // 4. Default to the first event
        const firstId = eventList[0].eventId;
        setSelectedEventIdState(firstId);
        if (typeof window !== "undefined") {
          localStorage.setItem("runsheet_selected_event_id", firstId);
        }
      } else {
        setSelectedEventIdState(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("runsheet_selected_event_id");
        }
      }

      return eventList;
    } catch (err) {
      console.error("Failed to load events in EventProvider:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthLoading) {
      refreshEvents();
    }
  }, [refreshEvents, isAuthLoading]);

  // When selectedEventId or user changes, fetch user's team membership for that event
  useEffect(() => {
    let isMounted = true;

    const fetchTeamInfo = async () => {
      if (!selectedEventId || !user) {
        if (isMounted) setUserTeamName(null);
        return;
      }

      const activeEvent = events.find((e) => e.eventId === selectedEventId);
      const isEventOrganizer = activeEvent?.organizerId === user.userId;

      try {
        const membership = await teamMembershipService.getMyTeamMembership(selectedEventId);
        if (!isMounted) return;

        if (membership && membership.team) {
          const isLeader =
            membership.team.leaderMembershipId === membership.teamMembershipId ||
            Boolean(membership.leadingTeam);
          setUserTeamName(
            isLeader
              ? `${membership.team.teamName} (Lead)`
              : membership.team.teamName
          );
        } else if (isEventOrganizer) {
          setUserTeamName("Event Organizer");
        } else {
          setUserTeamName("Event Member");
        }
      } catch {
        if (isMounted) {
          setUserTeamName(isEventOrganizer ? "Event Organizer" : "Event Member");
        }
      }
    };

    fetchTeamInfo();

    return () => {
      isMounted = false;
    };
  }, [selectedEventId, user, events]);

  const setSelectedEventId = (eventId: string) => {
    setSelectedEventIdState(eventId);
    if (typeof window !== "undefined") {
      localStorage.setItem("runsheet_selected_event_id", eventId);
    }
  };

  const selectedEvent = events.find((e) => e.eventId === selectedEventId) || null;
  const isOrganizer = Boolean(user && selectedEvent && selectedEvent.organizerId === user.userId);

  return (
    <EventContext.Provider
      value={{
        events,
        selectedEventId,
        selectedEvent,
        userTeamName,
        isOrganizer,
        isLoading,
        setSelectedEventId,
        refreshEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
};
