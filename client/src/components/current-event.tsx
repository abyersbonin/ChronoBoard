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
              {decodeHtmlEntities(event.title)}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getBadgeColor(event.calendarSource)}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {getCalendarName(event.calendarSource)}
            </span>
          </div>
          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center space-x-4'} text-gray-500`}>
            {event.location && (
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                <span>{decodeHtmlEntities(event.location)}</span>
              </div>
            )}
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </span>
            </div>
          </div>
          
          {/* Shockwave animation - absolute positioned to right center */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="relative">
              <div className="w-4 h-4 rounded-full border-2 border-blue-400 opacity-75" style={{ animation: 'ripple 2s infinite' }}></div>
              <div className="absolute top-0 left-0 w-4 h-4 rounded-full border-2 border-blue-300 opacity-50" style={{ animation: 'ripple 2s infinite 0.5s' }}></div>
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
