import { MapPin, Clock, Calendar, X } from "lucide-react";
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
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // Additional scroll lock for mobile
      if (isMobile) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${window.scrollY}px`;
      }
    } else {
      // Ensure scroll is restored when dialog closes
      document.body.style.overflow = '';
      if (isMobile) {
        document.documentElement.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
      }
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
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
      }
    };
  }, [isMobile]);

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

  return (
    <div className={`fixed inset-0 z-[100] flex items-start justify-center ${isMobile ? 'p-3' : 'p-8 items-center'}`} style={{ paddingTop: isMobile ? '270px' : '8px' }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => {
          onOpenChange(false);
          // Force scroll restoration on backdrop click
          setTimeout(() => {
            document.body.style.overflow = '';
          }, 10);
        }}
      />
      
      {/* Modal Content */}
      <div className={`relative z-[101] w-full ${isMobile ? 'max-w-xs mx-2 max-h-[calc(100vh-260px)] overflow-y-auto' : 'max-w-md mx-4'} bg-white rounded-lg shadow-2xl border border-gray-300 ${isMobile ? 'p-3' : 'p-6'}`}>
        {/* Close Button */}
        <button
          onClick={() => {
            onOpenChange(false);
            // Force scroll restoration on close button click
            setTimeout(() => {
              document.body.style.overflow = '';
            }, 10);
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
              <p className="text-gray-600 leading-relaxed">
                {decodeHtmlEntities(event.description)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}