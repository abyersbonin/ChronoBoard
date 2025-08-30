import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { CurrentEvent } from "@/components/current-event";
import { UpcomingEvents } from "@/components/upcoming-events";
import { SidePanel } from "@/components/side-panel";
import { SpaBackground } from "@/components/spa-background";
import { FullscreenButton } from "@/components/fullscreen-button";
import { WeatherWidget } from "@/components/weather-widget";
import { LanguageToggle } from "@/components/language-toggle";
import spaHeaderImage from "@assets/spa-eastman_pavillon-pricipal_levee-du-soleil_face_credit-auqueb-4-scaled-e1736788112766_1753560070028.jpg";
import { type CalendarEvent, type Settings } from "@shared/schema";
import { syncIcalCalendar, updateIcalUrls } from "@/lib/ical-calendar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";

const DEFAULT_USER_ID = "default-user";

export default function Dashboard() {
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'unstable'>('online');
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [lastSuccessfulConnection, setLastSuccessfulConnection] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  
  // Mobile device detection (excluding TV browsers)
  const [isMobile, setIsMobile] = useState(false);
  
  // Auto-scroll-to-top functionality
  const scrollToTopTimer = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionTime = useRef<number>(Date.now());

  // Function to scroll to top smoothly
  const scrollToTop = () => {
    console.log('Auto-scrolling to top due to inactivity...');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function to check if page is scrolled down
  const isPageScrolledDown = () => {
    return window.scrollY > 100; // Consider scrolled if more than 100px from top
  };

  // Function to check if any event description dialog is open
  const isEventDialogOpen = () => {
    // Check for modal backdrop or dialog containers in the DOM
    const modalBackdrop = document.querySelector('[style*="z-index: 1000000"]');
    const dialogContainer = document.querySelector('[data-modal-content="true"]');
    return modalBackdrop !== null || dialogContainer !== null;
  };

  // Function to start scroll-to-top timer
  const startScrollToTopTimer = () => {
    if (scrollToTopTimer.current) {
      clearTimeout(scrollToTopTimer.current);
    }
    
    console.log('Starting 2.5-minute scroll-to-top timer...');
    lastInteractionTime.current = Date.now();
    
    scrollToTopTimer.current = setTimeout(() => {
      const timeSinceLastInteraction = Date.now() - lastInteractionTime.current;
      const dialogOpen = isEventDialogOpen();
      console.log(`Scroll timer fired. Time since last interaction: ${timeSinceLastInteraction}ms, Page scrolled: ${isPageScrolledDown()}, Dialog open: ${dialogOpen}`);
      
      // Only scroll to top if: page is scrolled down AND user is inactive AND no dialog is open
      if (timeSinceLastInteraction >= 149000 && isPageScrolledDown() && !dialogOpen) {
        scrollToTop();
      } else if (dialogOpen) {
        console.log('Auto-scroll prevented: Event description dialog is open');
        // Restart timer since we prevented scroll due to open dialog
        startScrollToTopTimer();
      }
    }, 150000); // 2 minutes 30 seconds = 150,000ms
  };

  // Function to reset scroll-to-top timer
  const resetScrollToTopTimer = () => {
    lastInteractionTime.current = Date.now();
    if (scrollToTopTimer.current) {
      clearTimeout(scrollToTopTimer.current);
    }
    startScrollToTopTimer(); // Restart the timer
  };

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

  // Auto-scroll-to-top interaction tracking
  useEffect(() => {
    const handleUserInteraction = (event: Event) => {
      console.log('User interaction for scroll timer:', event.type);
      resetScrollToTopTimer();
    };

    // Track deliberate user interactions
    document.addEventListener('mousedown', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('scroll', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('click', handleUserInteraction);

    // Start the initial timer
    startScrollToTopTimer();

    return () => {
      document.removeEventListener('mousedown', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
      
      // Clean up timer
      if (scrollToTopTimer.current) {
        clearTimeout(scrollToTopTimer.current);
      }
    };
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

  // Fetch calendar events with retry logic and local cache fallback
  const { data: events = [], isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['/api/calendar-events', DEFAULT_USER_ID],
    queryFn: async () => {
      const cacheKey = `spa-events-${DEFAULT_USER_ID}`;
      
      try {
        // Fetch all events with timeout using AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`/api/calendar-events/${DEFAULT_USER_ID}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.error(`Failed to fetch events: ${response.status} ${response.statusText}`);
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json() as CalendarEvent[];
        console.log(`Successfully loaded ${data.length} events from server`);
        
        // Update network status and connection tracking
        setNetworkStatus('online');
        setLastSuccessfulConnection(Date.now());
        setRetryAttempts(0);
        
        // Cache successful response
        if (data.length > 0) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              events: data,
              timestamp: Date.now()
            }));
            console.log(`Cached ${data.length} events locally`);
          } catch (cacheError) {
            console.warn('Failed to cache events locally:', cacheError);
          }
        }
        
        return data;
      } catch (error) {
        console.error('API request failed, trying local cache...', error);
        
        // Update network status
        const currentRetries = retryAttempts + 1;
        setRetryAttempts(currentRetries);
        
        if (currentRetries >= 3) {
          setNetworkStatus('unstable');
        } else if (navigator.onLine === false) {
          setNetworkStatus('offline');
        }
        
        // Try to load from local cache
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const cachedData = JSON.parse(cached);
            const isRecent = (Date.now() - cachedData.timestamp) < 60 * 60 * 1000; // Less than 1 hour old
            
            if (isRecent && cachedData.events.length > 0) {
              console.log(`Loaded ${cachedData.events.length} events from local cache`);
              
              const statusMessage = networkStatus === 'offline' 
                ? "Réseau indisponible - Affichage des activités en cache"
                : "Problème de connexion - Utilisation des activités en cache";
              
              toast({
                title: "Mode hors ligne",
                description: statusMessage,
                variant: "default",
              });
              return cachedData.events;
            }
          }
        } catch (cacheError) {
          console.error('Failed to load from cache:', cacheError);
        }
        
        throw error;
      }
    },
    retry: 5, // Retry failed requests up to 5 times for tablets
    retryDelay: attemptIndex => Math.min(2000 * 2 ** attemptIndex, 15000), // Faster exponential backoff
    refetchInterval: 15 * 60 * 1000, // Refresh every 15 minutes - minimal interference
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
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
          // Don't invalidate cache automatically to prevent jarring reloads
          // queryClient.invalidateQueries({ queryKey: ['/api/calendar-events', DEFAULT_USER_ID] });
          console.log(`Calendar automatically synchronized: ${data.eventCount} events`);
        } else {
          console.error('Auto-sync failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    };

    // Initial sync after component loads (wait 20 seconds to allow manual loading first)
    const initialSyncTimer = setTimeout(performAutoSync, 20000);

    // Set up recurring sync every 30 minutes (much less aggressive)
    const autoSyncInterval = setInterval(performAutoSync, 30 * 60 * 1000);

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
    const ongoing = events.find((event: CalendarEvent) => {
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

  // Force refresh when page becomes visible (tablet wake-up fix)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && events.length === 0) {
        console.log('Page became visible with no events, forcing refresh...');
        setTimeout(() => refetchEvents(), 1000);
      }
    };
    
    const handleFocus = () => {
      if (events.length === 0) {
        console.log('Window focused with no events, forcing refresh...');
        setTimeout(() => refetchEvents(), 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [events.length, refetchEvents]);

  // Auto-retry if no events are loaded (more aggressive for tablets)
  useEffect(() => {
    if (!eventsLoading && events.length === 0) {
      let retryCount = 0;
      const maxRetries = 5;
      
      const performRetry = () => {
        retryCount++;
        console.log(`No events found, retry attempt ${retryCount}/${maxRetries}`);
        refetchEvents();
        
        if (retryCount < maxRetries) {
          // Exponential backoff: 3s, 6s, 12s, 24s, 48s
          const delay = 3000 * Math.pow(2, retryCount - 1);
          setTimeout(performRetry, delay);
        }
      };
      
      // Start first retry after 3 seconds
      const initialTimer = setTimeout(performRetry, 3000);
      
      return () => clearTimeout(initialTimer);
    }
  }, [eventsLoading, events.length, refetchEvents]);

  // Get upcoming events for the next 3 full days (not including current)
  const upcomingEvents = events.filter((event: CalendarEvent) => {
    const start = new Date(event.startTime);
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999); // End of the third day
    
    return start > now && start <= threeDaysFromNow;
  }).sort((a: CalendarEvent, b: CalendarEvent) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

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

  // Only show loading if both settings and events are loading initially
  if (settingsLoading && eventsLoading && !events.length) {
    return (
      <div className="min-h-screen bg-dashboard-dark flex items-center justify-center">
        <div className="text-white">{t ? t('loading') : 'Chargement...'}</div>
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

          {/* Language toggle positioned absolute top-right */}
          <div className="absolute right-6 top-6 z-20">
            <LanguageToggle />
          </div>

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
                {/* Text positioned above */}
                <div className="text-white text-sm drop-shadow-md text-center mb-2">
                  {t('mobile.qr.title').split('\n').map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
                
                {/* QR Code centered below text */}
                <div className="bg-white p-3 rounded-lg shadow-lg mx-auto w-fit">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://spa-eastman.org" 
                    alt="QR Code"
                    className="w-24 h-24"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Manual Refresh Button - Show if no events loaded */}
          {!eventsLoading && events.length === 0 && (
            <div className={`absolute ${isMobile ? 'bottom-20 left-1/2' : 'bottom-24 left-1/2'} transform -translate-x-1/2 z-20`}>
              <button
                onClick={() => {
                  console.log('Manual refresh triggered');
                  refetchEvents();
                }}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 shadow-lg"
                data-testid="button-manual-refresh"
              >
                🔄 {t('refresh.manual') || 'Actualiser'}
              </button>
            </div>
          )}

          {/* Weather Widget - Positioned at bottom right corner of header */}
          <div className={`absolute ${isMobile ? 'bottom-3 right-3' : 'bottom-6 right-6'} z-20 animate-slide-in-right`}>
            <WeatherWidget location={settings?.location || "Eastman"} language={language} />
          </div>

        </div>
      </div>

      {/* Main Content - Add top margin to account for fixed header */}
      <div className={`relative z-10 w-full ${isMobile ? 'px-2 py-4' : 'px-6 py-8'}`} style={{ marginTop: isMobile ? '250px' : '350px' }}>
        <div className="grid gap-8 grid-cols-1">
          <div className="col-span-1">
            {/* Show loading or error state for events */}
            {eventsLoading && events.length === 0 && (
              <div className="text-center text-white/70 py-8">
                <div className="animate-pulse">
                  🔄 {t('events.loading') || 'Chargement des activités...'}
                </div>
              </div>
            )}
            
            {/* Show retry indicator if events failed to load */}
            {!eventsLoading && events.length === 0 && (
              <div className="text-center text-white/70 py-8">
                <div className="mb-4">
                  ⚠️ {t('events.no_data') || 'Aucune activité trouvée'}
                </div>
                <div className="text-sm opacity-75">
                  {t('events.retry_info') || 'Tentatives de rechargement en cours...'}
                </div>
              </div>
            )}
            
            {/* Show events if loaded */}
            {events.length > 0 && (
              <>
                <div className="animate-fade-in-up">
                  <CurrentEvent event={currentEvent} language={language} />
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <UpcomingEvents events={upcomingEvents} language={language} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
