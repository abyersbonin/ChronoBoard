import { MapPin, Clock, Calendar, X, CalendarPlus } from "lucide-react";
import { type CalendarEvent } from "@shared/schema";
import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { TranslatedText } from "@/components/translated-text";

interface EventDetailsDialogProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailsDialog({ event, open, onOpenChange }: EventDetailsDialogProps) {
  const { language } = useLanguage();
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
    const locale = language === 'fr' ? 'fr-FR' : 'en-US';
    return new Date(date).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: language === 'en'
    });
  };

  const formatDate = (date: Date) => {
    const locale = language === 'fr' ? 'fr-FR' : 'en-US';
    return new Date(date).toLocaleDateString(locale, {
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
      text: cleanHtmlText(event.title), // Will be translated by Google Calendar
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Enhanced Modal Content with device-specific sizing */}
      <div className={`
        relative z-[101] w-full bg-white/95 backdrop-blur-sm shadow-2xl border border-white/20 overflow-hidden
        ${isMobile 
          ? 'max-w-[95vw] max-h-[85vh] rounded-xl p-6' 
          : 'max-w-[90vw] max-h-[90vh] rounded-2xl'
        }
        sm:max-w-3xl sm:p-8
        md:max-w-4xl md:p-10
        lg:max-w-5xl lg:p-12
        xl:max-w-6xl xl:p-16
        2xl:max-w-7xl 2xl:p-20
      `}>
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 sm:right-6 sm:top-6 lg:right-8 lg:top-8"
        >
          <X className="h-5 w-5 text-gray-700 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
          <span className="sr-only">Close</span>
        </button>
        
        {/* Scrollable Content Area */}
        <div className="overflow-y-auto max-h-full pr-2" data-scroll-allowed="true">
          {/* Header */}
          <div className="mb-6 pr-12 sm:pr-16 lg:pr-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 leading-tight">
              <TranslatedText text={cleanHtmlText(event.title)} />
            </h2>
          </div>
          
          {/* Content Grid */}
          <div className="grid gap-6 sm:gap-8 lg:gap-10">
            {/* Date and Time Card */}
            <div className="flex items-start space-x-4 p-4 sm:p-6 bg-blue-50/50 rounded-xl border border-blue-100">
              <Calendar className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="font-semibold text-lg sm:text-xl lg:text-2xl text-gray-800 mb-2">
                  {formatDate(event.startTime)}
                </div>
                <div className="text-base sm:text-lg lg:text-xl text-gray-600">
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </div>
              </div>
            </div>

            {/* Location Card */}
            {event.location && (
              <div className="flex items-start space-x-4 p-4 sm:p-6 bg-green-50/50 rounded-xl border border-green-100">
                <MapPin className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="font-semibold text-lg sm:text-xl lg:text-2xl text-gray-800 mb-2">
                    {language === 'fr' ? 'Lieu' : 'Location'}
                  </div>
                  <div className="text-base sm:text-lg lg:text-xl text-gray-700">
                    <TranslatedText text={cleanHtmlText(event.location)} />
                  </div>
                </div>
              </div>
            )}

            {/* Description Card */}
            {event.description && (
              <div className="p-4 sm:p-6 bg-purple-50/50 rounded-xl border border-purple-100">
                <h4 className="font-semibold text-lg sm:text-xl lg:text-2xl text-gray-800 mb-4 flex items-center">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-purple-600 mr-3" />
                  {language === 'fr' ? 'Description' : 'Description'}
                </h4>
                <div className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
                  <TranslatedText text={cleanHtmlText(event.description)} />
                </div>
              </div>
            )}

            {/* Add to Calendar Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleAddToCalendar}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 sm:py-5 lg:py-6 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <CalendarPlus className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                <span className="text-base sm:text-lg lg:text-xl">
                  {language === 'fr' ? 'Ajouter à mon calendrier' : 'Add to my calendar'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}