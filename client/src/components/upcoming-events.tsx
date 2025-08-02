import { MapPin } from "lucide-react";
import { type CalendarEvent } from "@shared/schema";
import { EventDetailsDialog } from "./event-details-dialog";
import { useState, useEffect } from "react";

interface UpcomingEventsProps {
  events: CalendarEvent[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  
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

  // Decode HTML entities in text
  const decodeHtmlEntities = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  // Get badge color based on calendar source
  const getBadgeColor = (calendarSource: string | null) => {
    if (!calendarSource) return 'bg-gray-500';
    
    // Generate consistent colors based on calendar source
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-red-500'
    ];
    
    // Simple hash function to consistently assign colors
    let hash = 0;
    for (let i = 0; i < calendarSource.length; i++) {
      hash = ((hash << 5) - hash) + calendarSource.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Get calendar display name from source
  const getCalendarName = (calendarSource: string | null) => {
    if (!calendarSource) return 'GÉNÉRAL';
    
    // Extract a short name from the calendar source
    if (calendarSource.includes('spaeastman')) return 'PRINCIPAL';
    if (calendarSource.includes('group.calendar.google.com')) {
      // Try to extract meaningful name from group calendar ID
      const match = calendarSource.match(/([a-f0-9]{64})/);
      if (match) {
        const id = match[1];
        // Map known calendar IDs to names
        if (id.startsWith('8d3d8be7')) return 'ACTIVITÉS';
        if (id.startsWith('9402bc30')) return 'CONFÉRENCES';
        if (id.startsWith('c3e052be')) return 'WORKSHOPS';
        if (id.startsWith('4dfbddf3')) return 'VISITE';
      }
      return 'GROUPE';
    }
    
    return 'AUTRE';
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const eventDate = new Date(date);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (eventDate.toDateString() === today.toDateString()) {
      return "AUJOURD'HUI";
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return "DEMAIN";
    } else {
      // Format as "DIMANCHE, AOÛT 3"
      const weekday = eventDate.toLocaleDateString('fr-FR', { weekday: 'long' }).toUpperCase();
      const month = eventDate.toLocaleDateString('fr-FR', { month: 'long' }).toUpperCase();
      const day = eventDate.getDate();
      return `${weekday}, ${month} ${day}`;
    }
  };

  const groupEventsByDate = (events: CalendarEvent[]) => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    
    events.forEach(event => {
      const dateKey = new Date(event.startTime).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    return grouped;
  };

  const groupedEvents = groupEventsByDate(events);

  if (events.length === 0) {
    return (
      <div className={`bg-gray-100 bg-opacity-60 rounded-xl ${isMobile ? 'p-4' : 'p-6'} border border-gray-300 shadow-lg`}>
        <h2 className={`${isMobile ? 'text-lg mb-4' : 'text-xl mb-6'} font-semibold text-gray-800`}>Événements à venir</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-2">Aucun événement à venir</p>
          <p className="text-gray-500 text-sm">Les calendriers iCal se synchronisent automatiquement</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-gray-100 bg-opacity-60 rounded-xl ${isMobile ? 'p-4' : 'p-6'} border border-gray-300 shadow-lg`}>
        <h2 className={`${isMobile ? 'text-lg mb-4' : 'text-xl mb-6'} font-semibold text-gray-800`}>Événements à venir</h2>
        
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => {
            const date = new Date(dateKey);
            const isToday = date.toDateString() === new Date().toDateString();
            const isTomorrow = date.toDateString() === new Date(Date.now() + 24*60*60*1000).toDateString();
            
            return (
              <div key={dateKey}>
                <h3 className={`${(isToday || isTomorrow) ? 'text-base' : 'text-lg'} font-semibold mb-4 text-gray-800`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {formatDate(date)}
                </h3>
                <div className="space-y-4">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start space-x-4 p-4 bg-gray-200/40 rounded-lg hover:bg-gray-200/60 transition-colors duration-200 border border-gray-300/40 cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="text-center min-w-0 flex-shrink-0">
                        <div className="text-xl font-bold text-gray-800">
                          {formatTime(event.startTime)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 relative">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-800">
                            {decodeHtmlEntities(event.title)}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getBadgeColor(event.calendarSource)}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {getCalendarName(event.calendarSource)}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center text-gray-500 text-sm">
                            <MapPin className="mr-1 h-3 w-3" />
                            <span>{decodeHtmlEntities(event.location)}</span>
                          </div>
                        )}
                        
                        {/* Shockwave animation - absolute positioned to right center */}
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="relative">
                            <div className="w-3 h-3 rounded-full border-2 border-blue-400 opacity-75" style={{ animation: 'ripple 1.8s infinite' }}></div>
                            <div className="absolute top-0 left-0 w-3 h-3 rounded-full border-2 border-blue-300 opacity-50" style={{ animation: 'ripple 1.8s infinite 0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <EventDetailsDialog 
        event={selectedEvent}
        open={showEventDetails}
        onOpenChange={setShowEventDetails}
      />
    </>
  );
}
