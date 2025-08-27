import { MapPin } from "lucide-react";
import { type CalendarEvent } from "@shared/schema";
import { EventDetailsDialog } from "./event-details-dialog";
import { useState, useEffect } from "react";
import { useLanguage, formatTime, formatDate } from "@/hooks/useLanguage";

interface UpcomingEventsProps {
  events: CalendarEvent[];
  language?: 'fr' | 'en';
}

export function UpcomingEvents({ events, language: propLanguage = 'fr' }: UpcomingEventsProps) {
  const { t, language, translateEventContent } = useLanguage();
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

  // Clean HTML tags and decode HTML entities
  const cleanHtmlText = (text: string) => {
    if (!text) return '';
    
    // First strip HTML tags
    const stripHtml = text.replace(/<[^>]*>/g, '');
    
    // Then decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = stripHtml;
    return textarea.value.trim();
  };

  // Get badge color based on calendar name (not source)
  const getBadgeColor = (calendarSource: string | null) => {
    const calendarName = getCalendarName(calendarSource);
    
    // Assign consistent colors based on calendar name
    const colorMap: { [key: string]: string } = {
      'ACTIVITÉS': 'spa-activites-badge',
      'CONFÉRENCES': 'spa-conferences-badge',
      'WORKSHOPS': 'bg-purple-500',
      'VISITE': 'spa-visite-badge',
      'GROUPE': 'bg-indigo-500',
      'GÉNÉRAL': 'bg-gray-500',
      'AUTRE': 'bg-red-500'
    };
    
    return colorMap[calendarName] || 'bg-gray-500';
  };

  // Get calendar display name from source
  const getCalendarName = (calendarSource: string | null) => {
    if (!calendarSource) return t('categories.general');
    
    // Extract a short name from the calendar source
    if (calendarSource.includes('spaeastman')) return t('categories.activities');
    if (calendarSource.includes('group.calendar.google.com')) {
      // Try to extract meaningful name from group calendar ID
      const match = calendarSource.match(/([a-f0-9]{64})/);
      if (match) {
        const id = match[1];
        // Map known calendar IDs to names
        if (id.startsWith('8d3d8be7')) return t('categories.activities');
        if (id.startsWith('9402bc30')) return t('categories.conference');
        if (id.startsWith('c3e052be')) return t('categories.workshops');
        if (id.startsWith('4dfbddf3')) return t('categories.visit');
      }
      return t('categories.groupe');
    }
    
    return t('categories.other');
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };
  const formatTime = (date: Date) => {
    const locale = language === 'fr' ? 'fr-FR' : 'en-US';
    return new Date(date).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: language === 'en'
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const eventDate = new Date(date);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (eventDate.toDateString() === today.toDateString()) {
      return t('events.today');
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return t('events.tomorrow');
    } else {
      // Format using language-appropriate locale
      const locale = language === 'fr' ? 'fr-FR' : 'en-US';
      const weekday = eventDate.toLocaleDateString(locale, { weekday: 'long' }).toUpperCase();
      const month = eventDate.toLocaleDateString(locale, { month: 'long' }).toUpperCase();
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
        <h2 className={`${isMobile ? 'text-lg mb-4' : 'text-xl mb-6'} font-semibold text-gray-800`}>{t('events.upcoming')}</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-2">{t('events.none.upcoming')}</p>
          <p className="text-gray-500 text-sm">{t('events.sync.message')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-gray-100 bg-opacity-60 rounded-xl ${isMobile ? 'p-4' : 'p-6'} border border-gray-300 shadow-lg`}>
        <h2 className={`${isMobile ? 'text-lg mb-4' : 'text-xl mb-6'} font-semibold text-gray-800`}>{t('events.upcoming')}</h2>
        
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
                  {dayEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="event-item event-card flex items-start space-x-4 p-4 bg-gray-200/40 rounded-lg hover:bg-gray-200/60 transition-colors duration-200 border border-gray-300/40 cursor-pointer animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
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
                            {translateEventContent(cleanHtmlText(event.title))}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getBadgeColor(event.calendarSource)}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {getCalendarName(event.calendarSource)}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center text-gray-500 text-sm">
                            <MapPin className="mr-1 h-3 w-3" />
                            <span>{cleanHtmlText(event.location)}</span>
                          </div>
                        )}
                        
                        {/* Description button - hide on mobile since the whole container is clickable */}
                        {!isMobile && event.description && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                              className="bg-transparent border text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                              style={{ 
                                borderColor: '#788C6B', 
                                color: '#788C6B',
                                fontFamily: 'Montserrat, sans-serif'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#788C6B10'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              {t('events.description')}
                            </button>
                          </div>
                        )}
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
