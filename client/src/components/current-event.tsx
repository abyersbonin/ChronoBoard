import { MapPin, Clock } from "lucide-react";
import { type CalendarEvent } from "@shared/schema";
import { EventDetailsDialog } from "./event-details-dialog";
import { useState, useEffect } from "react";

interface CurrentEventProps {
  event: CalendarEvent | null;
}

export function CurrentEvent({ event }: CurrentEventProps) {
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }));
  
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
    if (!calendarSource) return 'GÉNÉRAL';
    
    // Extract a short name from the calendar source
    if (calendarSource.includes('spaeastman')) return 'ACTIVITÉS';
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

  // Update current time every 10 seconds - TV optimized
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }));
    }, 10000); // 10 seconds instead of 1 second for better TV performance

    return () => clearInterval(timer);
  }, []);

  const getCurrentTime = () => {
    return currentTime;
  };

  if (!event) {
    return (
      <div className={`bg-gray-100 bg-opacity-60 rounded-xl ${isMobile ? 'p-4 mb-6' : 'p-6 mb-8'} border border-gray-300 shadow-lg`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-800`} style={{ fontFamily: 'Montserrat, sans-serif' }}>À présent</h2>
          <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-blue-600`} style={{ fontFamily: 'Montserrat, sans-serif' }}>{currentTime}</div>
        </div>
        
        <div className="border-l-4 border-gray-300 pl-4">
          <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-600 mb-3`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Aucun événement en cours
          </h3>
          <p className={`text-gray-500 ${isMobile ? 'text-sm mb-3' : 'mb-4'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Profitez de ce moment libre dans votre emploi du temps.
          </p>
        </div>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div 
        className={`bg-gray-100 bg-opacity-60 rounded-xl ${isMobile ? 'p-4 mb-6' : 'p-6 mb-8'} border border-gray-300 shadow-lg cursor-pointer hover:bg-gray-100 hover:bg-opacity-70`}
        onClick={() => setShowEventDetails(true)}
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-800`} style={{ fontFamily: 'Montserrat, sans-serif' }}>À présent</h2>
          <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-blue-600`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {currentTime}
          </div>
        </div>
        
        <div className="border-l-4 border-blue-500 pl-4 flex-1 relative">
          <div className="flex items-center gap-3 mb-3">
            <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {cleanHtmlText(event.title)}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getBadgeColor(event.calendarSource)}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {getCalendarName(event.calendarSource)}
            </span>
          </div>
          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center space-x-4'} text-gray-500`}>
            {event.location && (
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                <span>{cleanHtmlText(event.location)}</span>
              </div>
            )}
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <EventDetailsDialog 
        event={event}
        open={showEventDetails}
        onOpenChange={setShowEventDetails}
      />
    </>
  );
}
