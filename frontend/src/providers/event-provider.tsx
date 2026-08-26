"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { eventService } from "@/services/event-service";
import { teamMembershipService } from "@/services/team-membership-service";
import { useAuth } from "@/hooks/use-auth";
import { Event } from "@/types/common/entities";

export interface EventContextType {
  events: Event[];
  selectedEventId: string | null;
  selectedEvent: Event | null;
  userTeamName: string | null;
  isOrganizer: boolean;
  isLoading: boolean;
  setSelectedEventId: (eventId: string) => void;
  refreshEvents: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventIdState] = useState<string | null>(null);
  const [userTeamName, setUserTeamName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshEvents = useCallback(async () => {
    if (!isAuthenticated) {
      setEvents([]);
      setSelectedEventIdState(null);
      setUserTeamName(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await eventService.getMyEvents();
      const eventList = data || [];
      setEvents(eventList);

      if (eventList.length > 0) {
        setSelectedEventIdState((prev) => {
          // 1. Check if user already had a valid selection in current session
          if (prev && eventList.some((e) => e.eventId === prev)) {
            return prev;
          }

          // 2. Check localStorage for previously saved active selection
          if (typeof window !== "undefined") {
            const savedId = localStorage.getItem("runsheet_selected_event_id");
            if (savedId && eventList.some((e) => e.eventId === savedId)) {
              return savedId;
            }
          }

          // 3. Select the event with status Active if one exists
          const activeEvt = eventList.find(
            (e) => (e.status as string) === "Active"
          );
          if (activeEvt) {
            if (typeof window !== "undefined") {
              localStorage.setItem("runsheet_selected_event_id", activeEvt.eventId);
            }
            return activeEvt.eventId;
          }

          // 4. Default to first event
          const firstId = eventList[0].eventId;
          if (typeof window !== "undefined") {
            localStorage.setItem("runsheet_selected_event_id", firstId);
          }
          return firstId;
        });
      } else {
        setSelectedEventIdState(null);
      }
    } catch (err) {
      console.error("Failed to load events in EventProvider:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

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
