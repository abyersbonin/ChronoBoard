import { MapPin, Clock, Calendar, X, CalendarPlus } from "lucide-react";
import { type CalendarEvent } from "@shared/schema";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { TranslatedText } from "@/components/translated-text";

interface EventDetailsDialogProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailsDialog({ event, open, onOpenChange }: EventDetailsDialogProps) {
  const { language } = useLanguage();
  // Viewport-based mobile detection using modern mobile breakpoints
  const [isMobile, setIsMobile] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  useEffect(() => {
    const detectMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Exclude TV browsers (webOS, Tizen, etc.)
      const isTVBrowser = /webos|tizen|smart-tv|smarttv/.test(userAgent);
      
      // Mobile viewport ranges covering 95% of phones from last 5 years
      const isMobileViewport = (
        // Portrait: narrow to wide mobile range
        (width >= 280 && width <= 430 && height >= 640) ||
        // Landscape: typical mobile landscape orientations  
        (width >= 568 && width <= 932 && height >= 320 && height <= 430) ||
        // Foldable edge cases
        (width >= 280 && width <= 360 && height >= 653)
      ) && width < 600; // Small tablet breakpoint
      
      // Touch capability check
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Mobile if: viewport matches mobile ranges AND touch capable AND NOT TV browser
      const mobile = isMobileViewport && isTouchDevice && !isTVBrowser;
      
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

  // Use React portal to render modal at document.body level, completely outside scroll context
  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)'
      }}
    >
      {/* Backdrop */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%'
        }}
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal Content */}
      <div 
        className="bg-white shadow-2xl border border-gray-300 rounded-lg overflow-y-auto"
        style={{
          position: 'relative',
          zIndex: 1000000,
          width: isMobile ? '90vw' : '500px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          padding: isMobile ? '1rem' : '2rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenChange(false);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenChange(false);
          }}
          className="absolute right-4 top-4 p-2 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-opacity bg-white/80 hover:bg-white"
          style={{ 
            zIndex: 1000001,
            minWidth: '32px',
            minHeight: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X className="h-4 w-4 text-gray-600" />
          <span className="sr-only">Close</span>
        </button>
        
        {/* Header */}
        <div className={`${isMobile ? 'mb-4 pr-6' : 'mb-6 pr-8'}`}>
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-800`}>
            <TranslatedText text={cleanHtmlText(event.title)} />
          </h2>
        </div>
        
        {/* Content */}
        <div className={isMobile ? 'space-y-3' : 'space-y-4'}>
          {/* Date and Time */}
          <div className="flex items-center space-x-3 text-gray-700">
            <Calendar className="h-5 w-5 flex-shrink-0" style={{ color: '#36455c' }} />
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
              <MapPin className="h-5 w-5 flex-shrink-0" style={{ color: '#85a1ab' }} />
              <span><TranslatedText text={cleanHtmlText(event.location)} /></span>
            </div>
          )}

          {/* Description */}
          {event.description && cleanHtmlText(event.description).trim() && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">
                <TranslatedText text="Description" />
              </h4>
              <div className="text-gray-600 leading-relaxed text-sm">
                <TranslatedText text={cleanHtmlText(event.description)} />
              </div>
            </div>
          )}

          {/* Add to Calendar Button - Mobile Only */}
          {isMobile && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCalendar();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCalendar();
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                style={{ 
                  minHeight: '48px',
                  touchAction: 'manipulation'
                }}
              >
                <CalendarPlus className="h-5 w-5" />
                {language === 'fr' ? 'Ajouter à mon calendrier' : 'Add to my calendar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}