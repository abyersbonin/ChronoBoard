import { MapPin, Clock, Calendar, X, CalendarPlus } from "lucide-react";
import { type CalendarEvent } from "@shared/schema";
import { useState, useEffect } from "react";

interface EventDetailsDialogProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailsDialog({ event, open, onOpenChange }: EventDetailsDialogProps) {
  // Mobile device detection (excluding TV browsers)
  const [isMobile, setIsMobile] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
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

  // Handle escape key and body scroll - runs even when dialog is closed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };
    
    const preventTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // Additional scroll lock for mobile
      if (isMobile) {
        const currentScrollY = window.scrollY;
        setScrollPosition(currentScrollY);
        document.documentElement.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${currentScrollY}px`;
        document.body.style.touchAction = 'none';
        // Prevent touch scrolling completely
        document.addEventListener('touchmove', preventTouchMove, { passive: false });
      }
    } else {
      // Ensure scroll is restored when dialog closes
      document.body.style.overflow = '';
      if (isMobile) {
        document.documentElement.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        document.body.style.touchAction = '';
        // Remove touch prevention
        document.removeEventListener('touchmove', preventTouchMove);
        // Restore scroll position
        window.scrollTo(0, scrollPosition);
      }
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      if (isMobile) {
        document.removeEventListener('touchmove', preventTouchMove);
      }
    };
  }, [open, onOpenChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      if (isMobile) {
        document.documentElement.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        // Restore scroll position on cleanup
        window.scrollTo(0, scrollPosition);
      }
    };
  }, [isMobile, scrollPosition]);

  if (!event || !open) return null;

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate Google Calendar URL for adding event
  const generateCalendarUrl = (event: CalendarEvent) => {
    const formatDateForCalendar = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const startTime = formatDateForCalendar(new Date(event.startTime));
    const endTime = formatDateForCalendar(new Date(event.endTime));
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: decodeHtmlEntities(event.title),
      dates: `${startTime}/${endTime}`,
      details: event.description ? decodeHtmlEntities(event.description) : '',
      location: event.location ? decodeHtmlEntities(event.location) : ''
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const handleAddToCalendar = () => {
    if (event) {
      const calendarUrl = generateCalendarUrl(event);
      window.open(calendarUrl, '_blank');
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex ${isMobile ? 'items-end justify-center p-0' : 'items-center justify-center p-8'}`}
      style={{ touchAction: isMobile ? 'none' : 'auto' }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        style={{ touchAction: isMobile ? 'none' : 'auto' }}
        onClick={() => {
          onOpenChange(false);
        }}
        onTouchMove={(e) => {
          if (isMobile) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      />
      
      {/* Modal Content */}
      <div className={`relative z-[101] w-full ${isMobile ? 'max-w-full mx-0 h-[55vh] overflow-y-auto rounded-t-lg' : 'max-w-md mx-4 rounded-lg'} bg-white shadow-2xl border border-gray-300 ${isMobile ? 'p-4' : 'p-6'}`}>
        {/* Close Button */}
        <button
          onClick={() => {
            onOpenChange(false);
          }}
          className="absolute right-4 top-4 p-1 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-opacity"
        >
          <X className="h-4 w-4 text-gray-600" />
          <span className="sr-only">Close</span>
        </button>
        
        {/* Header */}
        <div className={`${isMobile ? 'mb-4 pr-6' : 'mb-6 pr-8'}`}>
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-800`}>
            {decodeHtmlEntities(event.title)}
          </h2>
        </div>
        
        {/* Content */}
        <div className={isMobile ? 'space-y-3' : 'space-y-4'}>
          {/* Date and Time */}
          <div className="flex items-center space-x-3 text-gray-700">
            <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div>
              <div className="font-medium">{formatDate(event.startTime)}</div>
              <div className="text-sm text-gray-600">
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </div>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center space-x-3 text-gray-700">
              <MapPin className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span>{decodeHtmlEntities(event.location)}</span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Description</h4>
              <p className="text-gray-600 leading-relaxed mb-4">
                {decodeHtmlEntities(event.description)}
              </p>
            </div>
          )}

          {/* Add to Calendar Button - Mobile Only */}
          {isMobile && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleAddToCalendar}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <CalendarPlus className="h-5 w-5" />
                Ajouter à mon calendrier
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}