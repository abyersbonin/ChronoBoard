import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { WeatherStrip } from "@/components/weather-strip";
import { CurrentEvent } from "@/components/current-event";
import { UpcomingEvents } from "@/components/upcoming-events";
import { SidePanel } from "@/components/side-panel";
import { type CalendarEvent, type Settings } from "@shared/schema";
import { signInToGoogle } from "@/lib/google-calendar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const DEFAULT_USER_ID = "default-user";

export default function Dashboard() {
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/settings', DEFAULT_USER_ID],
    queryFn: async () => {
      const response = await fetch(`/api/settings/${DEFAULT_USER_ID}`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json() as Promise<Settings>;
    },
  });

  // Fetch calendar events
  const { data: events = [], isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['/api/calendar-events', DEFAULT_USER_ID],
    queryFn: async () => {
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const response = await fetch(
        `/api/calendar-events/${DEFAULT_USER_ID}?start=${now.toISOString()}&end=${oneWeekFromNow.toISOString()}`
      );
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json() as Promise<CalendarEvent[]>;
    },
    refetchInterval: settings?.autoRefresh ? 5 * 60 * 1000 : false, // 5 minutes if auto-refresh enabled
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<Settings>) => {
      const response = await apiRequest('PUT', `/api/settings/${DEFAULT_USER_ID}`, newSettings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings', DEFAULT_USER_ID] });
    },
  });

  // Google Calendar sync mutation
  const syncCalendarMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/sync-google-calendar/${DEFAULT_USER_ID}`, {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-events', DEFAULT_USER_ID] });
      toast({
        title: "Synchronisation réussie",
        description: `${data.eventCount} événements synchronisés.`,
      });
    },
    onError: () => {
      toast({
        title: "Erreur de synchronisation",
        description: "Veuillez connecter votre compte Google Calendar.",
        variant: "destructive",
      });
    },
  });

  // Find current event
  useEffect(() => {
    if (events.length === 0) {
      setCurrentEvent(null);
      return;
    }

    const now = new Date();
    const ongoing = events.find(event => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      return start <= now && end > now;
    });

    setCurrentEvent(ongoing || null);
  }, [events]);

  // Get upcoming events (not including current)
  const upcomingEvents = events.filter(event => {
    const start = new Date(event.startTime);
    const now = new Date();
    return start > now;
  });

  const handleConnectGoogleCalendar = async () => {
    try {
      const accessToken = await signInToGoogle();
      await updateSettingsMutation.mutateAsync({ 
        googleCalendarToken: accessToken 
      });
      await syncCalendarMutation.mutateAsync();
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à Google Calendar.",
        variant: "destructive",
      });
    }
  };

  const handleSyncCalendar = async () => {
    if (!settings?.googleCalendarToken) {
      await handleConnectGoogleCalendar();
    } else {
      await syncCalendarMutation.mutateAsync();
    }
  };

  const handleImageUpload = async (imageUrl: string) => {
    await updateSettingsMutation.mutateAsync({ headerImageUrl: imageUrl });
  };

  const handleToggleAutoRefresh = async (enabled: boolean) => {
    await updateSettingsMutation.mutateAsync({ autoRefresh: enabled });
  };

  const handleToggle24Hour = async (enabled: boolean) => {
    await updateSettingsMutation.mutateAsync({ use24Hour: enabled });
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-dashboard-dark flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-dark text-white font-sans">
      <DashboardHeader
        title={settings?.dashboardTitle || "Personal Dashboard"}
        backgroundImageUrl={settings?.headerImageUrl || undefined}
        onImageUpload={handleImageUpload}
      />

      <div className="container mx-auto px-6 py-8">
        <WeatherStrip location={settings?.location || "Montreal"} />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CurrentEvent event={currentEvent} />
            <UpcomingEvents events={upcomingEvents} />
          </div>

          <SidePanel
            onSyncCalendar={handleSyncCalendar}
            isCalendarConnected={!!settings?.googleCalendarToken}
            lastSync={undefined} // Could be stored in settings if needed
            autoRefresh={settings?.autoRefresh || false}
            use24Hour={settings?.use24Hour || false}
            onToggleAutoRefresh={handleToggleAutoRefresh}
            onToggle24Hour={handleToggle24Hour}
          />
        </div>
      </div>
    </div>
  );
}
