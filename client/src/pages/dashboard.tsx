import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { CurrentEvent } from "@/components/current-event";
import { UpcomingEvents } from "@/components/upcoming-events";
import { SidePanel } from "@/components/side-panel";
import { SpaBackground } from "@/components/spa-background";
import { FullscreenButton } from "@/components/fullscreen-button";
import { WeatherWidget } from "@/components/weather-widget";
import spaHeaderImage from "@assets/spa-eastman_pavillon-pricipal_levee-du-soleil_face_credit-auqueb-4-scaled-e1736788112766_1753560070028.jpg";
import { type CalendarEvent, type Settings } from "@shared/schema";
import { syncIcalCalendar, updateIcalUrls } from "@/lib/ical-calendar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

const DEFAULT_USER_ID = "default-user";

export default function Dashboard() {
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  
  // Mobile device detection (excluding TV browsers)
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const detectMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      
      // Exclude TV browsers (webOS, Tizen, etc.)
      const isTVBrowser = /webos|tizen|smart-tv|smarttv/.test(userAgent);
      
      // Check for mobile user agents
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      
      // Mobile if: (touch device AND small screen AND mobile UA) AND NOT TV browser
      const mobile = (isTouchDevice && isSmallScreen && isMobileUA) && !isTVBrowser;
      
      setIsMobile(mobile);
    };
    
    detectMobile();
    window.addEventListener('resize', detectMobile);
    
    return () => window.removeEventListener('resize', detectMobile);
  }, []);

  // Fetch settings - only if admin is logged in
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/settings', DEFAULT_USER_ID],
    queryFn: async () => {
      const response = await fetch(`/api/settings/${DEFAULT_USER_ID}`);
      if (!response.ok) {
        if (response.status === 401) {
          // Return default settings for unauthorized users
          return {
            id: DEFAULT_USER_ID,
            userId: DEFAULT_USER_ID,
            dashboardTitle: "Spa Eastman",
            headerImageUrl: null,
            autoRefresh: true,
            use24Hour: true,
            icalUrls: [],
            location: "Eastman"
          };
        }
        throw new Error('Failed to fetch settings');
      }
      return response.json() as Promise<Settings>;
    },
  });

  // Fetch calendar events
  const { data: events = [], isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['/api/calendar-events', DEFAULT_USER_ID],
    queryFn: async () => {
      // Fetch all events without date filtering to get current and upcoming events
      const response = await fetch(`/api/calendar-events/${DEFAULT_USER_ID}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json() as Promise<CalendarEvent[]>;
    },
    refetchInterval: 60 * 1000, // Refresh every 60 seconds - optimized for TV performance
  });

  // Update settings mutation - only if admin is logged in
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<Settings>) => {
      if (!isLoggedIn) {
        throw new Error('Admin authentication required');
      }
      const response = await apiRequest('PUT', `/api/settings/${DEFAULT_USER_ID}`, newSettings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings', DEFAULT_USER_ID] });
    },
    onError: (error: any) => {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        toast({
          title: "Accès refusé",
          description: "Veuillez vous connecter en tant qu'administrateur.",
          variant: "destructive",
        });
      }
    },
  });

  // iCal Calendar sync mutation - only if admin is logged in
  const syncCalendarMutation = useMutation({
    mutationFn: async () => {
      if (!isLoggedIn) {
        throw new Error('Admin authentication required');
      }
      return syncIcalCalendar(DEFAULT_USER_ID);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-events', DEFAULT_USER_ID] });
      toast({
        title: "Synchronisation réussie",
        description: `${data.eventCount} événements synchronisés.`,
      });
    },
    onError: (error: any) => {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        toast({
          title: "Accès refusé",
          description: "Veuillez vous connecter en tant qu'administrateur pour synchroniser les calendriers.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur de synchronisation",
          description: "Impossible de synchroniser les calendriers iCal.",
          variant: "destructive",
        });
      }
    },
  });

  // Automatic calendar sync every 5 minutes - works for everyone
  useEffect(() => {
    console.log('Setting up auto-sync...');

    // Function to perform automatic sync for everyone
    const performAutoSync = async () => {
      try {
        console.log('Starting automatic calendar sync...');
        
        // Make direct API call (no admin auth needed anymore)
        const response = await fetch(`/api/sync-ical-calendar/${DEFAULT_USER_ID}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          queryClient.invalidateQueries({ queryKey: ['/api/calendar-events', DEFAULT_USER_ID] });
          console.log(`Calendar automatically synchronized: ${data.eventCount} events`);
        } else {
          console.error('Auto-sync failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    };

    // Initial sync after component loads (wait 10 seconds)
    const initialSyncTimer = setTimeout(performAutoSync, 10000);

    // Set up recurring sync every 5 minutes
    const autoSyncInterval = setInterval(performAutoSync, 5 * 60 * 1000);

    return () => {
      clearTimeout(initialSyncTimer);
      clearInterval(autoSyncInterval);
    };
  }, [queryClient]); // Only re-run when queryClient changes

  // Real-time current event detection with separate timer
  const checkCurrentEvent = () => {
    if (events.length === 0) {
      setCurrentEvent(null);
      return;
    }

    const now = new Date();
    
    // Check ALL events for ongoing status
    const ongoing = events.find(event => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      return start <= now && end > now;
    });

    setCurrentEvent(ongoing || null);
  };

  // Check for current events when events data changes
  useEffect(() => {
    checkCurrentEvent();
  }, [events]);

  // Add real-time timer to check for current events every 15 seconds
  useEffect(() => {
    const timer = setInterval(checkCurrentEvent, 15 * 1000); // Check every 15 seconds
    return () => clearInterval(timer);
  }, [events]); // Recreate timer when events change

  // Get upcoming events for the next 3 full days (not including current)
  const upcomingEvents = events.filter(event => {
    const start = new Date(event.startTime);
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999); // End of the third day
    
    return start > now && start <= threeDaysFromNow;
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const handleSyncCalendar = async () => {
    if (!settings?.icalUrls || settings.icalUrls.length === 0) {
      // Initialize with the provided iCal URLs
      const icalUrls = [
        "https://calendar.google.com/calendar/ical/spaeastman%40gmail.com/public/basic.ics",
        "https://calendar.google.com/calendar/ical/8d3d8be71aeb3eb924d665432be0d7dc1279067af9cff69349b6162da0ede4a7%40group.calendar.google.com/public/basic.ics",
        "https://calendar.google.com/calendar/ical/9402bc300e03b7e49456423cdcb12942bd7a9b4eceb5607401ea5a1b2dff92ae%40group.calendar.google.com/public/basic.ics",
        "https://calendar.google.com/calendar/embed?src=c3e052beb9103bf681ce6afe95c864b38f044dfe2f757333eecef723cd03607a%40group.calendar.google.com&ctz=America%2FToronto",
        "https://calendar.google.com/calendar/embed?src=4dfbddf3ad676641adfc936d8909d34e9f95c878f5e84519fd265f7f833f1da6%40group.calendar.google.com&ctz=America%2FToronto"
      ];
      
      await updateSettingsMutation.mutateAsync({ icalUrls });
    }
    await syncCalendarMutation.mutateAsync();
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
    <div className="min-h-screen bg-white text-white font-sans relative">
      {/* Fixed Header with Spa Image Background */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div 
          className="relative overflow-hidden"
          style={{
            backgroundImage: `url(${spaHeaderImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 60%',
            backgroundRepeat: 'no-repeat',
            height: isMobile ? '250px' : '350px',
            imageRendering: 'auto'
          }}
        >
          {/* Simplified overlay for TV performance */}
          <div className="absolute inset-0 bg-black opacity-25"></div>
          
          {/* Fullscreen button positioned absolute top-left - hide on mobile */}
          {!isMobile && (
            <div className="absolute left-6 top-6 z-20">
              <FullscreenButton />
            </div>
          )}

          {/* Logo at the very top center */}
          <div className={`absolute ${isMobile ? 'top-3' : 'top-6'} left-1/2 transform -translate-x-1/2 z-10`}>
            <img 
              src="https://www.spa-eastman.com/wp-content/themes/spa-eastman/assets/images/logo-spa-1977-blanc-fr.svg" 
              alt="Spa Eastman" 
              className={`${isMobile ? 'h-12' : 'h-20'} drop-shadow-lg`}
              style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))' }}
            />
          </div>
          
          {/* QR Code section on the left - hide on mobile */}
          {!isMobile && (
            <div className="absolute bottom-6 left-16">
              <div className="relative">
                {/* Text positioned above with arrow */}
                <div className="text-white text-sm drop-shadow-md text-center mb-2">
                  <div>Consulter sur votre<br />appareil mobile</div>
                  <div className="flex justify-center mt-1">
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      className="drop-shadow-md"
                    >
                      <path 
                        d="M12 16l-6-6h12l-6 6z" 
                        fill="white"
                      />
                    </svg>
                  </div>
                </div>
                
                {/* QR Code centered below text */}
                <div className="bg-white p-3 rounded-lg shadow-lg mx-auto w-fit">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://chrono-board-tarnrsps.replit.app/" 
                    alt="QR Code"
                    className="w-24 h-24"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Weather Widget - Positioned at bottom right corner of header */}
          <div className={`absolute ${isMobile ? 'bottom-3 right-3' : 'bottom-6 right-6'} z-20`}>
            <WeatherWidget location={settings?.location || "Eastman"} />
          </div>

        </div>
      </div>

      {/* Main Content - Add top margin to account for fixed header */}
      <div className={`relative z-10 w-full ${isMobile ? 'px-2 py-4' : 'px-6 py-8'}`} style={{ marginTop: isMobile ? '250px' : '350px' }}>
        <div className="grid gap-8 grid-cols-1">
          <div className="col-span-1">
            <CurrentEvent event={currentEvent} />
            <UpcomingEvents events={upcomingEvents} />
          </div>
        </div>
      </div>
    </div>
  );
}
