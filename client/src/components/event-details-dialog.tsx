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

  // Handle escape key and body scroll - runs even when dialog is closed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };
    
    const preventTouchMove = (e: TouchEvent) => {
      // Allow scrolling within dialog content, but prevent body scroll
      const target = e.target as Element;
      const dialogContent = target.closest('[data-scroll-allowed]');
      if (!dialogContent) {
        e.preventDefault();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      
      // Mobile-specific scroll prevention
      if (isMobile) {
        const currentScrollY = window.scrollY;
        setScrollPosition(currentScrollY);
        
        // Prevent all scrolling on mobile
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${currentScrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.position = 'fixed';
        document.documentElement.style.width = '100%';
        document.documentElement.style.height = '100%';
        
        // Prevent touch scrolling
        document.addEventListener('touchmove', preventTouchMove, { passive: false });
        document.addEventListener('touchstart', preventTouchMove, { passive: false });
      } else {
        // Desktop - just prevent body scroll
        document.body.style.overflow = 'hidden';
      }
    } else {
      // Restore scroll when dialog closes
      if (isMobile) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.position = '';
        document.documentElement.style.width = '';
        document.documentElement.style.height = '';
        
        // Remove touch prevention
        document.removeEventListener('touchmove', preventTouchMove);
        document.removeEventListener('touchstart', preventTouchMove);
        
        // Restore scroll position
        window.scrollTo(0, scrollPosition);
      } else {
        document.body.style.overflow = '';
      }
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (isMobile) {
        document.removeEventListener('touchmove', preventTouchMove);
        document.removeEventListener('touchstart', preventTouchMove);
      }
      
      // Clean up styles
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.position = '';
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';
    };
  }, [open, onOpenChange, isMobile, scrollPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Restore all styles on component unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.position = '';
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';
      
      // Restore scroll position on cleanup if needed
      if (isMobile && scrollPosition > 0) {
        window.scrollTo(0, scrollPosition);
      }
    };
  }, []);

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
      text: cleanHtmlText(event.title),
      dates: `${startTime}/${endTime}`,
      details: event.description ? cleanHtmlText(event.description) : '',
      location: event.location ? cleanHtmlText(event.location) : ''
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
            // Only prevent scrolling on backdrop, not modal content
            const target = e.target as HTMLElement;
            if (target === e.currentTarget) {
              e.preventDefault();
              e.stopPropagation();
            }
          }
        }}
      />
      
      {/* Modal Content */}
      <div 
        className={`relative z-[101] w-full ${isMobile ? 'max-w-full mx-0 h-[55vh] overflow-y-auto rounded-t-lg' : 'max-w-md mx-4 rounded-lg'} bg-white shadow-2xl border border-gray-300 ${isMobile ? 'p-4' : 'p-6'}`}
        data-scroll-allowed="true"
        onTouchMove={(e) => {
          // Allow scrolling within the modal content
          e.stopPropagation();
        }}
      >
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
            {cleanHtmlText(event.title)}
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
              <span>{cleanHtmlText(event.location)}</span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Description</h4>
              <p className="text-gray-600 leading-relaxed mb-4">
                {cleanHtmlText(event.description)}
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